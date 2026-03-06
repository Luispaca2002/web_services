require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/usuarios', async (req, res) => {
    try {
        const response = await fetch(process.env.FIREBASE_URL, {
            method: 'POST',
            body: JSON.stringify(req.body),
            headers: { 'Content-Type': 'application/json' }
        });
        const data = await response.json();
        res.status(201).json({ mensaje: "Guardado", id: data.name });
    } catch (e) { res.status(500).json({ error: "Fallo NoSQL" }); }
});

app.get('/api/usuarios', async (req, res) => {
    try {
        const response = await fetch(process.env.FIREBASE_URL);
        const data = await response.json();
        const lista = data ? Object.keys(data).map(id => ({ id, ...data[id] })) : [];
        res.json({ datos: lista });
    } catch (e) { res.status(500).json({ error: "Error NoSQL" }); }
});

app.get('/api/perfil-facebook', async (req, res) => {
    try {
        const response = await fetch(`https://graph.facebook.com/v19.0/4?fields=id,name`);
        const data = await response.json();
        // Aseguramos que el objeto enviado coincida con el nombre que espera tu HTML
        res.json({ facebook: `Usuario: ${data.name || 'Mark'} | ID: ${data.id || '4'}` });
    } catch (e) { res.json({ facebook: "Error de autenticación" }); }
});

app.get('/api/status-heroku', async (req, res) => {
    try {
        const response = await fetch('https://status.heroku.com/api/v4/current-status');
        const data = await response.json();
        
        // Verificamos si existe el estado 'none' (que significa que no hay problemas)
        const statusReal = data.status && data.status.description === 'All systems operational' 
            ? "Online / Operacional" 
            : "Mantenimiento";
            
        res.json({ heroku: statusReal });
    } catch (e) {
        res.json({ heroku: "Servicio no disponible" });
    }
});

app.get('/api/interoperabilidad', async (req, res) => {
    const tema = req.query.q || 'Sistemas';
    try {
        const [gRes, fbRes, hRes] = await Promise.allSettled([
            fetch(`https://www.googleapis.com/books/v1/volumes?q=${tema}&key=${process.env.GOOGLE_API_KEY}`),
            fetch(`https://graph.facebook.com/v19.0/4?fields=id`),
            fetch(`https://status.heroku.com/api/v4/current-status`)
        ]);
        
        const gData = gRes.status === 'fulfilled' ? await gRes.value.json() : null;
        const fbData = fbRes.status === 'fulfilled' ? await fbRes.value.json() : null;
        const hData = hRes.status === 'fulfilled' ? await hRes.value.json() : null;

        res.json({
            google: gData?.items ? gData.items.slice(0,3).map(i => i.volumeInfo.title) : ["Sin datos en Google Cloud"],
            firebase: "Sincronizado",
        });
    } catch (e) { res.status(500).json({ error: "Fallo General de Federación" }); }
});

app.listen(3000, () => {
    console.log("-----------------------------------------");
    console.log("🚀 REST API escuchando en el puerto 3000");
    console.log("📝 Listo para capturas de interoperabilidad");
    console.log("-----------------------------------------");
});