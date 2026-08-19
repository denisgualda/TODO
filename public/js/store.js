// store.js
const API_URL = '/api/data';

class Store {
    constructor() {
        this.data = { tasks: [], projects: [] };
        this.listeners = [];
    }

    async init() {
        try {
            const res = await fetch(API_URL);
            if (res.ok) {
                this.data = await res.json();
            }
        } catch (e) {
            console.error("No s'han pogut carregar les dades inicials");
        }
        this.notify();
    }

    async save() {
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(this.data)
            });
        } catch (e) {
            console.error("No s'han pogut desar les dades");
        }
        this.notify();
    }

    // Gestió de Tasques
    addTask(task) {
        this.data.tasks.push({
            ...task,
            id: Date.now().toString(),
            completed: false,
            createdAt: new Date().toISOString()
        });
        this.save();
    }

    updateTask(id, updates) {
        const idx = this.data.tasks.findIndex(t => t.id === id);
        if (idx !== -1) {
            this.data.tasks[idx] = { ...this.data.tasks[idx], ...updates };
            this.save();
        }
    }

    deleteTask(id) {
        this.data.tasks = this.data.tasks.filter(t => t.id !== id);
        this.save();
    }

    // Gestió de Projectes
    addProject(project) {
        this.data.projects.push({
            ...project,
            id: Date.now().toString(),
            createdAt: new Date().toISOString()
        });
        this.save();
    }

    updateProject(id, updates) {
        const idx = this.data.projects.findIndex(p => p.id === id);
        if (idx !== -1) {
            this.data.projects[idx] = { ...this.data.projects[idx], ...updates };
            this.save();
        }
    }

    deleteProject(id) {
        this.data.projects = this.data.projects.filter(p => p.id !== id);
        this.save();
    }

    // Subscripcions UI
    subscribe(listener) {
        this.listeners.push(listener);
        return () => { this.listeners = this.listeners.filter(l => l !== listener) };
    }

    notify() {
        this.listeners.forEach(l => l(this.data));
    }
}

export const store = new Store();
