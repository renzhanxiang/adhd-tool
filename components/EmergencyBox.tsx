import React, { useState } from 'react';
import { Wind, Grip, Shuffle, ArrowLeft } from 'lucide-react';

const EmergencyBox: React.FC = () => {
  const [mode, setMode] = useState<'menu' | 'breathe' | 'pop' | 'random'>('menu');
  const [popGrid, setPopGrid] = useState<boolean[]>(Array(20).fill(false));
  const [randomTask, setRandomTask] = useState<string>('');

  const randomTasks = [
    "Drink a glass of water",
    "Stretch your arms up",
    "Write down one worry then tear it up",
    "Look out the window for 20 seconds",
    "Clean one tiny surface",
    "Do 5 jumping jacks"
  ];

  const handlePop = (index: number) => {
    const newGrid = [...popGrid];
    newGrid[index] = !newGrid[index];
    setPopGrid(newGrid);
    // Haptic vibration if available
    if (navigator.vibrate) navigator.vibrate(50);
  };

  const pickRandom = () => {
    const task = randomTasks[Math.floor(Math.random() * randomTasks.length)];
    setRandomTask(task);
  };

  const renderContent = () => {
    switch (mode) {
      case 'breathe':
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-8">
            <h3 className="text-xl font-semibold text-slate-700">4-7-8 Breathing</h3>
            <div className="relative flex items-center justify-center w-64 h-64">
              <div className="absolute w-32 h-32 bg-blue-200 rounded-full animate-breathe opacity-50"></div>
              <div className="absolute w-24 h-24 bg-blue-300 rounded-full animate-breathe opacity-75" style={{ animationDelay: '0.5s' }}></div>
              <div className="z-10 text-slate-600 font-medium">Breathe In...</div>
            </div>
            <p className="text-center text-slate-500 px-8">Inhale for 4s, Hold for 7s, Exhale for 8s.</p>
          </div>
        );
      
      case 'pop':
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-6">
            <h3 className="text-xl font-semibold text-slate-700">Pop It</h3>
            <div className="grid grid-cols-4 gap-4 p-4 bg-slate-100 rounded-xl">
              {popGrid.map((popped, i) => (
                <button
                  key={i}
                  onMouseDown={() => handlePop(i)}
                  className={`w-12 h-12 rounded-full shadow-inner border-2 transition-all duration-100 ${
                    popped 
                      ? 'bg-slate-200 border-slate-300 scale-95' 
                      : 'bg-accent border-blue-300 scale-100 hover:bg-blue-300'
                  }`}
                />
              ))}
            </div>
            <button onClick={() => setPopGrid(Array(20).fill(false))} className="text-sm text-slate-400 underline">Reset</button>
          </div>
        );

      case 'random':
        return (
          <div className="flex flex-col items-center justify-center h-full space-y-8 p-6 text-center">
            <h3 className="text-xl font-semibold text-slate-700">Break the Loop</h3>
            <div className="min-h-[100px] flex items-center justify-center">
              <p className="text-2xl font-bold text-primary">{randomTask || "Ready?"}</p>
            </div>
            <button 
              onClick={pickRandom}
              className="px-8 py-3 bg-secondary text-white font-bold rounded-full shadow-lg hover:bg-yellow-500 active:scale-95 transition-all"
            >
              Spin the Wheel
            </button>
          </div>
        );

      default:
        return (
          <div className="grid grid-cols-1 gap-4 p-6 w-full max-w-md mx-auto">
            <button 
              onClick={() => setMode('breathe')}
              className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-100 hover:border-blue-300 transition-all flex flex-col items-center gap-2"
            >
              <Wind size={32} className="text-blue-500" />
              <span className="font-bold text-slate-700">Breathe</span>
              <span className="text-xs text-slate-500">Calm your nervous system</span>
            </button>
            <button 
              onClick={() => setMode('pop')}
              className="p-6 bg-purple-50 rounded-2xl border-2 border-purple-100 hover:border-purple-300 transition-all flex flex-col items-center gap-2"
            >
              <Grip size={32} className="text-purple-500" />
              <span className="font-bold text-slate-700">Energy Vent</span>
              <span className="text-xs text-slate-500">Fidget and pop bubbles</span>
            </button>
            <button 
              onClick={() => setMode('random')}
              className="p-6 bg-orange-50 rounded-2xl border-2 border-orange-100 hover:border-orange-300 transition-all flex flex-col items-center gap-2"
            >
              <Shuffle size={32} className="text-orange-500" />
              <span className="font-bold text-slate-700">Pattern Interrupt</span>
              <span className="text-xs text-slate-500">Get unstuck instantly</span>
            </button>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <header className="p-4 flex items-center border-b border-slate-100">
        {mode !== 'menu' && (
          <button onClick={() => setMode('menu')} className="mr-3 p-2 hover:bg-slate-100 rounded-full">
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
        )}
        <h2 className="text-lg font-bold text-slate-800">Emergency Toolbox</h2>
      </header>
      <div className="flex-1 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default EmergencyBox;