const Alerta = require('../models/Alerta');
const { actualizarSesion } = require('../session/sessionManager');

module.exports = async function reanudarAlerta(mensaje, numero, sesion) {
  const alerta = await Alerta.findById(sesion.alertaEnGestionId);
  if (!alerta) return '❌ No encontré la alerta. Escribí "volver" para regresar.';

  alerta.activa = true;
  await alerta.save();

  sesion.estado = 'menu_usuario_recurrente';
  delete sesion.alertaEnGestionId;
  await actualizarSesion(numero, sesion);

  return `🔔 ¡Listo! Tu alerta fue reanudada con éxito.\nTe voy a avisar si se libera un turno según tu configuración.\n🔙 (Botón) Volver al menú`;
};
