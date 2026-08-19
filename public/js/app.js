// app.js
import { store } from './store.js';

// Elements del DOM
const clockEl = document.getElementById('system-clock');
const dateEl = document.getElementById('system-date');

const listUrgents = document.getElementById('list-urgents');
const listDaily = document.getElementById('list-daily');
const listProjects = document.getElementById('list-projects');

const cUrgents = document.getElementById('count-urgents');
const cDaily = document.getElementById('count-daily');
const cProjects = document.getElementById('count-projects');

// Modals i Botons
const taskModal = document.getElementById('task-modal');
const projectModal = document.getElementById('project-modal');
const btnAddTask = document.getElementById('btn-add-task');
const btnAddProject = document.getElementById('btn-add-project');
const closeBtns = document.querySelectorAll('.close-modal');

// Formularis
const taskForm = document.getElementById('task-form');
const projectForm = document.getElementById('project-form');

// Rellotge del sistema
function updateClock() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('ca-ES');
    dateEl.textContent = now.toLocaleDateString('ca-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
setInterval(updateClock, 1000);
updateClock();

// Funcions de Models
function openModal(modal) { modal.classList.remove('hidden'); }
function closeModal(modal) { modal.classList.add('hidden'); }

btnAddTask.addEventListener('click', () => {
    taskForm.reset();
    document.getElementById('task-id').value = '';
    document.getElementById('task-notes').value = '';
    document.getElementById('task-modal-title').textContent = 'Nova Incidència / Tasca';
    openModal(taskModal);
});

btnAddProject.addEventListener('click', () => {
    projectForm.reset();
    document.getElementById('project-progress-range').value = 0;
    document.getElementById('progress-value-display').textContent = '0%';
    document.getElementById('project-id').value = '';
    document.getElementById('project-notes').value = '';
    document.getElementById('project-modal-title').textContent = 'Nou Projecte';
    openModal(projectModal);
});

closeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modalId = e.target.closest('button').dataset.close;
        closeModal(document.getElementById(modalId));
    });
});

document.getElementById('project-progress-range').addEventListener('input', (e) => {
    document.getElementById('progress-value-display').textContent = e.target.value + '%';
});

// Enviament de formularis
taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('task-id').value;
    const title = document.getElementById('task-title').value;
    const priority = document.getElementById('task-priority').value;
    const tag = document.getElementById('task-tag').value;
    const notes = document.getElementById('task-notes').value;

    if (id) {
        store.updateTask(id, { title, priority, tag, notes });
    } else {
        store.addTask({ title, priority, tag, notes });
    }
    closeModal(taskModal);
});

projectForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const id = document.getElementById('project-id').value;
    const title = document.getElementById('project-title').value;
    const progress = document.getElementById('project-progress-range').value;
    const notes = document.getElementById('project-notes').value;

    if (id) {
        store.updateProject(id, { title, progress: parseInt(progress), notes });
    } else {
        store.addProject({ title, progress: parseInt(progress), notes });
    }
    closeModal(projectModal);
});

// Renderització
function renderTasks(data) {
    listUrgents.innerHTML = '';
    listDaily.innerHTML = '';
    let urgentsCount = 0;
    let dailyCount = 0;

    // Sort per data més recent
    const sortedTasks = [...(data.tasks || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    sortedTasks.forEach(task => {
        const card = document.createElement('div');
        card.className = `task-card ${task.completed ? 'completed' : ''}`;
        card.draggable = true;
        card.dataset.id = task.id;

        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'task', id: task.id }));
            setTimeout(() => card.classList.add('dragging'), 0);
        });
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });

        card.innerHTML = `
            <div class="task-header">
                <div class="task-title">${task.title}</div>
                <div class="task-actions">
                    <button class="btn-icon check" data-id="${task.id}" title="Completar"><i class='bx ${task.completed ? 'bx-check-square' : 'bx-square'}'></i></button>
                    <button class="btn-icon edit" data-id="${task.id}" data-type="task" title="Editar"><i class='bx bx-edit'></i></button>
                    <button class="btn-icon delete" data-id="${task.id}" data-type="task" title="Eliminar"><i class='bx bx-trash'></i></button>
                </div>
            </div>
            <div class="task-meta">
                <span class="tag ${task.tag}">${task.tag.toUpperCase()}</span>
            </div>
            ${task.notes ? `<div class="task-notes">${task.notes}</div>` : ''}
        `;

        if (task.priority === 'urgent' && !task.completed) {
            listUrgents.appendChild(card);
            urgentsCount++;
        } else {
            listDaily.appendChild(card);
            if (!task.completed) dailyCount++;
        }
    });

    cUrgents.textContent = urgentsCount;
    cDaily.textContent = dailyCount;
}

function renderProjects(data) {
    listProjects.innerHTML = '';
    let projCount = 0;

    const sortedProjects = [...(data.projects || [])].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    sortedProjects.forEach(proj => {
        const card = document.createElement('div');
        card.className = `task-card ${proj.progress == 100 ? 'completed' : ''}`;
        card.draggable = true;
        card.dataset.id = proj.id;

        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'project', id: proj.id }));
            setTimeout(() => card.classList.add('dragging'), 0);
        });
        card.addEventListener('dragend', () => {
            card.classList.remove('dragging');
        });

        card.innerHTML = `
            <div class="task-header">
                <div class="task-title">${proj.title}</div>
                <div class="task-actions">
                    <button class="btn-icon edit" data-id="${proj.id}" data-type="project" title="Editar"><i class='bx bx-edit'></i></button>
                    <button class="btn-icon delete" data-id="${proj.id}" data-type="project" title="Eliminar"><i class='bx bx-trash'></i></button>
                </div>
            </div>
            <div class="progress-container">
                <div class="progress-bar-bg">
                    <div class="progress-bar-fill" style="width: ${proj.progress}%;"></div>
                </div>
                <span class="progress-text">${proj.progress}% completat</span>
            </div>
            ${proj.notes ? `<div class="task-notes">${proj.notes}</div>` : ''}
        `;
        listProjects.appendChild(card);
        if (proj.progress < 100) projCount++;
    });

    cProjects.textContent = projCount;
}

// Delegació global d'esdeveniments
document.body.addEventListener('click', (e) => {
    const btnCheck = e.target.closest('.btn-icon.check');
    if (btnCheck) {
        const id = btnCheck.dataset.id;
        const task = store.data.tasks.find(t => t.id === id);
        if (task) store.updateTask(id, { completed: !task.completed });
    }

    const btnEdit = e.target.closest('.btn-icon.edit');
    if (btnEdit) {
        const id = btnEdit.dataset.id;
        const type = btnEdit.dataset.type;
        if (type === 'task') {
            const task = store.data.tasks.find(t => t.id === id);
            if (task) {
                document.getElementById('task-id').value = task.id;
                document.getElementById('task-title').value = task.title;
                document.getElementById('task-priority').value = task.priority;
                document.getElementById('task-tag').value = task.tag;
                document.getElementById('task-notes').value = task.notes || '';
                document.getElementById('task-modal-title').textContent = 'Editar Tasca';
                openModal(document.getElementById('task-modal'));
            }
        } else if (type === 'project') {
            const proj = store.data.projects.find(p => p.id === id);
            if (proj) {
                document.getElementById('project-id').value = proj.id;
                document.getElementById('project-title').value = proj.title;
                document.getElementById('project-progress-range').value = proj.progress;
                document.getElementById('progress-value-display').textContent = proj.progress + '%';
                document.getElementById('project-notes').value = proj.notes || '';
                document.getElementById('project-modal-title').textContent = 'Editar Projecte';
                openModal(document.getElementById('project-modal'));
            }
        }
    }

    const btnDel = e.target.closest('.btn-icon.delete');
    if (btnDel) {
        const id = btnDel.dataset.id;
        const type = btnDel.dataset.type;
        if (confirm("Segur que vols eliminar aquest registre de forma permanent?")) {
            if (type === 'task') store.deleteTask(id);
            else if (type === 'project') store.deleteProject(id);
        }
    }
});

// Subscripció de l'UI a l'store
store.subscribe((data) => {
    renderTasks(data);
    renderProjects(data);
});

// Implementació Drag and Drop (Zones de destí)
const columns = [listUrgents, listDaily, listProjects];
columns.forEach(col => {
    col.addEventListener('dragover', e => {
        e.preventDefault();
        col.classList.add('drag-over');
    });

    col.addEventListener('dragleave', e => {
        col.classList.remove('drag-over');
    });

    col.addEventListener('drop', e => {
        e.preventDefault();
        col.classList.remove('drag-over');

        try {
            const dataStr = e.dataTransfer.getData('text/plain');
            if (!dataStr) return;
            // Mode retro-compatible pels tests globals
            const data = dataStr.startsWith('{') ? JSON.parse(dataStr) : { type: 'task', id: dataStr };

            if (col.id === 'list-projects') {
                if (data.type === 'task') {
                    // Codi de promoció de Tasca -> Projecte
                    const task = store.data.tasks.find(t => t.id === data.id);
                    if (task) {
                        store.deleteTask(data.id);
                        store.addProject({ title: task.title, progress: 0 });
                    }
                }
            } else {
                const isUrgent = col.id === 'list-urgents';
                if (data.type === 'task') {
                    // Moviment canviant la prioritat de la Tasca
                    store.updateTask(data.id, { priority: isUrgent ? 'urgent' : 'medium' });
                } else if (data.type === 'project') {
                    // Reversió Projecte -> Tasca
                    const proj = store.data.projects.find(p => p.id === data.id);
                    if (proj) {
                        store.deleteProject(data.id);
                        store.addTask({ title: proj.title, priority: isUrgent ? 'urgent' : 'medium', tag: 'support' });
                    }
                }
            }
        } catch (err) {
            console.error("Error drag and drop: ", err);
        }
    });
});

// Inicialització completada
store.init();
