// Generate a time string (HH:mm) from a Date object
export const formatTime = (date) => {
  return date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
};

// Generate an array of hours for the timeline
export const getTimelineHours = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push(i.toString().padStart(2, '0') + ":00");
  }
  return hours;
};

// Check if a time string falls within a start/end range (handles midnight crossing)
export const isTimeInShift = (timeStr, start, end) => {
  if (start < end) {
    return timeStr >= start && timeStr < end;
  } else {
    // Crosses midnight (e.g., 22:00 to 06:00)
    return timeStr >= start || timeStr < end;
  }
};

// Helper to determine Shift Activity Status (Compliance)
export const getShiftActivityStatus = (task, timeString) => {
  const isPastStart = task.plannedStart < timeString;
  const isUpdated = ['completed', 'aborted', 'in_progress'].includes(task.status);
  
  if (isUpdated) {
      if (task.actualStart && task.actualStart > task.plannedStart) {
          // Late Update
          return { 
              label: 'Late Update', 
              gradient: 'from-rose-400 to-rose-600',
              badge: 'text-rose-700 bg-rose-50 border border-rose-100',
              text: 'text-rose-700'
          };
      }
      if (task.status === 'aborted') {
          return { 
              label: 'Aborted', 
              gradient: 'from-slate-400 to-slate-500',
              badge: 'text-slate-600 bg-slate-50 border border-slate-100',
              text: 'text-slate-600'
          };
      }
      return { 
          label: 'Completed', 
          gradient: 'from-emerald-400 to-emerald-500',
          badge: 'text-emerald-700 bg-emerald-50 border border-emerald-100',
          text: 'text-emerald-700'
      };
  }
  
  if (isPastStart) {
      return { 
          label: 'Overdue', 
          gradient: 'from-rose-500 to-red-600',
          badge: 'text-rose-700 bg-rose-50 border border-rose-100 animate-pulse',
          text: 'text-rose-600'
      };
  }
  
  return { 
      label: 'Scheduled', 
      gradient: 'from-indigo-300 to-indigo-400',
      badge: 'text-indigo-600 bg-indigo-50 border border-indigo-100',
      text: 'text-indigo-600'
  };
};

// Calculate stats for a given list of tasks
export const calculateStats = (taskList, currentTime) => {
    const timeString = formatTime(currentTime);
    let compliant = true;
    
    const stats = { 
      total: taskList.length, 
      updatedOnTime: 0, 
      notUpdatedOnTime: 0,
      pendingFuture: 0
    };
    
    const categoryStats = {};

    taskList.forEach(t => {
      const isPastStart = t.plannedStart < timeString;

      if (t.status === 'completed' || t.status === 'in_progress' || t.status === 'aborted') {
         if (t.actualStart && t.actualStart > t.plannedStart) {
            stats.notUpdatedOnTime++; 
         } else {
            stats.updatedOnTime++;
         }
      } else {
        if (isPastStart) {
          stats.notUpdatedOnTime++;
          compliant = false;
        } else {
          stats.pendingFuture++;
        }
      }

      const type = t.type || 'general';
      if (!categoryStats[type]) {
        categoryStats[type] = { total: 0, success: 0, aborted: 0 };
      }
      categoryStats[type].total++;
      if (t.status === 'completed') categoryStats[type].success++;
      if (t.status === 'aborted') categoryStats[type].aborted++;
    });

    return { compliant, stats, categoryStats };
};
