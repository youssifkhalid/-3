
import React, { useState, useEffect } from 'react';
import { Task, DayPlan, SUBJECT_COLORS } from './types';
import { generatePlan, getDatesForPlan, formatDate, distributeTasksEvenly } from './utils';
import { fullCurriculum } from './curriculumData'; // Import curriculum to calculate totals
import Dashboard from './components/Dashboard';
import PrintLayout from './components/PrintLayout';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';
import { Settings, Printer, RotateCcw, Plus, Save, RefreshCw, Trash2, Grip, Send, Calendar, ListTodo, Calculator } from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [totalDays, setTotalDays] = useState(60);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSetup, setIsSetup] = useState(false);
  
  // Setup Mode State
  const [planningMode, setPlanningMode] = useState<'days' | 'tasks'>('days');
  const [tasksPerDay, setTasksPerDay] = useState(4);
  
  // UI States
  const [viewMode, setViewMode] = useState<'daily' | 'weekly' | 'all'>('daily');
  const [selectedDay, setSelectedDay] = useState(0);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  
  // Quick Add State
  const [quickTopic, setQuickTopic] = useState('');
  const [quickSubject, setQuickSubject] = useState(Object.keys(SUBJECT_COLORS)[0]);
  
  // Modal States
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [swapSource, setSwapSource] = useState<Task | null>(null);

  // Initialize
  useEffect(() => {
    const saved = localStorage.getItem('thanawya-plan');
    if (saved) {
      const data = JSON.parse(saved);
      setTasks(data.tasks);
      setTotalDays(data.totalDays);
      setStartDate(data.startDate);
      setIsSetup(true);
    }
  }, []);

  const saveState = (newTasks: Task[], days: number, start: string) => {
    setTasks(newTasks);
    setTotalDays(days);
    setStartDate(start);
    localStorage.setItem('thanawya-plan', JSON.stringify({ tasks: newTasks, totalDays: days, startDate: start }));
  };

  const handleCreatePlan = () => {
    let finalDays = totalDays;

    // If planning by tasks, calculate the required days first
    if (planningMode === 'tasks') {
        const totalItems = fullCurriculum.length;
        finalDays = Math.ceil(totalItems / tasksPerDay);
        // Add a buffer day if needed or strictly stick to math
        setTotalDays(finalDays);
    }

    const newTasks = generatePlan(finalDays, startDate);
    saveState(newTasks, finalDays, startDate);
    setIsSetup(true);
  };

  const toggleTask = (id: string) => {
    const updated = tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t);
    saveState(updated, totalDays, startDate);
  };

  const handleSaveTask = (taskData: { id?: string; subject: string; topic: string; dayIndex: number; color?: string }) => {
    if (taskData.id) {
      // Update existing
      const updated = tasks.map(t => t.id === taskData.id ? { ...t, ...taskData } : t);
      updated.sort((a, b) => a.dayIndex - b.dayIndex);
      saveState(updated, totalDays, startDate);
    } else {
      // Add new
      const newTask: Task = {
        id: `custom-${Date.now()}`,
        subject: taskData.subject,
        topic: taskData.topic,
        dayIndex: taskData.dayIndex,
        isCompleted: false,
        color: taskData.color
      };
      const updated = [...tasks, newTask].sort((a, b) => a.dayIndex - b.dayIndex);
      saveState(updated, totalDays, startDate);
    }
    setEditingTask(null);
  };

  const handleQuickAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if(!quickTopic.trim()) return;

    const newTask: Task = {
        id: `quick-${Date.now()}`,
        subject: quickSubject,
        topic: quickTopic,
        dayIndex: selectedDay,
        isCompleted: false
    };
    const updated = [...tasks, newTask].sort((a, b) => a.dayIndex - b.dayIndex);
    saveState(updated, totalDays, startDate);
    setQuickTopic('');
  };

  const handleDeleteTask = (id: string) => {
    const updated = tasks.filter(t => t.id !== id);
    saveState(updated, totalDays, startDate);
  };

  const handleRedistribute = () => {
    if (confirm('سيتم إعادة توزيع جميع المهام الحالية بالتساوي وبنظام (التنوع) لتجنب التكرار. هل أنت متأكد؟')) {
      const balanced = distributeTasksEvenly(tasks, totalDays);
      saveState(balanced, totalDays, startDate);
    }
  };

  const handleReorder = (reorderedTasks: Task[]) => {
    // Robust reordering
    const grouped = new Map<number, Task[]>();
    for (let i = 0; i < totalDays; i++) grouped.set(i, []);
    
    tasks.forEach(t => {
      if (t.dayIndex === selectedDay) return;
      const list = grouped.get(t.dayIndex);
      if (list) list.push(t);
    });
    
    grouped.set(selectedDay, reorderedTasks);
    
    const newAllTasks: Task[] = [];
    for (let i = 0; i < totalDays; i++) {
      const dayTasks = grouped.get(i);
      if (dayTasks) newAllTasks.push(...dayTasks);
    }
    
    saveState(newAllTasks, totalDays, startDate);
  };

  const handleSwap = (targetTask: Task) => {
    if (!swapSource) {
      setSwapSource(targetTask);
    } else {
      const updated = tasks.map(t => {
        if (t.id === swapSource.id) return { ...t, dayIndex: targetTask.dayIndex };
        if (t.id === targetTask.id) return { ...t, dayIndex: swapSource.dayIndex };
        return t;
      });
      updated.sort((a, b) => a.dayIndex - b.dayIndex);
      saveState(updated, totalDays, startDate);
      setSwapSource(null);
    }
  };

  // Grouping for views
  const dayPlans: DayPlan[] = [];
  const dates = getDatesForPlan(totalDays, startDate);
  
  for (let i = 0; i < totalDays; i++) {
    dayPlans.push({
      dayIndex: i,
      date: dates[i],
      tasks: tasks.filter(t => t.dayIndex === i),
      isRestDay: false,
    });
  }

  // Setup Screen
  if (!isSetup) {
    const calculatedDays = Math.ceil(fullCurriculum.length / tasksPerDay);

    return (
      <div className="min-h-screen flex items-center justify-center bg-dark-950 p-4 relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
             <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-accent-600/20 rounded-full blur-[100px]"></div>
             <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"></div>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-dark-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-[2rem] max-w-lg w-full shadow-2xl relative z-10"
        >
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-accent-600 rounded-2xl flex items-center justify-center shadow-lg shadow-accent-500/20 mx-auto mb-4">
               <span className="text-3xl font-black text-white">P</span>
            </div>
            <h1 className="text-3xl font-black text-white font-sans mb-2">رفيق الثانوية</h1>
            <p className="text-gray-400 font-medium">خطط لمنهجك بالطريقة التي تناسبك</p>
          </div>

          <div className="space-y-6">
            
            {/* Planning Mode Toggle */}
            <div className="bg-dark-800 p-1.5 rounded-2xl border border-white/5 flex relative">
                <button 
                  onClick={() => setPlanningMode('days')}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all relative z-10 ${planningMode === 'days' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                   <Calendar size={16} />
                   عدد الأيام
                </button>
                <button 
                  onClick={() => setPlanningMode('tasks')}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all relative z-10 ${planningMode === 'tasks' ? 'text-white' : 'text-gray-400 hover:text-gray-200'}`}
                >
                   <ListTodo size={16} />
                   مهام يومية
                </button>
                
                {/* Animated Background for Toggle */}
                <motion.div 
                   className="absolute top-1.5 bottom-1.5 bg-accent-600 rounded-xl shadow-lg"
                   initial={false}
                   animate={{ 
                       left: planningMode === 'days' ? '6px' : '50%', 
                       width: 'calc(50% - 6px)' 
                   }}
                   transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
            </div>

            <AnimatePresence mode="wait">
                {planningMode === 'days' ? (
                    <motion.div 
                        key="days-input"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                    >
                        <label className="block text-sm font-bold text-gray-300 mb-2">كم يوماً تريد أن تستمر الخطة؟</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={totalDays}
                                onChange={(e) => setTotalDays(parseInt(e.target.value) || 1)}
                                min={1}
                                className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-4 text-white text-lg font-bold focus:ring-2 focus:ring-accent-500 outline-none transition pl-12"
                            />
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        </div>
                        <p className="text-xs text-gray-500 mt-2 font-bold">
                           سيتم توزيع {fullCurriculum.length} درس على {totalDays} يوم (بمعدل {Math.ceil(fullCurriculum.length / totalDays)} دروس يومياً تقريباً)
                        </p>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="tasks-input"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <label className="block text-sm font-bold text-gray-300 mb-2">كم درساً تستطيع أن تذاكر يومياً؟</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                value={tasksPerDay}
                                onChange={(e) => setTasksPerDay(parseInt(e.target.value) || 1)}
                                min={1}
                                className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-4 text-white text-lg font-bold focus:ring-2 focus:ring-accent-500 outline-none transition pl-12"
                            />
                            <ListTodo className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                        </div>
                        <div className="mt-3 bg-accent-500/10 border border-accent-500/20 p-3 rounded-xl flex items-center gap-3">
                           <Calculator className="text-accent-400" size={20} />
                           <div>
                               <p className="text-xs text-accent-200 font-bold">المدة المتوقعة للختم:</p>
                               <p className="text-lg font-black text-white">{calculatedDays} يوم</p>
                           </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">تاريخ البداية</label>
              <input 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-accent-500 outline-none transition"
              />
            </div>

            <button 
              onClick={handleCreatePlan}
              className="w-full bg-gradient-to-r from-accent-600 to-blue-600 hover:from-accent-500 hover:to-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-accent-600/20 mt-2 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              إنشاء الجدول السحري 🚀
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-950 text-gray-100 font-sans pb-20 selection:bg-accent-500/30">
      
      {/* Header */}
      <header className="sticky top-0 z-40 bg-dark-900/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-accent-600 rounded-xl flex items-center justify-center shadow-lg shadow-accent-500/20">
               <span className="text-xl font-black text-white">P</span>
             </div>
             <div>
               <h1 className="font-bold text-lg leading-none">رفيق الثانوية</h1>
               <p className="text-xs text-gray-400 font-semibold">Pro Plan</p>
             </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            <button 
              onClick={() => {
                setEditingTask(null);
                setIsTaskModalOpen(true);
              }}
              className="whitespace-nowrap px-4 py-2.5 bg-accent-600 hover:bg-accent-500 rounded-xl text-white transition-colors shadow-lg shadow-accent-600/20 flex items-center gap-2 font-bold text-sm"
            >
              <Plus size={18} />
              إضافة
            </button>

            <button 
              onClick={handleRedistribute}
              className="whitespace-nowrap px-4 py-2.5 bg-dark-800 hover:bg-blue-600/20 hover:text-blue-400 rounded-xl text-gray-300 transition-colors border border-white/5 flex items-center gap-2 text-sm font-bold"
              title="إعادة توزيع المنهج بالتساوي"
            >
              <RefreshCw size={18} />
              توزيع ذكي (متنوع)
            </button>

            <button 
              onClick={() => setIsPrintOpen(true)}
              className="p-2.5 bg-dark-800 hover:bg-dark-700 rounded-xl text-gray-300 transition-colors border border-white/5"
              title="طباعة الكراسة"
            >
              <Printer size={20} />
            </button>
            <button 
              onClick={() => {
                if(confirm('هل أنت متأكد من إعادة تعيين الخطة؟')) {
                  localStorage.removeItem('thanawya-plan');
                  window.location.reload();
                }
              }}
              className="p-2.5 bg-dark-800 hover:bg-red-500/20 hover:text-red-400 rounded-xl text-gray-300 transition-colors border border-white/5"
            >
              <RotateCcw size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        <Dashboard tasks={tasks} totalDays={totalDays} />

        {/* View Controls */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-6 gap-4">
          <div className="flex bg-dark-800 p-1.5 rounded-2xl border border-white/5">
            {(['daily', 'weekly', 'all'] as const).map(mode => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  viewMode === mode 
                  ? 'bg-accent-600 text-white shadow-lg shadow-accent-900/50' 
                  : 'text-gray-400 hover:text-white'
                }`}
              >
                {mode === 'daily' ? 'يومي' : mode === 'weekly' ? 'أسبوعي' : 'الكل'}
              </button>
            ))}
          </div>

          {swapSource && (
             <div className="bg-accent-500/20 text-accent-400 px-4 py-2 rounded-xl border border-accent-500/30 text-sm font-bold animate-pulse">
               اختر مهمة للتبديل معها...
             </div>
          )}
        </div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={viewMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {viewMode === 'daily' && (
              <div className="space-y-6">
                {/* Day Selector */}
                <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
                  {dayPlans.map((day, idx) => (
                    <button
                      key={day.dayIndex}
                      onClick={() => setSelectedDay(idx)}
                      className={`min-w-[80px] p-4 rounded-2xl border flex flex-col items-center gap-1 transition-all ${
                        selectedDay === idx 
                        ? 'bg-gradient-to-b from-blue-500 to-blue-600 border-blue-400 text-white shadow-lg shadow-blue-500/30 scale-105' 
                        : 'bg-dark-800 border-white/5 text-gray-400 hover:bg-dark-700'
                      }`}
                    >
                      <span className="text-xs font-bold">{day.date ? new Date(day.date).toLocaleDateString('ar-EG', {weekday: 'short'}) : `Day`}</span>
                      <span className="text-2xl font-black">{day.dayIndex + 1}</span>
                    </button>
                  ))}
                </div>

                <div className="bg-dark-800/50 rounded-3xl p-6 border border-white/5">
                   <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-black text-white">
                        {dayPlans[selectedDay]?.date ? formatDate(dayPlans[selectedDay].date!) : `اليوم ${selectedDay + 1}`}
                      </h2>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400 hidden sm:block">اسحب لإعادة الترتيب</span>
                        <span className="text-sm font-bold text-gray-500 bg-dark-900 px-3 py-1 rounded-lg">
                          {dayPlans[selectedDay]?.tasks.length} مهام
                        </span>
                      </div>
                   </div>

                   {/* Quick Add Bar */}
                   <form onSubmit={handleQuickAdd} className="mb-6 bg-dark-800 p-2 rounded-2xl border border-white/5 flex gap-2">
                       <select 
                         value={quickSubject}
                         onChange={(e) => setQuickSubject(e.target.value)}
                         className="bg-dark-900 text-gray-300 text-xs font-bold rounded-xl px-3 py-2 border border-white/5 outline-none focus:border-accent-500"
                       >
                         {Object.keys(SUBJECT_COLORS).map(s => <option key={s} value={s}>{s}</option>)}
                         <option value="أخرى">أخرى</option>
                       </select>
                       <input 
                          type="text" 
                          placeholder="أضف مهمة سريعة لهذا اليوم..."
                          value={quickTopic}
                          onChange={(e) => setQuickTopic(e.target.value)}
                          className="flex-1 bg-transparent text-white px-2 outline-none text-sm placeholder:text-gray-600"
                       />
                       <button 
                        type="submit" 
                        disabled={!quickTopic.trim()}
                        className="bg-accent-600 hover:bg-accent-500 disabled:bg-gray-700 text-white p-2 rounded-xl transition-colors"
                       >
                         <Send size={18} />
                       </button>
                   </form>

                   {/* Reorderable List for Daily View */}
                   <Reorder.Group 
                     axis="y" 
                     values={dayPlans[selectedDay]?.tasks || []} 
                     onReorder={handleReorder}
                     className="grid gap-4"
                   >
                     {dayPlans[selectedDay]?.tasks.map(task => (
                       <Reorder.Item key={task.id} value={task} className="touch-none">
                         <TaskCard 
                           task={task} 
                           onToggle={toggleTask}
                           onEdit={(t) => { setEditingTask(t); setIsTaskModalOpen(true); }}
                           onDelete={handleDeleteTask}
                           onSwapStart={handleSwap}
                           isSwapMode={!!swapSource}
                           isSelectedForSwap={swapSource?.id === task.id}
                           // Pass dragControls if we used them, but Reorder.Item handles it automatically if we don't specify dragListener={false}
                         />
                       </Reorder.Item>
                     ))}
                   </Reorder.Group>

                   {dayPlans[selectedDay]?.tasks.length === 0 && (
                     <div className="text-center py-12 text-gray-500 font-bold">
                       لا توجد مهام في هذا اليوم! استرح ☕
                     </div>
                   )}
                </div>
              </div>
            )}

            {(viewMode === 'weekly' || viewMode === 'all') && (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {dayPlans.filter(d => viewMode === 'all' || (d.dayIndex >= selectedDay && d.dayIndex < selectedDay + 7)).map(day => (
                    <div key={day.dayIndex} className="bg-dark-800 rounded-3xl p-5 border border-white/5 hover:border-white/10 transition-colors">
                      <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
                        <span className="font-bold text-gray-400">اليوم {day.dayIndex + 1}</span>
                        {day.date && <span className="text-xs text-gray-500">{new Date(day.date).toLocaleDateString('ar-EG')}</span>}
                      </div>
                      <div className="space-y-3">
                        {day.tasks.map(task => (
                           <TaskCard 
                             key={task.id} 
                             task={task} 
                             onToggle={toggleTask}
                             onEdit={(t) => { setEditingTask(t); setIsTaskModalOpen(true); }}
                             onDelete={handleDeleteTask}
                             onSwapStart={handleSwap}
                             isSwapMode={!!swapSource}
                             isSelectedForSwap={swapSource?.id === task.id}
                           />
                        ))}
                      </div>
                    </div>
                  ))}
               </div>
            )}

          </motion.div>
        </AnimatePresence>

      </main>

      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => { setIsTaskModalOpen(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        initialTask={editingTask}
        currentDayIndex={selectedDay}
        totalDays={totalDays}
      />

      <PrintLayout 
        plan={dayPlans}
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
      />
    </div>
  );
};

export default App;
