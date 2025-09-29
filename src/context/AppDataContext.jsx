import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const DEFAULT_PET_STATE = { food: 50, happy: 50 };
const EMPTY_INVENTORY = { clothing: [], accessories: [], backgrounds: [], equipped: {} };

const INITIAL_KIDS = [
  { id: 1, name: 'Nash', age: 13, coins: 20, streak: 0, petLevel: 1, petType: 'none', activePet: null },
  { id: 2, name: 'Isla', age: 10, coins: 20, streak: 0, petLevel: 1, petType: 'none', activePet: null },
  { id: 3, name: 'Archer', age: 8, coins: 20, streak: 0, petLevel: 1, petType: 'none', activePet: null },
];

const INITIAL_CHORES = [
  { id: 1, name: 'Empty Dishwasher', value: 2, icon: '🍽️' },
  { id: 2, name: 'Make Bed', value: 1, icon: '🛏️' },
  { id: 3, name: 'Put Clothes Away', value: 1, icon: '👕' },
  { id: 4, name: 'Take Out Trash', value: 2, icon: '🗑️' },
  { id: 5, name: 'Feed Pet', value: 1, icon: '🐕' },
];

const AppDataContext = createContext();

export function AppDataProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [kids, setKids] = useState([]);
  const [chores, setChores] = useState([]);
  const [dailyProgress, setDailyProgress] = useState({});
  const [petStates, setPetStates] = useState({});
  const [kidInventories, setKidInventories] = useState({});
  const [kidPets, setKidPets] = useState({});
  const [selectedKidId, setSelectedKidId] = useState(null);

  useEffect(() => {
    const initializeData = async () => {
      try {
        const kidsDoc = await getDoc(doc(db, 'app', 'kids'));
        if (!kidsDoc.exists()) {
          await setDoc(doc(db, 'app', 'kids'), { data: INITIAL_KIDS });
          await setDoc(doc(db, 'app', 'chores'), { data: INITIAL_CHORES });
          await setDoc(doc(db, 'app', 'dailyProgress'), { data: { 1: [], 2: [], 3: [] } });
          await setDoc(doc(db, 'app', 'petStates'), {
            data: {
              1: { ...DEFAULT_PET_STATE },
              2: { ...DEFAULT_PET_STATE },
              3: { ...DEFAULT_PET_STATE },
            },
          });
          await setDoc(doc(db, 'app', 'inventories'), {
            data: {
              1: { ...EMPTY_INVENTORY },
              2: { ...EMPTY_INVENTORY },
              3: { ...EMPTY_INVENTORY },
            },
          });
          await setDoc(doc(db, 'app', 'kidPets'), {
            data: { 1: [], 2: [], 3: [] },
          });
        }
        setLoading(false);
      } catch (error) {
        console.error('Error initializing data:', error);
        setLoading(false);
      }
    };
    initializeData();
  }, []);

  useEffect(() => {
    const unsubscribers = [
      onSnapshot(doc(db, 'app', 'kids'), (snap) => {
        if (snap.exists()) setKids(snap.data().data || []);
      }),
      onSnapshot(doc(db, 'app', 'chores'), (snap) => {
        if (snap.exists()) setChores(snap.data().data || []);
      }),
      onSnapshot(doc(db, 'app', 'dailyProgress'), (snap) => {
        if (snap.exists()) setDailyProgress(snap.data().data || {});
      }),
      onSnapshot(doc(db, 'app', 'petStates'), (snap) => {
        if (snap.exists()) setPetStates(snap.data().data || {});
      }),
      onSnapshot(doc(db, 'app', 'inventories'), (snap) => {
        if (snap.exists()) setKidInventories(snap.data().data || {});
      }),
      onSnapshot(doc(db, 'app', 'kidPets'), (snap) => {
        if (snap.exists()) setKidPets(snap.data().data || {});
      }),
    ];

    return () => {
      unsubscribers.forEach((unsubscribe) => unsubscribe?.());
    };
  }, []);

  const selectKid = (kidId) => setSelectedKidId(kidId ? Number(kidId) : null);

  const toggleChore = async (kidId, choreId) => {
    const kidChores = dailyProgress[kidId] || [];
    const chore = chores.find((c) => c.id === choreId);
    if (!chore) return;

    const kidChoreSet = chores.filter(
      (c) => String(c.kidId ?? '') === String(kidId) || c.kidId == null
    );
    const kidChoreIds = kidChoreSet.map((c) => c.id);

    let newChores;
    if (kidChores.includes(choreId)) {
      newChores = kidChores.filter((id) => id !== choreId);
      const updatedKids = kids.map((kid) =>
        kid.id === kidId
          ? { ...kid, coins: Math.max(0, kid.coins - chore.value) }
          : kid
      );
      await updateDoc(doc(db, 'app', 'kids'), { data: updatedKids });
    } else {
      newChores = [...kidChores, choreId];
      const completedRelevant = newChores.filter((id) => kidChoreIds.includes(id)).length;
      const allDone = kidChoreSet.length > 0 && completedRelevant === kidChoreSet.length;
      const coinsToAdd = chore.value + (allDone ? 5 : 0);
      const updatedKids = kids.map((kid) =>
        kid.id === kidId
          ? {
              ...kid,
              coins: kid.coins + coinsToAdd,
              streak: allDone ? kid.streak + 1 : kid.streak,
            }
          : kid
      );
      await updateDoc(doc(db, 'app', 'kids'), { data: updatedKids });
    }

    await setDoc(
      doc(db, 'app', 'dailyProgress'),
      { data: { ...dailyProgress, [kidId]: newChores } },
      { merge: true }
    );
  };

  const updatePetState = async (kidId, updates) => {
    const newPetState = {
      ...DEFAULT_PET_STATE,
      ...(petStates[kidId] || {}),
      ...updates,
    };

    await setDoc(
      doc(db, 'app', 'petStates'),
      { data: { ...petStates, [kidId]: newPetState } },
      { merge: true }
    );
  };

  const updateKidCoins = async (kidId, amount) => {
    const updatedKids = kids.map((kid) =>
      kid.id === kidId ? { ...kid, coins: Math.max(0, kid.coins - amount) } : kid
    );
    await updateDoc(doc(db, 'app', 'kids'), { data: updatedKids });
  };

  const addKidCoins = async (kidId, amount) => {
    const updatedKids = kids.map((kid) =>
      kid.id === kidId ? { ...kid, coins: kid.coins + amount } : kid
    );
    await updateDoc(doc(db, 'app', 'kids'), { data: updatedKids });
  };

  const upgradePetLevel = async (kidId) => {
    const kid = kids.find((k) => k.id === kidId);
    if (!kid) return;

    const owned = kidPets[kidId] || [];
    const activeIndex = owned.findIndex((pet) => pet.id === kid.activePet);

    if (activeIndex !== -1) {
      const current = Math.min(owned[activeIndex]?.level ?? 1, 5);
      const cost = current * 10;
      if (kid.coins < cost || current >= 5) return;

      const updatedOwned = [...owned];
      updatedOwned[activeIndex] = { ...updatedOwned[activeIndex], level: current + 1 };

      await setDoc(
        doc(db, 'app', 'kidPets'),
        { data: { ...kidPets, [kidId]: updatedOwned } },
        { merge: true }
      );

      const updatedKids = kids.map((k) =>
        k.id === kidId
          ? { ...k, coins: k.coins - cost, petLevel: current + 1 }
          : k
      );
      await updateDoc(doc(db, 'app', 'kids'), { data: updatedKids });
      return;
    }

    const current = Math.min(kid.petLevel ?? 1, 5);
    const cost = current * 10;
    if (kid.coins < cost || current >= 5) return;

    const updatedKids = kids.map((k) =>
      k.id === kidId
        ? { ...k, coins: k.coins - cost, petLevel: current + 1 }
        : k
    );
    await updateDoc(doc(db, 'app', 'kids'), { data: updatedKids });
  };

  const buyEgg = async (kidId) => {
    const kid = kids.find((k) => k.id === kidId);
    if (!kid || kid.coins < 15) return;

    const petTypes = ['dog', 'cat', 'bunny', 'dragon', 'unicorn'];
    const randomPet = petTypes[Math.floor(Math.random() * petTypes.length)];
    const newPet = { id: Date.now(), type: randomPet, level: 1 };

    const updatedPets = { ...kidPets, [kidId]: [...(kidPets[kidId] || []), newPet] };
    await setDoc(doc(db, 'app', 'kidPets'), { data: updatedPets }, { merge: true });

    const updatedKids = kids.map((k) =>
      k.id === kidId
        ? {
            ...k,
            coins: k.coins - 15,
            petType: randomPet,
            petLevel: 1,
            activePet: newPet.id,
          }
        : k
    );
    await updateDoc(doc(db, 'app', 'kids'), { data: updatedKids });
  };

  const setActivePet = async (kidId, petId) => {
    const ownedPets = kidPets[kidId] || [];
    const selected = ownedPets.find((pet) => pet.id === petId);
    if (!selected) return;

    const updatedKids = kids.map((kid) =>
      kid.id === kidId
        ? {
            ...kid,
            petType: selected.type,
            petLevel: selected.level,
            activePet: petId,
          }
        : kid
    );
    await updateDoc(doc(db, 'app', 'kids'), { data: updatedKids });
  };

  const buyItem = async (kidId, item, category) => {
    const kid = kids.find((k) => k.id === kidId);
    if (!kid) return;

    const inventory = kidInventories[kidId] || { ...EMPTY_INVENTORY };
    if ((inventory[category] || []).includes(item.id)) {
      return;
    }
    if (kid.coins < item.price) {
      return;
    }

    const updatedInventory = {
      ...inventory,
      [category]: [...(inventory[category] || []), item.id],
      equipped: { ...(inventory.equipped || {}), [category]: item.id },
    };

    await setDoc(
      doc(db, 'app', 'inventories'),
      { data: { ...kidInventories, [kidId]: updatedInventory } },
      { merge: true }
    );

    const updatedKids = kids.map((k) =>
      k.id === kidId ? { ...k, coins: k.coins - item.price } : k
    );
    await updateDoc(doc(db, 'app', 'kids'), { data: updatedKids });
  };

  const equipItem = async (kidId, itemId, category) => {
    const inventory = kidInventories[kidId] || { ...EMPTY_INVENTORY };
    const updated = {
      ...inventory,
      equipped: { ...(inventory.equipped || {}), [category]: itemId },
    };

    await setDoc(
      doc(db, 'app', 'inventories'),
      { data: { ...kidInventories, [kidId]: updated } },
      { merge: true }
    );
  };

  const saveChore = async (chore) => {
    const normalized = {
      id: chore.id ?? Date.now(),
      name: chore.name,
      value: Number(chore.points ?? chore.value ?? 0),
      icon: chore.icon ?? '⭐',
      dueDate: chore.dueDate ?? null,
      kidId: chore.kidId ?? null,
    };

    const updatedChores = chore.id
      ? chores.map((item) => (item.id === chore.id ? { ...item, ...normalized } : item))
      : [...chores, normalized];

    await setDoc(doc(db, 'app', 'chores'), { data: updatedChores });
  };

  const deleteChore = async (choreId) => {
    const updatedChores = chores.filter((item) => item.id !== choreId);
    await setDoc(doc(db, 'app', 'chores'), { data: updatedChores });

    const updatedProgress = Object.fromEntries(
      Object.entries(dailyProgress).map(([kidId, list]) => [
        kidId,
        list.filter((id) => id !== choreId),
      ])
    );
    await setDoc(doc(db, 'app', 'dailyProgress'), { data: updatedProgress });
  };

  const selectedKid = useMemo(
    () => kids.find((kid) => kid.id === selectedKidId) || null,
    [kids, selectedKidId]
  );

  const saveKid = async (kid) => {
    const normalized = {
      id: kid.id ?? Date.now(),
      name: kid.name,
      age: kid.age ?? 0,
      coins: kid.coins ?? 0,
      streak: kid.streak ?? 0,
      petLevel: kid.petLevel ?? 1,
      petType: kid.petType ?? 'none',
      activePet: kid.activePet ?? null,
    };

    const updatedKids = kid.id
      ? kids.map((item) => (item.id === kid.id ? { ...item, ...normalized } : item))
      : [...kids, normalized];

    await setDoc(doc(db, 'app', 'kids'), { data: updatedKids });

    if (!kid.id) {
      await setDoc(
        doc(db, 'app', 'dailyProgress'),
        { data: { ...dailyProgress, [normalized.id]: [] } },
        { merge: true }
      );
      await setDoc(
        doc(db, 'app', 'petStates'),
        { data: { ...petStates, [normalized.id]: { ...DEFAULT_PET_STATE } } },
        { merge: true }
      );
      await setDoc(
        doc(db, 'app', 'inventories'),
        { data: { ...kidInventories, [normalized.id]: { ...EMPTY_INVENTORY } } },
        { merge: true }
      );
      await setDoc(
        doc(db, 'app', 'kidPets'),
        { data: { ...kidPets, [normalized.id]: [] } },
        { merge: true }
      );
    }
  };

  const deleteKid = async (kidId) => {
    const updatedKids = kids.filter((kid) => kid.id !== kidId);
    await setDoc(doc(db, 'app', 'kids'), { data: updatedKids });

    const { [kidId]: _omitProgress, ...progressRest } = dailyProgress;
    await setDoc(doc(db, 'app', 'dailyProgress'), { data: progressRest });

    const { [kidId]: _omitPet, ...petRest } = petStates;
    await setDoc(doc(db, 'app', 'petStates'), { data: petRest });

    const { [kidId]: _omitInventory, ...inventoryRest } = kidInventories;
    await setDoc(doc(db, 'app', 'inventories'), { data: inventoryRest });

    const { [kidId]: _omitKidPet, ...kidPetsRest } = kidPets;
    await setDoc(doc(db, 'app', 'kidPets'), { data: kidPetsRest });

    if (selectedKidId === kidId) {
      setSelectedKidId(null);
    }
  };

  const value = {
    loading,
    kids,
    chores,
    dailyProgress,
    petStates,
    kidInventories,
    kidPets,
    selectedKidId,
    selectedKid,
    selectKid,
    toggleChore,
    updatePetState,
    updateKidCoins,
    addKidCoins,
    upgradePetLevel,
    buyEgg,
    setActivePet,
    buyItem,
    equipItem,
    saveChore,
    deleteChore,
    saveKid,
    deleteKid,
  };

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within AppDataProvider');
  }
  return context;
}
