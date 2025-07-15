const Local = require('../models/Local');
const { actualizarSesion, reiniciarSesion } = require('../session/sessionManager');

function parecePalabraInutil(texto) {
  const palabrasComunes = ['hola', 'gracias', 'ok', 'bien'];
  return texto.length < 5 && !/^(fiddo|cf)\d{3,}$/i.test(texto) && !palabrasComunes.includes(texto);
}

async function manejarCodigo(mensaje, numero, sesion) {
  let respuesta = '';

  if (mensaje === 'no') {
    respuesta = '📍 Podés buscar aliados por zona o por nombre.\n\n🗺️ Ej: "padel en Martínez" o "peluquería en Palermo"\n👤 O también: "Dr. Alejandro López" o "El Bosque Padel"';
    await actualizarSesion(numero, { estado: 'esperando_busqueda' });
  } else if (/^(fiddo|cf)\d{5}$/i.test(mensaje)) {
    const codigoIngresado = mensaje.toUpperCase();
    try {
      const local = await Local.findOne({ codigoFiddo: codigoIngresado });
      if (local) {
        sesion.localesSeleccionados = [local.nombre];
        sesion.rubro = local.rubro;
        sesion.zona = local.zona;
        sesion.estado = 'esperando_horarios';
        await actualizarSesion(numero, sesion);
        respuesta = `✅ Código verificado: ${codigoIngresado}\n📍 Local: ${local.nombre}\n🗓️ Ahora decime el día y horario que te interesa (Ej: “lunes de 18 a 22”).`;
      } else {
        respuesta = `❌ El código ${codigoIngresado} no está asociado a ningún local.\n🧐 Verificá si lo escribiste bien o escribí “volver” para regresar al menú anterior.`;
      }
    } catch (error) {
      console.error('❌ Error buscando código Fiddo:', error);
      respuesta = '⚠️ Ocurrió un error al buscar el código. Por favor, intentá más tarde.';
    }
  } else if (parecePalabraInutil(mensaje)) {
    respuesta = '😕 Mmm… no entendí. Si no tenés un código Fiddo, podés escribir **"volver"** para ir al menú anterior.';
  } else {
    respuesta = '😕 No reconozco ese código. Si no tenés uno, escribí “volver” para buscar por zona o nombre.';
  }

  return respuesta;
}

module.exports = manejarCodigo;
