const AudioContextClass = typeof window !== 'undefined' ? (window.AudioContext || window.webkitAudioContext) : null;
const sharedContext = AudioContextClass ? new AudioContextClass() : null;

class Object3D {
  constructor() {
    this.children = [];
    this.parent = null;
  }

  add(obj) {
    if (!obj) return this;
    if (obj.parent) obj.parent.remove(obj);
    this.children.push(obj);
    obj.parent = this;
    if (typeof obj.onAdded === 'function') obj.onAdded(this);
    return this;
  }

  remove(obj) {
    if (!obj) return this;
    const idx = this.children.indexOf(obj);
    if (idx >= 0) {
      this.children.splice(idx, 1);
      obj.parent = null;
      if (typeof obj.onRemoved === 'function') obj.onRemoved(this);
    }
    return this;
  }
}

class Camera extends Object3D {}

class PerspectiveCamera extends Camera {
  constructor(fov = 50, aspect = 1, near = 0.1, far = 2000) {
    super();
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
  }
}

class AudioListener extends Object3D {
  constructor() {
    super();
    if (!sharedContext) {
      throw new Error('Web Audio API not supported');
    }
    this.context = sharedContext;
    this.gain = this.context.createGain();
    this.gain.connect(this.context.destination);
  }

  getInput() {
    return this.gain;
  }
}

class Audio extends Object3D {
  constructor(listener) {
    super();
    if (!listener || !listener.context) {
      throw new Error('Audio requires a listener with a context');
    }
    this.listener = listener;
    this.context = listener.context;
    this.gain = this.context.createGain();
    this.gain.gain.setValueAtTime(1, this.context.currentTime);
    this.gain.connect(listener.getInput());
    this.loop = false;
    this.volume = 1;
  }

  setBuffer(buffer) {
    this.buffer = buffer;
    return this;
  }

  setLoop(loop) {
    this.loop = loop;
    if (this.source) this.source.loop = loop;
    return this;
  }

  setVolume(volume) {
    this.volume = volume;
    if (this.gain) {
      this.gain.gain.setTargetAtTime(volume, this.context.currentTime, 0.01);
    }
    return this;
  }

  getVolume() {
    return this.volume;
  }

  play() {
    if (!this.buffer) return this;
    this.stop();
    const source = this.context.createBufferSource();
    source.buffer = this.buffer;
    source.loop = !!this.loop;
    source.connect(this.gain);
    source.start(0);
    this.source = source;
    return this;
  }

  stop() {
    if (this.source) {
      try {
        this.source.stop();
      } catch (e) {
        // ignore
      }
      this.source.disconnect();
      this.source = null;
    }
    return this;
  }
}

class AudioLoader {
  load(url, onLoad, onProgress, onError) {
    if (!sharedContext) {
      onError?.(new Error('Web Audio API not supported'));
      return;
    }
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
        return res.arrayBuffer();
      })
      .then(data => sharedContext.decodeAudioData(data))
      .then(buffer => onLoad?.(buffer))
      .catch(err => onError?.(err));
  }
}

export { Object3D, Camera, PerspectiveCamera, AudioListener, Audio, AudioLoader };
export default {
  Object3D,
  Camera,
  PerspectiveCamera,
  AudioListener,
  Audio,
  AudioLoader,
};
