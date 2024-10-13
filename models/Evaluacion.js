const mongoose = require('mongoose'); 
const { Schema } = mongoose; 
const AutoIncrement = require('mongoose-sequence')(mongoose); 

const evaluacionSchema = new Schema({
    //ID_evaluacion: { type: Number, required: true, unique: true }, 
    id_software: { type: Number, ref: 'Software', required: true },
    id_rubrica: { type: Number, ref: 'Rubrica', required: true },
    id_usuario: { type: Number, ref: 'Usuario', required: true },
    puntaje_total: { type: Number, required: false },
    promedio: { type: Number, required: false }, 
    terminado: { type: Boolean, required: true, default: false }, 
    fecha_evaluacion: { type: Date, default: Date.now }
  });

  evaluacionSchema.plugin(AutoIncrement, { inc_field: 'ID_evaluacion' });
  
  module.exports = mongoose.model('Evaluacion', evaluacionSchema);
  