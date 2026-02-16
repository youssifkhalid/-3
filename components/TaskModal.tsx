
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Calendar, Save, Palette } from 'lucide-react';
import { SUBJECT_COLORS, Task } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: { id?: string; subject: string; topic: string; dayIndex: number; color?: string }) => void;
  initialTask?: Task | null;
  currentDayIndex: number;
  totalDays: number;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, onSave, initialTask, currentDayIndex, totalDays }) => {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState(Object.keys(SUBJECT_COLORS)[0]);
  const [day, setDay] = useState(currentDayIndex + 1);
  const [customColor, setCustomColor] = useState<string>('#8b5cf6'); // Default accent
  const [useCustomColor, setUseCustomColor] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialTask) {
        setTopic(initialTask.topic);
        setSubject(initialTask.subject);
        setDay(initialTask.dayIndex + 1);
        if (initialTask.color) {
          setCustomColor(initialTask.color);
          setUseCustomColor(true);
        } else {
          setUseCustomColor(false);
        }
      } else {
        setDay(currentDayIndex + 1);
        setTopic('');
        setSubject(Object.keys(SUBJECT_COLORS)[0]);
        setUseCustomColor(false);
      }
    }
  }, [isOpen, initialTask, currentDayIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    onSave({
      id: initialTask?.id,
      subject,
      topic,
      dayIndex: Math.max(0, Math.min(day - 1, totalDays - 1)),
      color: useCustomColor ? customColor : undefined
    });
    setTopic('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-dark-900 w-full max-w-md rounded-3xl p-6 shadow-2xl border border-white/10"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white font-sans">
            {initialTask ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">المادة</label>
            <div className="flex gap-2">
                <select 
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="flex-1 bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-accent-500 outline-none appearance-none"
                >
                  {Object.keys(SUBJECT_COLORS).map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                  <option value="مادة أخرى">مادة أخرى</option>
                </select>
                
                {/* Color Picker Toggle */}
                <button
                  type="button"
                  onClick={() => setUseCustomColor(!useCustomColor)}
                  className={`p-3 rounded-xl border transition-colors ${useCustomColor ? 'bg-dark-800 border-accent-500 text-white' : 'bg-dark-800 border-white/10 text-gray-500'}`}
                  title="لون مخصص"
                >
                  <Palette size={20} />
                </button>
            </div>
            
            {/* Custom Color Input */}
            {useCustomColor && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="mt-2 flex items-center gap-3 bg-dark-800 p-3 rounded-xl border border-white/5"
              >
                  <input 
                    type="color" 
                    value={customColor}
                    onChange={(e) => setCustomColor(e.target.value)}
                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                  />
                  <span className="text-xs text-gray-400">اختر لوناً مميزاً لهذه المهمة</span>
              </motion.div>
            )}
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">عنوان الدرس / المهمة</label>
            <input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="مثال: مراجعة الباب الأول..."
              className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-accent-500 outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">اليوم (1 - {totalDays})</label>
            <div className="relative">
              <input 
                type="number" 
                min={1}
                max={totalDays}
                value={day}
                onChange={(e) => setDay(parseInt(e.target.value) || 1)}
                className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-accent-500 outline-none pl-10"
              />
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
            </div>
          </div>

          <button 
            type="submit"
            className={`w-full text-white font-bold py-4 rounded-xl shadow-lg mt-4 flex items-center justify-center gap-2 transition-all ${
              initialTask 
                ? 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20' 
                : 'bg-accent-600 hover:bg-accent-500 shadow-accent-600/20'
            }`}
          >
            {initialTask ? <Save size={20} /> : <Plus size={20} />}
            {initialTask ? 'حفظ التعديلات' : 'إضافة للمنهج'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default TaskModal;
