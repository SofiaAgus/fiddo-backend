// utils/obtenerPromos.js

const Local = require('../models/Local');

module.exports = async function obtenerPromos(rubro = null, zona = null) {
  const query = {
    promocion: { $exists: true, $ne: '' } // solo locales con promoción activa
  };

  if (rubro) {
    query.rubro = new RegExp(rubro, 'i'); // case-insensitive
  }

  if (zona) {
    query.zona = new RegExp(zona, 'i');
  }

  try {
    const locales = await Local.find(query);
    return locales.map(local => ({
      nombre: local.nombre,
      promo: local.promocion
    }));
  } catch (error) {
    console.error('❌ Error al obtener promociones:', error);
    return [];
  }
};
