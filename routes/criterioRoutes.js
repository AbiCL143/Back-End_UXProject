const express = require('express');
const router = express.Router();
const Criterio = require('../models/Criterio'); 
const authMiddleware = require('../middleware/authMiddleware');

// Obtener los criterios de una categoría que el usuario tiene permiso de ver
router.get('/categoria/:id_categoria', authMiddleware, async (req, res) => {
    const { id_categoria } = req.params; 
    try {
        const criterios = await Criterio.find({
            id_categoria: id_categoria,
            $or: [
                { id_usuario: req.user.id }, 
                { id_usuario: 0 }            
            ]
        });

        res.json(criterios);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Obtener todos los criterios
router.get('/', authMiddleware, async (req, res) => {
    try {
        // Verificar si el usuario es admin
        if (req.user.rol === 0) { // Suponiendo que el rol 0 es el rol de administrador
            const criterios = await Criterio.find();
            return res.json(criterios);
        }

        // Si no es admin, buscar solo los criterios del usuario o los criterios con id_usuario = 0
        const criteriosDelUsuario = await Criterio.find({
            $or: [
                { id_usuario: req.user.id },   // Criterios del usuario
                { id_usuario: 0 }               // Criterios con id_usuario = 0
            ]
        });

        return res.json(criteriosDelUsuario);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});


// Crear un nuevo criterio
router.post('/nuevo-criterio', authMiddleware, async (req, res) => {
    if (req.user.rol !== 0 && req.user.rol !== 1) { 
        return res.status(403).json({ mensaje: 'Acceso denegado. Solo los administradores y usuarios registrados pueden añadir criterios.' });
    }

    const criterio = new Criterio(req.body);
    try {
        const nuevoCriterio = await criterio.save();
        res.status(201).json(nuevoCriterio);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


// Obtener un criterio específico
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        // Buscar el criterio por su ID
        const criterio = await Criterio.findOne({ ID_criterio: req.params.id });

        // Verificar si el criterio existe
        if (!criterio) {
            return res.status(404).json({ mensaje: 'Criterio no encontrado' });
        }

        // Verificar si el usuario tiene acceso al criterio
        if (criterio.id_usuario !== req.user.id && criterio.id_usuario !== 0) {
            return res.status(403).json({ mensaje: 'Acceso denegado. No tienes permiso para ver este criterio.' });
        }

        res.status(200).json(criterio);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener criterio' });
    }
});


// Actualizar un criterio
router.put('/actualizar/:id', authMiddleware, async (req, res) => {
    try {
        // Obtener el criterio a modificar
        const criterio = await Criterio.findOne({ ID_criterio: req.params.id });
        
        if (!criterio) {
            return res.status(404).json({ mensaje: 'Criterio no encontrado' });
        }

        // Verificar si el usuario tiene el rol de administrador
        if (req.user.rol === 0) {
            // El administrador puede editar cualquier campo
            const criterioModificado = await Criterio.findOneAndUpdate(
                { ID_criterio: req.params.id },
                req.body,
                { new: true } 
            );
            return res.status(200).json(criterioModificado);
        }

        // Si no es administrador, solo permite editar id_categoria
        if (req.body.id_categoria !== undefined) {
            const criterioModificado = await Criterio.findOneAndUpdate(
                { ID_criterio: req.params.id },
                { id_categoria: req.body.id_categoria }, // Solo actualizar id_categoria
                { new: true }
            );
            return res.status(200).json(criterioModificado);
        }

        // Verificar si el usuario es el dueño del criterio para otros campos
        if (criterio.id_usuario.toString() !== req.user.id.toString()) {
            return res.status(403).json({ mensaje: 'Acceso denegado. Solo el administrador o el dueño del criterio pueden editarlo.' });
        }

        // Si es dueño, se permite la actualización de otros campos
        const criterioModificado = await Criterio.findOneAndUpdate(
            { ID_criterio: req.params.id },
            req.body,
            { new: true } // Devuelve el criterio modificado
        );

        res.status(200).json(criterioModificado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al modificar criterio' });
    }
});



// Eliminar un criterio
router.delete('/eliminar/:id', authMiddleware, async (req, res) => {
    try {
        // Buscar el criterio que se desea eliminar
        const criterio = await Criterio.findOne({ ID_criterio: req.params.id });

        // Verificar si el criterio existe
        if (!criterio) {
            return res.status(404).json({ mensaje: 'Criterio no encontrado' });
        }

        // Verificar si el usuario es el administrador o el dueño del criterio
        if (req.user.rol !== 0 && criterio.id_usuario !== req.user.id) {
            return res.status(403).json({ mensaje: 'Acceso denegado. Solo el administrador o el dueño del criterio pueden eliminarlo.' });
        }

        // Eliminar el criterio
        await Criterio.findOneAndDelete({ ID_criterio: req.params.id });

        res.status(204).json({ mensaje: 'Eliminado correctamente' }); // No hay contenido que devolver
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar criterio' });
    }
});





module.exports = router;
