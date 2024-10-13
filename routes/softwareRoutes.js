const express = require('express');
const router = express.Router();
const Software = require('../models/Software'); 
const authMiddleware = require('../middleware/authMiddleware'); 

// Crear un nuevo software
router.post('/nuevo-software', async (req, res) => {
    const software = new Software(req.body);
    try {
        const nuevoSoftware = await software.save();
        res.status(201).json(nuevoSoftware);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Obtener todos los softwares (solo el administrador o el dueño pueden ver sus propios softwares)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const usuarioId = req.user.id;  
        const rolUsuario = req.user.rol;  

        let softwares;

        if (rolUsuario === 'admin') {
            softwares = await Software.find();
        } else {
            softwares = await Software.find({ id_usuario: usuarioId });
        }

        if (!softwares || softwares.length === 0) {
            return res.status(404).json({ mensaje: 'No se encontraron softwares.' });
        }

        res.json(softwares);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// Obtener un software por ID (solo el administrador o el dueño pueden verlo)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const software = await Software.findOne({ ID_software: req.params.id });
        
        if (!software) {
            return res.status(404).json({ mensaje: 'Software no encontrado' });
        }

        const usuarioId = req.user.id; 
        const rolUsuario = req.user.rol;  

        if (software.id_usuario !== usuarioId && rolUsuario !== 'admin') {
            return res.status(403).json({ mensaje: 'Acceso denegado. No tienes permiso para ver este software.' });
        }

        res.status(200).json(software);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener software' });
    }
});


// Actualizar un software (solo el dueño puede modificarlo)
router.put('/actualizar/:id', authMiddleware, async (req, res) => {
    try {
        // Buscar el software por ID
        const software = await Software.findOne({ ID_software: req.params.id });

        if (!software) {
            return res.status(404).json({ mensaje: 'Software no encontrado' });
        }

        // Verificar si el usuario es el dueño del software
        const usuarioId = req.user.id;  // ID del usuario autenticado
        if (software.id_usuario !== usuarioId) {
            return res.status(403).json({ mensaje: 'Acceso denegado. Solo el dueño puede modificar este software.' });
        }

        // Actualizar el software
        const softwareModificado = await Software.findOneAndUpdate(
            { ID_software: req.params.id },
            req.body,
            { new: true } 
        );

        res.status(200).json(softwareModificado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al modificar software' });
    }
});


// Eliminar un software (solo el admin o el dueño pueden eliminarlo)
router.delete('/eliminar/:id', authMiddleware, async (req, res) => {
    try {
        // Buscar el software por ID
        const software = await Software.findOne({ ID_software: req.params.id });

        if (!software) {
            return res.status(404).json({ mensaje: 'Software no encontrado' });
        }

        // Verificar si el usuario es el dueño o es un administrador
        const usuarioId = req.user.id;  // ID del usuario autenticado
        const rolUsuario = req.user.rol; // Rol del usuario autenticado (admin o user)

        if (software.id_usuario !== usuarioId && rolUsuario !== 'admin') {
            return res.status(403).json({ mensaje: 'Acceso denegado. Solo el dueño o un administrador pueden eliminar este software.' });
        }

        // Eliminar el software
        await Software.findOneAndDelete({ ID_software: req.params.id });

        res.status(204).json(); // No hay contenido que devolver
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar software' });
    }
});


module.exports = router;
