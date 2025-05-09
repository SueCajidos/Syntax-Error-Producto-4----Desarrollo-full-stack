const { Schema, model } = require('mongoose');

const usuarioSchema = new Schema({
  nombre:   { type: String, required: true },
  correo:   { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  rol:      { type: String, enum: ['admin', 'usuario'], default: 'usuario' }
});

module.exports = model('Usuario', usuarioSchema);
