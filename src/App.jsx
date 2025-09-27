import { useState, useEffect } from 'react';
import { Users, Home, Settings, Plus, Trash2, DollarSign, Star, Award, ShoppingBag, Sparkles, Gamepad2, Zap, Trophy } from 'lucide-react';

// Firebase imports
import { db } from './firebase';
import { collection, doc, setDoc, getDoc, updateDoc, onSnapshot } from 'firebase/firestore';

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

// Main App Component
export default function ChoreTrackerApp() {
  const [isParent, setIsParent] = useState(false);
  const [parentPassword, setParentPassword] = useState('');
  const [currentView, setCurrentView] = useState('select');
  const [selectedKid, setSelectedKid] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [kids, setKids] = useState([]);
  const [chores, setChores] = useState([]);
  const [dailyProgress, setDailyProgress] = useState({});
  const [petStates, setPetStates] = useState({});
  const [kidInventories, setKidInventories] = useState({});
  
  useEffect(() => {
    const initializeData = async () => {
      try {
        const kidsDoc = await getDoc(doc(db, 'app', 'kids'));
        
        if (!kidsDoc.exists()) {
          const initialKids = [
            { id: 1, name: 'Nash', age: 13, coins: 0, streak: 0, petLevel: 1, petType: 'dog' },
            { id: 2, name: 'Isla', age: 10, coins: 0, streak: 0, petLevel: 1, petType: 'cat' },
            { id: 3, name: 'Archer', age: 8, coins: 0, streak: 0, petLevel: 1, petType: 'bunny' }
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
    
    return () => {
      unsubscribe1();
      unsubscribe2();
      unsubscribe3();
      unsubscribe4();
      unsubscribe5();
    };
  }, []);
  
  const handleParentLogin = () => {
    if (parentPassword === 'parent123') {
      setIsParent(true);
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
  
  const changePetType = async (kidId, petType) => {
    const updatedKids = kids.map(k => 
      k.id === kidId ? { ...k, petType, petLevel: 1 } : k
    );
    await updateDoc(doc(db, 'app', 'kids'), { data: updatedKids });
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
            const petType = PET_TYPES[kid.petType] || PET_TYPES.dog;
            const kidInventory = kidInventories[kid.id] || { clothing: [], accessories: [], backgrounds: [], equipped: {} };
            const equippedClothing = kidInventory.equipped && kidInventory.equipped.clothing ? 
              SHOP_ITEMS.clothing.find(i => i.id === kidInventory.equipped.clothing) : null;
            
            return (
              <button
                key={kid.id}
                onClick={() => { setSelectedKid(kid.id); setCurrentView('kid'); }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform relative"
              >
                <div className="relative">
                  <div className="text-6xl mb-2 text-center animate-bounce">{petType.levels[kid.petLevel - 1]}</div>
                  {equippedClothing && (
                    <div className="text-2xl absolute top-0 left-1/2 transform -translate-x-1/2 animate-pulse">
                      {equippedClothing.emoji}
                    </div>
                  )}
                </div>
                <div className="text-sm text-gray-500 text-center mb-2">{LEVEL_NAMES[kid.petLevel - 1]} {petType.name}</div>
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
              petState={petStates[selectedKid] || { food: 50, happy: 50 }}
              inventory={kidInventories[selectedKid] || { clothing: [], accessories: [], backgrounds: [], equipped: {} }}
              updatePetState={(updates) => updatePetState(selectedKid, updates)}
              updateCoins={(amount) => updateKidCoins(selectedKid, amount)}
              upgradePet={() => upgradePetLevel(selectedKid)}
              changePet={(type) => changePetType(selectedKid, type)}
              onOpenShop={() => setShowShop(true)}
              onOpenGames={() => setShowGames(true)}
              equipItem={(itemId, category) => equipItem(selectedKid, itemId, category)}
            />
          )}
          
          {allDone && showShop && (
            <PetShop
              kid={kid}
              inventory={kidInventories[selectedKid] || { clothing: [], accessories: [], backgrounds: [], equipped: {} }}
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
  
  const VirtualPetGame = ({ kid, petState, inventory, updatePetState, updateCoins, upgradePet, changePet, onOpenShop, onOpenGames, equipItem }) => {
    const [showPetSelector, setShowPetSelector] = useState(false);
    const [petAnimation, setPetAnimation] = useState('bounce');
    const petType = PET_TYPES[kid.petType] || PET_TYPES.dog;
    const equippedBg = inventory.backgrounds && inventory.backgrounds.length > 0 && inventory.equipped && inventory.equipped.backgrounds ? 
      SHOP_ITEMS.backgrounds.find(bg => bg.id === inventory.equipped.backgrounds) : null;
    const bgClass = equippedBg ? equippedBg.gradient : 'from-sky-200 to-green-200';
    const upgradeCost = kid.petLevel * 10;
    
    // Cycle through animations
    useEffect(() => {
      const animations = ['bounce', 'pulse', 'wiggle', 'float'];
      let index = 0;
      const interval = setInterval(() => {
        index = (index + 1) % animations.length;
        setPetAnimation(animations[index]);
      }, 3000);
      return () => clearInterval(interval);
    }, []);
    
    const feedPet = () => {
      if (kid.coins >= 3) {
        updateCoins(3);
        updatePetState({ food: Math.min(100, petState.food + 20) });
        setPetAnimation('jump');
        setTimeout(() => setPetAnimation('bounce'), 500);
      }
    };
    
    const playWithPet = () => {
      if (kid.coins >= 2) {
        updateCoins(2);
        updatePetState({ happy: Math.min(100, petState.happy + 20) });
        setPetAnimation('spin');
        setTimeout(() => setPetAnimation('bounce'), 500);
      }
    };
    
    const handleUpgrade = () => {
      if (kid.coins >= upgradeCost && kid.petLevel < 5) {
        upgradePet();
        setPetAnimation('tada');
        setTimeout(() => setPetAnimation('bounce'), 1000);
      }
    };
    
    const equippedClothing = inventory.equipped && inventory.equipped.clothing ? 
      SHOP_ITEMS.clothing.find(i => i.id === inventory.equipped.clothing) : null;
    const equippedAccessory = inventory.equipped && inventory.equipped.accessories ? 
      SHOP_ITEMS.accessories.find(i => i.id === inventory.equipped.accessories) : null;
    
    const getAnimationClass = (anim) => {
      switch(anim) {
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
            <button
              onClick={() => setShowPetSelector(!showPetSelector)}
              className={`text-8xl mb-2 hover:scale-110 transition-transform cursor-pointer inline-block ${getAnimationClass(petAnimation)}`}
            >
              {petType.levels[kid.petLevel - 1]}
            </button>
            
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
            
            <div className="text-xl font-bold">{LEVEL_NAMES[kid.petLevel - 1]} {petType.name}</div>
            <div className="text-sm text-gray-600">Level {kid.petLevel}/5</div>
            <button
              onClick={() => setShowPetSelector(!showPetSelector)}
              className="text-sm text-blue-600 hover:underline"
            >
              Change Pet
            </button>
          </div>
          
          {showPetSelector && (
            <div className="absolute top-full left-4 right-4 mt-2 bg-white rounded-xl p-4 shadow-xl z-10">
              <h4 className="font-bold mb-3">Choose Your Pet:</h4>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(PET_TYPES).map(([key, pet]) => (
                  <button
                    key={key}
                    onClick={() => {
                      changePet(key);
                      setShowPetSelector(false);
                      setPetAnimation('tada');
                    }}
                    className={`p-3 rounded-lg border-2 hover:border-blue-400 transition ${
                      kid.petType === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="text-3xl">{pet.emoji}</div>
                    <div className="text-xs mt-1">{pet.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="absolute bottom-4 left-4 right-4">
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Food: {petState.food}%</span>
                <span>Happiness: {petState.happy}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full transition-all duration-500" style={{ width: `${petState.food}%` }}></div>
              </div>
              <div className="bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-pink-500 h-2 rounded-full transition-all duration-500" style={{ width: `${petState.happy}%` }}></div>
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
            🍖 Feed<br/>
            <span className="text-sm">(3 coins)</span>
          </button>
          <button
            onClick={playWithPet}
            disabled={kid.coins < 2}
            className="bg-pink-500 text-white py-3 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-pink-600 hover:scale-105 transition-all"
          >
            ⚽ Play<br/>
            <span className="text-sm">(2 coins)</span>
          </button>
          <button
            onClick={handleUpgrade}
            disabled={kid.coins < upgradeCost || kid.petLevel >= 5}
            className="bg-purple-500 text-white py-3 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-purple-600 hover:scale-105 transition-all"
          >
            {kid.petLevel === 5 ? '✨ MAX' : `⭐ Evolve (${upgradeCost})`}
          </button>
        </div>
        
        {inventory.clothing && inventory.clothing.length > 0 && (
          <div className="mt-4">
            <h4 className="font-bold mb-2">Your Wardrobe:</h4>
            <div className="flex gap-2 flex-wrap">
              {inventory.clothing.map(itemId => {
                const item = SHOP_ITEMS.clothing.find(i => i.id === itemId);
                if (!item) return null;
                const isEquipped = inventory.equipped && inventory.equipped.clothing === itemId;
                return (
                  <button
                    key={itemId}
                    onClick={() => equipItem(itemId, 'clothing')}
                    className={`p-2 rounded-lg border-2 transition-all hover:scale-110 ${
                      isEquipped ? 'border-blue-500 bg-blue-50 animate-pulse' : 'border-gray-200'
                    }`}
                  >
                    <div className="text-2xl">{item.emoji}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
        
        {inventory.accessories && inventory.accessories.length > 0 && (
          <div className="mt-4">
            <h4 className="font-bold mb-2">Your Accessories:</h4>
            <div className="flex gap-2 flex-wrap">
              {inventory.accessories.map(itemId => {
                const item = SHOP_ITEMS.accessories.find(i => i.id === itemId);
                if (!item) return null;
                const isEquipped = inventory.equipped && inventory.equipped.accessories === itemId;
                return (
                  <button
                    key={itemId}
                    onClick={() => equipItem(itemId, 'accessories')}
                    className={`p-2 rounded-lg border-2 transition-all hover:scale-110 ${
                      isEquipped ? 'border-green-500 bg-green-50 animate-pulse' : 'border-gray-200'
                    }`}
                  >
                    <div className="text-2xl">{item.emoji}</div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };
  
  const MiniGames = ({ kid, onEarnCoins, onClose }) => {
    const [currentGame, setCurrentGame] = useState(null);
    const [gameState, setGameState] = useState({});
    
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
    }, [clickTimeLeft, clickGameActive, clickCount]);
    
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
    
    const addChore = async () => {
      if (newChoreName.trim()) {
        const newChore = {
          id: Date.now(),
          name: newChoreName,
          value: newChoreValue,
          icon: newChoreIcon
        };
        await setDoc(doc(db, 'app', 'chores'), {
          data: [...chores, newChore]
        }, { merge: true });
        setNewChoreName('');
        setNewChoreValue(1);
        setNewChoreIcon('✅');
      }
    };
    
    const deleteChore = async (id) => {
      await setDoc(doc(db, 'app', 'chores'), {
        data: chores.filter(c => c.id !== id)
      }, { merge: true });
    };
    
    const resetDaily = async () => {
      if (window.confirm('Reset all daily progress? This will keep coins and streaks.')) {
        await setDoc(doc(db, 'app', 'dailyProgress'), {
          data: { 1: [], 2: [], 3: [] }
        }, { merge: true });
      }
    };
    
    const weeklyPayout = async () => {
      if (window.confirm('Process weekly payout? This will reset coins to 0.')) {
        const resetKids = kids.map(k => ({ ...k, coins: 0 }));
        await updateDoc(doc(db, 'app', 'kids'), { data: resetKids });
        await setDoc(doc(db, 'app', 'dailyProgress'), {
          data: { 1: [], 2: [], 3: [] }
        }, { merge: true });
      }
    };
    
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Parent Dashboard</h1>
            <button
              onClick={() => { setIsParent(false); setCurrentView('select'); }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg"
            >
              Exit
            </button>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {kids.map(kid => {
              const petType = PET_TYPES[kid.petType] || PET_TYPES.dog;
              return (
                <div key={kid.id} className="bg-white rounded-xl p-4 shadow">
                  <div className="text-4xl text-center mb-2">{petType.levels[kid.petLevel - 1]}</div>
                  <h3 className="text-xl font-bold mb-2">{kid.name}</h3>
                  <div className="text-sm text-gray-500 mb-1">{LEVEL_NAMES[kid.petLevel - 1]} {petType.name}</div>
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
                className="bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
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
                      className="text-red-500 hover:text-red-700"
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
              className="bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600"
            >
              Reset Daily Progress
            </button>
            <button
              onClick={weeklyPayout}
              className="bg-green-500 text-white py-3 rounded-lg hover:bg-green-600"
            >
              Process Weekly Payout
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