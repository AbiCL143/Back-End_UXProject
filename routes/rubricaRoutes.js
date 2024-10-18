const express = require('express');
const router = express.Router();
const Rubrica = require('../models/Rubrica');
const Criterio = require('../models/Criterio');
const Pregunta = require('../models/Pregunta');
const authMiddleware = require('../middleware/authMiddleware'); 

router.get('/completa/:id_rubrica', authMiddleware, async (req, res) => {
    const { id_rubrica } = req.params;

    try {
        // Buscar la rúbrica por su ID
        const rubrica = await Rubrica.findOne({ ID_rubrica: Number(id_rubrica) });

        if (!rubrica) {
            return res.status(404).json({ message: 'Rúbrica no encontrada' });
        }

        // Si es rúbrica 0 (pública), permitir acceso a todos
        if (id_rubrica === '0') {
            const categorias = rubrica.categorias;
            const criteriosSeleccionados = rubrica.criterios; // Los criterios que seleccionaste

            // Obtener categorías desglosadas con criterios seleccionados
            const categoriasDesglosadas = await Promise.all(categorias.map(async (categoriaId) => {
                // Buscar los criterios de esta categoría que están en los criterios seleccionados
                const criterios = await Criterio.find({
                    id_categoria: categoriaId,
                    ID_criterio: { $in: criteriosSeleccionados }
                });

                const criteriosDesglosados = await Promise.all(criterios.map(async (criterio) => {
                    const preguntas = await Pregunta.find({ id_criterio: criterio.ID_criterio });
                    return {
                        ...criterio._doc,
                        preguntas: preguntas
                    };
                }));

                return {
                    id_categoria: categoriaId,
                    criterios: criteriosDesglosados
                };
            }));

            return res.json({
                ...rubrica._doc,
                categorias: categoriasDesglosadas
            });
        }

        // Si no es la rúbrica 0, requerir autenticación
        const idUsuario = req.user?.id; // ID del usuario autenticado, si existe
        const rolUsuario = req.user?.rol; // Rol del usuario autenticado, si existe
        console.log('idUsuario:', idUsuario);
        if (!idUsuario) {
            return res.status(403).json({ message: 'Acceso denegado. No tienes permiso para ver esta rúbrica.' });
        }

        // Verificar si el usuario es el propietario o admin
        if (rubrica.id_usuario !== idUsuario && rolUsuario !== 0) {
            return res.status(403).json({ message: 'Acceso denegado. No tienes permiso para ver esta rúbrica.' });
        }

        // Obtener las categorías relacionadas con la rúbrica
        const categorias = rubrica.categorias;
        const criteriosSeleccionados = rubrica.criterios; // Los criterios que seleccionaste

        // Obtener categorías desglosadas con criterios seleccionados
        const categoriasDesglosadas = await Promise.all(categorias.map(async (categoriaId) => {
            const criterios = await Criterio.find({
                id_categoria: categoriaId,
                ID_criterio: { $in: criteriosSeleccionados }
            });

            const criteriosDesglosados = await Promise.all(criterios.map(async (criterio) => {
                const preguntas = await Pregunta.find({ id_criterio: criterio.ID_criterio });
                return {
                    ...criterio._doc,
                    preguntas: preguntas
                };
            }));

            return {
                id_categoria: categoriaId,
                criterios: criteriosDesglosados
            };
        }));

        res.json({
            ...rubrica._doc,
            categorias: categoriasDesglosadas
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});





// Crear una nueva rúbrica (solo para usuarios autenticados)
router.post('/nueva-rubrica', authMiddleware, async (req, res) => {
    try {
        // Incluye el ID del usuario autenticado en la nueva rúbrica
        const nuevaRubrica = new Rubrica({
            ...req.body,
            id_usuario: req.user.id
        });

        await nuevaRubrica.save();
        res.status(201).json(nuevaRubrica);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Obtener todas las rúbricas del usuario autenticado y la rúbrica general
router.get('/', authMiddleware, async (req, res) => {
    try {
        const idUsuario = req.user.id;
        const rubricaGeneral = await Rubrica.findOne({ ID_rubrica: 0 });
        const rubricasUsuario = await Rubrica.find({ id_usuario: idUsuario });
        const todasRubricas = [rubricaGeneral, ...rubricasUsuario];

        res.status(200).json(todasRubricas);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});


// Obtener una rúbrica específica (solo el usuario propietario o admin pueden acceder)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const idUsuario = req.user.id; // ID del usuario autenticado
        const rolUsuario = req.user.rol; // Rol del usuario autenticado
        const rubrica = await Rubrica.findOne({ ID_rubrica: req.params.id });

        if (!rubrica) {
            return res.status(404).json({ mensaje: 'Rúbrica no encontrada' });
        }
        if (rubrica.id_usuario !== idUsuario && rolUsuario !== 0) {
            return res.status(403).json({ mensaje: 'Acceso denegado. No tienes permiso para ver esta rúbrica.' });
        }

        res.status(200).json(rubrica);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al obtener rúbrica' });
    }
});


// Actualizar una rúbrica
router.put('/actualizar/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params; 
        const idUsuario = req.user.id; 

        const rubricaModificado = await Rubrica.findOneAndUpdate(
            { ID_rubrica: id, id_usuario: idUsuario }, 
            req.body,
            { new: true }
        );

        if (!rubricaModificado) {
            return res.status(404).json({ mensaje: 'Rúbrica no encontrada o no tienes permiso para modificarla.' });
        }

        res.status(200).json(rubricaModificado);
    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al modificar la rúbrica' });
    }
});


// Eliminar una rúbrica (solo el admin o el dueño de la rúbrica pueden eliminarla, excepto la rúbrica 0 que solo puede ser eliminada por el admin)
router.delete('/eliminar/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;  
        const usuarioId = req.user.id;  
        const rolUsuario = req.user.rol;  

        if (id === '0' && rolUsuario !== 'admin') {
            return res.status(403).json({ mensaje: 'No tienes permisos para eliminar la rúbrica general.' });
        }

        const rubrica = await Rubrica.findOne({ ID_rubrica: id });

        if (!rubrica) {
            return res.status(404).json({ mensaje: 'Rúbrica no encontrada' });
        }

        if (rubrica.id_usuario !== usuarioId && rolUsuario !== 'admin') {
            return res.status(403).json({ mensaje: 'No tienes permiso para eliminar esta rúbrica.' });
        }

        // Eliminar la rúbrica
        await Rubrica.findOneAndDelete({ ID_rubrica: id });
        res.status(204).json(); 

    } catch (error) {
        console.error(error);
        res.status(500).json({ mensaje: 'Error al eliminar la rúbrica' });
    }
});


module.exports = router;
