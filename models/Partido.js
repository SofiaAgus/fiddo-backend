const mongoose = require('mongoose');

const PartidoSchema = new mongoose.Schema({
  id: { type: String, required: true },
  tipo: { type: String, default: 'partido' },
  nombre: { type: String, required: true },
  incluye: [String]
});

module.exports = mongoose.model('Partido', PartidoSchema);
