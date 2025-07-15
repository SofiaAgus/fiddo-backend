const mongoose = require('mongoose');

const AliadoSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  rubro: String,
  zona: String,
  partido: String,
  localidad: String,
  direccion: String,
  contacto: String,
  reputacion: String,
  promociones: [String]
});

module.exports = mongoose.model('Aliado', AliadoSchema, 'locales'); // 👈 usa la colección 'locales'
