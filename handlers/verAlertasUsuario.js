// handlers/verAlertasUsuario.js
const Alerta = require('../models/Alerta');
const { actualizarSesion } = require('../session/sessionManager');

module.exports = async function verAlertasUsuario(numero, sesion) {
  const alertas = await Alerta.find({ telefono: numero });

  if (!alertas || alertas.length === 0) {
    return '📭 No tenés alertas activas por ahora. Podés crear una nueva escribiendo "2".';
  }

  // Guardar en sesión
  sesion.alertasDisponibles = alertas.map(alerta => ({
    _id: alerta._id,
    locales: alerta.locales,
    diasHorarios: alerta.diasHorarios,
    activa: alerta.activa
  }));
  sesion.estado = 'viendo_alertas';
  await actualizarSesion(numero, sesion);

  let respuesta = '📋 Estas son tus alertas activas:\n';
  console.log('📦 Alerta encontrada:', JSON.stringify(alertas, null, 2));

  alertas.forEach((alerta, index) => {
    const locales = alerta.locales.join(', ');

    // 🔄 Cambiado el método riesgoso por uno seguro:
    const diasHorariosPlano = JSON.parse(JSON.stringify(alerta.diasHorarios || {}));

    const diasHorarios = Object.entries(diasHorariosPlano)
    .map(([dia, detalle]) => {
      console.log('🔎 Detalle de día:', dia, detalle);
      const capitalDia = dia.charAt(0).toUpperCase() + dia.slice(1);

      if (detalle?.desde && detalle?.hasta) {
        return `${capitalDia}: de ${detalle.desde}hs a ${detalle.hasta}hs`;
      }

      if (Array.isArray(detalle.horas)) {
        if (detalle.horas.length === 1) {
          return `${capitalDia}: ${detalle.horas[0]}hs`;
        } else if (detalle.horas.length > 1) {
          return `${capitalDia}: ${detalle.horas.map(h => `${h}hs`).join(' a ')}`;
        }
      }

      return `${capitalDia}: sin horarios configurados`;
    }) // 👈 ESTA CIERRE ESTABA FALTANDO AQUÍ
    .filter(linea => linea !== '')
    .join(' • ');



    console.log('🔹 diasHorarios calculado:', diasHorarios);
    respuesta += `\n${index + 1}️⃣ ${locales} – ${diasHorarios}`;
  });

  respuesta += '\n✍️ Escribime el número de la alerta que querés gestionar\n📝 También podés escribir “volver” o “cancelar”';

  return respuesta;
};
