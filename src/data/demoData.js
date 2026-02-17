// Demo data generator for offline testing
export const generateDemoTasks = () => {
  const types = ['critical', 'routine', 'admin'];
  const titles = [
    "DB Health Check", "API Latency Review", "Security Audit", "Cache Purge",
    "Load Balancer Sync", "User Session Backup", "Error Log Analysis", "Service Restart",
    "Deploy Hotfix", "Shift Handover Note", "Resource Scaling"
  ];
  
  const sampleResources = ["Sarah Jenkins", "Mike Ross", "David Kim", "Priya Patel", "Emily Blunt"];
  const tasks = [];
  const currentHour = new Date().getHours();

  for (let h = 0; h < 24; h++) {
    const hourStr = h.toString().padStart(2, '0');
    const numTasks = Math.floor(Math.random() * 2) + 3;

    for (let i = 0; i < numTasks; i++) {
      const startMin = i * 15;
      const endMin = startMin + 10;
      const startStr = `${hourStr}:${startMin.toString().padStart(2, '0')}`;
      const endStr = `${hourStr}:${endMin.toString().padStart(2, '0')}`;
      
      let status = 'pending';
      let actualStart = '';
      let actualEnd = '';
      let updatedAt = null;
      let updatedBy = null;
      
      if (h < currentHour) {
        const rand = Math.random();
        if (rand > 0.2) {
          status = 'completed';
          actualStart = startStr;
          actualEnd = endStr;
          updatedAt = new Date().toISOString();
          updatedBy = sampleResources[Math.floor(Math.random() * sampleResources.length)];
        } else if (rand > 0.1) {
          status = 'aborted';
          actualStart = startStr;
          actualEnd = endStr;
          updatedAt = new Date().toISOString();
          updatedBy = sampleResources[Math.floor(Math.random() * sampleResources.length)];
        }
      }

      tasks.push({
        id: `demo-task-${h}-${i}`,
        title: titles[Math.floor(Math.random() * titles.length)],
        plannedStart: startStr,
        plannedEnd: endStr,
        status: status,
        actualStart: actualStart,
        actualEnd: actualEnd,
        type: types[Math.floor(Math.random() * types.length)],
        comments: status === 'aborted' ? "Auto-aborted for demo" : "",
        updatedAt: updatedAt,
        updatedBy: updatedBy,
        createdAt: new Date().toISOString(),
        isDemo: true
      });
    }
  }

  return tasks;
};
