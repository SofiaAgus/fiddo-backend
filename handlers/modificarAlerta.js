const { actualizarSesion } = require('../session/sessionManager');
const Alerta = require('../models/Alerta');
const interpretarHorarios = require('../utils/interpretarHorarios');

module.exports = async function modificarAlerta(mensaje, numero, sesion) {
  const alerta = await Alerta.findById(sesion.alertaEnGestionId);
  if (!alerta) {
    return '❌ No encontré esa alerta. Escribí “volver” para regresar.';
  }

  // Si el mensaje es "mostrar_instrucciones", mostrar horarios actuales y ejemplos
  if (mensaje === 'mostrar_instrucciones' || mensaje === '1') {
    sesion.estado = 'modificar_alerta';
    await actualizarSesion(numero, sesion);

    return `📅 Actualmente tenés esta alerta para ${alerta.locales.join(', ')}:\n${formatearHorarios(alerta.diasHorarios)}

✏️ Decime los nuevos días y horarios que querés para esta alerta.

Por ejemplo:
• Lunes de 18 a 20
• Martes después de las 19
• Jueves de 13 a 16

🛈 *Los horarios anteriores serán reemplazados por los que me digas ahora.*`;
  }

  // Paso 2: Interpretar nuevo mensaje con horarios
  const esAgregar = /agreg[aoé]/i.test(mensaje);
  const horarios = interpretarHorarios(mensaje);

  if (Object.keys(horarios).length === 0) {
    return '😕 No entendí bien los horarios. Podés decir algo como:\n“martes de 19 a 21” o “jueves después de las 18”';
  }

  sesion.estado = 'confirmar_modificacion_alerta';
  sesion.nuevosHorarios = horarios;
  sesion.accionModificacion = 'reemplazar';  // Forzamos a solo reemplazar
  await actualizarSesion(numero, sesion);

  const resumen = Object.entries(horarios)
  .map(([dia, rango]) => {
    const diaCapital = dia.charAt(0).toUpperCase() + dia.slice(1);
    if (rango.desde && rango.hasta) {
      return `• ${diaCapital}: ${rango.desde} a ${rango.hasta}`;
    } else if (rango.desde && !rango.hasta) {
      return `• ${diaCapital}: después de las ${rango.desde}`;
    } else if (!rango.desde && rango.hasta) {
      return `• ${diaCapital}: antes de las ${rango.hasta}`;
    } else {
      return `• ${diaCapital}: horario no reconocido`;
    }
  })
  .join('\n');


  return `📝 Entendido. Querés reemplazar estos horarios:\n${resumen}\n\n👉 ¿Confirmamos?\n✍️ Escribí “sí” o “no”`;
};

function formatearHorarios(diasHorarios = {}) {
  return Object.entries(diasHorarios)
    .map(([dia, detalle]) => {
      if (detalle.desde && detalle.hasta) {
        return `• ${dia.charAt(0).toUpperCase() + dia.slice(1)} de ${detalle.desde} a ${detalle.hasta}`;
      } else if (detalle.horas && detalle.horas.length > 0) {
        return `• ${dia.charAt(0).toUpperCase() + dia.slice(1)}: ${detalle.horas.join(', ')}`;
      }
      return '';
    })
    .filter(Boolean)
    .join('\n');
}
