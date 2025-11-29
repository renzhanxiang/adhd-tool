
export interface Step {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  steps: Step[];
  createdAt: number;
  completed: boolean;
}

export interface FocusSession {
  id: string;
  durationPlanned: number; // minutes
  durationActual: number; // seconds
  startedAt: number;
  completed: boolean;
}

export interface Plant {
  id: string;
  type: 'sunflower' | 'cactus' | 'tree' | 'flower';
  growthStage: 1 | 2 | 3; // 1: Sprout, 2: Growing, 3: Mature
  plantedAt: number;
}

export interface UserStats {
  coins: number;
  seeds: number;
  totalFocusTime: number; // minutes
  plants: Plant[];
  sessions: FocusSession[];
}

export enum Tab {
  TASKS = 'tasks',
  TIMER = 'timer',
  GARDEN = 'garden',
  EMERGENCY = 'emergency',
  PROFILE = 'profile'
}
