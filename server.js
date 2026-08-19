const express = require('express');
const cors = require('cors');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dataDir = path.join(__dirname, 'data');
const storeFile = path.join(dataDir, 'db.json');

// Assegurem que el fitxer JSON existeixi amb l'estructura inicial
async function initStore() {
    try {
        await fs.mkdir(dataDir, { recursive: true });
        try {
            await fs.access(storeFile);
        } catch {
            const initialData = { tasks: [], projects: [] };
            await fs.writeFile(storeFile, JSON.stringify(initialData, null, 2), 'utf8');
        }
    } catch (error) {
        console.error("Error inicialitzant les dades local:", error);
    }
}
initStore();

app.get('/api/data', async (req, res) => {
    try {
        const data = await fs.readFile(storeFile, 'utf8');
        res.json(JSON.parse(data));
    } catch (error) {
        res.status(500).json({ error: "Error de lectura de dades" });
    }
});

app.post('/api/data', async (req, res) => {
    try {
        await fs.writeFile(storeFile, JSON.stringify(req.body, null, 2), 'utf8');
        res.json({ success: true });
    } catch (error) {
        console.error("Save error:", error);
        res.status(500).json({ error: "Error d'escriptura de dades" });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor escoltant al port ${PORT}`);
});
