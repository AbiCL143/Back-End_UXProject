const express = require('express');
const router = express.Router();
const Categoria = require('../models/categoria'); // Modelo de Categoría
const authMiddleware = require('../middleware/authMiddleware'); // Asegúrate de que la ruta sea correcta


// Obtener todas las categorías
router.get('/', async (req, res) => {
    try {
        const categorias = await Categoria.find();
        res.json(categorias);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Crear una nueva categoría
router.post('/nueva-categoria', authMiddleware, async (req, res) => {
    // Verificar si el usuario tiene el rol de administrador
    if (req.user.rol !== 0) { // Suponiendo que el rol 0 es el de admin
        return res.status(403).json({ message: 'Acceso denegado. Solo el administrador puede crear categorías.' });
    }

    const categoria = new Categoria(req.body);
    try {
        const nuevaCategoria = await categoria.save();
        res.status(201).json(nuevaCategoria);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Obtener una categoría por ID
router.get('/:id', async (req, res) => {
    try {
        // Convertir a número para buscar en la base de datos
        const categoria = await Categoria.findOne({ ID_categoria: parseInt(req.params.id) });
        if (!categoria) {
            return res.status(404).json({ mensaje: 'Categoría no encontrada' });
        }
        res.status(200).json(categoria);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener categoría' });
    }
});

// Actualizar una categoría
router.put('/actualizar/:id', authMiddleware, async (req, res) => {
    // Verificar si el usuario tiene el rol de administrador
    if (req.user.rol !== 0) { // Suponiendo que el rol 0 es el de admin
        return res.status(403).json({ mensaje: 'Acceso denegado. Solo el administrador puede actualizar categorías.' });
    }

    try {
        // Convertir a número para buscar en la base de datos
        const categoriaModificada = await Categoria.findOneAndUpdate(
            { ID_categoria: parseInt(req.params.id) }, // Convierte a entero
            req.body,
            { new: true } // Devuelve la categoría modificada
        );

        if (!categoriaModificada) {
            return res.status(404).json({ mensaje: 'Categoría no encontrada' });
        }

        res.status(200).json(categoriaModificada);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al modificar categoría' });
    }
});


// Eliminar una categoría
router.delete('/eliminar/:id', authMiddleware, async (req, res) => {
    // Verificar si el usuario tiene el rol de administrador
    if (req.user.rol !== 0) { // Suponiendo que el rol 0 es el de admin
        return res.status(403).json({ mensaje: 'Acceso denegado. Solo el administrador puede eliminar categorías.' });
    }

    try {
        // Convertir a número para buscar en la base de datos
        const categoriaEliminada = await Categoria.findOneAndDelete({ ID_categoria: parseInt(req.params.id) });

        if (!categoriaEliminada) {
            return res.status(404).json({ mensaje: 'Categoría no encontrada' });
        }

        res.status(204).json({ mensaje: 'Eliminado con éxito' }); // No hay contenido que devolver
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar categoría' });
    }
});


module.exports = router;
