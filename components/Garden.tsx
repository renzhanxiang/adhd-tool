import React from 'react';
import { Plant, UserStats } from '../types';
import { Sprout, CloudRain, Lock } from 'lucide-react';

interface Props {
  stats: UserStats;
  plantSeed: (type: Plant['type']) => void;
  waterPlant: (plantId: string) => void;
}

const PLANT_TYPES: { type: Plant['type']; cost: number; name: string }[] = [
  { type: 'sunflower', cost: 1, name: 'Sunflower' },
  { type: 'cactus', cost: 2, name: 'Cactus' },
  { type: 'flower', cost: 3, name: 'Rose' },
  { type: 'tree', cost: 5, name: 'Oak Tree' },
];

const Garden: React.FC<Props> = ({ stats, plantSeed, waterPlant }) => {
  // Helper to render plant SVG based on type and stage
  const renderPlantIcon = (plant: Plant) => {
    const scale = plant.growthStage === 1 ? 0.5 : plant.growthStage === 2 ? 0.8 : 1.2;
    
    // Simple inline SVGs for demo
    if (plant.type === 'cactus') {
      return (
        <svg viewBox="0 0 24 24" width={40 * scale} height={40 * scale} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
          <path d="M6 10v6a4 4 0 0 0 4 4h4a4 4 0 0 0 4-4v-6" />
          <path d="M14 6a2 2 0 0 1 2 2v2" />
          <path d="M10 6a2 2 0 0 0-2 2v2" />
        </svg>
      );
    }
    if (plant.type === 'tree') {
      return (
        <svg viewBox="0 0 24 24" width={40 * scale} height={40 * scale} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-800">
           <path d="M12 19v-9" />
           <path d="M7 10c0-4 5-7 5-7s5 3 5 7" />
           <circle cx="12" cy="19" r="1" />
        </svg>
      );
    }
    // Default Sunflower/Flower
    return (
      <svg viewBox="0 0 24 24" width={40 * scale} height={40 * scale} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={plant.type === 'flower' ? 'text-pink-500' : 'text-yellow-500'}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 16v6" />
        <path d="M12 8a2 2 0 0 1 2-2h2" />
        <path d="M12 8a2 2 0 0 0-2-2H8" />
        <path d="M16 12a2 2 0 0 1 2 2v2" />
        <path d="M8 12a2 2 0 0 0-2 2v2" />
      </svg>
    );
  };

  return (
    <div className="h-full flex flex-col p-4 bg-gradient-to-b from-blue-50 to-green-50 overflow-y-auto pb-20">
      <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-xl shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Growth Garden</h2>
          <p className="text-xs text-slate-500">Focus to grow your garden</p>
        </div>
        <div className="flex gap-4 text-sm font-bold">
          <div className="flex items-center text-yellow-500">
            <span className="mr-1">🪙</span> {stats.coins}
          </div>
          <div className="flex items-center text-green-600">
            <span className="mr-1">🌱</span> {stats.seeds}
          </div>
        </div>
      </header>

      {/* Garden Grid */}
      <div className="flex-1 mb-6">
        <div className="grid grid-cols-3 gap-4">
          {stats.plants.map((plant) => (
            <div key={plant.id} className="aspect-square bg-white rounded-xl shadow-sm border border-green-100 flex flex-col items-center justify-center relative group">
              <div className="transition-transform duration-500 ease-out transform group-hover:scale-110">
                {renderPlantIcon(plant)}
              </div>
              
              {plant.growthStage < 3 && (
                <button
                  onClick={() => waterPlant(plant.id)}
                  className="absolute bottom-2 right-2 p-1.5 bg-blue-100 text-blue-500 rounded-full hover:bg-blue-200 transition-colors"
                  disabled={stats.coins < 5}
                >
                  <CloudRain size={14} />
                </button>
              )}
            </div>
          ))}
          {stats.plants.length === 0 && (
             <div className="col-span-3 text-center py-10 text-slate-400">
               Your garden is empty. Start a focus session to earn seeds!
             </div>
          )}
        </div>
      </div>

      {/* Nursery (Shop) */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
        <h3 className="font-semibold mb-3 text-slate-700 flex items-center gap-2">
          <Sprout size={18} /> Nursery
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {PLANT_TYPES.map((item) => (
            <button
              key={item.type}
              onClick={() => plantSeed(item.type)}
              disabled={stats.seeds < item.cost}
              className="flex-shrink-0 flex flex-col items-center p-3 rounded-lg border border-slate-200 min-w-[100px] hover:bg-slate-50 disabled:opacity-50 disabled:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-medium text-slate-800">{item.name}</span>
              <span className="text-xs text-green-600 font-bold mt-1">
                {item.cost} Seed{item.cost > 1 ? 's' : ''}
              </span>
              {stats.seeds < item.cost && <Lock size={12} className="mt-1 text-slate-300" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Garden;