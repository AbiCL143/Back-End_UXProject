const mongoose = require('mongoose'); // Importar mongoose
const { Schema } = mongoose; // Desestructurar Schema de mongoose
const AutoIncrement = require('mongoose-sequence')(mongoose); // Importar mongoose-sequence

const softwareSchema = new Schema({
    //ID_software: { type: Number, required: true, unique: true }, // Definido como un número
    id_usuario: { type: Number, ref: 'Usuario', required: true },
    nombre_software: { type: String, required: true },
    descripcion: { type: String, required: true },
    fecha_lanzamiento: { type: Date, required: false}
  });

  softwareSchema.plugin(AutoIncrement, { inc_field: 'ID_software' });
  
  module.exports = mongoose.model('Software', softwareSchema);
  