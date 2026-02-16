import React, { useRef, useState, useEffect, useCallback } from 'react';
import * as ReactToPrintPkg from 'react-to-print';
import { DayPlan, PrintSettings } from '../types';
import { getDayName } from '../utils';
import { Printer, X, Settings2, Moon, Sun, Plus, Minus, LayoutList, CheckSquare, BookOpen, AlignJustify, Grid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Robust import for useReactToPrint to handle ESM/CJS differences
const useReactToPrint = ReactToPrintPkg.useReactToPrint || (ReactToPrintPkg as any).default?.useReactToPrint;

interface PrintLayoutProps {
  plan: DayPlan[];
  isOpen: boolean;
  onClose: () => void;
}

const PrintLayout: React.FC<PrintLayoutProps> = ({ plan, isOpen, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [chunks, setChunks] = useState<DayPlan[][]>([]);
  
  const [settings, setSettings] = useState<PrintSettings>({
    paperSize: 'A4',
    layout: 'grid-2',
    daysPerPage: 2,
    showDate: true,
    showDayName: true,
    showNotesArea: true,
    spiralMargin: true,
    spiralPosition: 'right',
    marginSize: 15,
    showPrayers: false, 
    showFasting: false,
    extraLines: 2,
    taskLayout: 'simple',
    showDayCompletion: true,
    theme: 'modern',
    fontSize: 'medium',
    fontStyle: 'cairo',
    density: 'comfortable'
  });

  const [isRamadanMode, setIsRamadanMode] = useState(false);

  // Recalculate chunks whenever plan or settings change
  useEffect(() => {
    if (plan.length > 0) {
      const newChunks = [];
      const itemsPerPage = settings.daysPerPage || 2;
      for (let i = 0; i < plan.length; i += itemsPerPage) {
        newChunks.push(plan.slice(i, i + itemsPerPage));
      }
      setChunks(newChunks);
    }
  }, [plan, settings.daysPerPage]);

  // Content getter callback for react-to-print
  const reactToPrintContent = useCallback(() => {
    return printRef.current;
  }, []);

  // Initialize the hook with strict configuration
  const handlePrintTrigger = useReactToPrint ? useReactToPrint({
    content: reactToPrintContent,
    documentTitle: 'PlanPro_Notebook',
    onBeforeGetContent: () => {
        setIsPrinting(true);
        return Promise.resolve();
    },
    onAfterPrint: () => setIsPrinting(false),
    onPrintError: (errorLocation: any, error: any) => {
      console.error(errorLocation, error);
      setIsPrinting(false);
    },
    // Adding contentRef specifically helps with newer versions/esm builds
    // @ts-ignore - Ignoring type check as contentRef might not be in all type definitions but is supported
    contentRef: printRef, 
  }) : null;

  // --- دالة الطباعة المعدلة ---
  const handlePrint = () => {
    if (!handlePrintTrigger) {
      alert('نظام الطباعة غير جاهز. يرجى تحديث الصفحة.');
      return;
    }

    if (chunks.length === 0) {
        alert('لا توجد بيانات للطباعة.');
        return;
    }

    setIsPrinting(true);

    // ننتظر قليلاً لضمان تحديث الـ State ورسم المحتوى
    setTimeout(() => {
      if (printRef.current) {
        // تم التعديل: استدعاء الدالة مباشرة بدون معاملات
        handlePrintTrigger(); 
      } else {
        setIsPrinting(false);
        console.error("Print ref is null");
        alert("خطأ: تعذر الوصول لمحتوى الطباعة.");
      }
    }, 500);
  };

  if (!isOpen) return null;

  const themes = [
    { id: 'modern', name: 'عصري', color: 'bg-blue-600' },
    { id: 'professional', name: 'احترافي', color: 'bg-slate-700' },
    { id: 'islamic', name: 'إسلامي', color: 'bg-emerald-600' },
    { id: 'minimal', name: 'مينيمال', color: 'bg-gray-400' },
    { id: 'creative', name: 'إبداعي', color: 'bg-purple-600' },
    { id: 'geometric', name: 'هندسي', color: 'bg-indigo-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-0 md:p-4 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="bg-dark-900 w-full h-full md:h-[95vh] md:rounded-3xl flex flex-col md:flex-row overflow-hidden shadow-2xl border border-white/10"
      >
        {/* Sidebar Controls */}
        <div className="w-full md:w-80 bg-dark-950 p-6 flex flex-col gap-5 overflow-y-auto border-l border-white/5 no-print relative z-20 shadow-xl scrollbar-thin scrollbar-thumb-dark-700">
          <div className="flex justify-between items-center sticky top-0 bg-dark-950 pb-4 z-10 border-b border-white/5">
            <div>
               <h2 className="text-xl font-black text-white font-sans flex items-center gap-2">
                 <Settings2 className="text-accent-500" size={20} />
                 مصنع الكراسة
               </h2>
            </div>
            <button onClick={onClose} className="bg-dark-800 p-2 rounded-full text-gray-400 hover:text-white transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="space-y-6 pb-24">
             {/* Theme Selection */}
             <Section title="1. الثيم (Theme)">
               <div className="grid grid-cols-2 gap-2">
                 {themes.map(t => (
                   <button
                     key={t.id}
                     onClick={() => setSettings(s => ({...s, theme: t.id as any}))}
                     className={`p-2 rounded-lg text-xs font-bold border transition-all flex items-center gap-2 ${
                       settings.theme === t.id 
                       ? `border-white/50 text-white ${t.color}` 
                       : 'bg-dark-800 border-white/5 text-gray-400 hover:bg-dark-700'
                     }`}
                   >
                     <div className={`w-3 h-3 rounded-full ${t.id === settings.theme ? 'bg-white' : t.color}`}></div>
                     {t.name}
                   </button>
                 ))}
               </div>
             </Section>

            {/* Typography */}
            <Section title="2. الخطوط والنصوص">
               <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                     {(['small', 'medium', 'large'] as const).map(size => (
                        <button 
                           key={size}
                           onClick={() => setSettings(s => ({...s, fontSize: size}))}
                           className={`p-2 rounded-lg text-xs font-bold border ${settings.fontSize === size ? 'bg-accent-600 border-accent-400 text-white' : 'bg-dark-800 border-white/5 text-gray-400'}`}
                        >
                           {size === 'small' ? 'صغير' : size === 'medium' ? 'متوسط' : 'كبير'}
                        </button>
                     ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                     {(['cairo', 'amiri', 'tajawal'] as const).map(font => (
                        <button 
                           key={font}
                           onClick={() => setSettings(s => ({...s, fontStyle: font}))}
                           className={`p-2 rounded-lg text-xs font-bold border ${settings.fontStyle === font ? 'bg-accent-600 border-accent-400 text-white' : 'bg-dark-800 border-white/5 text-gray-400'}`}
                        >
                           {font === 'cairo' ? 'عصري' : font === 'amiri' ? 'نسخ' : 'تجوال'}
                        </button>
                     ))}
                  </div>
               </div>
            </Section>

            {/* Paper Config */}
            <Section title="3. إعدادات الورقة">
              <div className="space-y-3">
                 <div className="grid grid-cols-3 gap-2">
                  {(['A4', 'A5', 'Note'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => setSettings(s => ({ ...s, paperSize: size }))}
                      className={`px-2 py-2 rounded-lg text-xs font-bold transition-all border ${
                        settings.paperSize === size 
                        ? 'bg-white text-black shadow-lg' 
                        : 'bg-dark-800 border-white/5 text-gray-400 hover:bg-dark-700'
                      }`}
                    >
                      {size === 'Note' ? 'نوتة' : size}
                    </button>
                  ))}
                 </div>
                 
                 {/* Density */}
                 <div className="flex items-center justify-between bg-dark-800 p-2 rounded-lg">
                    <span className="text-xs text-gray-400 font-bold ml-2">تباعد العناصر:</span>
                    <div className="flex gap-1">
                       <button onClick={() => setSettings(s => ({...s, density: 'compact'}))} title="مضغوط" className={`p-1 rounded ${settings.density === 'compact' ? 'bg-white text-black' : 'text-gray-500'}`}><AlignJustify size={14}/></button>
                       <button onClick={() => setSettings(s => ({...s, density: 'comfortable'}))} title="مريح" className={`p-1 rounded ${settings.density === 'comfortable' ? 'bg-white text-black' : 'text-gray-500'}`}><Grid size={14}/></button>
                       <button onClick={() => setSettings(s => ({...s, density: 'spacious'}))} title="واسع" className={`p-1 rounded ${settings.density === 'spacious' ? 'bg-white text-black' : 'text-gray-500'}`}><LayoutList size={14}/></button>
                    </div>
                 </div>
              </div>
            </Section>

            {/* Binding/Holes */}
            <Section title="4. هامش السلك (Spiral)">
              <div className="space-y-3">
                 <Toggle 
                    label="تفعيل الهامش" 
                    checked={settings.spiralMargin} 
                    onChange={v => setSettings(s => ({...s, spiralMargin: v}))} 
                 />
                 
                 {settings.spiralMargin && (
                    <div className="grid grid-cols-3 gap-2">
                       <button 
                         onClick={() => setSettings(s => ({...s, spiralPosition: 'right'}))}
                         className={`p-2 rounded-lg text-xs font-bold border transition-all ${settings.spiralPosition === 'right' ? 'bg-dark-700 border-white/20 text-white' : 'bg-dark-800 border-transparent text-gray-500'}`}
                       >
                         يمين
                       </button>
                       <button 
                         onClick={() => setSettings(s => ({...s, spiralPosition: 'top'}))}
                         className={`p-2 rounded-lg text-xs font-bold border transition-all ${settings.spiralPosition === 'top' ? 'bg-dark-700 border-white/20 text-white' : 'bg-dark-800 border-transparent text-gray-500'}`}
                       >
                         أعلى
                       </button>
                       <button 
                         onClick={() => setSettings(s => ({...s, spiralPosition: 'left'}))}
                         className={`p-2 rounded-lg text-xs font-bold border transition-all ${settings.spiralPosition === 'left' ? 'bg-dark-700 border-white/20 text-white' : 'bg-dark-800 border-transparent text-gray-500'}`}
                       >
                         يسار
                       </button>
                    </div>
                 )}
              </div>
            </Section>

            {/* Islamic Features */}
            <Section title="5. إضافات شهر رمضان">
              <div className="space-y-3">
                <Toggle 
                   label="تفعيل وضع رمضان" 
                   checked={isRamadanMode}
                   onChange={setIsRamadanMode}
                   icon={<Moon size={14} className="text-yellow-400" />}
                />
                
                <AnimatePresence>
                  {isRamadanMode && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="space-y-2 pl-4 border-r-2 border-white/10 pr-2 overflow-hidden"
                    >
                      <Toggle 
                        label="جدول الصلوات" 
                        checked={settings.showPrayers} 
                        onChange={(v) => setSettings(s => ({...s, showPrayers: v}))} 
                        icon={<Sun size={14} />}
                      />
                      <Toggle 
                        label="متابعة الصيام" 
                        checked={settings.showFasting} 
                        onChange={(v) => setSettings(s => ({...s, showFasting: v}))} 
                        icon={<BookOpen size={14} />}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </Section>
            
            {/* Other Options */}
             <Section title="6. تخصيص المحتوى">
               <div className="space-y-3">
                  <div className="space-y-2">
                   <div className="flex justify-between items-center text-gray-400 text-xs font-bold">
                      <span>أيام في الصفحة</span>
                      <span className="text-accent-400 bg-accent-500/10 px-2 rounded">{settings.daysPerPage}</span>
                   </div>
                   <input 
                      type="range" 
                      min="1" max="4" 
                      value={settings.daysPerPage}
                      onChange={(e) => setSettings(s => ({...s, daysPerPage: parseInt(e.target.value)}))}
                      className="w-full h-2 bg-dark-800 rounded-lg appearance-none cursor-pointer accent-accent-500"
                   />
                  </div>

                  <Toggle label="التاريخ الميلادي" checked={settings.showDate} onChange={v => setSettings(s => ({...s, showDate: v}))} />
                  <Toggle label="اسم اليوم" checked={settings.showDayName} onChange={v => setSettings(s => ({...s, showDayName: v}))} />
                  <Toggle label="خانة الملاحظات" checked={settings.showNotesArea} onChange={v => setSettings(s => ({...s, showNotesArea: v}))} />
                  <Toggle 
                    label="مربع (تم الإنجاز)" 
                    checked={settings.showDayCompletion} 
                    onChange={v => setSettings(s => ({...s, showDayCompletion: v}))} 
                    icon={<CheckSquare size={14} />}
                  />
                  <div className="flex justify-between items-center pt-2">
                      <span className="text-gray-400 text-xs font-bold">سطور فارغة</span>
                      <div className="flex items-center gap-2 bg-dark-800 rounded-lg p-1">
                          <button onClick={() => setSettings(s => ({...s, extraLines: Math.max(0, s.extraLines - 1)}))} className="p-1 hover:text-white"><Minus size={12}/></button>
                          <span className="text-white w-4 text-center text-xs">{settings.extraLines}</span>
                          <button onClick={() => setSettings(s => ({...s, extraLines: s.extraLines + 1}))} className="p-1 hover:text-white"><Plus size={12}/></button>
                       </div>
                  </div>
               </div>
            </Section>

          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-dark-950 border-t border-white/5">
            <button
              onClick={() => handlePrint()}
              disabled={isPrinting}
              className="w-full bg-gradient-to-r from-accent-600 to-blue-600 hover:from-accent-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-accent-600/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {isPrinting ? (
                <span className="animate-pulse">جاري التجهيز...</span>
              ) : (
                <>
                  <Printer size={18} />
                  <span>طباعة (PDF)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-gray-200/50 p-4 md:p-8 overflow-y-auto flex justify-center items-start scrollbar-thin scrollbar-thumb-gray-400">
           {/* This is a scaled preview of what will be printed */}
           <div className="transform scale-[0.6] md:scale-75 lg:scale-90 origin-top shadow-2xl transition-all duration-300">
               <PrintContent 
                 chunks={chunks} 
                 settings={settings} 
                 isPreview={true} 
                 totalChunkPages={chunks.length}
               />
           </div>
        </div>
      </motion.div>

      {/* HIDDEN PRINT CONTAINER - معدل */}
      <div style={{ display: 'none' }}>
        <div ref={printRef} className="print-content-wrapper">
          <PrintContent 
              chunks={chunks} 
              settings={settings} 
              isPreview={false}
              totalChunkPages={chunks.length}
          />
        </div>
      </div>
    </div>
  );
};

// --- SOPHISTICATED PRINT COMPONENT ---
const PrintContent = ({ chunks, settings, isPreview, totalChunkPages }: { chunks: DayPlan[][], settings: PrintSettings, isPreview: boolean, totalChunkPages: number }) => {
    
    // --- LAYOUT CALCULATIONS ---
    const getPadding = () => {
        const base = '10mm';
        const spiral = '18mm'; // Increased for better clearance
        
        let pt = base, pr = base, pb = '15mm', pl = base; // Bottom padding for footer
        
        if (settings.spiralMargin) {
            if (settings.spiralPosition === 'top') pt = spiral;
            if (settings.spiralPosition === 'right') pr = spiral;
            if (settings.spiralPosition === 'left') pl = spiral;
        }
        return { paddingTop: pt, paddingRight: pr, paddingBottom: pb, paddingLeft: pl };
    };

    const paddingStyle = getPadding();
    const prayers = ['فجر', 'ظهر', 'عصر', 'مغرب', 'عشاء'];

    // --- FONT SETTINGS ---
    const getFontClass = () => {
        if (settings.fontStyle === 'amiri') return 'font-serif';
        if (settings.fontStyle === 'tajawal') return 'font-sans-tajawal';
        return 'font-sans'; // Cairo (default)
    };
    
    const getFontSize = () => {
        if (settings.fontSize === 'small') return 'text-[10px]';
        if (settings.fontSize === 'large') return 'text-[14px]';
        return 'text-[12px]';
    };

    const getDensityGap = () => {
        if (settings.density === 'compact') return 'gap-2';
        if (settings.density === 'spacious') return 'gap-6';
        return 'gap-4';
    };

    return (
        <div className={`bg-white text-black box-border ${getFontClass()}`} dir="rtl">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=Cairo:wght@300;400;600;700;900&family=Tajawal:wght@400;500;700;800&display=swap');
                
                .font-serif { font-family: 'Amiri', serif; }
                .font-sans { font-family: 'Cairo', sans-serif; }
                .font-sans-tajawal { font-family: 'Tajawal', sans-serif; }
                
                @media print {
                   @page { margin: 0; size: ${settings.paperSize}; }
                   body { background: white !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                   .print-content-wrapper { display: block !important; }
                }
            `}</style>

            {chunks.map((pageDays, pageIdx) => (
                <div 
                  key={pageIdx}
                  className={`bg-white text-black relative mx-auto overflow-hidden
                    ${settings.paperSize === 'A4' ? 'w-[210mm] h-[297mm]' : ''}
                    ${settings.paperSize === 'A5' ? 'w-[148mm] h-[210mm]' : ''}
                    ${settings.paperSize === 'Note' ? 'w-[105mm] h-[148mm]' : ''}
                  `}
                  style={{
                    ...paddingStyle,
                    pageBreakAfter: 'always'
                  }}
                >
                  {/* --- THEME BACKGROUNDS --- */}
                  {settings.theme === 'islamic' && (
                      <>
                         <div className="absolute top-0 left-0 right-0 h-24 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 pointer-events-none"></div>
                         <div className="absolute bottom-0 left-0 right-0 h-24 bg-[url('https://www.transparenttextures.com/patterns/arabesque.png')] opacity-10 pointer-events-none transform rotate-180"></div>
                      </>
                  )}
                  {settings.theme === 'geometric' && (
                    <>
                       <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-50 rounded-bl-[100%] z-0"></div>
                       <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-50 rounded-tr-[100%] z-0"></div>
                    </>
                  )}
                  {settings.theme === 'creative' && (
                     <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#8b5cf6_1px,transparent_1px)] [background-size:16px_16px]"></div>
                  )}
                  {settings.theme === 'professional' && (
                     <div className="absolute top-4 left-4 right-4 h-1 bg-slate-800 z-0"></div>
                  )}

                  {/* --- SPIRAL GUIDE (Preview Only) --- */}
                  {isPreview && settings.spiralMargin && (
                     <div 
                        className={`absolute bg-blue-500/10 border-blue-300 border-dashed pointer-events-none z-50 flex items-center justify-center
                        ${settings.spiralPosition === 'right' ? 'right-0 top-0 bottom-0 w-[15mm] border-l' : ''}
                        ${settings.spiralPosition === 'left' ? 'left-0 top-0 bottom-0 w-[15mm] border-r' : ''}
                        ${settings.spiralPosition === 'top' ? 'top-0 left-0 right-0 h-[15mm] border-b' : ''}
                        `}
                    >
                        <span className="text-[10px] text-blue-500 font-bold -rotate-90 whitespace-nowrap">منطقة السلك (لا تكتب هنا)</span>
                    </div>
                  )}

                  {/* --- MAIN GRID --- */}
                  <div className={`h-full w-full grid content-start relative z-10 ${getDensityGap()} ${
                    settings.daysPerPage === 1 ? 'grid-rows-1' :
                    settings.daysPerPage === 2 ? 'grid-rows-2' :
                    settings.daysPerPage === 3 ? 'grid-rows-3' :
                    'grid-cols-2 grid-rows-2'
                  }`}>
                    {pageDays.map((day, dIdx) => (
                      <div key={dIdx} className={`
                          flex flex-col h-full relative overflow-hidden
                          ${settings.density === 'compact' ? 'p-2' : 'p-4'}
                          ${settings.theme === 'modern' ? 'border-2 border-gray-800 rounded-3xl' : ''}
                          ${settings.theme === 'professional' ? 'border border-slate-400 bg-slate-50' : ''}
                          ${settings.theme === 'minimal' ? 'border-b-2 border-black last:border-b-0 rounded-none' : ''}
                          ${settings.theme === 'islamic' ? 'border-2 border-emerald-700 rounded-t-[2rem] rounded-b-lg border-double' : ''}
                          ${settings.theme === 'geometric' ? 'border-2 border-indigo-200 rounded-xl bg-white/80 shadow-sm' : ''}
                          ${settings.theme === 'creative' ? 'border-2 border-dashed border-purple-300 rounded-2xl' : ''}
                      `}>
                        
                        {/* --- HEADER --- */}
                        <div className={`flex justify-between items-start mb-2 pb-2
                          ${settings.theme === 'minimal' ? 'border-b border-black' : 
                            settings.theme === 'professional' ? 'border-b-2 border-slate-800 bg-slate-200 -mx-4 -mt-4 p-4 mb-4' :
                            'border-b border-gray-100'}
                        `}>
                          <div className="flex items-center gap-3">
                             <div className={`
                                w-10 h-10 flex items-center justify-center text-xl font-black shadow-sm shrink-0
                                ${settings.theme === 'modern' ? 'bg-gray-900 text-white rounded-xl' : ''}
                                ${settings.theme === 'professional' ? 'bg-slate-800 text-white rounded-none' : ''}
                                ${settings.theme === 'minimal' ? 'bg-transparent text-black border-2 border-black rounded-full' : ''}
                                ${settings.theme === 'islamic' ? 'bg-emerald-800 text-white rounded-tl-xl rounded-br-xl shadow-md' : ''}
                                ${settings.theme === 'geometric' ? 'bg-indigo-600 text-white transform rotate-45 rounded-md' : ''}
                                ${settings.theme === 'creative' ? 'bg-purple-500 text-white rounded-full' : ''}
                             `}>
                                <span className={settings.theme === 'geometric' ? 'transform -rotate-45' : ''}>{day.dayIndex + 1}</span>
                             </div>
                             <div className="flex flex-col">
                                {settings.showDayName && day.date && (
                                  <span className={`font-bold leading-tight ${settings.fontSize === 'large' ? 'text-xl' : 'text-lg'} ${settings.theme === 'creative' ? 'text-purple-700' : 'text-gray-900'}`}>
                                      {getDayName(day.date)}
                                  </span>
                                )}
                                {settings.showDate && day.date && (
                                  <span className="text-xs font-semibold text-gray-500 font-mono">
                                    {new Date(day.date).toLocaleDateString('ar-EG')}
                                  </span>
                                )}
                             </div>
                          </div>
                          
                          <div className="flex items-start gap-2">
                             {/* Badges */}
                             {settings.showFasting && (
                                 <div className="flex items-center gap-1.5 px-2 py-1 border rounded-lg bg-gray-50 border-gray-200">
                                     <span className="text-[9px] font-bold text-gray-600">صيام</span>
                                     <div className="w-3 h-3 border border-gray-400 rounded-sm"></div>
                                 </div>
                             )}
                             {settings.showDayCompletion && (
                                 <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-lg border border-gray-200">
                                     <span className="text-[9px] font-bold text-gray-600">إنجاز اليوم</span>
                                     <div className="w-3 h-3 border border-gray-600 bg-white rounded-sm"></div>
                                 </div>
                             )}
                          </div>
                        </div>

                        {/* --- TASKS --- */}
                        <div className={`flex-1 overflow-hidden ${getFontSize()}`}>
                             {/* LIST LAYOUT */}
                             {settings.taskLayout === 'simple' && (
                                 <div className={`${settings.density === 'compact' ? 'space-y-1' : 'space-y-2'}`}>
                                     {day.tasks.map((task) => (
                                         <div key={task.id} className="flex justify-between items-start gap-2 w-full group">
                                             <div className="flex-1 border-b border-gray-200 border-dashed pb-0.5 text-right relative">
                                                 <div className="flex flex-col items-start w-full">
                                                     <span className="font-bold text-black leading-tight w-full text-right">{task.topic}</span>
                                                     <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[8px] px-1.5 rounded text-gray-600 border border-gray-300 bg-gray-50">{task.subject}</span>
                                                     </div>
                                                 </div>
                                             </div>
                                             <div className={`mt-1 w-4 h-4 border border-gray-400 flex-shrink-0 ${settings.theme === 'modern' ? 'rounded' : 'rounded-sm'}`}></div>
                                         </div>
                                     ))}
                                     {/* Empty Lines */}
                                     {Array.from({length: settings.extraLines}).map((_, i) => (
                                          <div key={`ex-${i}`} className="flex justify-between items-center gap-2 opacity-40">
                                              <div className="flex-1 border-b border-gray-300 h-5"></div>
                                              <div className="w-4 h-4 border border-gray-300 rounded-sm"></div>
                                          </div>
                                     ))}
                                 </div>
                             )}

                             {/* TABLE LAYOUT */}
                             {settings.taskLayout === 'table' && (
                                 <table className="w-full text-xs border-collapse">
                                     <thead>
                                         <tr className="bg-gray-100">
                                             <th className="border p-1 text-right border-gray-400 font-bold">المهمة</th>
                                             <th className="border p-1 text-right w-20 border-gray-400 font-bold">المادة</th>
                                             <th className="border p-1 text-center w-8 border-gray-400">✔</th>
                                         </tr>
                                     </thead>
                                     <tbody>
                                         {day.tasks.map((task) => (
                                             <tr key={task.id}>
                                                 <td className="border p-1 font-bold border-gray-300 text-right">{task.topic}</td>
                                                 <td className="border p-1 text-gray-600 border-gray-300 text-right text-[10px]">{task.subject}</td>
                                                 <td className="border p-1 text-center border-gray-300"><div className="w-3 h-3 border border-black mx-auto rounded-sm"></div></td>
                                             </tr>
                                         ))}
                                         {Array.from({length: settings.extraLines}).map((_, i) => (
                                              <tr key={`ex-${i}`}>
                                                 <td className="border p-1 h-6 border-gray-300"></td>
                                                 <td className="border p-1 border-gray-300"></td>
                                                 <td className="border p-1 text-center border-gray-300"><div className="w-3 h-3 border border-gray-400 mx-auto rounded-sm"></div></td>
                                              </tr>
                                         ))}
                                     </tbody>
                                 </table>
                             )}
                        </div>

                        {/* --- FOOTER (Prayers & Notes) --- */}
                        <div className={`mt-auto pt-2 space-y-2 ${settings.density === 'compact' ? 'pt-1' : 'pt-2'}`}>
                           {/* Prayer Tracker */}
                           {settings.showPrayers && (
                               <div className={`flex border rounded-lg overflow-hidden
                                 ${settings.theme === 'islamic' ? 'border-emerald-200 bg-emerald-50/50' : 'border-gray-300'}
                               `}>
                                   {prayers.map((p, idx) => (
                                       <div key={p} className={`flex-1 flex flex-col items-center py-1 ${idx !== prayers.length - 1 ? 'border-l border-gray-200' : ''}`}>
                                           <span className="text-[9px] font-bold text-gray-500 mb-0.5">{p}</span>
                                           <div className={`w-3.5 h-3.5 border rounded-sm ${settings.theme === 'islamic' ? 'border-emerald-400' : 'border-gray-400'}`}></div>
                                       </div>
                                   ))}
                               </div>
                           )}

                           {/* Notes Area */}
                           {settings.showNotesArea && (
                              <div className="border-t border-gray-300 border-dotted pt-1 mt-1">
                                  <div className="flex items-center gap-1 mb-1 opacity-70">
                                     <span className="text-[10px] font-bold text-gray-500">ملاحظات:</span>
                                  </div>
                                  <div className={`w-full border border-gray-200 rounded-lg bg-gray-50 ${settings.density === 'compact' ? 'h-8' : 'h-12'}`}></div>
                              </div>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* --- PAGE FOOTER / NUMBERING --- */}
                  <div className="absolute bottom-2 left-0 right-0 text-center flex justify-center items-center px-8 opacity-50">
                    <span className="text-[10px] font-mono text-gray-500">
                        {settings.theme === 'modern' ? 'Plan Pro • ' : ''}
                        صفحة {pageIdx + 1} من {totalChunkPages}
                    </span>
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

const Toggle = ({ label, checked, onChange, icon }: { label: string, checked: boolean, onChange: (v: boolean) => void, icon?: React.ReactNode }) => (
  <label className="flex items-center justify-between cursor-pointer group select-none hover:bg-white/5 p-1 rounded-lg transition-colors">
    <div className="flex items-center gap-2 text-gray-300 group-hover:text-white transition-colors">
      {icon && <span className="text-accent-500">{icon}</span>}
      <span className="text-xs font-bold">{label}</span>
    </div>
    <div className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-300 ${checked ? 'bg-accent-600' : 'bg-dark-700'}`} onClick={(e) => { e.preventDefault(); onChange(!checked); }}>
      <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform duration-300 ${checked ? 'translate-x-5' : 'translate-x-0'}`}></div>
    </div>
  </label>
);

export default PrintLayout;