// services/yaEnvioPromoHoy.js

const Local = require('../models/Local');

module.exports = async function yaEnvioPromoHoy(nombreLocal) {
  const local = await Local.findOne({ nombre: new RegExp(`^${nombreLocal}$`, 'i') });

  if (!local || !local.ultimaPromo) return false;

  const hoy = new Date();
  const ultima = new Date(local.ultimaPromo);

  return (
    hoy.getFullYear() === ultima.getFullYear() &&
    hoy.getMonth() === ultima.getMonth() &&
    hoy.getDate() === ultima.getDate()
  );
};
