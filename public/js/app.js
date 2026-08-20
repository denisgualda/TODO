// app.js
import { store } from './store.js';

// Elements del DOM
const dateEl = document.getElementById('system-date');

const listDaily = document.getElementById('list-daily');
const listProjects = document.getElementById('list-projects');

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


// Funcions de Models
function openModal(modal) { modal.classList.remove('hidden'); }
function closeModal(modal) { modal.classList.add('hidden'); }

btnAddTask.addEventListener('click', () => {
    taskForm.reset();
    document.getElementById('task-id').value = '';
    document.getElementById('task-notes').value = '';
    document.getElementById('task-modal-title').textContent = 'Nova Tasca';
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
    const notes = document.getElementById('task-notes').value;

    if (id) {
        store.updateTask(id, { title, priority, notes });
    } else {
        store.addTask({ title, priority, notes });
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
    listDaily.innerHTML = '';
    let dailyCount = 0;

    // Sort per ordre manual (ascendent), nou elements al final
    const sortedTasks = [...(data.tasks || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

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
            ${task.notes ? `<div class="task-notes">${task.notes}</div>` : ''}
        `;

        listDaily.appendChild(card);
        if (!task.completed) dailyCount++;
    });

    cDaily.textContent = dailyCount;
}

function renderProjects(data) {
    listProjects.innerHTML = '';
    let projCount = 0;

    // Sort per ordre manual (ascendent)
    const sortedProjects = [...(data.projects || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

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

        if (type === 'task') store.deleteTask(id);
        else if (type === 'project') store.deleteProject(id);

    }
});

// Subscripció de l'UI a l'store
store.subscribe((data) => {
    renderTasks(data);
    renderProjects(data);
});

// Helper: troba l'element davant del qual inserir durant el drag
function getDragAfterElement(container, y) {
    const cards = [...container.querySelectorAll('.task-card:not(.dragging)')];
    return cards.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset, element: child };
        }
        return closest;
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

let touchDragState = null;

function getCardTypeFromList(list) {
    return list && list.id === 'list-projects' ? 'project' : 'task';
}

function reorderListFromDOM(list, type) {
    const ids = [...list.querySelectorAll('.task-card')].map(card => card.dataset.id);
    if (type === 'task') {
        store.reorderTasks(ids);
    } else {
        store.reorderProjects(ids);
    }
}

function moveCardToList(card, targetList) {
    const sourceList = card.closest('.task-list');
    const sourceType = getCardTypeFromList(sourceList);
    const targetType = getCardTypeFromList(targetList);
    const id = card.dataset.id;

    if (!sourceList || !targetList || sourceList === targetList) {
        reorderListFromDOM(sourceList || targetList, sourceType || targetType);
        return;
    }

    if (sourceType === 'task' && targetType === 'project') {
        const task = store.data.tasks.find(t => t.id === id);
        if (task) {
            store.deleteTask(id);
            store.addProject({ title: task.title, progress: 0, notes: task.notes || '' });
        }
        return;
    }

    if (sourceType === 'project' && targetType === 'task') {
        const project = store.data.projects.find(p => p.id === id);
        if (project) {
            store.deleteProject(id);
            store.addTask({ title: project.title, priority: 'medium', notes: project.notes || '', tag: 'support' });
        }
        return;
    }

    reorderListFromDOM(targetList, targetType);
}

function attachTouchHandling() {
    document.addEventListener('touchstart', (e) => {
        const card = e.target.closest('.task-card');
        if (!card || e.target.closest('.btn-icon')) return;

        const list = card.closest('.task-list');
        if (!list) return;

        touchDragState = {
            card,
            list,
            type: getCardTypeFromList(list),
            id: card.dataset.id,
            lastX: e.touches[0].clientX,
            lastY: e.touches[0].clientY
        };

        card.classList.add('dragging');
        e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
        if (!touchDragState) return;

        const touch = e.touches[0];
        touchDragState.lastX = touch.clientX;
        touchDragState.lastY = touch.clientY;

        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        const targetList = target ? target.closest('.task-list') : null;

        if (!targetList) return;

        e.preventDefault();
        const afterElement = getDragAfterElement(targetList, touch.clientY);
        const { card } = touchDragState;

        if (afterElement == null) {
            targetList.appendChild(card);
        } else {
            targetList.insertBefore(card, afterElement);
        }

        targetList.classList.add('drag-over');
        const otherLists = [listDaily, listProjects].filter(list => list !== targetList);
        otherLists.forEach(list => list.classList.remove('drag-over'));
    }, { passive: false });

    document.addEventListener('touchend', () => {
        if (!touchDragState) return;

        const { card, list, type, lastX, lastY } = touchDragState;
        const target = document.elementFromPoint(lastX, lastY);
        const targetList = target ? target.closest('.task-list') : null;

        const finalList = targetList || list;
        card.classList.remove('dragging');
        finalList.classList.remove('drag-over');

        if (finalList && finalList !== list) {
            moveCardToList(card, finalList);
        } else if (finalList) {
            reorderListFromDOM(finalList, type);
        }

        touchDragState = null;
    });
}

attachTouchHandling();

// Implementació Drag and Drop (Zones de destí)
const columns = [listDaily, listProjects];
columns.forEach(col => {
    col.addEventListener('dragover', e => {
        e.preventDefault();
        col.classList.add('drag-over');
        // Reposicionament visual en temps real
        const draggingCard = document.querySelector('.task-card.dragging');
        if (draggingCard) {
            const afterElement = getDragAfterElement(col, e.clientY);
            if (afterElement == null) {
                col.appendChild(draggingCard);
            } else {
                col.insertBefore(draggingCard, afterElement);
            }
        }
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
            const data = dataStr.startsWith('{') ? JSON.parse(dataStr) : { type: 'task', id: dataStr };

            if (col.id === 'list-projects') {
                if (data.type === 'task') {
                    // Promoció Tasca -> Projecte
                    const task = store.data.tasks.find(t => t.id === data.id);
                    if (task) {
                        store.deleteTask(data.id);
                        store.addProject({ title: task.title, progress: 0 });
                    }
                } else if (data.type === 'project') {
                    // Reordre dins de la columna de projectes
                    const newOrder = [...col.querySelectorAll('.task-card')].map(c => c.dataset.id);
                    store.reorderProjects(newOrder);
                }
            } else {
                // col === listDaily
                if (data.type === 'task') {
                    // Reordre dins de la columna de tasques
                    const newOrder = [...col.querySelectorAll('.task-card')].map(c => c.dataset.id);
                    store.reorderTasks(newOrder);
                } else if (data.type === 'project') {
                    // Reversió Projecte -> Tasca
                    const proj = store.data.projects.find(p => p.id === data.id);
                    if (proj) {
                        store.deleteProject(data.id);
                        store.addTask({ title: proj.title, priority: 'medium', tag: 'support' });
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

