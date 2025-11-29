import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Leaf } from 'lucide-react';
import { FocusSession } from '../types';

interface Props {
  addSession: (session: FocusSession) => void;
  addCoins: (amount: number) => void;
  addSeeds: (amount: number) => void;
}

const FocusTimer: React.FC<Props> = ({ addSession, addCoins, addSeeds }) => {
  const [duration, setDuration] = useState(25); // minutes
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isNoiseOn, setIsNoiseOn] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const noiseNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Initialize Audio Context (Brown Noise)
  const toggleNoise = () => {
    if (isNoiseOn) {
      // Stop noise
      if (noiseNodeRef.current) {
        noiseNodeRef.current.stop();
        noiseNodeRef.current = null;
      }
      setIsNoiseOn(false);
    } else {
      // Start noise
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const ctx = audioContextRef.current;
      if (ctx) {
        const bufferSize = ctx.sampleRate * 2; // 2 seconds buffer
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          // Simple approximation of brown noise
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5; // Compensate for gain loss
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;
        
        const gainNode = ctx.createGain();
        gainNode.gain.value = 0.1; // Low volume
        
        noise.connect(gainNode);
        gainNode.connect(ctx.destination);
        noise.start();
        
        noiseNodeRef.current = noise;
        gainNodeRef.current = gainNode;
        setIsNoiseOn(true);
      }
    }
  };

  let lastOut = 0;

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      if (!startTimeRef.current) startTimeRef.current = Date.now();
      
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // Timer finished
      setIsActive(false);
      handleComplete();
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (noiseNodeRef.current) noiseNodeRef.current.stop();
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  const handleComplete = () => {
    if (isNoiseOn) toggleNoise();
    
    const actualDuration = duration * 60 - timeLeft;
    
    addSession({
      id: crypto.randomUUID(),
      durationPlanned: duration,
      durationActual: Math.floor(actualDuration / 60), // minutes
      startedAt: startTimeRef.current || Date.now(),
      completed: true
    });

    addCoins(Math.floor(duration)); // 1 coin per minute
    addSeeds(1); // 1 seed per session
    
    startTimeRef.current = null;
    alert("Focus Session Complete! You earned a seed and coins.");
    resetTimer();
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(duration * 60);
    startTimeRef.current = null;
    if (isNoiseOn) toggleNoise();
  };

  const handleDurationChange = (mins: number) => {
    setDuration(mins);
    setTimeLeft(mins * 60);
    setIsActive(false);
  };

  const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 space-y-8 max-w-md mx-auto">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Pulse Focus</h2>
        <p className="text-slate-500">Commit to this moment.</p>
      </div>

      {/* Preset Buttons */}
      {!isActive && (
        <div className="flex gap-4">
          {[5, 15, 25, 45].map((mins) => (
            <button
              key={mins}
              onClick={() => handleDurationChange(mins)}
              className={`w-12 h-12 rounded-full font-medium transition-all ${
                duration === mins 
                ? 'bg-primary text-white scale-110 shadow-lg' 
                : 'bg-white text-slate-600 border border-slate-200 hover:border-primary'
              }`}
            >
              {mins}
            </button>
          ))}
        </div>
      )}

      {/* Visualization */}
      <div className="relative w-64 h-64 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-8 border-slate-100"></div>
        {/* Progress Ring (SVG) */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-primary transition-all duration-1000 ease-linear"
            strokeDasharray={2 * Math.PI * 120}
            strokeDashoffset={2 * Math.PI * 120 * (1 - progress / 100)}
            strokeLinecap="round"
          />
        </svg>
        
        {/* Center Content */}
        <div className="flex flex-col items-center z-10">
          <span className="text-5xl font-mono font-bold text-slate-700">
            {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
          </span>
          {isActive && (
            <span className="text-sm text-primary mt-2 animate-pulse font-medium">
              Focusing...
            </span>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-6 items-center">
        <button
          onClick={toggleNoise}
          className={`p-4 rounded-full transition-colors ${
            isNoiseOn ? 'bg-secondary text-white' : 'bg-slate-100 text-slate-500'
          }`}
          title="White Noise"
        >
          {isNoiseOn ? <Volume2 size={24} /> : <VolumeX size={24} />}
        </button>

        <button
          onClick={() => setIsActive(!isActive)}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-transform active:scale-95 ${
            isActive ? 'bg-orange-400 hover:bg-orange-500' : 'bg-primary hover:bg-green-500'
          }`}
        >
          {isActive ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
        </button>

        <button
          onClick={resetTimer}
          className="p-4 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
          title="Reset"
        >
          <RotateCcw size={24} />
        </button>
      </div>

      <div className="bg-blue-50 text-blue-600 p-3 rounded-lg text-sm flex items-center gap-2">
        <Leaf size={16} />
        <span>Reward: {Math.floor(duration)} coins + 1 seed</span>
      </div>
    </div>
  );
};

export default FocusTimer;