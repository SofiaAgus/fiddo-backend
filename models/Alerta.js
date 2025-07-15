const mongoose = require('mongoose');

const alertaSchema = new mongoose.Schema({
  telefono: { type: String, required: true },  // Referencia indirecta al usuario
  locales: [String],                           // Ej: ["El Bosque Padel", "Punto de Oro"]
  categoria: String,                           // Ej: "padel", "peluquería"
  diasHorarios: {
    type: Map,
    of: new mongoose.Schema({
      desde: String,                           // Ej: "18"
      hasta: String,                           // Ej: "22"
      horas: [String]                          // Alternativa cuando no hay rango
    }),
    default: {}
  },
  activa: { type: Boolean, default: true },
  fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Alerta', alertaSchema);
