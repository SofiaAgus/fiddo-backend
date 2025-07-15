console.log('✅ Entrando al handler verMisAlertas');
const Alerta = require('../models/Alerta');
const { actualizarSesion } = require('../session/sessionManager');

module.exports = async function verMisAlertas(mensaje, numero, sesion) {
  const alertas = await Alerta.find({ telefono: numero, activa: true });

  if (alertas.length === 0) {
    sesion.estado = 'menu_usuario_recurrente';
    await actualizarSesion(numero, sesion);
    return '🔕 No tenés alertas activas por ahora.
Podés crear una nueva desde el menú principal.';
  }

  let texto = '📋 Estas son tus alertas activas:\n';

  alertas.forEach((alerta, index) => {
    console.log('🕒 Días y horarios de la alerta:', alerta.diasHorarios);  // 👈 agregá esta línea

    const resumenHorarios = Object.entries(alerta.diasHorarios)
      .map(([dia, rango]) => `${dia.charAt(0).toUpperCase() + dia.slice(1)} de ${rango.desde} a ${rango.hasta}`)
      .join(' / ');

    texto += `${index + 1}⃣ ${alerta.locales.join(', ')} – ${resumenHorarios}\n`;
  });


  texto += '\n✍️ Escribime el número de la alerta que querés gestionar\n📝 También podés escribir "volver" o "cancelar"';

  sesion.estado = 'esperando_alerta_a_gestionar';
  sesion.alertasUsuario = alertas.map(a => a._id.toString());
  await actualizarSesion(numero, sesion);

  return texto;
}
