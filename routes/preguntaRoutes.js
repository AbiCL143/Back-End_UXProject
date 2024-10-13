const express = require('express');
const router = express.Router();
const Pregunta = require('../models/Pregunta');
const Criterio = require('../models/Criterio');
const authMiddleware = require('../middleware/authMiddleware');

// Obtener criterios y preguntas por id_categoria (todos pueden ver las preguntas con id_usuario = 0, pero solo el admin o el dueño puede ver sus preguntas)
router.get('/categoria/:id_categoria', authMiddleware, async (req, res) => {
    const { id_categoria } = req.params;
    const usuarioId = req.user.id;  // ID del usuario autenticado
    const rolUsuario = req.user.rol; // Rol del usuario autenticado (admin o user)

    try {
        // Encontrar criterios por id_categoria
        const criterios = await Criterio.find({ id_categoria: id_categoria });

        if (criterios.length === 0) {
            return res.status(404).json({ message: 'No se encontraron criterios para esta categoría' });
        }

        // Para cada criterio, encontrar las preguntas asociadas
        const criteriosConPreguntas = await Promise.all(
            criterios.map(async (criterio) => {
                // Obtener preguntas asociadas a cada criterio
                const preguntas = await Pregunta.find({ id_criterio: criterio.ID_criterio });

                // Filtrar preguntas: todos pueden ver las preguntas de id_usuario = 0
                const preguntasFiltradas = preguntas.filter((pregunta) => {
                    return pregunta.id_usuario === '0' || pregunta.id_usuario === usuarioId || rolUsuario === 'admin';
                });

                return {
                    criterio: criterio,
                    preguntas: preguntasFiltradas
                };
            })
        );

        res.json(criteriosConPreguntas);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Obtener todas las preguntas 
router.get('/', authMiddleware, async (req, res) => {
    const usuarioId = req.user.id;
    const rolUsuario = req.user.rol;

    try {
        // Obtener todas las preguntas
        const preguntas = await Pregunta.find();
        const preguntasFiltradas = preguntas.filter((pregunta) => {
            // Filtrar preguntas que son del usuario con id 0, del usuario autenticado, o si es admin
            return pregunta.id_usuario === 0 || pregunta.id_usuario === usuarioId || rolUsuario === 'admin';
        });

        res.json(preguntasFiltradas);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Crear una nueva pregunta 
router.post('/nueva-pregunta', authMiddleware, async (req, res) => {
    if (req.user.rol !== 1) {
        return res.status(403).json({ message: 'No tienes permisos para crear preguntas.' });
    }

    // Crear nueva pregunta
    const pregunta = new Pregunta(req.body);
    try {
        const nuevaPregunta = await pregunta.save();
        res.status(201).json(nuevaPregunta);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Obtener una pregunta por ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const pregunta = await Pregunta.findOne({ ID_pregunta: req.params.id });

        if (!pregunta) {
            return res.status(404).json({ mensaje: 'Pregunta no encontrada' });
        }

        // Permitir acceso si la pregunta pertenece al usuario con ID 0
        if (pregunta.id_usuario === 0) {
            return res.status(200).json(pregunta);
        }

        // Verificar si el usuario es el dueño de la pregunta o un administrador
        if (pregunta.id_usuario !== req.user.id && req.user.rol !== 'admin') {
            return res.status(403).json({ mensaje: 'Acceso denegado. No tienes permiso para ver esta pregunta.' });
        }

        res.status(200).json(pregunta);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener la pregunta' });
    }
});



// Actualizar una pregunta (solo admin o dueño)
router.put('/actualizar/:id', authMiddleware, async (req, res) => {
    try {
        // Buscar la pregunta antes de intentar actualizarla
        const pregunta = await Pregunta.findOne({ ID_pregunta: req.params.id });

        if (!pregunta) {
            return res.status(404).json({ mensaje: 'Pregunta no encontrada' });
        }

        // Verificar si el usuario es el dueño de la pregunta o un administrador
        if (pregunta.id_usuario !== req.user.id && req.user.rol !== 'admin') {
            return res.status(403).json({ mensaje: 'Acceso denegado. No tienes permiso para editar esta pregunta.' });
        }

        // Actualizar la pregunta si tiene permisos
        const preguntaModificada = await Pregunta.findOneAndUpdate(
            { ID_pregunta: req.params.id },
            req.body,
            { new: true } // Devolver el documento modificado
        );

        res.status(200).json(preguntaModificada);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al modificar la pregunta' });
    }
});


// Eliminar una pregunta (solo admin o dueño)
router.delete('/eliminar/:id', authMiddleware, async (req, res) => {
    try {
        const pregunta = await Pregunta.findOne({ ID_pregunta: req.params.id });

        if (!pregunta) {
            return res.status(404).json({ mensaje: 'Pregunta no encontrada' });
        }

        if (pregunta.id_usuario !== req.user.id && req.user.rol !== 'admin') {
            return res.status(403).json({ mensaje: 'Acceso denegado. No tienes permiso para eliminar esta pregunta.' });
        }

        await Pregunta.findOneAndDelete({ ID_pregunta: req.params.id });

        res.status(204).json();
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar la pregunta' });
    }
});



module.exports = router;
