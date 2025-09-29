const isArray = (value) => Array.isArray(value);

export function _read(key, def = []) {
  try {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    if (!raw) return def;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : def;
  } catch (error) {
    console.warn(`Failed to read ${key} from localStorage`, error);
    return def;
  }
}

export function getKids(source) {
  if (isArray(source)) return source;
  if (source && isArray(source.data)) return source.data;
  return _read('kids');
}

export function getKidById(kidId, source) {
  if (kidId == null) return null;
  const kids = getKids(source);
  return (
    kids.find((kid) => String(kid.id) === String(kidId)) || null
  );
}

export function getChores(source) {
  if (isArray(source)) return source;
  if (source && isArray(source.data)) return source.data;
  return _read('chores');
}

export function getChoresByKid(kidId, source) {
  if (kidId == null) return [];
  return getChores(source).filter((chore) =>
    String(chore.kidId ?? chore.assignedTo ?? '') === String(kidId)
  );
}

export function getRewards(source) {
  if (isArray(source)) return source;
  if (source && isArray(source.data)) return source.data;
  return _read('rewards');
}

export function getRewardsByKid(kidId, source) {
  if (kidId == null) return [];
  return getRewards(source).filter((reward) => {
    const owner = reward?.kidId ?? reward?.redeemedBy ?? reward?.kid ?? reward?.ownerId;
    return String(owner ?? '') === String(kidId);
  });
}

export default {
  getKids,
  getKidById,
  getChores,
  getChoresByKid,
  getRewards,
  getRewardsByKid,
};
