const mongoose = require('mongoose'); // Importar mongoose
const { Schema } = mongoose; // Desestructurar Schema de mongoose
const AutoIncrement = require('mongoose-sequence')(mongoose); // Importar mongoose-sequence

const categoriaSchema = new Schema({
    nombre_categoria: { type: String, required: true },
    descripcion: { type: String }
});

categoriaSchema.plugin(AutoIncrement, { inc_field: 'ID_categoria' });

module.exports = mongoose.model('Categoria', categoriaSchema);
