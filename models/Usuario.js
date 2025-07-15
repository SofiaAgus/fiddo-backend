const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  telefono: { type: String, required: true, unique: true },
  nombre: String,
  zonasPreferidas: [String],
  localesFavoritos: [String],
  fechaRegistro: { type: Date, default: Date.now },
  tipo: { type: String, default: 'nuevo' }  // 👈 AGREGÁ ESTA LÍNEA
});

module.exports = mongoose.model('Usuario', usuarioSchema);
