const mongoose = require('mongoose');
const { Schema } = mongoose; 
const AutoIncrement = require('mongoose-sequence')(mongoose); 

const rubricaSchema = new Schema({
    //ID_rubrica: { type: Number, required: true, unique: true }, 
    nombre_rubrica: { type: String, required: true },
    id_usuario: { type: Number, ref: 'Usuario', required: true },
    categorias: [{ type: Number, ref: 'Categoria' }]  
  });

  rubricaSchema.plugin(AutoIncrement, { inc_field: 'ID_rubrica' });
  
  module.exports = mongoose.model('Rubrica', rubricaSchema);
  