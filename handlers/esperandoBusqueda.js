const { actualizarSesion } = require('../session/sessionManager');
const interpretarZonaRubro = require('../utils/interpretarZonaRubro');
const interpretarAliado = require('../utils/interpretarAliado');
const { buscarLocalesPorRubroYLugar } = require('../services/buscarLocalesPorRubroYLugar');

function capitalizarPrimeraLetra(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

module.exports = async function manejarBusqueda(mensaje, numero, sesion) {
  try {
    let rubro = '';
    let lugar = '';
    let resultados = [];

    // 👉 Solo ejecutamos interpretarZonaRubro si NO es búsqueda por nombre
    if (!sesion.buscarPorNombre) {
      const interpretacion = await interpretarZonaRubro(mensaje) || {};
      rubro = interpretacion.rubro || '';
      lugar = interpretacion.localidad || interpretacion.zona || '';

      if (rubro && lugar) {
        resultados = await buscarLocalesPorRubroYLugar(rubro, lugar);
        sesion.buscarPorNombre = false;
      }
    }

    // 🧠 Si no hay rubro+zona detectados o no hubo resultados, intentamos por nombre
    if (resultados.length === 0) {
      console.log("🔍 Intentando interpretar como nombre directo:", mensaje);
      const posiblesAliados = await interpretarAliado(mensaje);
      console.log("🧪 posiblesAliados detectados:", posiblesAliados?.map(a => a.nombre));

      if (posiblesAliados && posiblesAliados.length > 0) {
        sesion.buscarPorNombre = true;

        if (posiblesAliados.length === 1) {
          const aliado = posiblesAliados[0];
          sesion.localesSeleccionados = [aliado.nombre];
          sesion.rubro = aliado.rubro || 'Aliado';
          sesion.zona = aliado.zona || 'Zona no especificada';
          sesion.estado = 'esperando_horarios';
          await actualizarSesion(numero, sesion);

          if (aliado.codigoFiddo) {
            return `Fiddo:
📍 ${aliado.nombre}
📌 Perfil del local:
🏟️ ${aliado.direccion || 'Dirección no informada'} – ${aliado.localidad}, ${aliado.partido}, ${aliado.zona}
📞 Contacto: ${aliado.contacto || 'no informado'}
⭐ Reputación: ${aliado.reputacion || 'Sin calificación'}
🎁 Promos: ${(aliado.promociones && aliado.promociones.length > 0) ? aliado.promociones.join(' – ') : 'Sin promociones'}

✍️ Definamos día y hora para tu alerta: 
“Ej: lunes después de las 18” o “miércoles 13 a 17”`;
          } else {
            return `📍 ${aliado.nombre}
ℹ️ Este local no cuenta con perfil premium. Solo podés configurar alertas de disponibilidad.

✍️ Definamos día y hora para tu alerta: 
“Ej: lunes después de las 18” o “miércoles 13 a 17”`;
          }
        }

        resultados = [{ zona: 'sin especificar', locales: posiblesAliados }];
        rubro = 'Aliado';
        lugar = 'por nombre';
      }
    }

    if (!rubro || !lugar || resultados.length === 0) {
      if (sesion.buscarPorNombre) {
        return '😕 No entendí bien. Escribime el nombre del Aliado que estás buscando.\n(Ej: "El Bosque Padel" o "Dr. Alejandro López")';
      } else {
        return '😕 No entendí bien. Escribime algo como: “padel en Martínez” o “una peluquería por Palermo”.';
      }
    }

    const todosLosLocalesPlano = resultados.flatMap(grupo => grupo.locales);
    if (todosLosLocalesPlano.length === 1) {
      const local = todosLosLocalesPlano[0];
      sesion.localesSeleccionados = [local.nombre];
      sesion.rubro = local.rubro || 'Aliado';
      sesion.zona = local.zona || 'Zona no especificada';
      sesion.estado = 'esperando_horarios';
      await actualizarSesion(numero, sesion);

      if (local.codigoFiddo) {
        return `Fiddo:
📍 ${local.nombre}
📌 Perfil del local:
🏟️ ${local.direccion || 'Dirección no informada'} – ${local.localidad}, ${local.partido}, ${local.zona}
📞 Contacto: ${local.contacto || 'no informado'}
⭐ Reputación: ${local.reputacion || 'Sin calificación'}
🎁 Promos: ${(local.promociones && local.promociones.length > 0) ? local.promociones.join(' – ') : 'Sin promociones'}

✍️ Definamos día y hora para tu alerta: 
“Ej: lunes después de las 18” o “miércoles 13 a 17”`;
      } else {
        return `📍 ${local.nombre}
ℹ️ Este local no cuenta con perfil premium. Solo podés configurar alertas de disponibilidad.

✍️ Definamos día y hora para tu alerta: 
“Ej: lunes después de las 18” o “miércoles 13 a 17”`;
      }
    }

    const nombresSet = new Set();
    const todosLosLocales = resultados.flatMap(grupo => grupo.locales)
      .filter(local => {
        if (nombresSet.has(local.nombre)) return false;
        nombresSet.add(local.nombre);
        return true;
      })
      .map(local => `• ${local.nombre}`)
      .join('\n');

    sesion.localesSeleccionados = Array.from(nombresSet);
    sesion.rubro = rubro;
    sesion.zona = lugar;
    sesion.estado = 'esperando_locales_express';
    sesion.ultimaBusqueda = mensaje;
    await actualizarSesion(numero, sesion);

    return `📍 ${capitalizarPrimeraLetra(rubro)} en ${capitalizarPrimeraLetra(lugar)}:\n${todosLosLocales}\n✍️ Escribí el/los nombre/s que te interesan, o poné “todos”`;
  } catch (err) {
    console.error('❌ Error en interpretación de búsqueda:', err);
    return '⚠️ Hubo un problema al procesar tu búsqueda. Intentá de nuevo o escribí “volver”.';
  }
};
