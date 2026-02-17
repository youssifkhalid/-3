
import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as ReactToPrintPkg from 'react-to-print';
import { DayPlan, PrintSettings } from '../types';
import { getDayName } from '../utils';
import { Printer, X, Settings2, Moon, Sun, Plus, Minus, LayoutList, CheckSquare, BookOpen, AlignJustify, Grid, PenTool, FileText, Table as TableIcon, List, Type, Maximize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Robust import for useReactToPrint to handle ESM/CJS differences
const useReactToPrint = ReactToPrintPkg.useReactToPrint || (ReactToPrintPkg as any).default?.useReactToPrint;

interface PrintLayoutProps {
  plan: DayPlan[];
  isOpen: boolean;
  onClose: () => void;
}

// --- THEME ENGINE ---
// Defines the visual DNA for each theme
const THEME_STYLES = {
  emergency: {
    id: 'emergency',
    name: 'طوارئ (Mission)',
    // Container
    pageBorder: 'border-4 border-black',
    bgPattern: 'pattern-hazard',
    // Header
    headerWrapper: 'bg-black text-yellow-400 p-4 border-b-4 border-yellow-400 mb-6 flex items-center justify-between relative overflow-hidden',
    headerTitle: 'font-black tracking-widest uppercase text-3xl font-mono',
    headerSub: 'text-gray-400 font-bold font-mono text-sm',
    dayBadge: 'bg-yellow-400 text-black font-black text-2xl w-16 h-16 flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_#fff]',
    // Tasks
    taskContainer: 'mb-3 border-2 border-black bg-white shadow-[3px_3px_0px_rgba(0,0,0,0.2)]',
    taskHeader: 'bg-black text-white p-2 flex justify-between items-center border-b-2 border-black',
    taskBody: 'p-2 bg-gray-50',
    subjectBadge: 'bg-yellow-400 text-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border border-black',
    topicText: 'font-bold text-sm',
    checkboxWrapper: 'flex-1 border-2 border-black bg-white p-2 flex items-center gap-2 transition-all',
    checkboxBox: 'w-6 h-6 border-2 border-black bg-white shadow-[2px_2px_0px_#000]',
    // Footer
    footerBorder: 'border-t-4 border-black mt-auto pt-4',
    prayerBox: 'border-2 border-black bg-white',
    noteArea: 'border-2 border-black bg-white min-h-[80px] relative',
  },
  modern: {
    id: 'modern',
    name: 'عصري (Clean)',
    pageBorder: 'border-0',
    bgPattern: 'pattern-dots',
    headerWrapper: 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-3xl mb-6 shadow-sm flex items-center justify-between',
    headerTitle: 'font-bold text-3xl tracking-tight',
    headerSub: 'text-blue-100 font-medium',
    dayBadge: 'bg-white/20 backdrop-blur-md text-white font-bold text-2xl w-14 h-14 rounded-2xl flex items-center justify-center border border-white/30',
    taskContainer: 'mb-3 bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden',
    taskHeader: 'bg-white p-3 pb-0 flex justify-between items-start',
    taskBody: 'p-3 pt-1',
    subjectBadge: 'bg-blue-50 text-blue-600 px-3 py-1 rounded-lg text-[10px] font-bold',
    topicText: 'font-bold text-gray-800 text-sm mt-1 block',
    checkboxWrapper: 'flex-1 bg-gray-50 border border-gray-200 rounded-xl p-2 flex items-center gap-2',
    checkboxBox: 'w-5 h-5 border-2 border-gray-300 rounded-lg bg-white',
    footerBorder: 'border-t border-gray-200 mt-auto pt-4',
    prayerBox: 'border border-gray-200 rounded-2xl bg-gray-50 overflow-hidden',
    noteArea: 'border border-gray-200 rounded-2xl bg-gray-50/50 min-h-[80px]',
  },
  islamic: {
    id: 'islamic',
    name: 'إسلامي (Barakah)',
    pageBorder: 'border-2 border-emerald-600/20 border-double',
    bgPattern: 'pattern-arabesque',
    headerWrapper: 'bg-emerald-800 text-emerald-50 p-5 rounded-t-[2rem] rounded-b-lg mb-6 border-b-4 border-emerald-600/50 flex items-center justify-between relative',
    headerTitle: 'font-bold text-3xl font-serif',
    headerSub: 'text-emerald-200 font-serif',
    dayBadge: 'bg-[#fffdf5] text-emerald-800 font-bold text-2xl w-14 h-14 rounded-full flex items-center justify-center border-2 border-emerald-600 shadow-inner font-serif',
    taskContainer: 'mb-3 bg-white/80 border border-emerald-100 rounded-xl overflow-hidden backdrop-blur-sm',
    taskHeader: 'bg-emerald-50/50 p-2 border-b border-emerald-100 flex justify-between items-center',
    taskBody: 'p-2',
    subjectBadge: 'bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md text-[10px] font-bold font-serif',
    topicText: 'font-bold text-emerald-900 text-sm font-serif',
    checkboxWrapper: 'flex-1 border border-emerald-200 rounded-lg p-2 flex items-center gap-2 bg-[#fffdf5]',
    checkboxBox: 'w-5 h-5 border border-emerald-500 rounded bg-white transform rotate-45',
    footerBorder: 'border-t border-emerald-200 mt-auto pt-4',
    prayerBox: 'border border-emerald-200 rounded-xl bg-emerald-50/50',
    noteArea: 'border border-emerald-200 rounded-xl bg-[#fffdf5] min-h-[80px]',
  },
  professional: {
    id: 'professional',
    name: 'احترافي (Executive)',
    pageBorder: 'border-l-4 border-slate-300',
    bgPattern: 'pattern-lines',
    headerWrapper: 'bg-white border-b-2 border-slate-200 p-4 mb-6 flex items-center justify-between',
    headerTitle: 'font-bold text-3xl text-slate-800 uppercase tracking-tight',
    headerSub: 'text-slate-500 font-medium uppercase tracking-widest text-xs',
    dayBadge: 'bg-slate-800 text-white font-medium text-xl w-12 h-12 rounded flex items-center justify-center',
    taskContainer: 'mb-2 border-b border-slate-200 pb-2',
    taskHeader: 'flex justify-between items-center mb-1',
    taskBody: 'flex items-center gap-4',
    subjectBadge: 'bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[9px] font-bold uppercase',
    topicText: 'font-semibold text-slate-900 text-sm',
    checkboxWrapper: 'flex items-center gap-2',
    checkboxBox: 'w-4 h-4 border border-slate-400 rounded-sm',
    footerBorder: 'border-t border-slate-300 mt-auto pt-4',
    prayerBox: 'border border-slate-200 rounded',
    noteArea: 'border border-slate-200 bg-slate-50 min-h-[80px]',
  }
};

const PrintLayout: React.FC<PrintLayoutProps> = ({ plan, isOpen, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [chunks, setChunks] = useState<DayPlan[][]>([]);
  
  // Default Settings
  const [settings, setSettings] = useState<PrintSettings>({
    paperSize: 'A4',
    daysPerPage: 1, 
    taskStyle: 'dual', 
    theme: 'emergency',
    
    showDate: true,
    showDayName: true,
    showNotesArea: true,
    showPrayers: true, 
    showFasting: false,
    showScoreBox: true,
    
    spiralMargin: true,
    spiralPosition: 'right',
    marginSize: 15,
    extraLines: 2,
    
    fontSize: 'medium',
    fontStyle: 'cairo',
    density: 'comfortable'
  });

  // Recalculate chunks based on daysPerPage
  useEffect(() => {
    if (plan.length > 0) {
      const newChunks = [];
      const itemsPerPage = settings.daysPerPage || 1;
      for (let i = 0; i < plan.length; i += itemsPerPage) {
        newChunks.push(plan.slice(i, i + itemsPerPage));
      }
      setChunks(newChunks);
    }
  }, [plan, settings.daysPerPage]);

  const reactToPrintContent = useCallback(() => printRef.current, []);

  const handlePrintTrigger = useReactToPrint ? useReactToPrint({
    content: reactToPrintContent,
    documentTitle: 'PlanPro_Notebook',
    onBeforeGetContent: () => { setIsPrinting(true); return Promise.resolve(); },
    onAfterPrint: () => setIsPrinting(false),
    onPrintError: (e) => { console.error(e); setIsPrinting(false); },
    // @ts-ignore
    contentRef: printRef, 
  }) : null;

  const handlePrint = () => {
    if (!handlePrintTrigger || chunks.length === 0) return;
    setIsPrinting(true);
    setTimeout(() => {
      if (printRef.current) handlePrintTrigger();
      else setIsPrinting(false);
    }, 500);
  };

  if (!isOpen) return null;

  // Helpers
  const currentTheme = THEME_STYLES[settings.theme as keyof typeof THEME_STYLES] || THEME_STYLES.modern;
  const isEmergency = settings.theme === 'emergency';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-0 md:p-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="bg-dark-900 w-full h-full md:h-[95vh] md:rounded-3xl flex flex-col md:flex-row overflow-hidden shadow-2xl border border-white/10"
      >
        {/* --- SIDEBAR CONTROLS --- */}
        <div className="w-full md:w-80 bg-dark-950 p-6 flex flex-col gap-5 overflow-y-auto border-l border-white/5 no-print relative z-20 shadow-xl scrollbar-thin scrollbar-thumb-dark-700">
          <div className="flex justify-between items-center sticky top-0 bg-dark-950 pb-4 z-10 border-b border-white/5">
            <h2 className="text-xl font-black text-white font-sans flex items-center gap-2">
               <Settings2 className="text-accent-500" size={20} />
               مصنع الكراسة
            </h2>
            <button onClick={onClose} className="bg-dark-800 p-2 rounded-full text-gray-400 hover:text-white"><X size={18} /></button>
          </div>

          <div className="space-y-8 pb-24">
             {/* Theme Selection */}
             <Section title="1. الثيم (Style)">
               <div className="grid grid-cols-2 gap-2">
                 {Object.values(THEME_STYLES).map(t => (
                   <button 
                    key={t.id} 
                    onClick={() => setSettings(s => ({...s, theme: t.id as any}))} 
                    className={`p-3 rounded-xl text-xs font-bold border flex flex-col items-center gap-2 transition-all ${
                        settings.theme === t.id 
                        ? 'bg-white text-black border-white shadow-lg scale-105' 
                        : 'bg-dark-800 border-white/5 text-gray-400 hover:bg-dark-700'
                    }`}
                   >
                     <div className={`w-full h-8 rounded mb-1 ${
                        t.id === 'emergency' ? 'bg-yellow-400 border-2 border-black' :
                        t.id === 'modern' ? 'bg-gradient-to-r from-blue-500 to-indigo-500' :
                        t.id === 'islamic' ? 'bg-emerald-700 border-double border-4 border-emerald-500' :
                        'bg-slate-300 border-l-4 border-slate-500'
                     }`}></div>
                     {t.name}
                   </button>
                 ))}
               </div>
             </Section>

             {/* Layout Options */}
             <Section title="2. تخطيط الصفحة">
               <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => setSettings(s => ({...s, daysPerPage: 1}))} className={`p-3 rounded-xl border flex flex-col items-center gap-1 ${settings.daysPerPage === 1 ? 'bg-accent-600 border-accent-400 text-white' : 'bg-dark-800 border-white/5 text-gray-400'}`}>
                          <Maximize size={18} />
                          <span className="text-xs font-bold">يوم كامل</span>
                      </button>
                      <button onClick={() => setSettings(s => ({...s, daysPerPage: 2}))} className={`p-3 rounded-xl border flex flex-col items-center gap-1 ${settings.daysPerPage === 2 ? 'bg-accent-600 border-accent-400 text-white' : 'bg-dark-800 border-white/5 text-gray-400'}`}>
                          <Grid size={18} />
                          <span className="text-xs font-bold">يومين</span>
                      </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                     {(['A4', 'A5', 'Note'] as const).map(size => (
                        <button key={size} onClick={() => setSettings(s => ({ ...s, paperSize: size }))} className={`py-2 rounded-lg text-xs font-bold border ${settings.paperSize === size ? 'bg-white text-black' : 'bg-dark-800 border-white/5 text-gray-400'}`}>{size}</button>
                     ))}
                  </div>
               </div>
             </Section>

             {/* Task Style */}
             <Section title="3. شكل المهمة">
               <div className="space-y-2">
                   {/* Dual */}
                   <button onClick={() => setSettings(s => ({...s, taskStyle: 'dual'}))} className={`w-full p-2 px-3 rounded-xl border flex items-center justify-between transition-all ${settings.taskStyle === 'dual' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-dark-800 border-white/5 text-gray-400'}`}>
                       <div className="flex items-center gap-2">
                           <CheckSquare size={16} />
                           <span className="text-xs font-bold">مزدوج (شرح + حل)</span>
                       </div>
                   </button>
                   {/* Table */}
                   <button onClick={() => setSettings(s => ({...s, taskStyle: 'table'}))} className={`w-full p-2 px-3 rounded-xl border flex items-center justify-between transition-all ${settings.taskStyle === 'table' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-dark-800 border-white/5 text-gray-400'}`}>
                       <div className="flex items-center gap-2">
                           <TableIcon size={16} />
                           <span className="text-xs font-bold">جدول تقليدي</span>
                       </div>
                   </button>
                   {/* Simple */}
                   <button onClick={() => setSettings(s => ({...s, taskStyle: 'simple'}))} className={`w-full p-2 px-3 rounded-xl border flex items-center justify-between transition-all ${settings.taskStyle === 'simple' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-dark-800 border-white/5 text-gray-400'}`}>
                       <div className="flex items-center gap-2">
                           <List size={16} />
                           <span className="text-xs font-bold">قائمة بسيطة</span>
                       </div>
                   </button>
               </div>
             </Section>

             {/* Add-ons */}
             <Section title="4. إضافات الصفحة">
                <div className="space-y-2">
                    <Toggle label="خانة الملاحظات" checked={settings.showNotesArea} onChange={v => setSettings(s => ({...s, showNotesArea: v}))} />
                    <Toggle label="جدول الصلوات" checked={settings.showPrayers} onChange={v => setSettings(s => ({...s, showPrayers: v}))} />
                    <Toggle label="تقييم اليوم (Score)" checked={settings.showScoreBox} onChange={v => setSettings(s => ({...s, showScoreBox: v}))} />
                    <Toggle label="هامش السلك (Spiral)" checked={settings.spiralMargin} onChange={v => setSettings(s => ({...s, spiralMargin: v}))} />
                    
                    <div className="flex justify-between items-center pt-2 bg-dark-800 p-2 rounded-lg">
                       <span className="text-gray-400 text-xs font-bold">سطور إضافية</span>
                       <div className="flex items-center gap-2">
                          <button onClick={() => setSettings(s => ({...s, extraLines: Math.max(0, s.extraLines - 1)}))} className="p-1 hover:text-white"><Minus size={12}/></button>
                          <span className="text-white font-mono">{settings.extraLines}</span>
                          <button onClick={() => setSettings(s => ({...s, extraLines: s.extraLines + 1}))} className="p-1 hover:text-white"><Plus size={12}/></button>
                       </div>
                    </div>
                </div>
             </Section>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-dark-950 border-t border-white/5">
            <button onClick={handlePrint} disabled={isPrinting} className="w-full bg-gradient-to-r from-accent-600 to-blue-600 hover:from-accent-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all">
              {isPrinting ? <span className="animate-pulse">جاري التجهيز...</span> : <><Printer size={18} /><span>طباعة (PDF)</span></>}
            </button>
          </div>
        </div>

        {/* --- PREVIEW AREA --- */}
        <div className="flex-1 bg-gray-200/50 p-4 md:p-8 overflow-y-auto flex justify-center items-start scrollbar-thin scrollbar-thumb-gray-400 relative">
           {/* Visual Guide for Spiral */}
           {settings.spiralMargin && (
              <div className="absolute top-4 right-4 bg-black/70 text-white text-[10px] px-2 py-1 rounded backdrop-blur-sm z-50 pointer-events-none">
                 معاينة هامش السلك
              </div>
           )}
           
           <div className="transform scale-[0.6] md:scale-75 lg:scale-90 origin-top shadow-2xl transition-all duration-300 bg-white">
               <PrintContent chunks={chunks} settings={settings} isPreview={true} totalChunkPages={chunks.length} />
           </div>
        </div>
      </motion.div>

      {/* --- HIDDEN PRINT CONTAINER --- */}
      <div style={{ position: 'fixed', top: 0, left: 0, width: '0px', height: '0px', overflow: 'hidden' }}>
        <div ref={printRef} className="print-content-wrapper">
          <PrintContent chunks={chunks} settings={settings} isPreview={false} totalChunkPages={chunks.length} />
        </div>
      </div>
    </div>
  );
};

// --- SOPHISTICATED PRINT RENDERER ---
const PrintContent = ({ chunks, settings, isPreview, totalChunkPages }: { chunks: DayPlan[][], settings: PrintSettings, isPreview: boolean, totalChunkPages: number }) => {
    
    // --- MEASUREMENTS (Millimeters) ---
    const getPadding = () => {
        const base = '10mm';
        const spiral = '22mm'; // Extra space for binding
        let pt = base, pr = base, pb = '12mm', pl = base;
        
        if (settings.spiralMargin) {
            if (settings.spiralPosition === 'top') pt = spiral;
            if (settings.spiralPosition === 'right') pr = spiral;
            if (settings.spiralPosition === 'left') pl = spiral;
        }
        return { paddingTop: pt, paddingRight: pr, paddingBottom: pb, paddingLeft: pl };
    };

    const getFontClass = () => {
        if (settings.fontStyle === 'amiri') return 'font-serif';
        if (settings.fontStyle === 'tajawal') return 'font-sans-tajawal';
        return 'font-sans'; 
    };

    // Get Active Theme Styles
    const theme = THEME_STYLES[settings.theme as keyof typeof THEME_STYLES] || THEME_STYLES.modern;
    const isDual = settings.taskStyle === 'dual';
    const isTable = settings.taskStyle === 'table';

    return (
        <div className={`box-border ${getFontClass()} bg-white text-black`} dir="rtl">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@300;400;500;600;700;800;900&family=Tajawal:wght@400;500;700;800&family=Chakra+Petch:wght@400;700&display=swap');
                
                .font-serif { font-family: 'Amiri', serif; }
                .font-sans { font-family: 'Cairo', sans-serif; }
                .font-sans-tajawal { font-family: 'Tajawal', sans-serif; }
                .font-mono { font-family: 'Chakra Petch', 'Cairo', monospace; } /* Industrial look for emergency */

                /* PATTERNS */
                .pattern-hazard { 
                    background-image: repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 0, transparent 50%);
                    background-size: 10px 10px;
                    opacity: 0.03;
                }
                .pattern-dots { 
                    background-image: radial-gradient(#cbd5e1 1.5px, transparent 1.5px); 
                    background-size: 24px 24px; 
                    opacity: 0.4; 
                }
                .pattern-lines { 
                    background-image: linear-gradient(0deg, transparent 24px, #e2e8f0 25px);
                    background-size: 100% 25px;
                    opacity: 0.6;
                }
                .pattern-arabesque {
                    background-color: #fffdf5;
                    background-image: url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2310b981' fill-opacity='0.03'%3E%3Cpath d='M50 50c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10zM10 10c0-5.523 4.477-10 10-10s10 4.477 10 10-4.477 10-10 10c0 5.523-4.477 10-10 10S0 25.523 0 20s4.477-10 10-10zm10 8c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8zm40 40c4.418 0 8-3.582 8-8s-3.582-8-8-8-8 3.582-8 8 3.582 8 8 8z' /%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                }

                @media print {
                   @page { margin: 0; size: ${settings.paperSize}; }
                   body { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                   .print-content-wrapper { display: block !important; }
                }
            `}</style>

            {chunks.map((pageDays, pageIdx) => (
                <div key={pageIdx} 
                  className={`relative mx-auto overflow-hidden flex flex-col justify-between
                    ${settings.paperSize === 'A4' ? 'w-[210mm] h-[297mm]' : ''}
                    ${settings.paperSize === 'A5' ? 'w-[148mm] h-[210mm]' : ''}
                    ${settings.paperSize === 'Note' ? 'w-[105mm] h-[148mm]' : ''}
                  `}
                  style={{ ...getPadding(), pageBreakAfter: 'always' }}
                >
                  {/* --- BACKGROUND LAYER --- */}
                  <div className={`absolute inset-0 pointer-events-none z-0 ${theme.bgPattern}`}></div>

                  {/* --- SPIRAL GUIDE (Preview) --- */}
                  {isPreview && settings.spiralMargin && (
                     <div className={`absolute border-dashed pointer-events-none z-50 flex items-center justify-center opacity-30
                        ${settings.spiralPosition === 'right' ? 'right-0 top-0 bottom-0 w-[20mm] border-l bg-gray-200' : ''}
                        ${settings.spiralPosition === 'left' ? 'left-0 top-0 bottom-0 w-[20mm] border-r bg-gray-200' : ''}
                        ${settings.spiralPosition === 'top' ? 'top-0 left-0 right-0 h-[20mm] border-b bg-gray-200' : ''}
                     `}><span className="-rotate-90 text-[8px] font-mono tracking-widest text-black">SPIRAL BINDING ZONE</span></div>
                  )}

                  {/* --- EMERGENCY STRIPES (Top/Bottom) --- */}
                  {settings.theme === 'emergency' && (
                     <>
                        <div className="absolute top-0 left-0 right-0 h-3 bg-[repeating-linear-gradient(45deg,#FACC15,#FACC15_10px,#000_10px,#000_20px)] z-20"></div>
                        <div className="absolute bottom-0 left-0 right-0 h-3 bg-[repeating-linear-gradient(45deg,#FACC15,#FACC15_10px,#000_10px,#000_20px)] z-20"></div>
                     </>
                  )}

                  {/* --- MAIN LAYOUT GRID --- */}
                  <div className={`flex-1 grid gap-8 relative z-10 ${settings.daysPerPage === 1 ? 'grid-rows-1' : 'grid-rows-2'}`}>
                    {pageDays.map((day, dIdx) => (
                      <div key={dIdx} className={`flex flex-col h-full overflow-hidden p-0 ${theme.pageBorder}`}>
                        
                        {/* HEADER SECTION */}
                        <div className={theme.headerWrapper}>
                           <div className="flex items-center gap-4 relative z-10">
                              <div className={theme.dayBadge}>
                                 {day.dayIndex + 1}
                              </div>
                              <div className="flex flex-col">
                                 {settings.showDayName && <h2 className={theme.headerTitle}>{getDayName(day.date || '')}</h2>}
                                 {settings.showDate && <p className={theme.headerSub}>{new Date(day.date || '').toLocaleDateString('ar-EG')}</p>}
                              </div>
                           </div>
                           
                           <div className="flex gap-3 relative z-10">
                              {settings.showScoreBox && (
                                <div className={`flex flex-col items-center px-2 py-1 min-w-[60px] ${theme.prayerBox}`}>
                                   <span className="text-[9px] font-bold opacity-70 uppercase">Score</span>
                                   <div className="h-4 w-full"></div>
                                </div>
                              )}
                              {settings.showFasting && (
                                <div className={`flex items-center gap-2 px-3 py-1 ${theme.prayerBox}`}>
                                   <span className="text-[10px] font-bold">صيام</span>
                                   <div className={`w-4 h-4 border rounded-sm ${settings.theme === 'emergency' ? 'border-black' : 'border-gray-400'}`}></div>
                                </div>
                              )}
                           </div>
                           
                           {/* Decorative Elements for Header */}
                           {settings.theme === 'islamic' && <div className="absolute -right-10 -bottom-10 opacity-10 text-9xl">🕌</div>}
                           {settings.theme === 'modern' && <div className="absolute right-0 top-0 bottom-0 w-32 bg-white/10 skew-x-12"></div>}
                        </div>

                        {/* TASKS SECTION */}
                        <div className="flex-1 flex flex-col gap-1 px-1">
                           
                           {/* 1. TABLE STYLE */}
                           {isTable && (
                              <div className={theme.taskContainer}>
                                <table className="w-full text-xs text-black">
                                    <thead className={settings.theme === 'emergency' ? 'bg-yellow-400 text-black border-b-2 border-black' : 'bg-gray-100 text-black'}>
                                        <tr>
                                        <th className="p-2 text-right w-1/4">المادة</th>
                                        <th className="p-2 text-right">المهمة / الدرس</th>
                                        <th className="p-2 text-center w-16">إنجاز</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {day.tasks.map(t => (
                                        <tr key={t.id} className="border-b border-gray-100">
                                            <td className="p-2 font-bold border-l border-gray-100">{t.subject}</td>
                                            <td className="p-2 border-l border-gray-100">{t.topic}</td>
                                            <td className="p-2 text-center"><div className={`w-5 h-5 mx-auto ${theme.checkboxBox}`}></div></td>
                                        </tr>
                                        ))}
                                    </tbody>
                                </table>
                              </div>
                           )}

                           {/* 2. DUAL STYLE (THE REQUESTED LEGENDARY LOOK) */}
                           {isDual && (
                              <div className="flex flex-col h-full gap-2">
                                 {day.tasks.map(t => (
                                    <div key={t.id} className={theme.taskContainer}>
                                       {/* Header Strip */}
                                       <div className={theme.taskHeader}>
                                          <span className={theme.subjectBadge}>{t.subject}</span>
                                          {settings.theme === 'emergency' && <span className="text-[8px] opacity-60 font-mono tracking-widest">TSK-{t.id.slice(-4)}</span>}
                                       </div>
                                       
                                       <div className={theme.taskBody}>
                                            <div className="mb-3 pl-2">
                                                <span className={theme.topicText}>{t.topic}</span>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-2">
                                                <div className={theme.checkboxWrapper}>
                                                    <div className={theme.checkboxBox}></div>
                                                    <div className="flex flex-col leading-none">
                                                        <span className="text-[10px] font-bold">مذاكرة الدرس</span>
                                                        <span className="text-[8px] opacity-60">Study</span>
                                                    </div>
                                                    <BookOpen size={14} className="mr-auto opacity-30" />
                                                </div>
                                                <div className={theme.checkboxWrapper}>
                                                    <div className={theme.checkboxBox}></div>
                                                    <div className="flex flex-col leading-none">
                                                        <span className="text-[10px] font-bold">حل الأسئلة</span>
                                                        <span className="text-[8px] opacity-60">Practice</span>
                                                    </div>
                                                    <PenTool size={14} className="mr-auto opacity-30" />
                                                </div>
                                            </div>
                                            
                                            {/* Line for notes in single page view */}
                                            {settings.daysPerPage === 1 && (
                                                <div className="mt-2 pt-1 border-t border-dashed border-gray-300">
                                                    <div className="h-4"></div> 
                                                </div>
                                            )}
                                       </div>
                                    </div>
                                 ))}
                                 
                                 {/* Filler Lines */}
                                 {Array.from({length: settings.extraLines}).map((_, i) => (
                                    <div key={i} className={`flex-1 min-h-[40px] border-2 border-dashed rounded-lg opacity-40 flex items-center justify-center mb-2 ${settings.theme === 'emergency' ? 'border-gray-400' : 'border-gray-200'}`}>
                                       <span className="text-[10px] text-gray-400 font-bold">مساحة إضافية / Extra Space</span>
                                    </div>
                                 ))}
                              </div>
                           )}

                           {/* 3. SIMPLE STYLE */}
                           {settings.taskStyle === 'simple' && (
                              <div className="space-y-2">
                                 {day.tasks.map(t => (
                                    <div key={t.id} className={`${theme.taskContainer} p-2 flex items-center justify-between`}>
                                       <div>
                                          <span className={`${theme.subjectBadge} ml-2`}>{t.subject}</span>
                                          <span className={theme.topicText}>{t.topic}</span>
                                       </div>
                                       <div className={theme.checkboxBox}></div>
                                    </div>
                                 ))}
                                 {Array.from({length: settings.extraLines}).map((_, i) => (
                                    <div key={i} className="border-b border-gray-300 h-8"></div>
                                 ))}
                              </div>
                           )}

                        </div>

                        {/* FOOTER SECTION */}
                        <div className={`px-1 ${theme.footerBorder}`}>
                           <div className="flex gap-4 items-stretch h-full">
                               {/* Prayers */}
                               {settings.showPrayers && (
                                  <div className={`flex flex-col w-1/3 ${theme.prayerBox}`}>
                                     <div className={`text-center py-1 text-[10px] font-bold border-b ${settings.theme === 'emergency' ? 'bg-black text-white border-black' : 'bg-gray-100 border-gray-200'}`}>
                                         الصـلـوات
                                     </div>
                                     <div className="flex-1 flex flex-col justify-between p-2">
                                         {['فجر','ظهر','عصر','مغرب','عشاء'].map(p => (
                                             <div key={p} className="flex justify-between items-center border-b last:border-0 border-gray-100 pb-1 mb-1 last:mb-0 last:pb-0">
                                                 <span className="text-[9px] font-bold">{p}</span>
                                                 <div className={`w-3 h-3 border rounded-sm ${settings.theme === 'emergency' ? 'border-black' : 'border-gray-400'}`}></div>
                                             </div>
                                         ))}
                                     </div>
                                  </div>
                               )}
                               
                               {/* Notes */}
                               {settings.showNotesArea && (
                                  <div className={`flex-1 p-2 relative ${theme.noteArea}`}>
                                     <div className="absolute top-0 right-0 bg-gray-200 text-gray-600 text-[9px] px-2 rounded-bl-lg font-bold">ملاحظات / NOTES</div>
                                     <div className="h-full w-full flex flex-col justify-end gap-4 px-2 pb-2">
                                         <div className="border-b border-gray-300/50"></div>
                                         <div className="border-b border-gray-300/50"></div>
                                         <div className="border-b border-gray-300/50"></div>
                                     </div>
                                  </div>
                               )}
                           </div>
                        </div>

                      </div>
                    ))}
                  </div>

                  {/* --- PAGE META --- */}
                  <div className="flex justify-between px-8 py-2 opacity-50 text-[8px] font-mono mt-2 z-20">
                     <span>GENERATED BY PLAN PRO</span>
                     <span>PAGE {pageIdx + 1} OF {totalChunkPages}</span>
                     <span>{new Date().toLocaleDateString('en-GB')}</span>
                  </div>
                </div>
            ))}
        </div>
    );
};

const Section = ({ title, children }: { title: string, children?: React.ReactNode }) => (
  <div className="border-b border-white/5 pb-5 last:border-0 last:pb-0">
    <h3 className="text-gray-500 text-xs font-bold mb-3 uppercase tracking-wider font-sans">{title}</h3>
    {children}
  </div>
);

const Toggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) => (
  <label className="flex items-center justify-between cursor-pointer group select-none hover:bg-white/5 p-2 rounded-lg transition-colors">
    <span className="text-xs font-bold text-gray-300">{label}</span>
    <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${checked ? 'bg-accent-600' : 'bg-dark-700'}`} onClick={(e) => { e.preventDefault(); onChange(!checked); }}>
      <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform ${checked ? 'translate-x-4' : 'translate-x-0'}`}></div>
    </div>
  </label>
);

export default PrintLayout;
