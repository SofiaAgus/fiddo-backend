// handlers/esperandoHorarios.js

const interpretarHorarios = require('../utils/interpretarHorarios.js');
const obtenerPromos = require('../utils/obtenerPromos');
const { actualizarSesion } = require('../session/sessionManager');

function capitalizarPrimeraLetra(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

module.exports = async function manejarHorarios(mensaje, numero, sesion) {
  try {
    const diasHorarios = interpretarHorarios(mensaje);
    if (!diasHorarios || Object.keys(diasHorarios).length === 0) {
      return '😕 No entendí bien los horarios. Podés escribir algo como: “lunes de 18 a 22” o “jueves 19 a 21”.';
    }

    sesion.diasHorarios = diasHorarios;
    sesion.horariosSeleccionados = diasHorarios;
    sesion.estado = 'esperando_confirmacion_alerta_express';
    await actualizarSesion(numero, sesion);

    const diasTexto = Object.entries(diasHorarios).map(([dia, detalle]) => {
      if (detalle.desde && detalle.hasta) {
        return `• ${capitalizarPrimeraLetra(dia)}: ${detalle.desde} a ${detalle.hasta}`;
      } else if (detalle.horas && detalle.horas.length > 0) {
        return `• ${capitalizarPrimeraLetra(dia)}: ${detalle.horas.join(', ')}`;
      }
      return '';
    }).join('\n');

    const promosLocales = await obtenerPromos(sesion.localesSeleccionados);
    const promosTexto = promosLocales.length > 0
      ? promosLocales.map(p => `• ${p.nombre}: ${p.promo}`).join('\n')
      : 'No hay promociones activas por ahora.';

    return `✅ ¡Ya tengo todo!\n📍 Locales: ${sesion.localesSeleccionados.join(', ')}\n📅 Días y horarios:\n${diasTexto}\n📢 Promos disponibles:\n${promosTexto}\n👉 ¿Querés confirmar la alerta?\nRespondé “sí” o “no”`;
  } catch (err) {
    console.error('❌ Error interpretando horarios:', err);
    return '⚠️ Hubo un error al procesar los horarios. Intentá de nuevo.';
  }
};
