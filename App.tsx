
import React, { useState, useEffect } from 'react';
import { LayoutList, Timer, Sprout, Zap, User } from 'lucide-react';
import { Task, UserStats, Plant, FocusSession, Tab } from './types';
import TaskDecomposer from './components/TaskDecomposer';
import FocusTimer from './components/FocusTimer';
import Garden from './components/Garden';
import EmergencyBox from './components/EmergencyBox';
import ProfilePage from './components/Stats'; // Imports the updated ProfilePage

// Simple Login Screen Component
const LoginScreen = ({ onLogin }: { onLogin: (name: string) => void }) => {
  const [name, setName] = useState('');
  
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 p-6 space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <div className="w-20 h-20 bg-primary rounded-3xl mx-auto flex items-center justify-center shadow-xl shadow-green-200/50 mb-6 rotate-3">
          <Zap className="text-white fill-white" size={40} />
        </div>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight">Focus Pulse</h1>
        <p className="text-slate-500 text-lg">Your journey to better focus begins here.</p>
      </div>
      
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-100 space-y-5">
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">What should we call you?</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full p-4 bg-slate-50 rounded-xl border-2 border-slate-100 focus:border-primary focus:outline-none transition-all text-lg"
            onKeyDown={(e) => e.key === 'Enter' && name.trim() && onLogin(name)}
            autoFocus
          />
        </div>
        <button 
          onClick={() => name.trim() && onLogin(name)}
          disabled={!name.trim()}
          className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-green-500 transition-all transform active:scale-[0.98] shadow-lg shadow-green-200 disabled:opacity-50 disabled:shadow-none"
        >
          Start Journey
        </button>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.TASKS);
  
  // User Authentication State
  const [user, setUser] = useState<{name: string} | null>(() => {
    const saved = localStorage.getItem('fp_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Persistent State (Simulating Database)
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('fp_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('fp_stats');
    return saved ? JSON.parse(saved) : {
      coins: 0,
      seeds: 1, // Start with 1 seed
      totalFocusTime: 0,
      plants: [],
      sessions: []
    };
  });

  // Save on changes
  useEffect(() => {
    localStorage.setItem('fp_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('fp_stats', JSON.stringify(stats));
  }, [stats]);

  const handleLogin = (name: string) => {
    const newUser = { name };
    setUser(newUser);
    localStorage.setItem('fp_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      setUser(null);
      localStorage.removeItem('fp_user');
      setActiveTab(Tab.TASKS);
    }
  };

  // Actions
  const addCoins = (amount: number) => {
    setStats(prev => ({ ...prev, coins: prev.coins + amount }));
  };

  const addSeeds = (amount: number) => {
    setStats(prev => ({ ...prev, seeds: prev.seeds + amount }));
  };

  const addSession = (session: FocusSession) => {
    setStats(prev => ({
      ...prev,
      totalFocusTime: prev.totalFocusTime + session.durationActual,
      sessions: [...prev.sessions, session]
    }));
  };

  const plantSeed = (type: Plant['type']) => {
    const costMap = { sunflower: 1, cactus: 2, flower: 3, tree: 5 };
    const cost = costMap[type];

    if (stats.seeds >= cost) {
      const newPlant: Plant = {
        id: crypto.randomUUID(),
        type,
        growthStage: 1,
        plantedAt: Date.now()
      };
      setStats(prev => ({
        ...prev,
        seeds: prev.seeds - cost,
        plants: [...prev.plants, newPlant]
      }));
    }
  };

  const waterPlant = (plantId: string) => {
    if (stats.coins >= 5) {
      setStats(prev => ({
        ...prev,
        coins: prev.coins - 5,
        plants: prev.plants.map(p => 
          p.id === plantId && p.growthStage < 3 
            ? { ...p, growthStage: (p.growthStage + 1) as 1 | 2 | 3 } 
            : p
        )
      }));
    }
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case Tab.TASKS:
        return <TaskDecomposer tasks={tasks} setTasks={setTasks} addCoins={addCoins} addSeeds={addSeeds} />;
      case Tab.TIMER:
        return <FocusTimer addSession={addSession} addCoins={addCoins} addSeeds={addSeeds} />;
      case Tab.GARDEN:
        return <Garden stats={stats} plantSeed={plantSeed} waterPlant={waterPlant} />;
      case Tab.EMERGENCY:
        return <EmergencyBox />;
      case Tab.PROFILE:
        return <ProfilePage stats={stats} user={user} onLogout={handleLogout} />;
      default:
        return <TaskDecomposer tasks={tasks} setTasks={setTasks} addCoins={addCoins} addSeeds={addSeeds} />;
    }
  };

  return (
    <div className="flex flex-col h-screen w-full max-w-md mx-auto bg-white shadow-2xl overflow-hidden relative">
      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        {renderContent()}
      </main>

      {/* Navigation Bar */}
      <nav className="h-16 bg-white border-t border-slate-100 flex justify-around items-center px-2 z-50">
        <button 
          onClick={() => setActiveTab(Tab.TASKS)}
          className={`p-2 flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.TASKS ? 'text-primary' : 'text-slate-400'}`}
        >
          <LayoutList size={20} />
          <span className="text-[10px] font-medium">Tasks</span>
        </button>
        
        <button 
          onClick={() => setActiveTab(Tab.TIMER)}
          className={`p-2 flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.TIMER ? 'text-primary' : 'text-slate-400'}`}
        >
          <Timer size={20} />
          <span className="text-[10px] font-medium">Focus</span>
        </button>

        <button 
          onClick={() => setActiveTab(Tab.GARDEN)}
          className={`p-2 flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.GARDEN ? 'text-primary' : 'text-slate-400'}`}
        >
          <Sprout size={20} />
          <span className="text-[10px] font-medium">Garden</span>
        </button>

        <button 
          onClick={() => setActiveTab(Tab.EMERGENCY)}
          className={`p-2 flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.EMERGENCY ? 'text-red-400' : 'text-slate-400'}`}
        >
          <Zap size={20} />
          <span className="text-[10px] font-medium">SOS</span>
        </button>

        <button 
          onClick={() => setActiveTab(Tab.PROFILE)}
          className={`p-2 flex flex-col items-center gap-1 transition-colors ${activeTab === Tab.PROFILE ? 'text-primary' : 'text-slate-400'}`}
        >
          <User size={20} />
          <span className="text-[10px] font-medium">Profile</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
