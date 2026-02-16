
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
  // 1. Organize tasks by subject queue
  const subjects = Array.from(new Set(tasks.map(t => t.subject)));
  const tasksBySubject: Record<string, Task[]> = {};
  
  subjects.forEach(sub => {
    tasksBySubject[sub] = tasks.filter(t => t.subject === sub);
  });

  const distributedTasks: Task[] = [];
  const tasksPerDayBase = Math.floor(tasks.length / totalDays);
  let extraTasks = tasks.length % totalDays;

  // Track what was studied yesterday to avoid repetition if possible
  let previousDaySubjects = new Set<string>();

  for (let day = 0; day < totalDays; day++) {
    // Determine daily quota
    let dailyQuota = tasksPerDayBase + (extraTasks > 0 ? 1 : 0);
    extraTasks--;

    const dayTasks: Task[] = [];
    const currentDaySubjects = new Set<string>();

    let assignedCount = 0;

    // --- Strategy: Variety & Balance ---
    // We want to pick subjects that:
    // 1. Have not been picked today yet (Variety within day)
    // 2. Were NOT picked yesterday (Continuity balance / Spaced repetition)
    // 3. Have the most tasks remaining (Load balancing)

    while (assignedCount < dailyQuota) {
      // Filter subjects that still have tasks
      const availableSubjects = subjects.filter(s => tasksBySubject[s].length > 0);

      if (availableSubjects.length === 0) break; // No tasks left at all

      // Score each subject
      const subjectScores = availableSubjects.map(sub => {
        let score = 0;
        
        // Priority 1: High remaining count (Load balancing)
        score += tasksBySubject[sub].length * 10;

        // Priority 2: Not used today yet (Diversity within day)
        if (!currentDaySubjects.has(sub)) score += 1000;

        // Priority 3: Not used yesterday (Diversity across days)
        if (!previousDaySubjects.has(sub)) score += 500;

        return { sub, score };
      });

      // Sort by score descending
      subjectScores.sort((a, b) => b.score - a.score);

      // Pick the winner
      const winnerSub = subjectScores[0].sub;
      
      // Assign task
      const task = tasksBySubject[winnerSub].shift()!;
      task.dayIndex = day;
      dayTasks.push(task);
      
      currentDaySubjects.add(winnerSub);
      assignedCount++;
    }

    distributedTasks.push(...dayTasks);
    // Update history for next iteration
    previousDaySubjects = currentDaySubjects;
  }

  // Edge Case: If any tasks remain (due to weird division), append to end
  subjects.forEach(sub => {
    while (tasksBySubject[sub].length > 0) {
      const task = tasksBySubject[sub].shift()!;
      task.dayIndex = totalDays - 1;
      distributedTasks.push(task);
    }
  });

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
