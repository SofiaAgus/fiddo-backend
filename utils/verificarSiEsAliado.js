const Local = require('../models/Local');

module.exports = async function verificarSiEsAliado(numero) {
  try {
    // Normalizamos el formato del número (por las dudas)
    const numeroNormalizado = numero.trim().toLowerCase();

    const aliado = await Local.findOne({ telefono: numeroNormalizado });

    return aliado || null; // si existe, lo devuelve (puede usarse luego)
  } catch (err) {
    console.error('❌ Error al verificar si es aliado:', err);
    return null;
  }
};
