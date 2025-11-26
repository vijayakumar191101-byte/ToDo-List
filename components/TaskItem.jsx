import React, { useState } from 'react';
import { Reorder, useDragControls, AnimatePresence, motion } from 'framer-motion';
import { Check, Trash2, ChevronDown, ChevronUp, Sparkles, AlertCircle, GripVertical } from 'lucide-react';
import { Priority } from '../types';
import clsx from 'clsx';

export const TaskItem = ({
  task,
  onToggle,
  onDelete,
  onAiBreakdown,
  onToggleSubtask,
  isAiLoading
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const dragControls = useDragControls();

  const priorityColor = {
    [Priority.LOW]: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 group-hover:border-emerald-500/40',
    [Priority.MEDIUM]: 'bg-amber-500/10 text-amber-400 border-amber-500/20 group-hover:border-amber-500/40',
    [Priority.HIGH]: 'bg-rose-500/10 text-rose-400 border-rose-500/20 group-hover:border-rose-500/40',
  };

  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const progress = task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0;

  return (
    <Reorder.Item
      value={task}
      id={task.id}
      dragListener={false}
      dragControls={dragControls}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileDrag={{ scale: 1.02, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.4)" }}
      className="group relative bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden shadow-sm transition-all hover:shadow-lg hover:shadow-cyan-900/10 hover:border-slate-600 my-3"
    >
      {/* Priority Indicator Stripe */}
      <div className={clsx("absolute left-0 top-0 bottom-0 w-1 transition-colors", 
        task.priority === Priority.HIGH ? "bg-rose-500" : 
        task.priority === Priority.MEDIUM ? "bg-amber-500" : "bg-emerald-500"
      )} />

      <div className="p-4 pl-6 flex items-center gap-4">
        {/* Drag Handle */}
        <div 
          onPointerDown={(e) => dragControls.start(e)}
          className="cursor-grab active:cursor-grabbing text-slate-600 hover:text-slate-400 transition-colors"
        >
          <GripVertical size={20} />
        </div>

        {/* Checkbox */}
        <button
          onClick={onToggle}
          className={clsx(
            "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 relative overflow-hidden",
            task.completed
              ? "bg-gradient-to-br from-cyan-400 to-blue-500 border-transparent shadow-[0_0_10px_rgba(6,182,212,0.5)]"
              : "border-slate-500 hover:border-cyan-400 bg-slate-900/50"
          )}
        >
          {task.completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Check size={14} className="text-white font-bold" />
            </motion.div>
          )}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={clsx(
              "text-lg font-medium transition-all duration-300 truncate",
              task.completed ? "text-slate-500 line-through decoration-slate-600" : "text-slate-100"
            )}>
              {task.title}
            </span>
            <span className={clsx("text-[10px] px-2 py-0.5 rounded-full border font-bold uppercase tracking-wider transition-colors", priorityColor[task.priority])}>
              {task.priority}
            </span>
          </div>
          
          {/* Progress Bar */}
          {task.subtasks.length > 0 && (
            <div className="flex items-center gap-3 mt-2 max-w-xs">
               <div className="h-1.5 flex-1 bg-slate-700 rounded-full overflow-hidden">
                 <motion.div 
                   className={clsx("h-full rounded-full shadow-[0_0_8px_rgba(6,182,212,0.6)]", 
                     progress === 100 ? "bg-emerald-500" : "bg-cyan-500"
                   )}
                   initial={{ width: 0 }}
                   animate={{ width: `${progress}%` }}
                   transition={{ duration: 0.5, ease: "easeOut" }}
                 />
               </div>
               <span className="text-[10px] text-slate-400 font-mono">{Math.round(progress)}%</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
           {/* AI Button */}
          {!task.completed && task.subtasks.length === 0 && (
             <button
             onClick={onAiBreakdown}
             disabled={isAiLoading}
             className="p-2 text-purple-400 hover:bg-purple-500/10 rounded-lg transition-colors group/ai relative"
             title="AI Breakdown"
           >
             <Sparkles size={18} className={clsx(isAiLoading && "animate-spin text-purple-300")} />
             {/* Tooltip */}
             <span className="absolute -top-8 right-0 bg-slate-900 text-purple-300 border border-purple-500/30 text-xs px-2 py-1 rounded opacity-0 group-hover/ai:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
               AI Split
             </span>
           </button>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-400 hover:bg-slate-700 hover:text-white rounded-lg transition-colors"
          >
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
          
          <button
            onClick={onDelete}
            className="p-2 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 rounded-lg transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Subtasks Section */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-slate-900/30 border-t border-slate-700/50"
          >
            <div className="p-4 pl-16 space-y-2">
              {task.subtasks.length === 0 ? (
                <div className="text-sm text-slate-500 flex items-center gap-2">
                   <AlertCircle size={14} /> 
                   <span>No subtasks yet. </span>
                   <button onClick={onAiBreakdown} className="text-purple-400 hover:underline hover:text-purple-300">
                     Ask AI to help?
                   </button>
                </div>
              ) : (
                task.subtasks.map((sub) => (
                  <motion.div
                    key={sub.id}
                    layout
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex items-center gap-3 group/sub"
                  >
                    <button
                      onClick={() => onToggleSubtask(sub.id)}
                      className={clsx(
                        "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                        sub.completed ? "bg-emerald-500 border-emerald-500" : "border-slate-600 hover:border-emerald-500"
                      )}
                    >
                      {sub.completed && <Check size={10} className="text-white" />}
                    </button>
                    <span className={clsx(
                      "text-sm transition-colors cursor-pointer select-none",
                      sub.completed ? "text-slate-600 line-through" : "text-slate-300 group-hover/sub:text-slate-200"
                    )} onClick={() => onToggleSubtask(sub.id)}>
                      {sub.title}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
};