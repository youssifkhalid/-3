
import React, { useState } from 'react';
import { Task, SUBJECT_COLORS } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Flame, Calendar, BookOpen, TrendingUp, CheckCircle2, Target, BarChart2, PieChart } from 'lucide-react';

interface DashboardProps {
  tasks: Task[];
  totalDays: number;
}

const Dashboard: React.FC<DashboardProps> = ({ tasks, totalDays }) => {
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly' | 'all'>('all');

  // Filter tasks based on Time Range
  // Note: Since we don't have real historical dates for completed tasks in this simplified model (only `isCompleted`),
  // we will simulate the "view" filtering by assuming the `dayIndex` roughly maps to time.
  const filteredTasks = tasks.filter(t => {
      if (timeRange === 'all') return true;
      if (timeRange === 'daily') return t.dayIndex === 0; // Just showing Day 1 as example of 'Today'
      if (timeRange === 'weekly') return t.dayIndex < 7;
      if (timeRange === 'monthly') return t.dayIndex < 30;
      return true;
  });

  const completedTasks = filteredTasks.filter(t => t.isCompleted).length;
  const totalFiltered = filteredTasks.length;
  const progress = totalFiltered > 0 ? Math.round((completedTasks / totalFiltered) * 100) : 0;
  
  // Stats Calculation for Charts
  const subjectTotals = filteredTasks.reduce((acc, task) => {
    acc[task.subject] = (acc[task.subject] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const subjectCompleted = filteredTasks.reduce((acc, task) => {
    acc[task.subject] = (acc[task.subject] || 0) + (task.isCompleted ? 1 : 0);
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.keys(subjectTotals).map(subject => ({
    name: subject,
    completed: subjectCompleted[subject] || 0,
    total: subjectTotals[subject],
    remaining: subjectTotals[subject] - (subjectCompleted[subject] || 0),
    progress: Math.round(((subjectCompleted[subject] || 0) / subjectTotals[subject]) * 100)
  }));

  // Mock Activity Data (Simulated for visual appeal as we don't store timestamps of completion)
  const activityData = Array.from({ length: 7 }, (_, i) => ({
    day: `يوم ${i + 1}`,
    tasks: Math.floor(Math.random() * 8) + 2, // Random 2-10 tasks
    efficiency: Math.floor(Math.random() * 30) + 70, // 70-100%
  }));

  return (
    <div className="space-y-6 mb-8">
      {/* Time Range Tabs */}
      <div className="flex justify-center mb-6">
        <div className="bg-dark-800 p-1 rounded-2xl border border-white/5 inline-flex">
            {([
                { id: 'daily', label: 'يومي' },
                { id: 'weekly', label: 'أسبوعي' },
                { id: 'monthly', label: 'شهري' },
                { id: 'all', label: 'الكل' }
            ] as const).map(tab => (
                <button
                    key={tab.id}
                    onClick={() => setTimeRange(tab.id)}
                    className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                        timeRange === tab.id 
                        ? 'bg-gradient-to-r from-accent-600 to-accent-500 text-white shadow-lg' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
            key={timeRange}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            {/* Top Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Main Progress Circle */}
                <div className="bg-gradient-to-br from-indigo-900 to-dark-900 rounded-[2rem] p-6 border border-indigo-500/30 shadow-2xl relative overflow-hidden flex flex-col justify-between min-h-[300px]">
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                
                <div className="flex justify-between items-start relative z-10">
                    <div>
                    <h3 className="text-gray-400 font-bold mb-1">المستوى العام ({timeRange === 'all' ? 'الكلي' : timeRange === 'daily' ? 'اليومي' : timeRange === 'weekly' ? 'الأسبوعي' : 'الشهري'})</h3>
                    <h2 className="text-3xl font-black text-white font-sans">
                        {progress < 30 ? 'بداية الطريق' : progress < 70 ? 'محارب مجتهد' : 'أسطورة الثانوية'}
                    </h2>
                    </div>
                    <Award className="text-yellow-400 drop-shadow-lg" size={32} />
                </div>

                <div className="flex items-center justify-center py-6 relative z-10">
                    <div className="relative w-48 h-48">
                    {/* Background Circle */}
                    <svg className="w-full h-full rotate-[-90deg]" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#1e293b" strokeWidth="8" />
                        <motion.circle 
                            cx="50" cy="50" r="45" 
                            fill="none" 
                            stroke="url(#gradient)" 
                            strokeWidth="8" 
                            strokeLinecap="round"
                            strokeDasharray="283"
                            initial={{ strokeDashoffset: 283 }}
                            animate={{ strokeDashoffset: 283 - (283 * progress) / 100 }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                        <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                            </linearGradient>
                        </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-5xl font-black text-white tracking-tighter">{progress}%</span>
                        <span className="text-xs text-indigo-300 font-bold mt-1">إنجاز</span>
                    </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-white/5 rounded-2xl p-3 text-center backdrop-blur-sm">
                    <span className="block text-2xl font-bold text-white">{completedTasks}</span>
                    <span className="text-xs text-gray-400">مكتملة</span>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-3 text-center backdrop-blur-sm">
                    <span className="block text-2xl font-bold text-gray-300">{totalFiltered}</span>
                    <span className="text-xs text-gray-400">إجمالي</span>
                    </div>
                </div>
                </div>

                {/* Stats Grid */}
                <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <StatCard 
                    title="حماس اليوم" 
                    value="مرتفع جداً 🔥" 
                    sub="استمر في التحطيم!" 
                    icon={<Flame className="text-orange-500" />} 
                    color="bg-orange-500/10 border-orange-500/20"
                />
                <StatCard 
                    title="المدة المتبقية" 
                    value={`${totalDays} يوم`} 
                    sub="العد التنازلي" 
                    icon={<Calendar className="text-blue-500" />} 
                    color="bg-blue-500/10 border-blue-500/20"
                />
                <StatCard 
                    title="معدل الإنجاز" 
                    value={`${Math.ceil(totalFiltered / (timeRange === 'all' ? totalDays : 1))} مهام/يوم`} 
                    sub="وتيرة ثابتة" 
                    icon={<Target className="text-emerald-500" />} 
                    color="bg-emerald-500/10 border-emerald-500/20"
                />
                <StatCard 
                    title="مواد منتهية" 
                    value="0 مواد" 
                    sub="قريباً..." 
                    icon={<CheckCircle2 className="text-purple-500" />} 
                    color="bg-purple-500/10 border-purple-500/20"
                />

                {/* Mini Chart Area - Fixed Height to prevent -1 width error */}
                <div className="md:col-span-2 bg-dark-800 rounded-3xl p-5 border border-white/5 shadow-xl relative overflow-hidden min-h-[200px]">
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-bold text-white flex items-center gap-2">
                        <TrendingUp size={18} className="text-accent-500" />
                        نشاطك (محاكاة)
                        </h4>
                    </div>
                    <div className="h-32 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={activityData}>
                            <defs>
                            <linearGradient id="colorPv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                            </linearGradient>
                            </defs>
                            <Tooltip contentStyle={{backgroundColor: '#0f172a', border: 'none', borderRadius: '8px'}} itemStyle={{color: '#fff'}} />
                            <Area type="monotone" dataKey="efficiency" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#colorPv)" />
                        </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                </div>
            </div>

            {/* Detailed Subject Analysis */}
            <div className="bg-dark-800 rounded-[2rem] p-6 border border-white/5 shadow-xl mt-6">
                <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <BookOpen className="text-blue-500" />
                    تحليل المواد الدراسية
                </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Bar Chart - Fixed height container */}
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 20 }}>
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 'bold'}} />
                        <Tooltip 
                            cursor={{fill: 'rgba(255,255,255,0.05)'}}
                            content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                <div className="bg-dark-900 border border-white/10 p-3 rounded-xl shadow-xl">
                                    <p className="font-bold text-white mb-1">{payload[0].payload.name}</p>
                                    <p className="text-xs text-blue-400">مكتمل: {payload[0].payload.completed}</p>
                                    <p className="text-xs text-gray-500">متبقي: {payload[0].payload.remaining}</p>
                                </div>
                                );
                            }
                            return null;
                            }}
                        />
                        <Bar dataKey="total" barSize={12} radius={[0, 10, 10, 0]} fill="#334155" stackId="a" />
                        <Bar dataKey="completed" barSize={12} radius={[0, 10, 10, 0]} fill="#3b82f6" stackId="b" className="opacity-80" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-2 gap-3 content-start">
                    {chartData.map((subject, idx) => (
                        <div key={idx} className="bg-dark-900 p-3 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex justify-between items-center mb-2">
                            <div className={`w-2 h-2 rounded-full ${SUBJECT_COLORS[subject.name] || 'bg-gray-500'}`}></div>
                            <span className="text-xs font-bold text-gray-400">{subject.progress}%</span>
                            </div>
                            <h5 className="font-bold text-white text-sm truncate">{subject.name}</h5>
                            <div className="w-full h-1.5 bg-gray-800 rounded-full mt-2 overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${SUBJECT_COLORS[subject.name] || 'bg-gray-500'}`} 
                                style={{width: `${subject.progress}%`}}
                            ></div>
                            </div>
                        </div>
                    ))}
                </div>
                </div>
            </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const StatCard = ({ title, value, sub, icon, color }: any) => (
  <div className={`rounded-3xl p-5 border flex items-center justify-between transition-transform hover:scale-[1.02] ${color}`}>
    <div>
      <p className="text-gray-400 font-bold text-xs mb-1">{title}</p>
      <h4 className="text-2xl font-black text-white font-sans">{value}</h4>
      <p className="text-[10px] text-gray-400 mt-1 opacity-80">{sub}</p>
    </div>
    <div className="p-3 bg-dark-900/50 rounded-2xl backdrop-blur-sm">
      {icon}
    </div>
  </div>
);

export default Dashboard;
