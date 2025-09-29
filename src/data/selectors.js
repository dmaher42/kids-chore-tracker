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

const readArray = (source, key) => {
  if (isArray(source)) return source;
  if (source && isArray(source.data)) return source.data;
  if (source && typeof source === 'object') {
    // Support objects keyed by id (e.g., kidPets in context)
    const values = Object.values(source).flat();
    if (values.length > 0) {
      return values;
    }
  }
  return _read(key);
};

export function getKids(source) {
  if (isArray(source)) return source;
  if (source && isArray(source.data)) return source.data;
  return _read('kids');
}

export function getKidById(id, source) {
  if (id == null) return null;
  const kids = getKids(source);
  return kids.find((kid) => String(kid.id) === String(id)) || null;
}

export function getChores(source) {
  return readArray(source, 'chores');
}

export function getChoresByKid(id, source) {
  if (id == null) return [];
  return getChores(source).filter((chore) => String(chore.kidId ?? chore.assignedTo ?? '') === String(id));
}

export function getRewards(source) {
  return readArray(source, 'rewards');
}

export function getRewardsByKid(id, source) {
  if (id == null) return [];
  return getRewards(source).filter((reward) => {
    const owner = reward?.kidId ?? reward?.redeemedBy ?? reward?.kid ?? reward?.ownerId;
    return String(owner ?? '') === String(id);
  });
}

export function getPets(source) {
  return readArray(source, 'pets');
}

export function getPetsByKid(id, source) {
  if (id == null) return [];
  if (source && typeof source === 'object' && !isArray(source)) {
    const direct = source[id] || source[String(id)];
    if (isArray(direct)) {
      return direct;
    }
    if (source.data) {
      const nested = source.data[id] || source.data[String(id)];
      if (isArray(nested)) return nested;
    }
  }
  return getPets(source).filter((pet) => String(pet.kidId ?? pet.ownerId ?? '') === String(id));
}

export default {
  getKids,
  getKidById,
  getChores,
  getChoresByKid,
  getRewards,
  getRewardsByKid,
  getPets,
  getPetsByKid,
};
