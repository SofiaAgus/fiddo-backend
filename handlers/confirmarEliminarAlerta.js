// handlers/confirmarEliminarAlerta.js

const Alerta = require('../models/Alerta');
const { actualizarSesion } = require('../session/sessionManager');

module.exports = async function confirmarEliminarAlerta(mensaje, numero, sesion) {
  const opcion = mensaje.trim().toLowerCase();

  if (opcion === 'sí' || opcion === 'si') {
    // Eliminamos la alerta de la base
    const alerta = sesion.alertaActual;
    if (alerta && alerta._id) {
      await Alerta.findByIdAndDelete(alerta._id);
    }

    sesion.alertaActual = null;
    sesion.estado = 'esperando_codigo';
    await actualizarSesion(numero, sesion);

    return `🗑️ Listo, la alerta fue eliminada.\n🔙 (Botón) Volver al menú`;
  }

  if (opcion === 'no' || opcion === 'cancelar') {
    sesion.estado = 'esperando_codigo';
    await actualizarSesion(numero, sesion);
    return '🔙 Cancelado. Volviste al menú principal.';
  }

  return '❓ Escribí “sí” para confirmar o “no” para cancelar.';
};
