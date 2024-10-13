const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { initializeCollections } = require('./initializeCollections'); // Importar la inicialización de colecciones
//Importar las rutas
const usuarioRoutes = require('./routes/usuariosRoutes'); 
const categoriasRoutes = require('./routes/categoriaRoutes'); 
const criteriosRoutes = require('./routes/criterioRoutes');
const preguntasRoutes = require('./routes/preguntaRoutes');
const rubricaRoutes = require('./routes/rubricaRoutes');
const softwareRoutes = require('./routes/softwareRoutes');
const evaluacionRouter = require('./routes/evaluacionRoutes');
const puntajeRoutes = require('./routes/puntaje_criterioRoutes');

require('dotenv').config(); // Cargar las variables de entorno


// Configura tu aplicación
const app = express();
app.use(bodyParser.json());

// Conexión a MongoDB
const mongoURI = 'mongodb://localhost:27017/UXProject'; // Cambia esto según tu configuración
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log('Conectado a MongoDB');
        return initializeCollections(); // Llama a la función para inicializar las colecciones
    })
    .catch(err => {
        console.error('Error de conexión a MongoDB:', err);
    });

// Usar las rutas
app.use('/usuarios', usuarioRoutes);
app.use('/categorias', categoriasRoutes); 
app.use('/criterios', criteriosRoutes);
app.use('/preguntas', preguntasRoutes);
app.use('/rubricas', rubricaRoutes);
app.use('/softwares', softwareRoutes);
app.use('/evaluaciones', evaluacionRouter);
app.use('/puntajes', puntajeRoutes);

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
