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

    // 🧠 1. Si buscarPorNombre está activo, primero intento por nombre
    if (sesion.buscarPorNombre) {
      const posiblesAliados = await interpretarAliado(mensaje);
      console.log('🧪 posiblesAliados detectados:', posiblesAliados?.map(a => a.nombre));

      if (posiblesAliados && posiblesAliados.length > 0) {
        if (posiblesAliados.length === 1) {
          const aliado = posiblesAliados[0];
          sesion.localesSeleccionados = [aliado.nombre];
          sesion.rubro = aliado.rubro || 'Aliado';
          sesion.zona = aliado.zona || 'Zona no especificada';
          sesion.estado = 'esperando_horarios';
          await actualizarSesion(numero, sesion);

          return `📍 ${aliado.nombre}
ℹ️ Este local ${aliado.codigoFiddo ? 'tiene perfil completo' : 'no cuenta con perfil premium'}.

✍️ Definamos día y hora para tu alerta: 
(Ej: "lunes después de las 18" o "miércoles 13 a 17")`;
        }

        resultados = [{ zona: 'sin especificar', locales: posiblesAliados }];
        rubro = 'Aliado';
        lugar = 'por nombre';
      }
    }

    // 🧠 2. Si no encontró por nombre, intenta zona + rubro igual
    if (resultados.length === 0) {
      console.log("🧠 Interpretación de zona y rubro:", interpretacion);
      console.log("🎯 Rubro interpretado:", rubro);
      console.log("📍 Lugar interpretado:", lugar);
      const interpretacion = await interpretarZonaRubro(mensaje) || {};
      rubro = interpretacion.rubro || '';
      lugar = interpretacion.localidad || interpretacion.zona || '';

      if (rubro && lugar) {
        resultados = await buscarLocalesPorRubroYLugar(rubro, lugar);
        sesion.buscarPorNombre = false;
      }
    }

    // ⚠️ 3. Si sigue sin resultados, mensaje de ayuda
    if (!rubro || !lugar || resultados.length === 0) {
      if (sesion.buscarPorNombre) {
        return '😕 No encontré coincidencias. Escribime el nombre del Aliado que estás buscando.\n(Ej: "El Bosque Padel" o "Dr. Alejandro López")';
      } else {
        return '😕 No encontré coincidencias. Escribime algo como: “padel en Martínez” o “una peluquería por Palermo”.';
      }
    }

    // 🎯 4. Si hay solo uno, avanza a horarios
    const todosLosLocalesPlano = resultados.flatMap(grupo => grupo.locales);
    if (todosLosLocalesPlano.length === 1) {
      const local = todosLosLocalesPlano[0];
      sesion.localesSeleccionados = [local.nombre];
      sesion.rubro = local.rubro || 'Aliado';
      sesion.zona = local.zona || 'Zona no especificada';
      sesion.estado = 'esperando_horarios';
      await actualizarSesion(numero, sesion);

      return `📍 ${local.nombre}
ℹ️ Este local ${local.codigoFiddo ? 'tiene perfil completo' : 'no cuenta con perfil premium'}.

✍️ Definamos día y hora para tu alerta: 
(Ej: "lunes después de las 18" o "miércoles 13 a 17")`;
    }

    // 🔢 5. Si hay varios, los muestra para elegir
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
