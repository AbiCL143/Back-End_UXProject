const Evaluacion = require('../models/evaluacion');
const Software = require('../models/Software');
const Rubrica = require('../models/Rubrica');
const PuntajeCriterio = require('../models/Puntaje_Criterio'); // Asegúrate de importar el modelo de PuntajeCriterio

const obtenerEvaluacionCompleta = async (req, res) => {
    try {
        const idEvaluacion = Number(req.params.id);
        console.log("ID de evaluación:", idEvaluacion);

        // Buscar la evaluación
        const evaluacion = await Evaluacion.findOne({ ID_evaluacion: idEvaluacion });

        if (!evaluacion) {
            console.log("Evaluación no encontrada con ID:", idEvaluacion);
            return res.status(404).json({ message: 'Evaluación no encontrada' });
        }

        // Verificar si el usuario es administrador (rol 0) o dueño de la evaluación
        if (req.user.rol !== 0 && evaluacion.id_usuario !== req.user.id) {
            return res.status(403).json({ message: 'Acceso denegado. Solo el administrador o el dueño pueden ver esta evaluación.' });
        }

        console.log("Evaluación encontrada:", evaluacion);

        // Buscar el software
        const software = await Software.findOne({ ID_software: evaluacion.id_software });

        // Buscar la rúbrica
        const rubrica = await Rubrica.findOne({ ID_rubrica: evaluacion.id_rubrica });

        if (!software) {
            console.log("ID del software desde evaluación:", evaluacion.id_software);
            return res.status(404).json({ message: 'Software no encontrado' });
        }

        if (!rubrica) {
            console.log("ID de la rúbrica desde evaluación:", evaluacion.id_rubrica);
            return res.status(404).json({ message: 'Rúbrica no encontrada' });
        }

        // Buscar los puntajes de criterio asociados a la evaluación
        const puntajes = await PuntajeCriterio.find({ id_evaluacion: evaluacion.ID_evaluacion });

        return res.status(200).json({
            evaluacion: {
                id_evaluacion: evaluacion.ID_evaluacion,
                puntaje_total: evaluacion.puntaje_total,
                promedio: evaluacion.promedio,
                terminado: evaluacion.terminado,
                fecha_evaluacion: evaluacion.fecha_evaluacion,
                software: {
                    ID_software: software.ID_software,
                    nombre_software: software.nombre_software,
                    descripcion: software.descripcion
                },
                rubrica: {
                    id_rubrica: rubrica.id_rubrica,
                    nombre_rubrica: rubrica.nombre_rubrica
                },
                puntajes_criterio: puntajes // Incluir puntajes por criterio
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error al obtener la evaluación completa' });
    }
};

module.exports = {
    obtenerEvaluacionCompleta
};

