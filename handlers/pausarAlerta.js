const Alerta = require('../models/Alerta');
const { actualizarSesion } = require('../session/sessionManager');

module.exports = async function pausarAlerta(mensaje, numero, sesion) {
  const alerta = await Alerta.findById(sesion.alertaEnGestionId);
  if (!alerta) return '❌ No encontré la alerta. Escribí "volver" para regresar.';

  alerta.activa = false;
  await alerta.save();

  sesion.estado = 'menu_usuario_recurrente';
  delete sesion.alertaEnGestionId;
  await actualizarSesion(numero, sesion);

  return `⏸️ Perfecto. La alerta de ${alerta.locales.join(', ')} fue pausada.\n🔔 Cuando quieras volver a activarla, entrá a “Ver mis alertas” y seleccioná “Reanudar”.\n🔙 (Botón) Volver al menú`;
};
