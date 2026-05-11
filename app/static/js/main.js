document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('task-list')) {
        initDashboard();
    }
});

let socket;
let tasks = [];

function initDashboard() {
    // Initialize Socket.IO
    socket = io();
    socket.on('connect', () => {
        console.log('Connected to WebSocket');
        socket.emit('join', {});
    });

    socket.on('task_updated', (data) => {
        console.log('Task update received:', data);
        handleTaskUpdate(data);
        fetchAnalytics(); // Refresh analytics when tasks change
    });

    // Fetch initial data
    fetchTasks();
    fetchAnalytics();

    // Form submission
    document.getElementById('task-form').addEventListener('submit', handleTaskSubmit);
}

async function fetchTasks() {
    try {
        const res = await fetch('/api/tasks');
        tasks = await res.json();
        renderTasks();
    } catch (err) {
        console.error('Error fetching tasks:', err);
    }
}

async function fetchAnalytics() {
    try {
        const res = await fetch('/analytics/data');
        const data = await res.json();
        
        document.getElementById('stat-total').textContent = data.total;
        document.getElementById('stat-completed').textContent = data.completed;
        document.getElementById('stat-pending').textContent = data.pending;
        document.getElementById('stat-percentage').textContent = data.completion_percentage + '%';
    } catch (err) {
        console.error('Error fetching analytics:', err);
    }
}

function handleTaskUpdate(data) {
    if (data.action === 'add') {
        tasks.unshift(data.task);
    } else if (data.action === 'update') {
        const idx = tasks.findIndex(t => t.id === data.task.id);
        if (idx !== -1) tasks[idx] = data.task;
    } else if (data.action === 'delete') {
        tasks = tasks.filter(t => t.id !== data.task_id);
    }
    renderTasks();
}

function renderTasks() {
    const list = document.getElementById('task-list');
    if (tasks.length === 0) {
        list.innerHTML = '<div class="text-center text-muted" style="padding: 2rem;">No tasks found. Add one above!</div>';
        return;
    }

    list.innerHTML = tasks.map(task => `
        <div class="task-item status-${task.status}" id="task-${task.id}">
            <div class="task-content">
                <div class="task-title">${escapeHTML(task.title)}</div>
                ${task.description ? `<div class="task-desc">${escapeHTML(task.description)}</div>` : ''}
                <div class="task-meta">
                    <span class="badge priority-${task.priority}">${task.priority}</span>
                    <span class="badge" style="background: ${task.status==='Completed' ? '#d1fae5' : '#e5e7eb'}; color: ${task.status==='Completed' ? '#065f46' : '#374151'}">${task.status}</span>
                </div>
            </div>
            <div class="task-actions">
                ${task.status === 'Pending' ? 
                    `<button class="btn btn-sm btn-success" onclick="updateTaskStatus(${task.id}, 'Completed')" title="Mark Completed"><i class="fas fa-check"></i></button>` : 
                    `<button class="btn btn-sm btn-secondary" onclick="updateTaskStatus(${task.id}, 'Pending')" title="Mark Pending"><i class="fas fa-undo"></i></button>`
                }
                <button class="btn btn-sm btn-primary" onclick='editTask(${JSON.stringify(task).replace(/'/g, "&apos;")})' title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn btn-sm btn-danger" onclick="deleteTask(${task.id})" title="Delete"><i class="fas fa-trash"></i></button>
            </div>
        </div>
    `).join('');
}

async function handleTaskSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('task-id').value;
    const title = document.getElementById('task-title').value;
    const description = document.getElementById('task-desc').value;
    const priority = document.getElementById('task-priority').value;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/tasks/${id}` : '/api/tasks';

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, priority })
        });

        if (res.ok) {
            resetForm();
            // Real-time update is handled by WebSocket event from server
        }
    } catch (err) {
        console.error('Error saving task:', err);
    }
}

function editTask(task) {
    document.getElementById('task-id').value = task.id;
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-desc').value = task.description;
    document.getElementById('task-priority').value = task.priority;
    
    document.getElementById('submit-btn').textContent = 'Update Task';
    document.getElementById('cancel-btn').style.display = 'inline-block';
    document.getElementById('task-title').focus();
}

function resetForm() {
    document.getElementById('task-form').reset();
    document.getElementById('task-id').value = '';
    document.getElementById('submit-btn').textContent = 'Add Task';
    document.getElementById('cancel-btn').style.display = 'none';
}

async function updateTaskStatus(id, status) {
    try {
        await fetch(`/api/tasks/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
    } catch (err) {
        console.error('Error updating status:', err);
    }
}

async function deleteTask(id) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
        await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
    } catch (err) {
        console.error('Error deleting task:', err);
    }
}

function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
