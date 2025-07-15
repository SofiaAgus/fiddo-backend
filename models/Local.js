const mongoose = require('mongoose');

const localSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  nombreNormalizado: { type: String, index: true }, // 🆕 nuevo campo
  rubro: { type: String, required: true },
  zona: { type: String },
  partido: { type: String },
  localidad: { type: String, required: true },
  direccion: { type: String },
  contacto: { type: String },
  reputacion: { type: String },
  promociones: [{ type: String }],
  codigoFiddo: { type: String, unique: true, sparse: true },

  // 🆕 Nuevos campos para locales premium
  promoPerfil: { type: String },         // visible al entrar al perfil
  promoPush: { type: String },           // última enviada como mensaje push
  ultimaPromoPush: { type: Date }        // control para limitar a 1 por día
});

module.exports = mongoose.model('Local', localSchema, 'locales');
