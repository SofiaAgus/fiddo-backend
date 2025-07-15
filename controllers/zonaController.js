const Zona = require('../models/Zona');
const { mapearZonas } = require('../utils/mapearZonas');

async function obtenerZonasOrganizadas() {
  try {
    const zonas = await Zona.find({ tipo: 'zona' });       // 🔧 solo zonas
    const partidos = await Zona.find({ tipo: 'partido' }); // 🔧 solo partidos
    const zonasMapeadas = mapearZonas(zonas, partidos);
    return zonasMapeadas;
  } catch (error) {
    console.error('❌ Error al obtener zonas:', error);
    return [];
  }
}
module.exports = { obtenerZonasOrganizadas };
