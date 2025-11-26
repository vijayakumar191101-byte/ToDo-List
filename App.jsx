import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, Reorder } from 'framer-motion';
import { Plus, Sparkles, LayoutDashboard, ListTodo } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Priority } from './types';

import { TaskItem } from './components/TaskItem';
import { StatsChart } from './components/StatsChart';
import { Confetti } from './components/Confetti';
import { generateSubtasks } from './services/geminiService';
import clsx from 'clsx';

import './index.css';

// Simple audio synth for sound effects
const playSound = (type) => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;
  const ctx = new AudioContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  const now = ctx.currentTime;
  
  if (type === 'success') {
    osc.type = 'sine';
    osc.frequency.setValueAtTime(500, now);
    osc.frequency.exponentialRampToValueAtTime(1000, now + 0.1);
    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
  } else if (type === 'add') {
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(300, now);
    osc.frequency.linearRampToValueAtTime(500, now + 0.1);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.linearRampToValueAtTime(50, now + 0.1);
    gain.gain.setValueAtTime(0.05, now);
    gain.gain.linearRampToValueAtTime(0, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  }
};

const App = () => {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('nexus-tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [inputValue, setInputValue] = useState('');
  const [view, setView] = useState('list');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [activePriority, setActivePriority] = useState(Priority.MEDIUM);
  const [confetti, setConfetti] = useState(null);

  useEffect(() => {
    localStorage.setItem('nexus-tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    if (confetti) {
      const timer = setTimeout(() => setConfetti(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [confetti]);

  const addTask = async (e) => {
    e?.preventDefault();
    if (!inputValue.trim()) return;

    const newTask = {
      id: uuidv4(),
      title: inputValue,
      completed: false,
      priority: activePriority,
      createdAt: Date.now(),
      subtasks: []
    };

    setTasks(prev => [newTask, ...prev]);
    setInputValue('');
    playSound('add');
  };

  const handleAiBreakdown = async (taskId, taskTitle) => {
    setIsAiLoading(true);
    try {
      const subtasks = await generateSubtasks(taskTitle);
      setTasks(prev => prev.map(t => {
        if (t.id === taskId) {
          const newSubtasks = subtasks.map(st => ({
            id: uuidv4(),
            title: st,
            completed: false
          }));
          return { ...t, subtasks: [...t.subtasks, ...newSubtasks] };
        }
        return t;
      }));
      playSound('success');
    } catch (error) {
      console.error("AI Error:", error);
      alert("AI Assistant is currently unavailable. Please check your API Key.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const toggleTask = (id, e) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const newCompleted = !t.completed;
        if (newCompleted) {
          playSound('success');
          if (e) {
            setConfetti({ x: e.clientX, y: e.clientY, id: Date.now().toString() });
          }
        }
        return { ...t, completed: newCompleted };
      }
      return t;
    }));
  };

  const toggleSubtask = (taskId, subtaskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: t.subtasks.map(s => s.id === subtaskId ? { ...s, completed: !s.completed } : s)
        };
      }
      return t;
    }));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    playSound('delete');
  };

  const calculateStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.completed).length;
    const highPriority = tasks.filter(t => t.priority === Priority.HIGH).length;
    return { total, completed, pending: total - completed, highPriority };
  };

  return (
    <div className="min-h-screen bg-[#0b1121] text-slate-100 flex flex-col items-center py-10 px-4 sm:px-6 relative overflow-x-hidden selection:bg-cyan-500/30">
      {/* Background ambient glows */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-600/10 blur-[120px] rounded-full pointer-events-none" />

      {confetti && <Confetti x={confetti.x} y={confetti.y} key={confetti.id} />}

      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-4xl z-10"
      >
        <header className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-800/40 backdrop-blur-xl p-6 rounded-2xl border border-slate-700/50 shadow-2xl">
          <div>
            <h1 className="text-4xl font-extrabold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent tracking-tight">
              Vijay's Todo List
            </h1>
            <p className="text-slate-400 text-sm mt-1 font-medium tracking-wide">AI-Enhanced Productivity System</p>
          </div>
          <div className="flex bg-slate-900/50 p-1.5 rounded-xl border border-slate-700/50">
            <button
              onClick={() => setView('list')}
              className={clsx(
                "p-2.5 rounded-lg transition-all duration-300 relative",
                view === 'list' ? "text-cyan-400 bg-slate-800 shadow-lg" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <ListTodo size={20} />
              {view === 'list' && <motion.div layoutId="tab-highlight" className="absolute inset-0 border border-cyan-500/30 rounded-lg" />}
            </button>
            <button
              onClick={() => setView('dashboard')}
              className={clsx(
                "p-2.5 rounded-lg transition-all duration-300 relative",
                view === 'dashboard' ? "text-purple-400 bg-slate-800 shadow-lg" : "text-slate-500 hover:text-slate-300"
              )}
            >
              <LayoutDashboard size={20} />
              {view === 'dashboard' && <motion.div layoutId="tab-highlight" className="absolute inset-0 border border-purple-500/30 rounded-lg" />}
            </button>
          </div>
        </header>

        <main className="relative">
          <AnimatePresence mode="wait">
            {view === 'list' ? (
              <motion.div
                key="list-view"
                initial={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                transition={{ duration: 0.3 }}
              >
                {/* Input Area */}
                <div className="bg-slate-800/40 backdrop-blur-md rounded-2xl p-5 shadow-xl mb-8 border border-slate-700/50">
                  <form onSubmit={addTask} className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1 group">
                      <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="What is your next mission?"
                        className="w-full bg-slate-900/60 border border-slate-700 rounded-xl py-4 px-5 pl-5 focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 outline-none transition-all placeholder:text-slate-600 text-lg"
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-700/50">
                        {Object.values(Priority).map((p) => (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setActivePriority(p)}
                            className={clsx(
                              "w-7 h-7 rounded-md text-[10px] font-bold flex items-center justify-center transition-all",
                              p === activePriority 
                                ? p === Priority.HIGH ? "bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]" 
                                : p === Priority.MEDIUM ? "bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.4)]" 
                                : "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                                : "text-slate-500 hover:bg-slate-800"
                            )}
                            title={`Set priority: ${p}`}
                          >
                            {p[0]}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={!inputValue.trim()}
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20 active:scale-95"
                    >
                      <Plus size={24} />
                      <span className="hidden sm:inline">Add Task</span>
                    </button>
                  </form>
                </div>

                {/* Task List */}
                <Reorder.Group axis="y" values={tasks} onReorder={setTasks} className="space-y-4">
                  <AnimatePresence>
                    {tasks.length === 0 ? (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 text-slate-500"
                      >
                        <div className="relative inline-block">
                           <Sparkles className="w-16 h-16 mx-auto mb-4 text-slate-700" />
                           <motion.div 
                             animate={{ rotate: 360 }}
                             transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                             className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent rounded-full blur-xl"
                           />
                        </div>
                        <p className="text-lg font-light">Your workspace is empty.</p>
                        <p className="text-sm opacity-50">Add a task to begin your flow.</p>
                      </motion.div>
                    ) : (
                      tasks.map((task) => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          onToggle={(e) => toggleTask(task.id, e)}
                          onDelete={() => deleteTask(task.id)}
                          onAiBreakdown={() => handleAiBreakdown(task.id, task.title)}
                          onToggleSubtask={(subId) => toggleSubtask(task.id, subId)}
                          isAiLoading={isAiLoading}
                        />
                      ))
                    )}
                  </AnimatePresence>
                </Reorder.Group>
              </motion.div>
            ) : (
              <motion.div
                key="dashboard-view"
                initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                transition={{ duration: 0.3 }}
              >
                <StatsChart stats={calculateStats()} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </motion.div>
    </div>
  );
};

export default App;