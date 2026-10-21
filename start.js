const { fork } = require('child_process');

// Iniciar los 3 servidores de datos réplica
fork('./servidor_datos.js', ['8081']);
fork('./servidor_datos.js', ['8082']);
fork('./servidor_datos.js', ['8083']);

// Iniciar el coordinador central
fork('./coordinador.js');