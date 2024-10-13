const mongoose = require('mongoose'); // Importar mongoose
const { Schema } = mongoose; // Desestructurar Schema de mongoose
const AutoIncrement = require('mongoose-sequence')(mongoose); // Importar mongoose-sequence

const puntajeCriterioSchema = new Schema({
  id_rubrica: { type: Number, ref: 'Rubrica', required: true },  // Relación con la rúbrica
  id_criterio: { type: Number, ref: 'Criterio', required: true }, // Relación con el criterio
  id_evaluacion: { type: Number, ref: 'Evaluacion', required: true }, // Relación con la evaluación
  id_usuario: { type: Number, ref: 'Usuario', required: true },
  puntaje: { 
    type: Number, 
    required: true, 
    min: 1, // Valor mínimo
    max: 5  // Valor máximo
  },
  fecha_evaluacion: { type: Date, default: Date.now } // Fecha de evaluación
});

puntajeCriterioSchema.plugin(AutoIncrement, { inc_field: 'ID_puntaje' });

module.exports = mongoose.model('PuntajeCriterio', puntajeCriterioSchema);
