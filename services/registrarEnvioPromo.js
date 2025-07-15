// services/registrarEnvioPromo.js

const Local = require('../models/Local');

module.exports = async function registrarEnvioPromo(nombreLocal) {
  try {
    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());

    await Local.findOneAndUpdate(
      { nombre: new RegExp(`^${nombreLocal}$`, 'i') },
      { ultimoEnvioPromo: hoy }
    );
  } catch (error) {
    console.error('❌ Error al registrar el envío de promo:', error);
  }
};
