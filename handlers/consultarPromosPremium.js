const interpretarZonaRubro = require('../utils/interpretarZonaRubro');
const obtenerPromos = require('../utils/obtenerPromos');

module.exports = async function consultarPromosPremium(mensaje, numero, sesion) {
  try {
    // Intentamos interpretar rubro y zona del mensaje del usuario
    const interpretacion = await interpretarZonaRubro(mensaje) || {};
    const rubro = interpretacion.rubro || null;
    const zona = interpretacion.localidad || interpretacion.zona || null;

    // Obtener promos, filtrando si hay rubro o zona
    const promos = await obtenerPromos(rubro, zona);

    if (!promos || promos.length === 0) {
      return '📭 No hay promociones activas por ahora. Pero Fiddo te va a avisar cuando aparezcan 😉';
    }

    const promosTexto = promos.map(p => `• ${p.nombre}: ${p.promo}`).join('\n');
    return `🎁 Promociones destacadas:\n${promosTexto}`;
  } catch (error) {
    console.error('❌ Error al consultar promociones premium:', error);
    return '⚠️ Hubo un problema al consultar las promociones. Probá más tarde o escribí "volver".';
  }
};
