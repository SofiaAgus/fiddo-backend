const Alerta = require('../models/Alerta');
const { actualizarSesion, reiniciarSesion } = require('../session/sessionManager');
const obtenerPromos = require('../utils/obtenerPromos');
const manejarConfirmacionPromos = require('./confirmarPromociones');
const Usuario = require('../models/Usuario'); // 👉 asegurate de tener esto

function capitalizarPrimeraLetra(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

module.exports = async function manejarResumenAlerta(mensaje, numero, sesion) {
  const msg = mensaje.toLowerCase();

  if (sesion.estado === 'esperando_promociones') {
    return await manejarConfirmacionPromos(mensaje, numero, sesion);
  }

  if (msg === 'sí' || msg === 'si') {
    const nuevaAlerta = new Alerta({
      telefono: numero,
      locales: sesion.localesSeleccionados,
      categoria: sesion.rubro,
      diasHorarios: sesion.diasHorarios,
      activa: true,
      fechaCreacion: new Date()
    });

    await nuevaAlerta.save();
    await Usuario.updateOne({ telefono: numero }, { tipo: 'recurrente' });

    sesion.estado = 'esperando_promociones';
    await actualizarSesion(numero, sesion);

    return `🎉 ¡Listo! Tu alerta fue activada con éxito 🚀
Fiddo te va a avisar cuando haya un turno disponible que coincida con tus preferencias.

📨 ¿Querés recibir promociones o novedades de estos locales?
Respondé “sí” o “no”`;
  }

  if (msg === 'no' || msg === 'cancelar') {
    await reiniciarSesion(numero);
    return '👍 Cancelaste tu alerta. Pero tranqui, podés volver a empezar escribiendo "Hola".';
  }

  return '✋ Por favor respondé "sí" para confirmar o "no" para cancelar la alerta.';
};

module.exports.generarResumenAlerta = async function generarResumenAlerta(sesion, numero) {
  const diasHorarios = sesion.diasHorarios;

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

  return `✅ ¡Ya tengo todo!
📍 Locales: ${sesion.localesSeleccionados.join(', ')}
📅 Días y horarios:
${diasTexto}
📢 Promos disponibles:
${promosTexto}
👉 ¿Querés confirmar la alerta?
Respondé “sí” o “no”`;
};
