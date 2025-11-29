
import React, { useState } from 'react';
import { Sparkles, Plus, Check, Trash2, Circle, CheckCircle2, CornerDownRight } from 'lucide-react';
import { Task, Step } from '../types';
import { decomposeTaskWithAI } from '../services/geminiService';

interface Props {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  addCoins: (amount: number) => void;
  addSeeds: (amount: number) => void;
}

const TaskDecomposer: React.FC<Props> = ({ tasks, setTasks, addCoins, addSeeds }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [newStepInputs, setNewStepInputs] = useState<Record<string, string>>({});

  const handleAddTask = async (useAI: boolean) => {
    if (!input.trim()) return;
    
    const newTask: Task = {
      id: crypto.randomUUID(),
      title: input,
      steps: [],
      createdAt: Date.now(),
      completed: false,
    };

    setIsLoading(true);
    setInput(''); // Clear input early for better UX

    if (useAI) {
      const stepsText = await decomposeTaskWithAI(newTask.title);
      newTask.steps = stepsText.map(text => ({
        id: crypto.randomUUID(),
        text,
        completed: false
      }));
    } else {
      // Manual mode starts empty, user adds steps using the card input
      newTask.steps = []; 
    }

    setTasks(prev => [newTask, ...prev]);
    setIsLoading(false);
  };

  const handleAddStep = (taskId: string) => {
    const text = newStepInputs[taskId];
    if (!text || !text.trim()) return;

    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;
      return {
        ...task,
        steps: [...task.steps, { id: crypto.randomUUID(), text: text.trim(), completed: false }],
        completed: false // Reset completion if adding new step
      };
    }));

    setNewStepInputs(prev => ({ ...prev, [taskId]: '' }));
  };

  const toggleStep = (taskId: string, stepId: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id !== taskId) return task;
      
      const updatedSteps = task.steps.map(step => 
        step.id === stepId ? { ...step, completed: !step.completed } : step
      );

      const allCompleted = updatedSteps.length > 0 && updatedSteps.every(s => s.completed);
      
      // Reward logic: if task wasn't complete but now is
      if (!task.completed && allCompleted) {
        addCoins(10); // Big reward for finishing task
        addSeeds(1); // Reward seed for finishing task
        // Small animation or toast could trigger here
      }
      
      // Small reward for step
      const stepWasCompleted = task.steps.find(s => s.id === stepId)?.completed;
      const stepIsCompleted = updatedSteps.find(s => s.id === stepId)?.completed;
      if (!stepWasCompleted && stepIsCompleted) {
        addCoins(1);
      }

      return { ...task, steps: updatedSteps, completed: allCompleted };
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto p-4 space-y-6 bg-slate-50">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-800">Task Decomposer</h2>
        <p className="text-slate-500 text-sm">Big tasks are scary. Let's break them down.</p>
      </header>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What do you need to do?"
          className="w-full p-3 bg-slate-50 rounded-lg border-2 border-transparent focus:border-primary focus:outline-none transition-colors"
          onKeyDown={(e) => e.key === 'Enter' && handleAddTask(false)}
        />
        <div className="flex gap-2">
          <button
            onClick={() => handleAddTask(false)}
            disabled={!input.trim() || isLoading}
            className="flex-1 py-2 px-4 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-colors disabled:opacity-50"
          >
            Add Task Title
          </button>
          <button
            onClick={() => handleAddTask(true)}
            disabled={!input.trim() || isLoading}
            className="flex-1 py-2 px-4 bg-primary text-white rounded-lg font-medium hover:bg-green-500 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="animate-spin">⌛</span>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Magic Breakdown</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-20">
        {tasks.map(task => (
          <div key={task.id} className={`bg-white rounded-xl p-4 shadow-sm border transition-all ${task.completed ? 'border-green-200 opacity-75' : 'border-slate-100'}`}>
            <div className="flex justify-between items-start mb-3">
              <h3 className={`font-semibold text-lg ${task.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                {task.title}
              </h3>
              <button onClick={() => deleteTask(task.id)} className="text-slate-300 hover:text-red-400 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
            
            <div className="space-y-2 mb-4">
              {task.steps.map(step => (
                <div
                  key={step.id}
                  onClick={() => toggleStep(task.id, step.id)}
                  className="flex items-center gap-3 cursor-pointer group hover:bg-slate-50 p-2 rounded-lg transition-colors"
                >
                  <div className={`transition-transform ${step.completed ? 'scale-110' : 'group-hover:scale-110'}`}>
                    {step.completed ? (
                      <CheckCircle2 className="text-primary" size={20} />
                    ) : (
                      <Circle className="text-slate-300" size={20} />
                    )}
                  </div>
                  <span className={`flex-1 text-sm ${step.completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {step.text}
                  </span>
                </div>
              ))}
              {task.steps.length === 0 && (
                <p className="text-sm text-slate-400 italic p-2">No steps yet. Add one below!</p>
              )}
            </div>

            {/* Manual Step Entry */}
            {!task.completed && (
              <div className="flex items-center gap-2 mt-2 px-2">
                <CornerDownRight size={16} className="text-slate-300" />
                <input
                  type="text"
                  placeholder="Add a step..."
                  value={newStepInputs[task.id] || ''}
                  onChange={(e) => setNewStepInputs(prev => ({ ...prev, [task.id]: e.target.value }))}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddStep(task.id)}
                  className="flex-1 bg-transparent border-b border-slate-200 focus:border-primary focus:outline-none text-sm py-1 px-1 transition-colors"
                />
                <button 
                  onClick={() => handleAddStep(task.id)}
                  disabled={!newStepInputs[task.id]?.trim()}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full p-1 transition-colors disabled:opacity-50"
                >
                  <Plus size={16} />
                </button>
              </div>
            )}
            
            {/* Progress Bar */}
            {task.steps.length > 0 && (
              <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${(task.steps.filter(s => s.completed).length / task.steps.length) * 100 || 0}%` }}
                />
              </div>
            )}
          </div>
        ))}

        {tasks.length === 0 && !isLoading && (
          <div className="text-center text-slate-400 mt-10">
            <p>Your garden needs seeds! <br/> Complete tasks to earn them.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskDecomposer;
