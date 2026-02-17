
import React from 'react';
import { Task, SUBJECT_BG } from '../types';
import { motion } from 'framer-motion';
import { Check, ArrowRightLeft, Edit3, Trash2, GripVertical, FlaskConical, Atom, Dna, BookOpenCheck, Languages, Sparkles } from 'lucide-react';

interface TaskCardProps {
  task: Task;
  onToggle: (id: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onSwapStart: (task: Task) => void;
  isSwapMode: boolean;
  isSelectedForSwap: boolean;
  dragControls?: any;
}

// Map subjects to advanced icons
const getSubjectIcon = (subject: string) => {
  if (subject.includes('الكيمياء')) return <FlaskConical size={16} />;
  if (subject.includes('الفيزياء')) return <Atom size={16} />;
  if (subject.includes('الأحياء') || subject.includes('الجيولوجيا')) return <Dna size={16} />;
  if (subject.includes('العربية')) return <BookOpenCheck size={16} />;
  if (subject.includes('الإنجليزية')) return <Languages size={16} />;
  return <Sparkles size={16} />;
};

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  onToggle, 
  onEdit, 
  onDelete,
  onSwapStart, 
  isSwapMode, 
  isSelectedForSwap,
  dragControls
}) => {
  // Determine styles. If task has custom color, use it. Else use default class map.
  const hasCustomColor = !!task.color;
  
  // Base style for the subject tag
  const tagStyle = hasCustomColor 
    ? { backgroundColor: `${task.color}20`, color: task.color, borderColor: `${task.color}40` }
    : {};
    
  const tagClass = hasCustomColor 
    ? 'border' 
    : (SUBJECT_BG[task.subject] || 'bg-gray-800 text-gray-300 border-gray-700');

  // Checkbox style
  const checkboxStyle = task.isCompleted 
    ? { backgroundColor: '#22c55e', borderColor: '#22c55e' }
    : hasCustomColor ? { borderColor: task.color } : {};

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01, y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`relative group flex items-center p-4 rounded-2xl border transition-all duration-300 bg-dark-800 shadow-sm
        ${isSelectedForSwap ? 'border-accent-500 bg-accent-500/10 ring-2 ring-accent-500/50' : 'border-white/5 hover:border-white/20 hover:shadow-lg hover:shadow-black/20'}
        ${task.isCompleted ? 'opacity-60 grayscale-[0.5]' : ''}
      `}
    >
      {/* Drag Handle */}
      <div 
        className="cursor-grab active:cursor-grabbing p-1 text-gray-600 hover:text-gray-400 -ml-2 mr-1"
        onPointerDown={(e) => dragControls?.start(e)}
      >
        <GripVertical size={18} />
      </div>

      {/* Checkbox */}
      <button
        onClick={() => onToggle(task.id)}
        style={checkboxStyle}
        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mx-3 transition-all flex-shrink-0
          ${!task.isCompleted && !hasCustomColor ? 'border-gray-500 hover:border-green-400' : ''}
        `}
      >
        {task.isCompleted && <Check size={14} className="text-white" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div 
          style={tagStyle}
          className={`text-xs font-bold px-2 py-1 rounded-lg w-fit mb-1.5 border flex items-center gap-1.5 ${tagClass}`}
        >
          {getSubjectIcon(task.subject)}
          {task.subject}
        </div>
        <h4 className={`text-white font-bold leading-snug ml-1 ${task.isCompleted ? 'line-through text-gray-500' : ''}`}>
          {task.topic}
        </h4>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
        <button onClick={() => onSwapStart(task)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-blue-400 transition-colors" title="تبديل">
           <ArrowRightLeft size={16} />
        </button>
        <button onClick={() => onEdit(task)} className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-accent-400 transition-colors" title="تعديل">
           <Edit3 size={16} />
        </button>
        <button 
          onClick={() => {
            if(confirm('هل أنت متأكد من حذف هذه المهمة؟')) onDelete(task.id);
          }} 
          className="p-2 hover:bg-red-500/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors" 
          title="حذف"
        >
           <Trash2 size={16} />
        </button>
      </div>
    </motion.div>
  );
};

export default TaskCard;
