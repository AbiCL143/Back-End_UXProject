const express = require('express');
const router = express.Router();
const PuntajeCriterio = require('../models/Puntaje_Criterio'); 
const authMiddleware = require('../middleware/authMiddleware'); 

// Obtener todos los puntajes de criterio del usuario autenticado
router.get('/', authMiddleware, async (req, res) => {
    const usuarioId = req.user.id; 

    try {
        const puntajesCriterio = await PuntajeCriterio.find({ id_usuario: usuarioId });

        if (puntajesCriterio.length === 0) {
            return res.status(404).json({ message: 'No se encontraron puntajes para este usuario.' });
        }

        res.json(puntajesCriterio);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Crear un nuevo puntaje de criterio
router.post('/nuevo-puntaje', async (req, res) => {
    const puntajeCriterio = new PuntajeCriterio(req.body);
    try {
        const nuevoPuntajeCriterio = await puntajeCriterio.save();
        res.status(201).json(nuevoPuntajeCriterio);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Obtener un puntaje de criterio por ID
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const puntaje = await PuntajeCriterio.findOne({ ID_puntaje: req.params.id });

        if (!puntaje) {
            return res.status(404).json({ mensaje: 'Puntaje no encontrado' });
        }

        if (puntaje.id_usuario !== req.user.id) {
            return res.status(403).json({ mensaje: 'Acceso denegado. No tienes permiso para ver este puntaje.' });
        }

        res.status(200).json(puntaje);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener puntaje' });
    }
});

// Actualizar un puntaje de criterio
router.put('/actualizar/:id', authMiddleware, async (req, res) => {
    try {
        const puntaje = await PuntajeCriterio.findOne({ ID_puntaje: req.params.id });

        if (!puntaje) {
            return res.status(404).json({ mensaje: 'Puntaje no encontrado' });
        }

        if (puntaje.id_usuario !== req.user.id) {
            return res.status(403).json({ mensaje: 'Acceso denegado. No tienes permiso para editar este puntaje.' });
        }

        const puntajeModificado = await PuntajeCriterio.findOneAndUpdate(
            { ID_puntaje: req.params.id },
            req.body,
            { new: true } 
        );

        res.status(200).json(puntajeModificado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al modificar puntaje' });
    }
});


// Eliminar un puntaje de criterio
router.delete('/eliminar/:id', authMiddleware, async (req, res) => {
    try {
        const puntaje = await PuntajeCriterio.findOne({ ID_puntaje: req.params.id });

        if (!puntaje) {
            return res.status(404).json({ mensaje: 'Puntaje no encontrado' });
        }

        if (puntaje.id_usuario !== req.user.id) {
            return res.status(403).json({ mensaje: 'Acceso denegado. No tienes permiso para eliminar este puntaje.' });
        }

        await PuntajeCriterio.findOneAndDelete({ ID_puntaje: req.params.id });
        res.status(204).json(); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar puntaje' });
    }
});




module.exports = router;
