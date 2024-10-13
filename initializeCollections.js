const mongoose = require('mongoose');
const Categoria = require('./models/categoria'); // Asegúrate de que la ruta sea correcta
const Criterio = require('./models/Criterio'); // Asegúrate de que la ruta sea correcta

async function initializeCollections() {
    try {
        // Verifica si la colección de categorías ya existe
        const collections = await mongoose.connection.db.listCollections({ name: 'categorias' }).toArray();
        
        if (collections.length === 0) {
            console.log('Creando colección de categorías...');
            await Categoria.createCollection();
        } else {
            console.log('La colección de categorías ya existe.');
        }

        // Verifica si la colección de criterios ya existe
        const criterioCollections = await mongoose.connection.db.listCollections({ name: 'criterios' }).toArray();

        if (criterioCollections.length === 0) {
            console.log('Creando colección de criterios...');
            await Criterio.createCollection();
        } else {
            console.log('La colección de criterios ya existe.');
        }
        
    } catch (err) {
        console.error('Error al inicializar colecciones:', err);
    }
}

module.exports = { initializeCollections };
