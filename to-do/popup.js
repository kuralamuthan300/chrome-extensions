// Default state
let state = {
  theme: 'light',
  views: [{ id: 'v_default', name: 'My Tasks' }],
  currentViewId: 'v_default',
  tasks: []
};

let currentEditingTaskId = null;
let draggedTaskId = null;

// DOM Elements
const body = document.body;
const themeToggleBtn = document.getElementById('theme-toggle');
const viewsListEl = document.getElementById('views-list');
const newViewInput = document.getElementById('new-view-input');
const addViewBtn = document.getElementById('add-view-btn');
const currentViewTitleEl = document.getElementById('current-view-title');
const tasksListEl = document.getElementById('tasks-list');
const newTaskInput = document.getElementById('new-task-input');
const addTaskBtn = document.getElementById('add-task-btn');
const searchInput = document.getElementById('search-input');
const quickAddTabBtn = document.getElementById('quick-add-tab-btn');

// Editor DOM
const editorOverlay = document.getElementById('task-editor-overlay');
const closeEditorBtn = document.getElementById('close-editor-btn');
const editorTitle = document.getElementById('editor-title');
const editorDeadline = document.getElementById('editor-deadline');
const editorUrl = document.getElementById('editor-url');
const subtasksContainer = document.getElementById('subtasks-container');
const newSubtaskInput = document.getElementById('new-subtask-input');
const addSubtaskBtn = document.getElementById('add-subtask-btn');
const saveTaskBtn = document.getElementById('save-task-btn');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  loadState(() => {
    applyTheme();
    renderViews();
    renderTasks();
  });
});

// State Management
function loadState(callback) {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.get(['todoState'], (result) => {
      if (result.todoState) {
         state = Object.assign(state, result.todoState);
      }
      callback();
    });
  } else {
    // Fallback for non-extension environment
    const saved = localStorage.getItem('todoState');
    if (saved) state = JSON.parse(saved);
    callback();
  }
}

function saveState() {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    chrome.storage.local.set({ todoState: state }, () => {
      checkAlarms(); // Setup background alarms on save
    });
  } else {
    localStorage.setItem('todoState', JSON.stringify(state));
  }
}

// Alarms
function checkAlarms() {
  if (typeof chrome === 'undefined' || !chrome.alarms) return;
  chrome.alarms.clearAll();
  const now = new Date().getTime();
  state.tasks.forEach(t => {
    if (!t.completed && t.deadline) {
      const deadlineTime = new Date(t.deadline).getTime();
      if (deadlineTime > now) {
        // notification 1 hour before
        const alarmTime = deadlineTime - 60 * 60 * 1000; 
        if (alarmTime > now) {
          chrome.alarms.create(`alarm_${t.id}`, { when: alarmTime });
        }
      }
    }
  });
}

// UI Rendering
function applyTheme() {
  body.className = state.theme === 'dark' ? 'dark-mode' : 'light-mode';
}

function renderViews() {
  viewsListEl.innerHTML = '';
  state.views.forEach(view => {
    const el = document.createElement('div');
    el.className = `view-item ${view.id === state.currentViewId ? 'active' : ''}`;
    el.innerHTML = `<span>${view.name}</span>`;
    
    // Disable deleting the last view
    if (state.views.length > 1) {
      const delBtn = document.createElement('button');
      delBtn.className = 'delete-view';
      delBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>';
      delBtn.onclick = (e) => {
        e.stopPropagation();
        deleteView(view.id);
      }
      el.appendChild(delBtn);
    }
    
    el.onclick = () => selectView(view.id);
    viewsListEl.appendChild(el);
  });
  
  const activeView = state.views.find(v => v.id === state.currentViewId);
  if (activeView) currentViewTitleEl.textContent = activeView.name;
}

function renderTasks() {
  tasksListEl.innerHTML = '';
  const query = searchInput.value.toLowerCase();
  
  let viewTasks = state.tasks.filter(t => t.viewId === state.currentViewId);
  if (query) {
    viewTasks = state.tasks.filter(t => t.title.toLowerCase().includes(query));
    currentViewTitleEl.textContent = 'Search Results';
  } else {
    const activeView = state.views.find(v => v.id === state.currentViewId);
    if (activeView) currentViewTitleEl.textContent = activeView.name;
  }
  
  viewTasks.forEach((task, index) => {
    const el = document.createElement('div');
    el.className = 'task-item draggable';
    el.draggable = true;
    el.dataset.id = task.id;
    
    // Drag and Drop listeners
    el.addEventListener('dragstart', (e) => { draggedTaskId = task.id; e.dataTransfer.effectAllowed = 'move'; el.style.opacity = '0.5'; });
    el.addEventListener('dragend', () => { draggedTaskId = null; el.style.opacity = '1'; });
    el.addEventListener('dragover', (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; });
    el.addEventListener('drop', (e) => handleDrop(e, task.id));

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'task-checkbox';
    check.checked = task.completed;
    check.onchange = (e) => { e.stopPropagation(); toggleTask(task.id); };

    const info = document.createElement('div');
    info.className = 'task-main-info';
    
    let metaHTML = '';
    
    // Progress
    if (task.subtasks && task.subtasks.length > 0) {
      const completedSubs = task.subtasks.filter(s => s.completed).length;
      metaHTML += `<div class="meta-chip"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14H7v-2h5v2zm4-4H7v-2h9v2zm0-4H7V7h9v2z"/></svg>${completedSubs}/${task.subtasks.length}</div>`;
    }
    
    // Deadline
    if (task.deadline) {
      const isOverdue = !task.completed && new Date(task.deadline).getTime() < new Date().getTime();
      const dateStr = new Date(task.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' });
      metaHTML += `<div class="meta-chip ${isOverdue ? 'overdue' : ''}"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>${dateStr}</div>`;
    }

    // URL
    if (task.url) {
      metaHTML += `<a href="${task.url}" target="_blank" onclick="event.stopPropagation()" class="meta-chip" style="text-decoration:none; color:inherit;"><svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>Link</a>`;
    }

    info.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:4px">
        <span class="task-title ${task.completed ? 'completed' : ''}">${task.title}</span>
        ${metaHTML ? `<div class="task-meta">${metaHTML}</div>` : ''}
      </div>
    `;

    info.prepend(check);

    const actions = document.createElement('div');
    actions.className = 'task-actions';
    
    const editBtn = document.createElement('button');
    editBtn.className = 'icon-btn';
    editBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`;
    editBtn.onclick = (e) => { e.stopPropagation(); openEditor(task.id); };

    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn';
    delBtn.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`;
    delBtn.onclick = (e) => { e.stopPropagation(); deleteTask(task.id); };

    actions.appendChild(editBtn);
    actions.appendChild(delBtn);

    el.appendChild(info);
    el.appendChild(actions);
    
    // Double click to edit or regular click to edit
    el.onclick = () => openEditor(task.id);

    tasksListEl.appendChild(el);
  });
}

// Actions
themeToggleBtn.addEventListener('click', () => {
  state.theme = state.theme === 'light' ? 'dark' : 'light';
  applyTheme();
  saveState();
});

addViewBtn.addEventListener('click', () => {
  const name = newViewInput.value.trim();
  if (name) {
    const id = 'v_' + Date.now();
    state.views.push({ id, name });
    state.currentViewId = id;
    newViewInput.value = '';
    saveState();
    renderViews();
    renderTasks();
  }
});

function selectView(id) {
  state.currentViewId = id;
  searchInput.value = '';
  saveState();
  renderViews();
  renderTasks();
}

function deleteView(id) {
  if (state.views.length <= 1) return;
  state.views = state.views.filter(v => v.id !== id);
  state.tasks = state.tasks.filter(t => t.viewId !== id);
  if (state.currentViewId === id) {
    state.currentViewId = state.views[0].id;
  }
  saveState();
  renderViews();
  renderTasks();
}

addTaskBtn.addEventListener('click', () => {
  const title = newTaskInput.value.trim();
  if (title) {
    const task = {
      id: 't_' + Date.now(),
      viewId: state.currentViewId,
      title,
      completed: false,
      deadline: '',
      url: '',
      subtasks: []
    };
    state.tasks.push(task);
    newTaskInput.value = '';
    saveState();
    renderTasks();
  }
});

newTaskInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') addTaskBtn.click();
});

searchInput.addEventListener('input', () => {
  renderTasks();
});

function toggleTask(id) {
  const task = state.tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveState();
    renderTasks();
  }
}

function deleteTask(id) {
  state.tasks = state.tasks.filter(t => t.id !== id);
  saveState();
  renderTasks();
}

function handleDrop(e, targetId) {
  if (!draggedTaskId || draggedTaskId === targetId) return;
  const draggedIndex = state.tasks.findIndex(t => t.id === draggedTaskId);
  const targetIndex = state.tasks.findIndex(t => t.id === targetId);
  
  const [removed] = state.tasks.splice(draggedIndex, 1);
  state.tasks.splice(targetIndex, 0, removed);
  
  saveState();
  renderTasks();
}

// Editor Logic
function openEditor(id) {
  currentEditingTaskId = id;
  const task = state.tasks.find(t => t.id === id);
  if (!task) return;

  editorTitle.value = task.title;
  editorDeadline.value = task.deadline || '';
  editorUrl.value = task.url || '';
  
  renderSubtasks();
  
  editorOverlay.classList.remove('hidden');
}

function closeEditor() {
  editorOverlay.classList.add('hidden');
  currentEditingTaskId = null;
}

closeEditorBtn.addEventListener('click', closeEditor);

saveTaskBtn.addEventListener('click', () => {
  if (!currentEditingTaskId) return;
  const task = state.tasks.find(t => t.id === currentEditingTaskId);
  if (task) {
    task.title = editorTitle.value.trim() || 'Untitled';
    task.deadline = editorDeadline.value;
    task.url = editorUrl.value;
    saveState();
    renderTasks();
  }
  closeEditor();
});

function renderSubtasks() {
  const task = state.tasks.find(t => t.id === currentEditingTaskId);
  subtasksContainer.innerHTML = '';
  if (!task || !task.subtasks) return;
  
  task.subtasks.forEach(sub => {
    const d = document.createElement('div');
    d.className = 'subtask-item';
    
    const c = document.createElement('input');
    c.type = 'checkbox';
    c.checked = sub.completed;
    c.onchange = () => { sub.completed = c.checked; saveState(); renderTasks(); };
    
    const s = document.createElement('span');
    s.textContent = sub.title;
    s.style.flexGrow = '1';
    if(sub.completed) s.style.textDecoration = 'line-through';
    
    const x = document.createElement('button');
    x.className = 'icon-btn';
    x.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`;
    x.onclick = () => {
      task.subtasks = task.subtasks.filter(st => st.id !== sub.id);
      saveState();
      renderSubtasks();
    };

    d.appendChild(c);
    d.appendChild(s);
    d.appendChild(x);
    subtasksContainer.appendChild(d);
  });
}

addSubtaskBtn.addEventListener('click', () => {
  const val = newSubtaskInput.value.trim();
  const task = state.tasks.find(t => t.id === currentEditingTaskId);
  if (val && task) {
    if(!task.subtasks) task.subtasks = [];
    task.subtasks.push({ id: 's_' + Date.now(), title: val, completed: false });
    newSubtaskInput.value = '';
    renderSubtasks();
  }
});

// Quick Add Tab Functionality
quickAddTabBtn.addEventListener('click', () => {
  if (typeof chrome !== 'undefined' && chrome.tabs) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        const tab = tabs[0];
        const task = {
          id: 't_' + Date.now(),
          viewId: state.currentViewId,
          title: "Review: " + (tab.title || 'Untitled Tab'),
          completed: false,
          deadline: '',
          url: tab.url,
          subtasks: []
        };
        state.tasks.push(task);
        saveState();
        renderTasks();
      }
    });
  } else {
    alert("This feature only works inside the Chrome Extension context.");
  }
});
