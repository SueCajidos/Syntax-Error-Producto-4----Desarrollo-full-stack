const { Schema, model } = require('mongoose');

const usuarioSchema = new Schema({
  nombre:   { type: String, required: true },
  correo:   { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }   // texto plano
});

module.exports = model('Usuario', usuarioSchema);
