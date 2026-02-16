import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Calendar } from 'lucide-react';
import { SUBJECT_COLORS } from '../types';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: { subject: string; topic: string; dayIndex: number }) => void;
  currentDayIndex: number;
  totalDays: number;
}

const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAdd, currentDayIndex, totalDays }) => {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState(Object.keys(SUBJECT_COLORS)[0]);
  const [day, setDay] = useState(currentDayIndex + 1);

  // Reset day when modal opens or currentDayIndex changes
  useEffect(() => {
    if (isOpen) {
      setDay(currentDayIndex + 1);
      setTopic('');
    }
  }, [isOpen, currentDayIndex]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    onAdd({
      subject,
      topic,
      dayIndex: Math.max(0, Math.min(day - 1, totalDays - 1))
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
          <h2 className="text-2xl font-bold text-white font-sans">إضافة مهمة جديدة</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-400 mb-2">المادة</label>
            <select 
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-accent-500 outline-none appearance-none"
            >
              {Object.keys(SUBJECT_COLORS).map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
              <option value="مادة أخرى">مادة أخرى</option>
            </select>
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
            className="w-full bg-accent-600 hover:bg-accent-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-accent-600/20 mt-4 flex items-center justify-center gap-2 transition-all"
          >
            <Plus size={20} />
            إضافة للمنهج
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddTaskModal;