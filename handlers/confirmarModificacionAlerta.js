const Alerta = require('../models/Alerta');
const { actualizarSesion, reiniciarSesion } = require('../session/sessionManager');

module.exports = async function confirmarModificacionAlerta(mensaje, numero, sesion) {
  if (mensaje !== 'sí') {
    sesion.estado = 'menu_usuario_recurrente';
    await actualizarSesion(numero, sesion);
    return '❌ Cambios cancelados. Volvés al menú principal.';
  }

  const alerta = await Alerta.findById(sesion.alertaEnGestionId);
  if (!alerta) return '❌ No encontré la alerta. Escribí "volver".';

  alerta.diasHorarios = sesion.nuevosDiasHorarios;
  await alerta.save();

  sesion.estado = 'menu_usuario_recurrente';
  delete sesion.nuevosDiasHorarios;
  delete sesion.alertaEnGestionId;
  await actualizarSesion(numero, sesion);

  return '🎉 ¡Listo! Tu alerta fue actualizada con éxito 🚀\nTe voy a avisar si se libera un turno en esos horarios.\n🔙 (Botón) Volver al menú';
};
