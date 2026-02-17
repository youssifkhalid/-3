
export interface Task {
  id: string;
  subject: string;
  topic: string;
  isCompleted: boolean;
  dayIndex: number; // 0 to TotalDays - 1
  color?: string; // Optional custom color (hex)
}

export interface DayPlan {
  dayIndex: number;
  tasks: Task[];
  date?: string;
  isRestDay: boolean;
}

export interface AppSettings {
  totalDays: number;
  startDate: string;
  theme: 'dark' | 'light';
  isSetup: boolean;
}

export interface PrintSettings {
  paperSize: 'A4' | 'A5' | 'Note'; // Note is for small spiral notebook
  daysPerPage: 1 | 2 | 4; // Distinct from layout style
  
  // Content Options
  showDate: boolean;
  showDayName: boolean;
  showNotesArea: boolean;
  showPrayers: boolean;
  showFasting: boolean;
  showScoreBox: boolean; // New: Box for grading the day
  
  // Factory/Structure Options
  spiralMargin: boolean; 
  spiralPosition: 'top' | 'right' | 'left';
  marginSize: number; // in mm
  extraLines: number; // Add empty lines for user to write
  
  // The Core Look
  taskStyle: 'simple' | 'dual' | 'table'; // simple list, study/solve check, or full table
  theme: 'modern' | 'minimal' | 'islamic' | 'geometric' | 'professional' | 'creative' | 'emergency';
  
  // Typography
  fontSize: 'small' | 'medium' | 'large';
  fontStyle: 'cairo' | 'amiri' | 'tajawal';
  density: 'compact' | 'comfortable' | 'spacious';
}

export const SUBJECT_COLORS: Record<string, string> = {
  'اللغة العربية': 'bg-amber-500',
  'اللغة الإنجليزية': 'bg-purple-500',
  'التاريخ': 'bg-rose-600',
  'الجغرافيا': 'bg-emerald-600',
  'الإحصاء': 'bg-blue-500',
};

// Map subject names to tailwind classes for default styling
export const SUBJECT_BG: Record<string, string> = {
  'اللغة العربية': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'اللغة الإنجليزية': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  'التاريخ': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'الجغرافيا': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'الإحصاء': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
};
