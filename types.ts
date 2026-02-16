
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
  layout: 'list' | 'grid-2' | 'grid-4'; // tasks per page or days per page
  daysPerPage: number;
  showDate: boolean;
  showDayName: boolean;
  showNotesArea: boolean;
  
  // Factory Options
  spiralMargin: boolean; 
  spiralPosition: 'top' | 'right' | 'left';
  marginSize: number; // in mm
  
  // Islamic Additions
  showPrayers: boolean;
  showFasting: boolean;
  
  // Customization
  extraLines: number; // Add empty lines for user to write
  taskLayout: 'simple' | 'table'; // Render tasks as list or table with columns
  showDayCompletion: boolean; // New: Checkbox for whole day
  
  // Visuals & Typography
  theme: 'modern' | 'minimal' | 'islamic' | 'geometric' | 'professional' | 'creative';
  fontSize: 'small' | 'medium' | 'large';
  fontStyle: 'cairo' | 'amiri' | 'tajawal';
  density: 'compact' | 'comfortable' | 'spacious';
}

export const SUBJECT_COLORS: Record<string, string> = {
  'الكيمياء': 'bg-rose-500',
  'الفيزياء': 'bg-blue-500',
  'الأحياء والجيولوجيا': 'bg-emerald-500',
  'اللغة العربية': 'bg-amber-500',
  'اللغة الإنجليزية': 'bg-purple-500',
};

// Map subject names to tailwind classes for default styling
export const SUBJECT_BG: Record<string, string> = {
  'الكيمياء': 'bg-rose-500/10 text-rose-400 border-rose-500/20',
  'الفيزياء': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  'الأحياء والجيولوجيا': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  'اللغة العربية': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  'اللغة الإنجليزية': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
};
