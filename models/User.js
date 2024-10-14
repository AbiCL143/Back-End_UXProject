const mongoose = require('mongoose'); // Importar mongoose
const { Schema } = mongoose; // Desestructurar Schema de mongoose
const AutoIncrement = require('mongoose-sequence')(mongoose); // Importar mongoose-sequence

const userSchema = new Schema({
    ID_usuario: { type: Number, required: true, unique: true }, // Definido como un número
    nombre: { type: String, required: true },
    apellido_p: { type: String, required: true },
    apellido_m: { type: String, required: true },
    usuario: { type: String, required: true, unique: true },
    correo: { type: String, required: true, unique: true },
    contraseña: { type: String, required: true },
    rol: { type: Number, required: true },
    fecha_registro: { type: Date, default: Date.now }
});

userSchema.plugin(AutoIncrement, { inc_field: 'ID_usuario' });
  
module.exports = mongoose.model('Usuario', userSchema);

