import * as THREE from 'three';

// TODO (Codex): Populate with actual ambient audio assets once available in public/assets.
export const AMBIENT_TRACKS = [];

function baseURL(rel) {
  return new URL(rel, document.baseURI).toString();
}

const R = { listener: new THREE.AudioListener() };

export function attachAudioListenerTo(camera) {
  if (R.camera === camera) return;
  if (R.camera && R.camera.remove) R.camera.remove(R.listener);
  if (camera && camera.add) camera.add(R.listener);
  R.camera = camera;
}

async function loadBuffer(url) {
  return await new Promise((resolve, reject) => {
    const loader = new THREE.AudioLoader();
    loader.load(url, resolve, undefined, reject);
  });
}

let _unlocked = false;
function installAutoplayUnlock() {
  if (_unlocked) return;
  const unlock = () => {
    const ctx = R.listener.context;
    if (ctx && ctx.state !== 'running' && ctx.resume) ctx.resume();
    _unlocked = true;
    window.removeEventListener('pointerdown', unlock);
    window.removeEventListener('keydown', unlock);
    window.removeEventListener('touchstart', unlock);
  };
  window.addEventListener('pointerdown', unlock);
  window.addEventListener('keydown', unlock);
  window.addEventListener('touchstart', unlock);
}

async function playAmbientInternal(id, fadeSeconds = 1) {
  const entry = AMBIENT_TRACKS.find(t => t.id === id) || AMBIENT_TRACKS[0];
  if (!entry) {
    console.warn('[ambient] No tracks configured');
    return;
  }

  installAutoplayUnlock();

  const srcUrl = baseURL(entry.file);
  const buf = await loadBuffer(srcUrl);

  const next = new THREE.Audio(R.listener);
  next.setBuffer(buf);
  next.setLoop(true);
  next.setVolume(0.0001);
  next.play();

  const targetVol = entry.volume ?? 0.3;

  const prev = R.current;
  R.current = next;

  if (!prev) {
    const start = performance.now();
    const step = () => {
      const t = (performance.now() - start) / (fadeSeconds * 1000);
      const v = Math.min(1, t) * targetVol;
      next.setVolume(v);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
    return;
  }

  if (R.fading && prev.stop) prev.stop();
  R.fading = true;
  const start = performance.now();
  const prevStartVol = typeof prev.getVolume === 'function' ? prev.getVolume() : targetVol;

  const step = () => {
    const t = (performance.now() - start) / (fadeSeconds * 1000);
    const a = Math.min(1, t);
    next.setVolume(a * targetVol);
    prev.setVolume(Math.max(0, (1 - a) * prevStartVol));
    if (a < 1) requestAnimationFrame(step);
    else {
      if (prev.stop) prev.stop();
      R.fading = false;
    }
  };
  requestAnimationFrame(step);
}

export async function playAmbient(id, fadeSeconds = 1) {
  return playAmbientInternal(id, fadeSeconds);
}

export async function initAmbient(camera) {
  attachAudioListenerTo(camera);
  if (typeof window !== 'undefined') {
    window.__athensDebug = { ...(window.__athensDebug || {}), audio: { AMBIENT_TRACKS } };
  }

  const params = new URLSearchParams(window.location.search);
  const mute = params.get('mute') === '1';
  if (mute) return;

  const id = params.get('amb') || (AMBIENT_TRACKS[0] && AMBIENT_TRACKS[0].id);
  if (id) await playAmbientInternal(id);
}

export const AmbientAPI = {
  play: id => playAmbientInternal(id),
  list: () => AMBIENT_TRACKS.map(t => t.id),
};
