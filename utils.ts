
import { Task, DayPlan, SUBJECT_COLORS } from './types';
import { fullCurriculum } from './curriculumData';

export const generatePlan = (totalDays: number, startDateStr: string): Task[] => {
  const allTasks: Task[] = fullCurriculum.map((item, index) => ({
    id: `task-${index}-${Date.now()}`,
    subject: item.subject,
    topic: item.topic,
    isCompleted: false,
    dayIndex: 0, // Placeholder
  }));

  return distributeTasksSmartly(allTasks, totalDays);
};

export const distributeTasksSmartly = (tasks: Task[], totalDays: number): Task[] => {
  // 1. Group tasks by Subject into Queues
  const queues: Record<string, Task[]> = {};
  
  // Ensure we have keys for all subjects to avoid undefined errors
  const allSubjects = Array.from(new Set(tasks.map(t => t.subject)));
  allSubjects.forEach(s => queues[s] = []);
  
  tasks.forEach(t => {
    queues[t.subject].push(t);
  });

  // 2. Define the "Nice Day" Rotation Order
  // We alternate between: Scientific (Hard) -> Language (Light) -> Scientific (Hard) -> Language (Light) -> Bio/Geo (Medium)
  // This prevents having Physics + Chemistry + Bio all in one block.
  const balancedRotation = [
    'الفيزياء',          // Heavy Scientific
    'اللغة العربية',     // Language & Literature
    'الكيمياء',          // Heavy Scientific
    'اللغة الإنجليزية',  // Language
    'الأحياء والجيولوجيا' // Memorization/Scientific
  ];

  // If there are extra subjects not in the hardcoded list (e.g. customized), add them at the end
  allSubjects.forEach(s => {
    if (!balancedRotation.includes(s)) balancedRotation.push(s);
  });

  const distributedTasks: Task[] = [];
  let subjectPointer = 0; // Points to the current subject in balancedRotation

  // 3. Iterate Day by Day
  for (let day = 0; day < totalDays; day++) {
    const remainingDays = totalDays - day;
    
    // Calculate total remaining tasks across all queues
    let totalRemainingTasks = 0;
    Object.values(queues).forEach(q => totalRemainingTasks += q.length);

    if (totalRemainingTasks === 0) break;

    // CORE LOGIC: Divide remaining lessons by remaining days.
    // Math.ceil ensures we never fall behind. 
    // Example: 100 tasks / 50 days = 2 tasks/day exactly.
    // Example: 101 tasks / 50 days = 3 tasks today, then adjusts for tomorrow.
    const dailyTarget = Math.ceil(totalRemainingTasks / remainingDays);

    let tasksAddedToday = 0;
    let attempts = 0; // Safety breaker to prevent infinite loops if queues are empty

    while (tasksAddedToday < dailyTarget && totalRemainingTasks > 0) {
       // Pick a subject from the rotation
       const currentSubject = balancedRotation[subjectPointer];
       const subjectQueue = queues[currentSubject];

       // Check if this subject has tasks left
       if (subjectQueue && subjectQueue.length > 0) {
         const task = subjectQueue.shift(); // Take one task
         if (task) {
           task.dayIndex = day;
           distributedTasks.push(task);
           tasksAddedToday++;
           totalRemainingTasks--;
         }
         // Move to next subject ONLY after successfully picking one? 
         // No, always rotate to keep diversity even if one subject runs out, we skip it next loop.
       } 

       // Move pointer to the next subject in the "Cocktail"
       subjectPointer = (subjectPointer + 1) % balancedRotation.length;

       // Safety mechanism: If we looped through all subjects and didn't find tasks (but total > 0), 
       // it means only specific subjects are left.
       attempts++;
       if (attempts > balancedRotation.length * 2 && tasksAddedToday < dailyTarget) {
           // Fallback: Pick from ANY available queue
           const anySubject = Object.keys(queues).find(k => queues[k].length > 0);
           if (anySubject) {
               const task = queues[anySubject].shift();
               if (task) {
                   task.dayIndex = day;
                   distributedTasks.push(task);
                   tasksAddedToday++;
                   totalRemainingTasks--;
               }
           } else {
               break; // No tasks left anywhere
           }
       }
    }
  }

  // 4. Sort by Day Index (and ensure tasks inside the day are somewhat ordered by subject rotation if desired, but array order is fine)
  return distributedTasks;
}

export const distributeTasksEvenly = (tasks: Task[], totalDays: number): Task[] => {
  return distributeTasksSmartly(tasks, totalDays);
}

export const getDatesForPlan = (days: number, start: string): string[] => {
  const dates = [];
  const currentDate = new Date(start);
  
  for (let i = 0; i < days; i++) {
    dates.push(currentDate.toISOString());
    currentDate.setDate(currentDate.getDate() + 1);
  }
  return dates;
};

export const formatDate = (isoString: string): string => {
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', month: 'long', day: 'numeric' };
  return new Date(isoString).toLocaleDateString('ar-EG', options);
};

export const getDayName = (isoString: string): string => {
  return new Date(isoString).toLocaleDateString('ar-EG', { weekday: 'long' });
};
