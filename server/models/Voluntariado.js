const { Schema, model, Types } = require('mongoose');

const voluntariadoSchema = new Schema(
  {
    titulo:      { type: String, required: true },
    usuario:     { type: Types.ObjectId, ref: 'Usuario', required: true },
    fecha:       { type: Date, required: true },
    descripcion: String,
    tipo:        { type: String, enum: ['Petición', 'Oferta'], required: true }
  },
  { timestamps: true }
);

module.exports = model('Voluntariado', voluntariadoSchema);
