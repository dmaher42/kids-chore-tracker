import { useState, useEffect } from 'react';
import { Plus, Trash2, DollarSign, Star, Award, ShoppingBag, Sparkles, Gamepad2, Zap } from 'lucide-react';
import Lottie from 'lottie-react';

// Firebase imports
import { db } from './firebase';
import { doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

// Pet evolution stages (5 levels!)
const PET_TYPES = {
  dog: { 
    emoji: '🐶', 
    name: 'Dog', 
    levels: ['🥚', '🐕', '🐕', '🐕‍🦺', '🦮✨']
  },
  cat: { 
    emoji: '🐱', 
    name: 'Cat', 
    levels: ['🥚', '🐱', '🐈', '🐈‍⬛', '😺✨']
  },
  bunny: { 
    emoji: '🐰', 
    name: 'Bunny', 
    levels: ['🥚', '🐰', '🐇', '🐇', '🐇✨']
  },
  dragon: { 
    emoji: '🐲', 
    name: 'Dragon', 
    levels: ['🥚', '🐲', '🐉', '🐉', '🐉✨🔥']
  },
  unicorn: { 
    emoji: '🦄', 
    name: 'Unicorn', 
    levels: ['🥚', '🦄', '🦄', '🦄', '🦄✨🌈']
  }
};

// Shop items
const SHOP_ITEMS = {
  clothing: [
    { id: 'hat1', name: 'Cool Hat', emoji: '🎩', price: 15 },
    { id: 'hat2', name: 'Party Hat', emoji: '🎉', price: 12 },
    { id: 'glasses', name: 'Sunglasses', emoji: '🕶️', price: 10 },
    { id: 'crown', name: 'Royal Crown', emoji: '👑', price: 25 },
    { id: 'bow', name: 'Cute Bow', emoji: '🎀', price: 8 },
  ],
  accessories: [
    { id: 'ball', name: 'Play Ball', emoji: '⚽', price: 5 },
    { id: 'bone', name: 'Treat Bone', emoji: '🦴', price: 7 },
    { id: 'toy', name: 'Toy Mouse', emoji: '🐭', price: 6 },
    { id: 'star', name: 'Star Badge', emoji: '⭐', price: 20 },
  ],
  backgrounds: [
    { id: 'bg1', name: 'Garden', emoji: '🌳', price: 30, gradient: 'from-green-300 to-green-500' },
    { id: 'bg2', name: 'Beach', emoji: '🏖️', price: 30, gradient: 'from-yellow-300 to-blue-400' },
    { id: 'bg3', name: 'Space', emoji: '🚀', price: 40, gradient: 'from-purple-900 to-blue-900' },
    { id: 'bg4', name: 'Castle', emoji: '🏰', price: 50, gradient: 'from-gray-400 to-purple-600' },
  ]
};

const LEVEL_NAMES = ['Egg', 'Baby', 'Teen', 'Adult', 'Legendary'];

const DEFAULT_PET_STATE = { food: 50, happy: 50 };
const EMPTY_INVENTORY = { clothing: [], accessories: [], backgrounds: [], equipped: {} };

// Lottie Pet Component for animated pets
const LottiePet = ({ url, fallbackEmoji, size = 128, className = '' }) => {
  const [animationData, setAnimationData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setAnimationData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load Lottie:', err);
        setLoading(false);
      });
  }, [url]);
  
  if (loading) {
    return <div className="text-4xl animate-pulse">⏳</div>;
  }
  
  if (!animationData) {
    return <span className={className || 'text-8xl'}>{fallbackEmoji}</span>;
  }
  
  return (
    <div style={{ width: size, height: size }} className="inline-block">
      <Lottie 
        animationData={animationData}
        loop={true}
        autoplay={true}
      />
    </div>
  );
};

// Main App Component
export default function ChoreTrackerApp() {
  const [parentPassword, setParentPassword] = useState('');
  const [currentView, setCurrentView] = useState('select');
  const [selectedKid, setSelectedKid] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [kids, setKids] = useState([]);
  const [chores, setChores] = useState([]);
  const [dailyProgress, setDailyProgress] = useState({});
  const [petStates, setPetStates] = useState({});
  const [kidInventories, setKidInventories] = useState({});
  const [kidPets, setKidPets] = useState({}); // Track owned pets per kid
  
  useEffect(() => {
    const initializeData = async () => {
      try {
        const kidsDoc = await getDoc(doc(db, 'app', 'kids'));
        
        if (!kidsDoc.exists()) {
          const initialKids = [
            { id: 1, name: 'Nash', age: 13, coins: 20, streak: 0, petLevel: 1, petType: 'none', activePet: null },
            { id: 2, name: 'Isla', age: 10, coins: 20, streak: 0, petLevel: 1, petType: 'none', activePet: null },
            { id: 3, name: 'Archer', age: 8, coins: 20, streak: 0, petLevel: 1, petType: 'none', activePet: null }
          ];
          
          const initialChores = [
            { id: 1, name: 'Empty Dishwasher', value: 2, icon: '🍽️' },
            { id: 2, name: 'Make Bed', value: 1, icon: '🛏️' },
            { id: 3, name: 'Put Clothes Away', value: 1, icon: '👕' },
            { id: 4, name: 'Take Out Trash', value: 2, icon: '🗑️' },
            { id: 5, name: 'Feed Pet', value: 1, icon: '🐕' }
          ];
          
          await setDoc(doc(db, 'app', 'kids'), { data: initialKids });
          await setDoc(doc(db, 'app', 'chores'), { data: initialChores });
          await setDoc(doc(db, 'app', 'dailyProgress'), { data: { 1: [], 2: [], 3: [] } });
          await setDoc(doc(db, 'app', 'petStates'), { 
            data: { 
              1: { food: 50, happy: 50 },
              2: { food: 50, happy: 50 },
              3: { food: 50, happy: 50 }
            } 
          });
          await setDoc(doc(db, 'app', 'inventories'), {
            data: {
              1: { clothing: [], accessories: [], backgrounds: [], equipped: {} },
              2: { clothing: [], accessories: [], backgrounds: [], equipped: {} },
              3: { clothing: [], accessories: [], backgrounds: [], equipped: {} }
            }
          });
          await setDoc(doc(db, 'app', 'kidPets'), {
            data: {
              1: [], // Array of owned pets: [{ type: 'dog', level: 1, id: timestamp }]
              2: [],
              3: []
            }
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
    const unsubscribe1 = onSnapshot(doc(db, 'app', 'kids'), (doc) => {
      if (doc.exists()) setKids(doc.data().data || []);
    });
    const unsubscribe2 = onSnapshot(doc(db, 'app', 'chores'), (doc) => {
      if (doc.exists()) setChores(doc.data().data || []);
    });
    const unsubscribe3 = onSnapshot(doc(db, 'app', 'dailyProgress'), (doc) => {
      if (doc.exists()) setDailyProgress(doc.data().data || {});
    });
    const unsubscribe4 = onSnapshot(doc(db, 'app', 'petStates'), (doc) => {
      if (doc.exists()) setPetStates(doc.data().data || {});
    });
    const unsubscribe5 = onSnapshot(doc(db, 'app', 'inventories'), (doc) => {
      if (doc.exists()) setKidInventories(doc.data().data || {});
    });
    const unsubscribe6 = onSnapshot(doc(db, 'app', 'kidPets'), (doc) => {
      if (doc.exists()) setKidPets(doc.data().data || {});
    });
    
    return () => {
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
      unsubscribe4();
      unsubscribe5();
      unsubscribe6();
    };
  }, []);
  
  const handleParentLogin = () => {
    if (parentPassword === 'parent123') {
      setCurrentView('parent');
    } else {
      alert('Incorrect password!');
    }
  };
  
  const toggleChore = async (kidId, choreId) => {
    const kidChores = dailyProgress[kidId] || [];
    let newChores;
    
    if (kidChores.includes(choreId)) {
      newChores = kidChores.filter(id => id !== choreId);
      const chore = chores.find(c => c.id === choreId);
      const updatedKids = kids.map(k => 
        k.id === kidId ? { ...k, coins: Math.max(0, k.coins - chore.value) } : k
      );
      await updateDoc(doc(db, 'app', 'kids'), { data: updatedKids });
    } else {
      newChores = [...kidChores, choreId];
      const allDone = newChores.length === chores.length;
      const chore = chores.find(c => c.id === choreId);
      const coinsToAdd = chore.value + (allDone ? 5 : 0);
      
      const updatedKids = kids.map(k => 
        k.id === kidId 
          ? { ...k, coins: k.coins + coinsToAdd, streak: allDone ? k.streak + 1 : k.streak }
          : k
      );
      await updateDoc(doc(db, 'app', 'kids'), { data: updatedKids });
    }
    
    await setDoc(doc(db, 'app', 'dailyProgress'), {
      data: { ...dailyProgress, [kidId]: newChores }
    }, { merge: true });
  };
  
  const updatePetState = async (kidId, updates) => {
    const newPetStates = {
      ...petStates,
      [kidId]: { ...(petStates[kidId] || { food: 50, happy: 50 }), ...updates }
    };
    await setDoc(doc(db, 'app', 'petStates'), { 
      data: newPetStates 
    }, { merge: true });
  };
  
  const updateKidCoins = async (kidId, coinsToSubtract) => {
    const updatedKids = kids.map(k => 
      k.id === kidId ? { ...k, coins: Math.max(0, k.coins - coinsToSubtract) } : k
    );
    await updateDoc(doc(db, 'app', 'kids'), { data: updatedKids });
  };
  
  const addKidCoins = async (kidId, coinsToAdd) => {
    const updatedKids = kids.map(k => 
      k.id === kidId ? { ...k, coins: k.coins + coinsToAdd } : k
    );
    await updateDoc(doc(db, 'app', 'kids'), { data: updatedKids });
  };
  
  const upgradePetLevel = async (kidId) => {
    const kid = kids.find(k => k.id === kidId);
    const upgradeCost = kid.petLevel * 10;
    
    if (kid.coins >= upgradeCost && kid.petLevel < 5) {
      const updatedKids = kids.map(k => 
        k.id === kidId ? { ...k, coins: Math.max(0, k.coins - upgradeCost), petLevel: k.petLevel + 1 } : k
      );
      await updateDoc(doc(db, 'app', 'kids'), { data: updatedKids });
    }
  };
  
  const buyEgg = async (kidId) => {
    const kid = kids.find(k => k.id === kidId);
    const eggCost = 15;
    
    if (kid.coins < eggCost) {
      alert(`Not enough coins! You need ${eggCost} coins to buy an egg.`);
      return;
    }
    
    // Random pet types
    const petTypes = ['dog', 'cat', 'bunny', 'dragon', 'unicorn'];
    const randomPet = petTypes[Math.floor(Math.random() * petTypes.length)];
    
    // Create new pet
    const newPet = {
      id: Date.now(),
      type: randomPet,
      level: 1
    };
    
    // Update owned pets
    const currentPets = kidPets[kidId] || [];
    const updatedPets = [...currentPets, newPet];
    
    await setDoc(doc(db, 'app', 'kidPets'), {
      data: { ...kidPets, [kidId]: updatedPets }
    }, { merge: true });
    
    // Deduct coins and set as active pet
    const updatedKids = kids.map(k => 
      k.id === kidId ? { 
        ...k, 
        coins: k.coins - eggCost,
        petType: randomPet,
        petLevel: 1,
        activePet: newPet.id
      } : k
    );
    await updateDoc(doc(db, 'app', 'kids'), { data: updatedKids });
    
    // Show exciting hatch message
    setTimeout(() => {
      const petEmojis = { dog: '🐕', cat: '🐱', bunny: '🐰', dragon: '🐲', unicorn: '🦄' };
      alert(`🎉 Your egg hatched! You got a ${randomPet}! ${petEmojis[randomPet]}`);
    }, 100);
  };
  
  const setActivePet = async (kidId, petId) => {
    const ownedPets = kidPets[kidId] || [];
    const selectedPet = ownedPets.find(p => p.id === petId);
    
    if (selectedPet) {
      const updatedKids = kids.map(k => 
        k.id === kidId ? { 
          ...k, 
          petType: selectedPet.type, 
          petLevel: selectedPet.level,
          activePet: petId 
        } : k
      );
      await updateDoc(doc(db, 'app', 'kids'), { data: updatedKids });
    }
  };
  
  const buyItem = async (kidId, item, category) => {
    const kid = kids.find(k => k.id === kidId);
    const inventory = kidInventories[kidId] || { clothing: [], accessories: [], backgrounds: [], equipped: {} };
    
    // Check if already owned
    if (inventory[category] && inventory[category].includes(item.id)) {
      alert('You already own this item!');
      return;
    }
    
    // Check if enough coins
    if (kid.coins < item.price) {
      alert(`Not enough coins! You need ${item.price} coins.`);
      return;
    }
    
    try {
      // Update inventory and AUTO-EQUIP the item!
      const newInventory = {
        ...inventory,
        [category]: [...(inventory[category] || []), item.id],
        equipped: { ...(inventory.equipped || {}), [category]: item.id } // Auto-equip!
      };
      
      // Update coins
      const updatedKids = kids.map(k => 
        k.id === kidId ? { ...k, coins: k.coins - item.price } : k
      );
      
      // Update inventory in Firebase
      await setDoc(doc(db, 'app', 'inventories'), {
        data: { ...kidInventories, [kidId]: newInventory }
      }, { merge: true });
      
      // Update coins in Firebase
      await updateDoc(doc(db, 'app', 'kids'), { 
        data: updatedKids 
      });
      
      alert(`Successfully bought and equipped ${item.name}! 🎉`);
    } catch (error) {
      console.error('Error buying item:', error);
      alert('Error purchasing item. Please try again.');
    }
  };
  
  const equipItem = async (kidId, itemId, category) => {
    const inventory = kidInventories[kidId] || { clothing: [], accessories: [], backgrounds: [], equipped: {} };
    const newEquipped = { ...(inventory.equipped || {}), [category]: itemId };
    
    await setDoc(doc(db, 'app', 'inventories'), {
      data: {
        ...kidInventories,
        [kidId]: { ...inventory, equipped: newEquipped }
      }
    }, { merge: true });
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }
  
  const KidSelectScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-2">Chore Champions</h1>
        <p className="text-white text-center mb-8">Who's doing chores today?</p>
        
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {kids.map(kid => {
            const ownedPets = kidPets[kid.id] || [];
            const activePet = ownedPets.find(pet => pet.id === kid.activePet) || null;
            const petTypeKey = activePet?.type || (kid.petType && kid.petType !== 'none' ? kid.petType : null);
            const petType = petTypeKey ? (PET_TYPES[petTypeKey] || null) : null;
            const petLevel = activePet?.level || kid.petLevel || 1;
            const hasPet = Boolean(petType);
            const kidInventory = kidInventories[kid.id] || EMPTY_INVENTORY;
            const equippedClothing = kidInventory.equipped && kidInventory.equipped.clothing ? 
              SHOP_ITEMS.clothing.find(i => i.id === kidInventory.equipped.clothing) : null;
            
            return (
              <button
                key={kid.id}
                onClick={() => { setSelectedKid(kid.id); setCurrentView('kid'); }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform relative"
              >
                <div className="relative">
                  {hasPet ? (
                    <>
                      {/* Show pet if owned */}
                      {petTypeKey === 'dog' && petLevel === 3 ? (
                        <div className="flex justify-center mb-2">
                          <LottiePet 
                            url="https://lottie.host/buvwpY646G/data.json"
                            fallbackEmoji="🐕"
                            size={96}
                          />
                        </div>
                      ) : (
                        <div className="text-6xl mb-2 text-center animate-bounce">
                          {petType && petType.levels ? petType.levels[Math.min(petType.levels.length - 1, Math.max(0, petLevel - 1))] : '🥚'}
                        </div>
                      )}
                      {equippedClothing && (
                        <div className="text-2xl absolute top-0 left-1/2 transform -translate-x-1/2 animate-pulse">
                          {equippedClothing.emoji}
                        </div>
                      )}
                      <div className="text-sm text-gray-500 text-center mb-2">
                        {petType ? `${LEVEL_NAMES[Math.max(0, Math.min(LEVEL_NAMES.length - 1, petLevel - 1))]} ${petType.name}` : 'No pet'}
                      </div>
                      <div className="text-xs text-blue-600 text-center mb-2">{ownedPets.length} pet(s) owned</div>
                    </>
                  ) : (
                    <>
                      {/* No pet - show egg invitation */}
                      <div className="text-6xl mb-2 text-center">🥚</div>
                      <div className="text-sm text-gray-500 text-center mb-2">No pet yet!</div>
                      <div className="text-xs text-blue-600 text-center">Buy an egg to hatch a pet!</div>
                    </>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-center mb-2">{kid.name}</h3>
                <div className="flex justify-center items-center gap-2 text-yellow-600">
                  <DollarSign size={20} />
                  <span className="font-bold">{kid.coins} coins</span>
                </div>
                {kid.streak > 0 && (
                  <div className="flex justify-center items-center gap-1 text-orange-500 mt-2">
                    <Star size={16} />
                    <span className="text-sm">{kid.streak} day streak!</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
        
        <button
          onClick={() => setCurrentView('parent-login')}
          className="w-full bg-white/20 text-white py-3 rounded-lg hover:bg-white/30 transition"
        >
          Parent Settings
        </button>
      </div>
    </div>
  );
  
  const ParentLoginScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 p-6 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4">Parent Login</h2>
        <input
          type="password"
          placeholder="Enter password"
          className="w-full p-3 border rounded-lg mb-4"
          value={parentPassword}
          onChange={(e) => setParentPassword(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleParentLogin()}
        />
        <button
          onClick={handleParentLogin}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition"
        >
          Login
        </button>
        <button
          onClick={() => setCurrentView('select')}
          className="w-full mt-2 text-gray-500 py-2"
        >
          Back
        </button>
        <p className="text-xs text-gray-400 mt-4">Demo password: parent123</p>
      </div>
    </div>
  );
  
  const KidScreen = () => {
    const [showShop, setShowShop] = useState(false);
    const [showGames, setShowGames] = useState(false);
    const kid = kids.find(k => k.id === selectedKid);
    const completedChores = dailyProgress[selectedKid] || [];
    const allDone = completedChores.length === chores.length;
    const kidPetState = petStates[selectedKid] || DEFAULT_PET_STATE;
    const kidInventory = kidInventories[selectedKid] || EMPTY_INVENTORY;
    const kidOwnedPets = kidPets[selectedKid] || [];

    if (!kid) return null;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-400 to-blue-500 p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => { setCurrentView('select'); setSelectedKid(null); }}
            className="text-white mb-4"
          >
            ← Back
          </button>
          
          <div className="bg-white rounded-2xl p-6 shadow-xl mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-3xl font-bold">{kid.name}'s Chores</h2>
                <p className="text-gray-600">Complete all tasks to unlock the game!</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-yellow-600">{kid.coins} 🪙</div>
                {kid.streak > 0 && (
                  <div className="text-orange-500 text-sm">🔥 {kid.streak} day streak</div>
                )}
              </div>
            </div>
            
            <div className="space-y-3">
              {chores.map(chore => {
                const isComplete = completedChores.includes(chore.id);
                return (
                  <button
                    key={chore.id}
                    onClick={() => toggleChore(selectedKid, chore.id)}
                    className={`w-full p-4 rounded-xl border-2 transition-all ${
                      isComplete 
                        ? 'bg-green-100 border-green-500' 
                        : 'bg-white border-gray-200 hover:border-blue-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{chore.icon}</span>
                        <span className="font-semibold text-lg">{chore.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-yellow-600 font-bold">${chore.value}</span>
                        {isComplete && <span className="text-2xl">✅</span>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {allDone && (
              <div className="mt-6 bg-gradient-to-r from-yellow-400 to-orange-500 p-4 rounded-xl text-white text-center">
                <Award size={32} className="mx-auto mb-2" />
                <h3 className="text-xl font-bold">All Done! +5 Bonus Coins! 🎉</h3>
                <p>Play the game below!</p>
              </div>
            )}
          </div>
          
          {allDone && !showShop && !showGames && (
            <VirtualPetGame
              kid={kid}
              petState={kidPetState}
              inventory={kidInventory}
              ownedPets={kidOwnedPets}
              onUpdatePetState={(updates) => updatePetState(selectedKid, updates)}
              onSpendCoins={(amount) => updateKidCoins(selectedKid, amount)}
              onUpgradePet={() => upgradePetLevel(selectedKid)}
              onOpenShop={() => setShowShop(true)}
              onOpenGames={() => setShowGames(true)}
              onEquipItem={(itemId, category) => equipItem(selectedKid, itemId, category)}
              onBuyEgg={() => buyEgg(selectedKid)}
              onChangeActivePet={(petId) => setActivePet(selectedKid, petId)}
            />
          )}

          {allDone && showShop && (
            <PetShop
              kid={kid}
              inventory={kidInventory}
              onBuy={(item, category) => buyItem(selectedKid, item, category)}
              onClose={() => setShowShop(false)}
            />
          )}
          
          {allDone && showGames && (
            <MiniGames
              kid={kid}
              onEarnCoins={(amount) => addKidCoins(selectedKid, amount)}
              onClose={() => setShowGames(false)}
            />
          )}
        </div>
      </div>
    );
  };
  
  const VirtualPetGame = ({
    kid,
    petState,
    inventory,
    ownedPets,
    onUpdatePetState,
    onSpendCoins,
    onUpgradePet,
    onOpenShop,
    onOpenGames,
    onEquipItem,
    onBuyEgg,
    onChangeActivePet
  }) => {
    const [showPetSelector, setShowPetSelector] = useState(false);
    const [petAnimation, setPetAnimation] = useState('bounce');

    const safePetState = { ...DEFAULT_PET_STATE, ...petState };
    const equipped = inventory?.equipped || {};
    const activePet = ownedPets.find(pet => pet.id === kid.activePet) || null;
    const fallbackPet = activePet || ownedPets[0] || null;
    const petTypeKey = fallbackPet?.type || (kid.petType !== 'none' ? kid.petType : null);
    const petMeta = petTypeKey ? PET_TYPES[petTypeKey] : null;
    const petLevel = fallbackPet?.level || kid.petLevel || 1;
    const hasPet = Boolean(petMeta && ownedPets.length > 0);
    const equippedBg = equipped.backgrounds
      ? SHOP_ITEMS.backgrounds.find(bg => bg.id === equipped.backgrounds)
      : null;
    const bgClass = equippedBg ? equippedBg.gradient : 'from-sky-200 to-green-200';
    const upgradeCost = petLevel * 10;

    useEffect(() => {
      const animations = ['bounce', 'pulse', 'wiggle', 'float'];
      let index = 0;
      const interval = setInterval(() => {
        index = (index + 1) % animations.length;
        setPetAnimation(animations[index]);
      }, 3000);
      return () => clearInterval(interval);
    }, []);

    const getAnimationClass = (anim) => {
      switch (anim) {
        case 'bounce': return 'animate-bounce';
        case 'pulse': return 'animate-pulse';
        case 'wiggle': return 'animate-wiggle';
        case 'float': return 'animate-float';
        case 'jump': return 'animate-jump';
        case 'spin': return 'animate-spin-once';
        case 'tada': return 'animate-tada';
        default: return 'animate-bounce';
      }
    };

    const spendCoins = (amount) => {
      if (kid.coins < amount) return false;
      onSpendCoins(amount);
      return true;
    };

    const feedPet = () => {
      if (spendCoins(3)) {
        onUpdatePetState({ food: Math.min(100, safePetState.food + 20) });
        setPetAnimation('jump');
        setTimeout(() => setPetAnimation('bounce'), 500);
      }
    };

    const playWithPet = () => {
      if (spendCoins(2)) {
        onUpdatePetState({ happy: Math.min(100, safePetState.happy + 20) });
        setPetAnimation('spin');
        setTimeout(() => setPetAnimation('bounce'), 500);
      }
    };

    const handleUpgrade = () => {
      if (kid.coins >= upgradeCost && petLevel < 5) {
        onUpgradePet();
        setPetAnimation('tada');
        setTimeout(() => setPetAnimation('bounce'), 1000);
      }
    };

    const handleBuyEgg = () => {
      const eggCost = 15;
      if (kid.coins < eggCost) {
        alert(`Not enough coins! You need ${eggCost} coins to buy an egg.`);
        return;
      }
      onBuyEgg();
      setPetAnimation('tada');
      setTimeout(() => setPetAnimation('bounce'), 1000);
    };

    const handlePetSelect = (petId) => {
      onChangeActivePet(petId);
      setPetAnimation('tada');
      setTimeout(() => setPetAnimation('bounce'), 1000);
      setShowPetSelector(false);
    };

    const equippedClothing = equipped.clothing
      ? SHOP_ITEMS.clothing.find(i => i.id === equipped.clothing)
      : null;
    const equippedAccessory = equipped.accessories
      ? SHOP_ITEMS.accessories.find(i => i.id === equipped.accessories)
      : null;

    const inventorySections = [
      {
        key: 'clothing',
        title: 'Your Wardrobe',
        items: SHOP_ITEMS.clothing,
        activeClass: 'border-blue-500 bg-blue-50 animate-pulse',
        renderItem: (item) => <div className="text-2xl">{item.emoji}</div>
      },
      {
        key: 'accessories',
        title: 'Your Accessories',
        items: SHOP_ITEMS.accessories,
        activeClass: 'border-green-500 bg-green-50 animate-pulse',
        renderItem: (item) => <div className="text-2xl">{item.emoji}</div>
      },
      {
        key: 'backgrounds',
        title: 'Backgrounds',
        items: SHOP_ITEMS.backgrounds,
        activeClass: 'border-purple-500 bg-purple-50 animate-pulse',
        renderItem: (item) => (
          <div className={`h-16 w-24 rounded-lg bg-gradient-to-br ${item.gradient}`}></div>
        )
      }
    ];

    return (
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <style>{`
          @keyframes wiggle {
            0%, 100% { transform: rotate(-3deg); }
            50% { transform: rotate(3deg); }
          }
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          @keyframes jump {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-30px); }
          }
          @keyframes spin-once {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes tada {
            0% { transform: scale(1) rotate(0deg); }
            10%, 20% { transform: scale(0.9) rotate(-3deg); }
            30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); }
            40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); }
            100% { transform: scale(1) rotate(0deg); }
          }
          .animate-wiggle { animation: wiggle 1s ease-in-out infinite; }
          .animate-float { animation: float 2s ease-in-out infinite; }
          .animate-jump { animation: jump 0.5s ease-out; }
          .animate-spin-once { animation: spin-once 0.5s ease-out; }
          .animate-tada { animation: tada 1s ease-out; }
        `}</style>

        <div className="flex justify-between items-center mb-4">
          <h3 className="text-2xl font-bold">🏠 Your Virtual Pet</h3>
          <div className="flex gap-2">
            <button
              onClick={onOpenGames}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
              <Gamepad2 size={20} />
              Games
            </button>
            <button
              onClick={onOpenShop}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 flex items-center gap-2"
            >
              <ShoppingBag size={20} />
              Shop
            </button>
          </div>
        </div>

        <div className={`bg-gradient-to-b ${bgClass} rounded-xl p-6 mb-4 min-h-64 relative overflow-hidden`}>
          <div className="text-center relative">
            {hasPet && petMeta ? (
              petTypeKey === 'dog' && petLevel === 3 ? (
                <div className="inline-block">
                  <LottiePet
                    url="https://lottie.host/buvwpY646G/data.json"
                    fallbackEmoji="🐕"
                    size={128}
                    className="text-8xl"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowPetSelector(!showPetSelector)}
                  className={`text-8xl mb-2 hover:scale-110 transition-transform cursor-pointer inline-block ${getAnimationClass(petAnimation)}`}
                >
                  {petMeta.levels[Math.min(petMeta.levels.length - 1, Math.max(0, petLevel - 1))]}
                </button>
              )
            ) : (
              <div className="text-center">
                <div className={`text-8xl mb-2 ${getAnimationClass(petAnimation)}`}>🥚</div>
                <p className="text-sm text-white">Buy an egg to hatch your first pet!</p>
              </div>
            )}

            {equippedClothing && (
              <div className="text-4xl absolute top-4 left-1/2 transform -translate-x-1/2 animate-pulse pointer-events-none">
                {equippedClothing.emoji}
              </div>
            )}
            {equippedAccessory && (
              <div className="text-3xl absolute bottom-16 left-1/2 transform -translate-x-1/2 animate-bounce pointer-events-none">
                {equippedAccessory.emoji}
              </div>
            )}

            {hasPet && (
              <button
                onClick={() => setShowPetSelector(!showPetSelector)}
                className="text-sm text-blue-600 hover:underline mt-2"
              >
                Change Pet
              </button>
            )}
          </div>

          {showPetSelector && (
            <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-xl p-4 shadow-xl z-10">
              <h4 className="font-bold mb-3">Choose Your Pet</h4>
              {ownedPets.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {ownedPets.map(pet => {
                    const metadata = PET_TYPES[pet.type];
                    const isActive = kid.activePet === pet.id;
                    return (
                      <button
                        key={pet.id}
                        onClick={() => handlePetSelect(pet.id)}
                        className={`p-3 rounded-lg border-2 transition ${
                          isActive ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-400'
                        }`}
                      >
                        <div className="text-3xl">
                          {metadata ? metadata.levels[Math.min(metadata.levels.length - 1, Math.max(0, pet.level - 1))] : '🐾'}
                        </div>
                        <div className="text-xs font-semibold mt-1">{metadata ? metadata.name : pet.type}</div>
                        <div className="text-[10px] text-gray-500">Level {pet.level}</div>
                        {isActive && <div className="text-xs text-blue-500 font-semibold mt-1">Active</div>}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-600">No pets yet. Buy an egg to get started!</p>
              )}

              <button
                onClick={handleBuyEgg}
                className="mt-3 w-full bg-yellow-400 hover:bg-yellow-500 text-white py-2 rounded-lg font-semibold flex items-center justify-center gap-2"
              >
                <span role="img" aria-hidden="true">🥚</span>
                Buy Mystery Egg (15 coins)
              </button>
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4">
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Food: {safePetState.food}%</span>
                <span>Happiness: {safePetState.happy}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${safePetState.food}%` }}
                ></div>
              </div>
              <div className="bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className="bg-pink-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${safePetState.happy}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={feedPet}
            disabled={kid.coins < 3}
            className="bg-orange-500 text-white py-3 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-orange-600 hover:scale-105 transition-all"
          >
            🍖 Feed
            <br />
            <span className="text-sm">(3 coins)</span>
          </button>
          <button
            onClick={playWithPet}
            disabled={kid.coins < 2}
            className="bg-pink-500 text-white py-3 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-pink-600 hover:scale-105 transition-all"
          >
            ⚽ Play
            <br />
            <span className="text-sm">(2 coins)</span>
          </button>
          <button
            onClick={handleUpgrade}
            disabled={kid.coins < upgradeCost || petLevel >= 5}
            className="bg-purple-500 text-white py-3 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-purple-600 hover:scale-105 transition-all"
          >
            {petLevel >= 5 ? '✨ MAX' : `⭐ Evolve (${upgradeCost})`}
          </button>
        </div>

        <button
          onClick={handleBuyEgg}
          disabled={kid.coins < 15}
          className="mt-4 w-full bg-yellow-400 hover:bg-yellow-500 text-white py-3 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2"
        >
          <span role="img" aria-hidden="true">🥚</span>
          {ownedPets.length ? 'Buy Another Egg (15 coins)' : 'Buy Your First Egg (15 coins)'}
        </button>

        {inventorySections.map(section => {
          const owned = inventory[section.key] || [];
          if (!owned.length) return null;
          const equippedId = equipped[section.key];
          return (
            <div key={section.key} className="mt-4">
              <h4 className="font-bold mb-2">{section.title}</h4>
              <div className="flex gap-2 flex-wrap">
                {owned.map(itemId => {
                  const item = section.items.find(i => i.id === itemId);
                  if (!item) return null;
                  const isEquipped = equippedId === itemId;
                  return (
                    <button
                      key={itemId}
                      onClick={() => onEquipItem(itemId, section.key)}
                      className={`p-2 rounded-lg border-2 transition-all hover:scale-110 ${
                        isEquipped ? section.activeClass : 'border-gray-200'
                      }`}
                    >
                      {section.renderItem(item)}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  const MiniGames = ({ kid, onEarnCoins, onClose }) => {
    const [currentGame, setCurrentGame] = useState(null);
    
    // Quick Click Game
    const [clickCount, setClickCount] = useState(0);
    const [clickTimeLeft, setClickTimeLeft] = useState(5);
    const [clickGameActive, setClickGameActive] = useState(false);
    
    useEffect(() => {
      if (clickGameActive && clickTimeLeft > 0) {
        const timer = setTimeout(() => setClickTimeLeft(clickTimeLeft - 1), 1000);
        return () => clearTimeout(timer);
      } else if (clickGameActive && clickTimeLeft === 0) {
        setClickGameActive(false);
        const coinsEarned = Math.floor(clickCount / 2);
        if (coinsEarned > 0) {
          onEarnCoins(coinsEarned);
          alert(`Great job! You earned ${coinsEarned} coins!`);
        }
      }
    }, [clickTimeLeft, clickGameActive, clickCount, onEarnCoins]);
    
    const startClickGame = () => {
      setClickCount(0);
      setClickTimeLeft(5);
      setClickGameActive(true);
    };
    
    // Memory Game
    const [memoryCards, setMemoryCards] = useState([]);
    const [flippedCards, setFlippedCards] = useState([]);
    const [matchedCards, setMatchedCards] = useState([]);
    const [memoryMoves, setMemoryMoves] = useState(0);
    
    const startMemoryGame = () => {
      const emojis = ['🍎', '🍌', '🍇', '🍓'];
      const cards = [...emojis, ...emojis].sort(() => Math.random() - 0.5).map((emoji, i) => ({ id: i, emoji }));
      setMemoryCards(cards);
      setFlippedCards([]);
      setMatchedCards([]);
      setMemoryMoves(0);
      setCurrentGame('memory');
    };
    
    const flipCard = (id) => {
      if (flippedCards.length === 2 || flippedCards.includes(id) || matchedCards.includes(id)) return;
      
      const newFlipped = [...flippedCards, id];
      setFlippedCards(newFlipped);
      
      if (newFlipped.length === 2) {
        setMemoryMoves(memoryMoves + 1);
        const card1 = memoryCards.find(c => c.id === newFlipped[0]);
        const card2 = memoryCards.find(c => c.id === newFlipped[1]);
        
        if (card1.emoji === card2.emoji) {
          setMatchedCards([...matchedCards, ...newFlipped]);
          setFlippedCards([]);
          
          if (matchedCards.length + 2 === memoryCards.length) {
            const bonus = Math.max(5 - memoryMoves, 1);
            onEarnCoins(bonus);
            setTimeout(() => alert(`You won! Earned ${bonus} coins!`), 300);
          }
        } else {
          setTimeout(() => setFlippedCards([]), 1000);
        }
      }
    };
    
    // Coin Flip Game
    const [coinFlipResult, setCoinFlipResult] = useState(null);
    const [coinFlipBet, setCoinFlipBet] = useState(2);
    
    const playCoinFlip = (guess) => {
      if (kid.coins < coinFlipBet) {
        alert('Not enough coins!');
        return;
      }
      
      const result = Math.random() > 0.5 ? 'heads' : 'tails';
      setCoinFlipResult(result);
      
      if (result === guess) {
        onEarnCoins(coinFlipBet * 2);
        setTimeout(() => alert(`You won! Earned ${coinFlipBet * 2} coins!`), 500);
      } else {
        onEarnCoins(-coinFlipBet);
        setTimeout(() => alert(`You lost ${coinFlipBet} coins. Try again!`), 500);
      }
      
      setTimeout(() => setCoinFlipResult(null), 2000);
    };
    
    if (!currentGame) {
      return (
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">🎮 Mini Games</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              ← Back
            </button>
          </div>
          
          <div className="grid gap-4">
            <button
              onClick={() => { startClickGame(); setCurrentGame('click'); }}
              className="bg-gradient-to-r from-red-400 to-orange-500 text-white p-6 rounded-xl hover:scale-105 transition"
            >
              <Zap size={40} className="mx-auto mb-2" />
              <h4 className="text-xl font-bold">Quick Click</h4>
              <p className="text-sm">Click fast for 5 seconds!</p>
              <p className="text-xs mt-2">Earn: 1 coin per 2 clicks</p>
            </button>
            
            <button
              onClick={startMemoryGame}
              className="bg-gradient-to-r from-blue-400 to-purple-500 text-white p-6 rounded-xl hover:scale-105 transition"
            >
              <span className="text-4xl">🧠</span>
              <h4 className="text-xl font-bold">Memory Match</h4>
              <p className="text-sm">Match the pairs!</p>
              <p className="text-xs mt-2">Earn: Up to 5 coins</p>
            </button>
            
            <button
              onClick={() => setCurrentGame('coinflip')}
              className="bg-gradient-to-r from-yellow-400 to-green-500 text-white p-6 rounded-xl hover:scale-105 transition"
            >
              <span className="text-4xl">🪙</span>
              <h4 className="text-xl font-bold">Lucky Flip</h4>
              <p className="text-sm">Guess heads or tails!</p>
              <p className="text-xs mt-2">Risk coins to win double!</p>
            </button>
          </div>
        </div>
      );
    }
    
    if (currentGame === 'click') {
      return (
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">⚡ Quick Click</h3>
            <button onClick={() => setCurrentGame(null)} className="text-gray-500">
              ← Back
            </button>
          </div>
          
          <div className="text-center">
            <div className="text-6xl font-bold text-blue-600 mb-4">{clickTimeLeft}s</div>
            <div className="text-4xl font-bold text-green-600 mb-6">Clicks: {clickCount}</div>
            
            <button
              onClick={() => clickGameActive && setClickCount(clickCount + 1)}
              disabled={!clickGameActive}
              className="w-full h-48 bg-gradient-to-r from-red-500 to-orange-500 text-white text-3xl font-bold rounded-xl hover:scale-105 transition disabled:opacity-50"
            >
              {clickGameActive ? 'CLICK ME!' : 'Start Game'}
            </button>
            
            {!clickGameActive && clickTimeLeft === 5 && (
              <button
                onClick={startClickGame}
                className="mt-4 w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600"
              >
                Start Game
              </button>
            )}
          </div>
        </div>
      );
    }
    
    if (currentGame === 'memory') {
      return (
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold">🧠 Memory Match</h3>
            <button onClick={() => setCurrentGame(null)} className="text-gray-500">
              ← Back
            </button>
          </div>
          
          <div className="text-center mb-4">
            <span className="text-lg font-bold">Moves: {memoryMoves}</span>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            {memoryCards.map(card => (
              <button
                key={card.id}
                onClick={() => flipCard(card.id)}
                className="aspect-square bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl text-4xl flex items-center justify-center hover:scale-105 transition"
              >
                {flippedCards.includes(card.id) || matchedCards.includes(card.id) ? card.emoji : '?'}
              </button>
            ))}
          </div>
        </div>
      );
    }
    
    if (currentGame === 'coinflip') {
      return (
        <div className="bg-white rounded-2xl p-6 shadow-xl">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold">🪙 Lucky Flip</h3>
            <button onClick={() => setCurrentGame(null)} className="text-gray-500">
              ← Back
            </button>
          </div>
          
          <div className="text-center">
            <div className="text-6xl mb-4">
              {coinFlipResult === 'heads' ? '🙂' : coinFlipResult === 'tails' ? '🪙' : '🪙'}
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2">Bet Amount:</label>
              <input
                type="number"
                min="1"
                max={kid.coins}
                value={coinFlipBet}
                onChange={(e) => setCoinFlipBet(Number(e.target.value))}
                className="w-32 p-2 border rounded-lg text-center"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => playCoinFlip('heads')}
                disabled={coinFlipResult !== null}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white py-6 rounded-xl hover:scale-105 transition disabled:opacity-50"
              >
                <div className="text-3xl mb-2">🙂</div>
                <div className="font-bold">HEADS</div>
              </button>
              <button
                onClick={() => playCoinFlip('tails')}
                disabled={coinFlipResult !== null}
                className="bg-gradient-to-r from-blue-400 to-purple-500 text-white py-6 rounded-xl hover:scale-105 transition disabled:opacity-50"
              >
                <div className="text-3xl mb-2">🪙</div>
                <div className="font-bold">TAILS</div>
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mt-4">Win: Double your bet! Lose: Lose your bet</p>
          </div>
        </div>
      );
    }
  };
  
  const PetShop = ({ kid, inventory, onBuy, onClose }) => {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold">🛍️ Pet Shop</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ← Back to Pet
          </button>
        </div>
        
        <div className="mb-4 text-center">
          <span className="text-2xl font-bold text-yellow-600">{kid.coins} 🪙</span>
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
              <Sparkles size={20} /> Clothing & Hats
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SHOP_ITEMS.clothing.map(item => {
                const owned = inventory.clothing && inventory.clothing.includes(item.id);
                const canAfford = kid.coins >= item.price;
                return (
                  <button
                    key={item.id}
                    onClick={() => !owned && canAfford && onBuy(item, 'clothing')}
                    disabled={owned || !canAfford}
                    className={`p-4 rounded-xl border-2 transition ${
                      owned 
                        ? 'bg-green-100 border-green-500' 
                        : canAfford
                        ? 'border-gray-200 hover:border-purple-400 hover:scale-105'
                        : 'border-gray-200 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-4xl mb-2">{item.emoji}</div>
                    <div className="text-sm font-semibold">{item.name}</div>
                    <div className="text-yellow-600 font-bold">
                      {owned ? '✅ Owned' : `${item.price} coins`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-3">🎮 Accessories</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {SHOP_ITEMS.accessories.map(item => {
                const owned = inventory.accessories && inventory.accessories.includes(item.id);
                const canAfford = kid.coins >= item.price;
                return (
                  <button
                    key={item.id}
                    onClick={() => !owned && canAfford && onBuy(item, 'accessories')}
                    disabled={owned || !canAfford}
                    className={`p-4 rounded-xl border-2 transition ${
                      owned 
                        ? 'bg-green-100 border-green-500' 
                        : canAfford
                        ? 'border-gray-200 hover:border-purple-400 hover:scale-105'
                        : 'border-gray-200 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className="text-3xl mb-2">{item.emoji}</div>
                    <div className="text-xs font-semibold">{item.name}</div>
                    <div className="text-yellow-600 text-sm font-bold">
                      {owned ? '✅' : `${item.price}`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-lg mb-3">🌈 Backgrounds</h4>
            <div className="grid grid-cols-2 gap-3">
              {SHOP_ITEMS.backgrounds.map(item => {
                const owned = inventory.backgrounds && inventory.backgrounds.includes(item.id);
                const canAfford = kid.coins >= item.price;
                return (
                  <button
                    key={item.id}
                    onClick={() => !owned && canAfford && onBuy(item, 'backgrounds')}
                    disabled={owned || !canAfford}
                    className={`p-4 rounded-xl border-2 transition ${
                      owned 
                        ? 'bg-green-100 border-green-500' 
                        : canAfford
                        ? 'border-gray-200 hover:border-purple-400 hover:scale-105'
                        : 'border-gray-200 opacity-50 cursor-not-allowed'
                    }`}
                  >
                    <div className={`h-20 rounded-lg bg-gradient-to-br ${item.gradient} mb-2`}></div>
                    <div className="text-sm font-semibold">{item.emoji} {item.name}</div>
                    <div className="text-yellow-600 font-bold">
                      {owned ? '✅ Owned' : `${item.price} coins`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const ParentDashboard = () => {
    const [newChoreName, setNewChoreName] = useState('');
    const [newChoreValue, setNewChoreValue] = useState(1);
    const [newChoreIcon, setNewChoreIcon] = useState('✅');
    const [isSavingChore, setIsSavingChore] = useState(false);
    const [isResettingDaily, setIsResettingDaily] = useState(false);
    const [isProcessingPayout, setIsProcessingPayout] = useState(false);
    const [parentActionMessage, setParentActionMessage] = useState(null);
    const [parentActionType, setParentActionType] = useState('success');

    const setFeedback = (type, message) => {
      setParentActionType(type);
      setParentActionMessage(message);
    };

    const addChore = async () => {
      const trimmedName = newChoreName.trim();
      if (!trimmedName) {
        setFeedback('error', 'Please enter a name for the new chore.');
        return;
      }

      const newChore = {
        id: Date.now(),
        name: trimmedName,
        value: newChoreValue,
        icon: newChoreIcon
      };

      const previousChores = chores;
      const updatedChores = [...chores, newChore];

      try {
        setIsSavingChore(true);
        setChores(updatedChores);
        await setDoc(doc(db, 'app', 'chores'), {
          data: updatedChores
        }, { merge: true });
        setNewChoreName('');
        setNewChoreValue(1);
        setNewChoreIcon('✅');
        setFeedback('success', 'Chore added successfully.');
      } catch (error) {
        console.error('Error adding chore:', error);
        setChores(previousChores);
        setFeedback('error', 'Could not add the chore. Please try again.');
      } finally {
        setIsSavingChore(false);
      }
    };

    const deleteChore = async (id) => {
      const previousChores = chores;
      const updatedChores = chores.filter(c => c.id !== id);

      try {
        setIsSavingChore(true);
        setChores(updatedChores);
        await setDoc(doc(db, 'app', 'chores'), {
          data: updatedChores
        }, { merge: true });
        setFeedback('success', 'Chore removed.');
      } catch (error) {
        console.error('Error deleting chore:', error);
        setChores(previousChores);
        setFeedback('error', 'Could not delete the chore. Please try again.');
      } finally {
        setIsSavingChore(false);
      }
    };

    const resetDaily = async () => {
      if (window.confirm('Reset all daily progress? This will keep coins and streaks.')) {
        const previousProgress = dailyProgress;
        const resetProgress = kids.reduce((acc, kid) => {
          acc[kid.id] = [];
          return acc;
        }, {});

        try {
          setIsResettingDaily(true);
          setDailyProgress(resetProgress);
          await setDoc(doc(db, 'app', 'dailyProgress'), {
            data: resetProgress
          }, { merge: true });
          setFeedback('success', 'Daily progress reset for everyone.');
        } catch (error) {
          console.error('Error resetting daily progress:', error);
          setDailyProgress(previousProgress);
          setFeedback('error', 'Could not reset daily progress. Please try again.');
        } finally {
          setIsResettingDaily(false);
        }
      }
    };

    const weeklyPayout = async () => {
      if (window.confirm('Process weekly payout? This will reset coins to 0.')) {
        const previousKids = kids;
        const previousProgress = dailyProgress;
        const resetKids = kids.map(k => ({ ...k, coins: 0 }));
        const resetProgress = kids.reduce((acc, kid) => {
          acc[kid.id] = [];
          return acc;
        }, {});

        try {
          setIsProcessingPayout(true);
          setKids(resetKids);
          setDailyProgress(resetProgress);
          await updateDoc(doc(db, 'app', 'kids'), { data: resetKids });
          await setDoc(doc(db, 'app', 'dailyProgress'), {
            data: resetProgress
          }, { merge: true });
          setFeedback('success', 'Weekly payout processed and coins reset.');
        } catch (error) {
          console.error('Error processing weekly payout:', error);
          setKids(previousKids);
          setDailyProgress(previousProgress);
          setFeedback('error', 'Could not process the weekly payout. Please try again.');
        } finally {
          setIsProcessingPayout(false);
        }
      }
    };

    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Parent Dashboard</h1>
            <button
              onClick={() => setCurrentView('select')}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg"
            >
              Exit
            </button>
          </div>

          {parentActionMessage && (
            <div
              className={`mb-6 rounded-lg px-4 py-3 ${
                parentActionType === 'success'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}
            >
              {parentActionMessage}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {kids.map(kid => {
              const ownedPets = kidPets[kid.id] || [];
              const activePet = ownedPets.find(pet => pet.id === kid.activePet) || null;
              const petTypeKey = activePet?.type || (kid.petType && kid.petType !== 'none' ? kid.petType : null);
              const petType = petTypeKey ? (PET_TYPES[petTypeKey] || null) : null;
              const petLevel = activePet?.level || kid.petLevel || 1;
              const hasPet = Boolean(petType);

              return (
                <div key={kid.id} className="bg-white rounded-xl p-4 shadow">
                  {hasPet ? (
                    <>
                      {/* Show pet if owned */}
                      {petTypeKey === 'dog' && petLevel === 3 ? (
                        <div className="flex justify-center mb-2">
                          <LottiePet
                            url="https://lottie.host/buvwpY646G/data.json"
                            fallbackEmoji="🐕"
                            size={64}
                          />
                        </div>
                      ) : (
                        <div className="text-4xl text-center mb-2">
                          {petType && petType.levels ? petType.levels[Math.min(petType.levels.length - 1, Math.max(0, petLevel - 1))] : '🥚'}
                        </div>
                      )}
                      <div className="text-sm text-gray-500 mb-1 text-center">
                        {petType ? `${LEVEL_NAMES[Math.max(0, Math.min(LEVEL_NAMES.length - 1, petLevel - 1))]} ${petType.name}` : 'No pet'}
                      </div>
                      <div className="text-xs text-blue-600 text-center mb-2">{ownedPets.length} pet(s) owned</div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl text-center mb-2">🥚</div>
                      <div className="text-sm text-gray-500 text-center mb-2">No pet yet</div>
                    </>
                  )}
                  <h3 className="text-xl font-bold mb-2">{kid.name}</h3>
                  <div className="text-2xl text-yellow-600 font-bold mb-1">${kid.coins}</div>
                  <div className="text-sm text-gray-600">
                    Completed: {(dailyProgress[kid.id] || []).length}/{chores.length}
                  </div>
                  <div className="text-sm text-orange-500">
                    {kid.streak} day streak 🔥
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="bg-white rounded-xl p-6 shadow mb-6">
            <h2 className="text-2xl font-bold mb-4">Manage Chores</h2>
            
            <div className="grid md:grid-cols-4 gap-3 mb-4">
              <input
                type="text"
                placeholder="Chore name"
                className="p-2 border rounded-lg"
                value={newChoreName}
                onChange={(e) => setNewChoreName(e.target.value)}
              />
              <input
                type="text"
                placeholder="Icon (emoji)"
                className="p-2 border rounded-lg"
                value={newChoreIcon}
                onChange={(e) => setNewChoreIcon(e.target.value)}
              />
              <input
                type="number"
                placeholder="Value ($)"
                className="p-2 border rounded-lg"
                value={newChoreValue}
                onChange={(e) => setNewChoreValue(Number(e.target.value))}
              />
              <button
                onClick={addChore}
                disabled={isSavingChore}
                className={`flex items-center justify-center gap-2 rounded-lg py-2 text-white transition ${
                  isSavingChore
                    ? 'cursor-not-allowed bg-blue-300'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}
              >
                <Plus size={20} /> Add Chore
              </button>
            </div>

            <div className="space-y-2">
              {chores.map(chore => (
                <div key={chore.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{chore.icon}</span>
                    <span className="font-semibold">{chore.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-yellow-600 font-bold">${chore.value}</span>
                    <button
                      onClick={() => deleteChore(chore.id)}
                      disabled={isSavingChore}
                      className={`transition ${
                        isSavingChore
                          ? 'cursor-not-allowed text-red-300'
                          : 'text-red-500 hover:text-red-700'
                      }`}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={resetDaily}
              disabled={isResettingDaily}
              className={`rounded-lg py-3 text-white transition ${
                isResettingDaily
                  ? 'cursor-not-allowed bg-orange-300'
                  : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {isResettingDaily ? 'Resetting…' : 'Reset Daily Progress'}
            </button>
            <button
              onClick={weeklyPayout}
              disabled={isProcessingPayout}
              className={`rounded-lg py-3 text-white transition ${
                isProcessingPayout
                  ? 'cursor-not-allowed bg-green-300'
                  : 'bg-green-500 hover:bg-green-600'
              }`}
            >
              {isProcessingPayout ? 'Processing…' : 'Process Weekly Payout'}
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <>
      {currentView === 'select' && <KidSelectScreen />}
      {currentView === 'parent-login' && <ParentLoginScreen />}
      {currentView === 'kid' && <KidScreen />}
      {currentView === 'parent' && <ParentDashboard />}
    </>
  );
}