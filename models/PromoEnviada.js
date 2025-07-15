// models/PromoEnviada.js

const mongoose = require('mongoose');

const promoEnviadaSchema = new mongoose.Schema({
  telefono: { type: String, required: true },
  fecha: { type: Date, required: true }
});

module.exports = mongoose.model('PromoEnviada', promoEnviadaSchema);
