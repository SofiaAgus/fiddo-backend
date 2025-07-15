const Zona = require('../models/Zona');

async function obtenerZonasYPartidos() {
  try {
    const zonas = await Zona.find({ tipo: 'zona' });
    const partidos = await Zona.find({ tipo: 'partido' });

    return { zonas, partidos };
  } catch (error) {
    console.error('Error al obtener zonas y partidos:', error);
    throw error;
  }
}

module.exports = { obtenerZonasYPartidos };
