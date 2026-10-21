const express = require('express');
const app = express();
app.use(express.json());

// Nuestros permisos CORS para permitir solicitudes desde cualquier origen
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

const PUERTO_COORDINADOR = process.env.PORT || 8080;
const servidoresDatos = [
    'http://localhost:8081',
    'http://localhost:8082',
    'http://localhost:8083'
];

let turnoRR = 0;
let enEscritura = false;

//Activar la interfaz de usuario para el coordinador
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Funcion GET para la solicitud de lectura
app.get('/api/recurso', async (req, res) => {
    while (enEscritura) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    const servidorElegido = servidoresDatos[turnoRR];
    turnoRR = (turnoRR + 1) % servidoresDatos.length;

    try {
        const respuesta = await fetch(`${servidorElegido}/datos`);
        const data = await respuesta.json();
        console.log(`[Coordinador] Lectura pedida a ${servidorElegido} -> Valor: ${data.valor}`);
        res.json({ valor: data.valor, atendidoPor: servidorElegido });
    } catch (error) {
        res.status(500).json({ error: 'Error al conectar con la réplica de datos' });
    }
});

// Funcion POST para la solicitud de escritura
app.post('/api/recurso', async (req, res) => {
    const { incremento } = req.body;

    while (enEscritura) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    enEscritura = true;

    try {
        console.log(`[Coordinador] Escritura pedida. Valor a incrementar: ${incremento}`);

        // 1. Obtener el valor actual del servidor
        const respGET = await fetch(`${servidoresDatos[0]}/datos`);
        const dataGET = await respGET.json();
        const nuevoValor = dataGET.valor + parseInt(incremento);

        // 2. Enviar la actualización a todos los servidores de datos
        for (const urlServidor of servidoresDatos) {
            await fetch(`${urlServidor}/datos`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ valor: nuevoValor })
            });
        }

        console.log(`[Coordinador] Escritura realizada con éxito. Nuevo total: ${nuevoValor}\n`);
        res.json({ status: 'ok', nuevoValor: nuevoValor });

    } catch (error) {
        res.status(500).json({ error: 'Error durante la escritura' });
    } finally {
        enEscritura = false;
    }
});

app.listen(PUERTO_COORDINADOR, () => {
    console.log(`  Coordinador activo en puerto ${PUERTO_COORDINADOR}`);
    console.log(`---------------------------------------------------------------`);
});