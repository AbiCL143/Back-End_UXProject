const mongoose = require('mongoose'); // Importar mongoose
const { Schema } = mongoose; // Desestructurar Schema de mongoose
const AutoIncrement = require('mongoose-sequence')(mongoose); // Importar mongoose-sequence

const criterioSchema = new Schema({
    //ID_criterio: { type: Number, required: true, unique: true }, // Definido como un número
    nombre_criterio: { type: String, required: true },
    id_categoria: { type: Number, required: true }, // Cambiado a un número
    id_usuario: { type: Number, ref: 'Usuario', required: true },
});

criterioSchema.plugin(AutoIncrement, { inc_field: 'ID_criterio' });

module.exports = mongoose.model('Criterio', criterioSchema);
