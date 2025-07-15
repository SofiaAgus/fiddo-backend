const Alerta = require('../models/Alerta');
const { actualizarSesion } = require('../session/sessionManager');

module.exports = async function eliminarAlerta(mensaje, numero, sesion) {
  if (mensaje !== 'sí' && mensaje !== 'no') {
    return '⚠️ Estás por eliminar esta alerta. ¿Estás seguro?\n✍️ Escribí “sí” para confirmar\n❌ O escribí “no” para cancelar';
  }

  if (mensaje === 'no') {
    sesion.estado = 'menu_usuario_recurrente';
    delete sesion.alertaEnGestionId;
    await actualizarSesion(numero, sesion);
    return '✅ Cancelado. Tu alerta sigue activa.\n🔙 (Botón) Volver al menú';
  }

  const alerta = await Alerta.findById(sesion.alertaEnGestionId);
  if (!alerta) {
    return '❌ No encontré esa alerta. Escribí “volver” para regresar.';
  }

  await Alerta.deleteOne({ _id: alerta._id });

  sesion.estado = 'menu_usuario_recurrente';
  delete sesion.alertaEnGestionId;
  await actualizarSesion(numero, sesion);

  return `🗑️ Listo, la alerta de ${alerta.locales.join(', ')} fue eliminada.\n🔙 (Botón) Volver al menú`;
};
