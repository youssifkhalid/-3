
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Calendar, Save, Palette, BookOpen, Layout, Clock } from 'lucide-react';
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
  const [customColor, setCustomColor] = useState<string>('#8b5cf6');
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-md"
            />
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative bg-dark-900 w-full max-w-lg rounded-3xl p-6 md:p-8 shadow-2xl border border-white/10 overflow-hidden"
            >
                {/* Header */}
                <div className="flex justify-between items-start mb-8 relative z-10">
                    <div>
                        <h2 className="text-2xl font-black text-white font-sans flex items-center gap-2">
                            {initialTask ? <Save className="text-blue-500" size={24} /> : <Plus className="text-accent-500" size={24} />}
                            {initialTask ? 'تعديل المهمة' : 'مهمة جديدة'}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                            {initialTask ? 'قم بتحديث تفاصيل المهمة أدناه' : 'أضف نشاطاً جديداً لخطتك الدراسية'}
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="bg-dark-800 p-2 rounded-full text-gray-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/50 border border-transparent transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                    
                    {/* Subject Section */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <BookOpen size={14} />
                            المادة الدراسية
                        </label>
                        <div className="grid grid-cols-[1fr,auto] gap-3">
                            <div className="relative">
                                <select 
                                    value={subject}
                                    onChange={(e) => setSubject(e.target.value)}
                                    className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3.5 text-white font-bold focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none appearance-none transition-all cursor-pointer hover:border-white/20"
                                >
                                    {Object.keys(SUBJECT_COLORS).map(sub => (
                                        <option key={sub} value={sub}>{sub}</option>
                                    ))}
                                    <option value="مادة أخرى">مادة أخرى</option>
                                </select>
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    <Layout size={18} />
                                </div>
                            </div>
                            
                            <button
                                type="button"
                                onClick={() => setUseCustomColor(!useCustomColor)}
                                className={`w-14 rounded-xl border flex items-center justify-center transition-all ${useCustomColor ? 'bg-dark-800 border-accent-500 text-accent-400 shadow-[0_0_15px_rgba(139,92,246,0.3)]' : 'bg-dark-800 border-white/10 text-gray-500 hover:text-white hover:border-white/30'}`}
                                title="تخصيص اللون"
                            >
                                <Palette size={22} />
                            </button>
                        </div>
                        
                        <AnimatePresence>
                            {useCustomColor && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="flex items-center gap-3 bg-dark-800/50 p-3 rounded-xl border border-white/5">
                                        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 shadow-inner">
                                            <input 
                                                type="color" 
                                                value={customColor}
                                                onChange={(e) => setCustomColor(e.target.value)}
                                                className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer p-0 m-0"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-white">لون مخصص</p>
                                            <p className="text-[10px] text-gray-500">اختر لوناً يميز هذه المهمة في الجدول</p>
                                        </div>
                                        <div className="text-xs font-mono text-gray-400 bg-black/20 px-2 py-1 rounded">
                                            {customColor}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Topic Section */}
                    <div className="space-y-3">
                         <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Layout size={14} />
                            تفاصيل المهمة
                        </label>
                        <input 
                            type="text" 
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder="مثال: حل تمارين الدرس الأول..."
                            className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder:text-gray-600 focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none transition-all"
                            autoFocus
                        />
                    </div>

                    {/* Day Section */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                            <Clock size={14} />
                            التوقيت
                        </label>
                        <div className="relative group">
                            <input 
                                type="number" 
                                min={1}
                                max={totalDays}
                                value={day}
                                onChange={(e) => setDay(parseInt(e.target.value) || 1)}
                                className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3.5 text-white font-mono text-lg focus:ring-2 focus:ring-accent-500 focus:border-accent-500 outline-none pl-12 transition-all group-hover:border-white/20"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none group-focus-within:text-accent-500 transition-colors">
                                <Calendar size={20} />
                            </div>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500 pointer-events-none bg-dark-800 pl-2">
                                يوم {day} من {totalDays}
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-4 flex gap-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="flex-1 bg-dark-800 hover:bg-dark-700 text-gray-300 font-bold py-4 rounded-xl border border-white/5 transition-all"
                        >
                            إلغاء
                        </button>
                        <button 
                            type="submit"
                            className={`flex-[2] text-white font-bold py-4 rounded-xl shadow-xl flex items-center justify-center gap-2 transition-all transform active:scale-95 ${
                            initialTask 
                                ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-blue-500/20' 
                                : 'bg-gradient-to-r from-accent-600 to-accent-500 hover:from-accent-500 hover:to-accent-400 shadow-accent-500/20'
                            }`}
                        >
                            {initialTask ? <Save size={20} /> : <Plus size={20} />}
                            {initialTask ? 'حفظ التعديلات' : 'إضافة للجدول'}
                        </button>
                    </div>
                </form>

                {/* Decorative background blur */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
            </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default TaskModal;
