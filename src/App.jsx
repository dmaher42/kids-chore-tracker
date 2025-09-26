import { useState, useEffect } from 'react';
import { Users, Home, Settings, Plus, Trash2, DollarSign, Star, Award } from 'lucide-react';

// Main App Component
export default function ChoreTrackerApp() {
  const [isParent, setIsParent] = useState(false);
  const [parentPassword, setParentPassword] = useState('');
  const [currentView, setCurrentView] = useState('select'); // select, kid, parent
  const [selectedKid, setSelectedKid] = useState(null);
  
  // Demo data structure - in real app this comes from Firebase
  const [kids, setKids] = useState([
    { id: 1, name: 'Nash', age: 13, coins: 0, streak: 0, petLevel: 1 },
    { id: 2, name: 'Isla', age: 10, coins: 0, streak: 0, petLevel: 1 },
    { id: 3, name: 'Archer', age: 8, coins: 0, streak: 0, petLevel: 1 }
  ]);
  
  const [chores, setChores] = useState([
    { id: 1, name: 'Empty Dishwasher', value: 2, icon: '🍽️' },
    { id: 2, name: 'Make Bed', value: 1, icon: '🛏️' },
    { id: 3, name: 'Put Clothes Away', value: 1, icon: '👕' },
    { id: 4, name: 'Take Out Trash', value: 2, icon: '🗑️' },
    { id: 5, name: 'Feed Pet', value: 1, icon: '🐕' }
  ]);
  
  const [dailyProgress, setDailyProgress] = useState({
    1: [], // Nash's completed chores
    2: [], // Isla's completed chores
    3: []  // Archer's completed chores
  });
  
  // Parent Login
  const handleParentLogin = () => {
    if (parentPassword === 'parent123') { // Demo password
      setIsParent(true);
      setCurrentView('parent');
    } else {
      alert('Incorrect password!');
    }
  };
  
  // Toggle chore completion
  const toggleChore = (kidId, choreId) => {
    setDailyProgress(prev => {
      const kidChores = prev[kidId] || [];
      if (kidChores.includes(choreId)) {
        return { ...prev, [kidId]: kidChores.filter(id => id !== choreId) };
      } else {
        // Check if all chores done, add bonus
        const newChores = [...kidChores, choreId];
        const allDone = newChores.length === chores.length;
        
        const chore = chores.find(c => c.id === choreId);
        const coinsToAdd = chore.value + (allDone ? 5 : 0); // Bonus for completing all
        
        setKids(prev => prev.map(k => 
          k.id === kidId 
            ? { ...k, coins: k.coins + coinsToAdd, streak: allDone ? k.streak + 1 : k.streak }
            : k
        ));
        
        return { ...prev, [kidId]: newChores };
      }
    });
  };
  
  // Kid Selection Screen
  const KidSelectScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-white text-center mb-2">Chore Champions</h1>
        <p className="text-white text-center mb-8">Who's doing chores today?</p>
        
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          {kids.map(kid => (
            <button
              key={kid.id}
              onClick={() => { setSelectedKid(kid.id); setCurrentView('kid'); }}
              className="bg-white rounded-2xl p-6 shadow-lg hover:scale-105 transition-transform"
            >
              <div className="text-6xl mb-4 text-center">
                {kid.id === 1 ? '🧑' : kid.id === 2 ? '👧' : '🧒'}
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
          ))}
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
  
  // Parent Login Screen
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
  
  // Kid View Screen
  const KidScreen = () => {
    const kid = kids.find(k => k.id === selectedKid);
    const completedChores = dailyProgress[selectedKid] || [];
    const allDone = completedChores.length === chores.length;
    
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
          
          {allDone && <VirtualPetGame kid={kid} setKids={setKids} />}
        </div>
      </div>
    );
  };
  
  // Virtual Pet Game Component
  const VirtualPetGame = ({ kid, setKids }) => {
    const [petFood, setPetFood] = useState(50);
    const [petHappy, setPetHappy] = useState(50);
    
    const feedPet = () => {
      if (kid.coins >= 3) {
        setKids(prev => prev.map(k => 
          k.id === kid.id ? { ...k, coins: k.coins - 3 } : k
        ));
        setPetFood(Math.min(100, petFood + 20));
      }
    };
    
    const playWithPet = () => {
      if (kid.coins >= 2) {
        setKids(prev => prev.map(k => 
          k.id === kid.id ? { ...k, coins: k.coins - 2 } : k
        ));
        setPetHappy(Math.min(100, petHappy + 20));
      }
    };
    
    const upgradePet = () => {
      if (kid.coins >= 10) {
        setKids(prev => prev.map(k => 
          k.id === kid.id ? { ...k, coins: k.coins - 10, petLevel: k.petLevel + 1 } : k
        ));
      }
    };
    
    return (
      <div className="bg-white rounded-2xl p-6 shadow-xl">
        <h3 className="text-2xl font-bold mb-4">🏠 Your Virtual Home</h3>
        
        <div className="bg-gradient-to-b from-sky-200 to-green-200 rounded-xl p-6 mb-4 min-h-48 relative">
          <div className="text-center">
            <div className="text-8xl mb-2">
              {kid.petLevel === 1 ? '🐶' : kid.petLevel === 2 ? '🐕' : '🐕‍🦺'}
            </div>
            <div className="text-xl font-bold">Level {kid.petLevel} Pet</div>
          </div>
          
          <div className="absolute bottom-4 left-4 right-4">
            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span>Food: {petFood}%</span>
                <span>Happiness: {petHappy}%</span>
              </div>
              <div className="bg-gray-200 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${petFood}%` }}></div>
              </div>
              <div className="bg-gray-200 rounded-full h-2 mt-1">
                <div className="bg-pink-500 h-2 rounded-full" style={{ width: `${petHappy}%` }}></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-3">
          <button
            onClick={feedPet}
            disabled={kid.coins < 3}
            className="bg-orange-500 text-white py-3 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-orange-600 transition"
          >
            🍖 Feed<br/>
            <span className="text-sm">(3 coins)</span>
          </button>
          <button
            onClick={playWithPet}
            disabled={kid.coins < 2}
            className="bg-pink-500 text-white py-3 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-pink-600 transition"
          >
            ⚽ Play<br/>
            <span className="text-sm">(2 coins)</span>
          </button>
          <button
            onClick={upgradePet}
            disabled={kid.coins < 10}
            className="bg-purple-500 text-white py-3 rounded-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-purple-600 transition"
          >
            ⭐ Upgrade<br/>
            <span className="text-sm">(10 coins)</span>
          </button>
        </div>
      </div>
    );
  };
  
  // Parent Dashboard Screen
  const ParentDashboard = () => {
    const [newChoreName, setNewChoreName] = useState('');
    const [newChoreValue, setNewChoreValue] = useState(1);
    const [newChoreIcon, setNewChoreIcon] = useState('✅');
    
    const addChore = () => {
      if (newChoreName.trim()) {
        setChores([...chores, {
          id: Date.now(),
          name: newChoreName,
          value: newChoreValue,
          icon: newChoreIcon
        }]);
        setNewChoreName('');
        setNewChoreValue(1);
        setNewChoreIcon('✅');
      }
    };
    
    const deleteChore = (id) => {
      setChores(chores.filter(c => c.id !== id));
    };
    
    const resetDaily = () => {
      if (window.confirm('Reset all daily progress? This will keep coins and streaks.')) {
        setDailyProgress({ 1: [], 2: [], 3: [] });
      }
    };
    
    const weeklyPayout = () => {
      if (window.confirm('Process weekly payout? This will reset coins to 0.')) {
        setKids(kids.map(k => ({ ...k, coins: 0 })));
        setDailyProgress({ 1: [], 2: [], 3: [] });
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
          
          {/* Kids Overview */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {kids.map(kid => (
              <div key={kid.id} className="bg-white rounded-xl p-4 shadow">
                <h3 className="text-xl font-bold mb-2">{kid.name}</h3>
                <div className="text-2xl text-yellow-600 font-bold mb-1">${kid.coins}</div>
                <div className="text-sm text-gray-600">
                  Completed: {(dailyProgress[kid.id] || []).length}/{chores.length}
                </div>
                <div className="text-sm text-orange-500">
                  {kid.streak} day streak 🔥
                </div>
              </div>
            ))}
          </div>
          
          {/* Chore Management */}
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
          
          {/* Actions */}
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
  
  // Render appropriate screen
  return (
    <>
      {currentView === 'select' && <KidSelectScreen />}
      {currentView === 'parent-login' && <ParentLoginScreen />}
      {currentView === 'kid' && <KidScreen />}
      {currentView === 'parent' && <ParentDashboard />}
    </>
  );
}