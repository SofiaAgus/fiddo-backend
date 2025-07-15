const { actualizarSesion } = require('../session/sessionManager');
const Local = require('../models/Local');
const stringSimilarity = require('string-similarity');

module.exports = async function manejarLocalesExpress(mensaje, numero, sesion) {
  const nombresIngresados = mensaje
    .toLowerCase()
    .replace(/y/g, ',')
    .split(',')
    .map(n => n.trim())
    .filter(n => n.length > 0);

  let respuesta = '';

  if (mensaje === 'todos') {
    sesion.estado = 'esperando_horarios';
    await actualizarSesion(numero, sesion);
    return '🗓️ Decime cuándo te viene bien\nAlgo como “lunes de 18 a 22” o “jueves todo el día” está perfecto.';
  }

  const coincidencias = sesion.localesSeleccionados.filter(local => {
    const nombreNormalizado = local.toLowerCase();
    return nombresIngresados.some(entrada => {
      const similitud = stringSimilarity.compareTwoStrings(nombreNormalizado, entrada);
      return similitud > 0.5; // 🔧 tolerancia ajustable
    });
  });

  if (coincidencias.length === 0) {
    return '😕 No encontré coincidencias. Escribí bien el/los nombre/s de los locales o poné “todos”.';
  }

  const perfiles = [];

  for (const nombre of coincidencias) {
    const local = await Local.findOne({ nombre });

    if (!local) continue;

    if (local.codigoFiddo) {
      const celular = local.contacto?.replace(/\D/g, '');
      perfiles.push(
        `📍 ${local.nombre}\n📌 Perfil del local:\n🏟️ ${local.direccion || 'Dirección no informada'} – ${local.localidad}, ${local.partido}, ${local.zona}\n📞 Contacto: ${local.contacto || 'no informado'}\n⭐ Reputación: ${local.reputacion || 'Sin calificación'}\n🎁 Promos: ${
          local.promociones?.length > 0 ? local.promociones.join(' – ') : 'Sin promociones'
        }\n`
      );
    } else {
      perfiles.push(`📍 ${local.nombre}\nℹ️ Este local no cuenta con perfil premium. Solo podés configurar alertas de disponibilidad.\n`);
    }
  }

  sesion.localesSeleccionados = coincidencias;
  sesion.estado = 'esperando_horarios';
  await actualizarSesion(numero, sesion);

  return `${perfiles.join('\n')}✍️ Definamos día y hora para tu alerta:\n“Ej: lunes después de las 18” o “miércoles 13 a 17”`;
};
