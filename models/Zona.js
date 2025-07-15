const mongoose = require('mongoose');

const zonaSchema = new mongoose.Schema({
  id: { type: String, required: true },
  tipo: { type: String, required: true }, // "zona" o "partido"
  nombre: { type: String, required: true },
  incluye: { type: [String], required: true } // Lista de partidos o localidades
});

module.exports = mongoose.model('Zona', zonaSchema, 'zonas');
