const express = require('express');
const app = express();
app.use(express.json());

const PUERTO = process.argv[2] || 8081;
let recursoCompartido = 0;

// GET /datos - Consulta de lectura
app.get('/datos', (req, res) => {
    console.log(` ${PUERTO}-- Petición de lectura recibida. Valor actual: ${recursoCompartido}`);
    res.json({ valor: recursoCompartido });
});

// POST /datos - Actualización sincrónica
app.post('/datos', (req, res) => {
    const { valor } = req.body;
    recursoCompartido = valor;
    console.log(` ${PUERTO}-- Petición de escritura recibida. Nuevo valor: ${recursoCompartido}`);
    res.json({ status: 'ok', nuevoValor: recursoCompartido });
});

app.listen(PUERTO, () => {
    console.log(` ${PUERTO}-- Servidor activo en puerto ${PUERTO}`);
});