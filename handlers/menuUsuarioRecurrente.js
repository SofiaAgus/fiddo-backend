// handlers/menuUsuarioRecurrente.js
const { actualizarSesion } = require('../session/sessionManager');

module.exports = async function manejarMenuUsuarioRecurrente(mensaje, numero, sesion) {
  console.log('📥 Entrando a menuUsuarioRecurrente con mensaje:', mensaje, 'y estado:', sesion.estado);
  const msg = mensaje.trim().toLowerCase();

  // 🟢 NUEVO: Responder al "hola" o "menu"
  if (msg === 'hola' || msg === 'menu') {
    return '👋 ¡Hola de nuevo! ¿Qué querés hacer ahora?\n\n1️⃣ Ver mis alertas\n2️⃣ Crear nueva alerta\n3️⃣ Ver promociones\n4️⃣ Ingresar un Código Fiddo';
  }

  if (msg === '1') {
    const verAlertasUsuario = require('./verAlertasUsuario');
    return await verAlertasUsuario(numero, sesion);
  }

  if (msg === '2') {
    sesion.estado = 'esperando_busqueda';
    await actualizarSesion(numero, sesion);
    return '📍 Decime zona y rubro para empezar (Ej: padel en Martínez).';
  }

  if (msg === '3') {
    sesion.estado = 'esperando_busqueda';
    await actualizarSesion(numero, sesion);
    return '🎁 Decime qué promociones querés ver (ej: peluquería en Palermo).';
  }

  if (msg === '4') {
    sesion.estado = 'esperando_codigo';
    await actualizarSesion(numero, sesion);
    return '🔑 Escribime tu código Fiddo (ej: CF12345).';
  }

  return '😕 No entendí bien. Elegí una opción válida:\n1️⃣ Ver mis alertas\n2️⃣ Crear nueva alerta\n3️⃣ Ver promociones\n4️⃣ Ingresar un Código Fiddo';
};
