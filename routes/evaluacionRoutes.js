const express = require('express');
const router = express.Router();
const Evaluacion = require('../models/evaluacion'); 
const { obtenerEvaluacionCompleta } = require('./evaluacionController');
const authMiddleware = require('../middleware/authMiddleware'); 

//Obtener la información detallada de una evaluación
router.get('/completa/:id', authMiddleware, obtenerEvaluacionCompleta);

// Obtener todas las evaluaciones
router.get('/', authMiddleware, async (req, res) => {
    try {
        let evaluaciones;
        if (req.user.rol === 0) {
            evaluaciones = await Evaluacion.find();
        } else {
            evaluaciones = await Evaluacion.find({ id_usuario: req.user.id });
        }

        res.json(evaluaciones);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Ruta para modificar una evaluación por su ID
router.put('/actualizar/:id', authMiddleware, async (req, res) => {
    try {
        const evaluacion = await Evaluacion.findOne({ ID_evaluacion: req.params.id });

        if (!evaluacion) {
            return res.status(404).json({ mensaje: 'Evaluación no encontrada' });
        }

        if (evaluacion.id_usuario !== req.user.id) {
            return res.status(403).json({ mensaje: 'Acceso denegado. Solo el dueño de la evaluación puede modificarla.' });
        }

        // Verificar si la evaluación está terminada
        if (evaluacion.terminado) {
            return res.status(403).json({ mensaje: 'No se puede modificar la evaluación porque ya está terminada.' });
        }

        // Actualizar la evaluación
        const evaluacionModificada = await Evaluacion.findOneAndUpdate(
            { ID_evaluacion: req.params.id },
            req.body,
            { new: true } 
        );

        res.status(200).json(evaluacionModificada);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al modificar evaluación' });
    }
});


// Obtener una evaluación por ID solo si el usuario es administrador o dueño de la evaluación
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const evaluacion = await Evaluacion.findOne({ ID_evaluacion: req.params.id });

        if (!evaluacion) {
            return res.status(404).json({ mensaje: 'Evaluación no encontrada' });
        }

        if (req.user.rol !== 0 && evaluacion.id_usuario !== req.user.id) {
            return res.status(403).json({ mensaje: 'Acceso denegado. Solo el administrador o el dueño de la evaluación pueden verla.' });
        }

        res.status(200).json(evaluacion);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener evaluación' });
    }
});

// Eliminar una evaluación solo si el usuario es administrador o dueño de la evaluación
router.delete('/eliminar/:id', authMiddleware, async (req, res) => {
    try {
        const evaluacion = await Evaluacion.findOne({ ID_evaluacion: req.params.id });

        if (!evaluacion) {
            return res.status(404).json({ mensaje: 'Evaluación no encontrada' });
        }

        if (req.user.rol !== 0 && evaluacion.id_usuario !== req.user.id) {
            return res.status(403).json({ mensaje: 'Acceso denegado. Solo el administrador o el dueño de la evaluación pueden eliminarla.' });
        }
        await Evaluacion.findOneAndDelete({ ID_evaluacion: req.params.id });

        res.status(204).json(); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar evaluación' });
    }
});


module.exports = router;
