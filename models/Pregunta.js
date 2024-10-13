const mongoose = require('mongoose'); // Importar mongoose
const { Schema } = mongoose; // Desestructurar Schema de mongoose
const AutoIncrement = require('mongoose-sequence')(mongoose); // Importar mongoose-sequence

  const preguntaSchema = new Schema({
    id_criterio: { type: Number, ref: 'Criterio', required: true },  
    pregunta: { type: String, required: true },  
    id_rubrica: { type: Number, ref: 'Rubrica' },
    id_usuario: { type: Number, ref: 'Usuario', required: true },
  });

  preguntaSchema.plugin(AutoIncrement, { inc_field: 'ID_pregunta' });
  
  module.exports = mongoose.model('Pregunta', preguntaSchema);
  
  