chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name.startsWith('alarm_')) {
    const taskId = alarm.name.split('_')[1];
    
    chrome.storage.local.get(['todoState'], (result) => {
      if (result.todoState && result.todoState.tasks) {
        const task = result.todoState.tasks.find(t => t.id === `t_${taskId}` || t.id === taskId || t.id.includes(taskId));
        if (task && !task.completed) {
          chrome.notifications.create(alarm.name, {
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'Task Due Soon',
            message: `Your task "${task.title}" is due soon!`,
            priority: 2
          });
        }
      }
    });
  }
});
