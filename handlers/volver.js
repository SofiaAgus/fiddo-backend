// handlers/volver.js
const { actualizarSesion, reiniciarSesion } = require('../session/sessionManager');
const mensajeBienvenida = require('../messages/bienvenida');
const Usuario = require('../models/Usuario');

module.exports = async function manejarVolver(sesion, numero) {
  let respuestaVolver = '';

  switch (sesion.estado) {
    case 'resumen_alerta':
      sesion.estado = 'esperando_horarios';
      await actualizarSesion(numero, sesion);
      respuestaVolver = '🗓️ Decime cuándo te viene bien\nAlgo como “lunes y martes de 18 a 22” o “jueves todo el día” está perfecto.';
      break;

    case 'esperando_promociones':
      if (sesion.localesSeleccionados && sesion.localesSeleccionados.length > 0) {
        sesion.estado = 'esperando_horarios';
        await actualizarSesion(numero, sesion);
        respuestaVolver = '🗓️ Volvemos a definir el horario de tu alerta.\nPodés decir algo como “lunes 18 a 22” o “miércoles todo el día”.';
      } else {
        await reiniciarSesion(numero);
        const usuario = await Usuario.findOne({ telefono: numero });
        if (usuario?.tipo === 'recurrente') {
          await actualizarSesion(numero, { estado: 'menu_usuario_recurrente' });
          respuestaVolver = `👋 ¡Hola de nuevo! Estas son tus opciones:\n1️⃣ Ver mis alertas\n2️⃣ Crear nueva alerta\n3️⃣ Ver promociones\n4️⃣ Ingresar un Código Fiddo`;
        } else {
          await actualizarSesion(numero, { estado: 'esperando_codigo' });
          respuestaVolver = mensajeBienvenida;
        }
      }
      break;

    case 'esperando_horarios':
      if (sesion.buscarPorNombre) {
        sesion.estado = 'esperando_busqueda';
        await actualizarSesion(numero, sesion);
        respuestaVolver = '🔎 Escribime el nombre del local o profesional que estás buscando.\n(Ej: "El Bosque Padel" o "Dr. Alejandro López")';
      } else {
        await reiniciarSesion(numero);
        const usuario = await Usuario.findOne({ telefono: numero });
        if (usuario?.tipo === 'recurrente') {
          await actualizarSesion(numero, { estado: 'menu_usuario_recurrente' });
          respuestaVolver = `👋 ¡Hola de nuevo! Estas son tus opciones:\n1️⃣ Ver mis alertas\n2️⃣ Crear nueva alerta\n3️⃣ Ver promociones\n4️⃣ Ingresar un Código Fiddo`;
        } else {
          await actualizarSesion(numero, { estado: 'esperando_codigo' });
          respuestaVolver = mensajeBienvenida;
        }
      }
      break;

    case 'esperando_locales_express':
      if (sesion.ultimaBusqueda) {
        await reiniciarSesion(numero);
        await actualizarSesion(numero, { estado: 'esperando_codigo' });
        respuestaVolver = mensajeBienvenida;
      } else {
        sesion.estado = 'esperando_busqueda';
        await actualizarSesion(numero, sesion);
        respuestaVolver = '🔁 Volvemos al paso anterior. Escribime un rubro y zona (ej: padel en Martínez).';
      }
      break;

    case 'esperando_busqueda':
      await reiniciarSesion(numero);
      await actualizarSesion(numero, { estado: 'esperando_codigo' });
      respuestaVolver = mensajeBienvenida;
      break;

    case 'menu_usuario_recurrente':
    case 'esperando_codigo':
    default:
      await reiniciarSesion(numero);
      const usuario = await Usuario.findOne({ telefono: numero });
      if (usuario?.tipo === 'recurrente') {
        await actualizarSesion(numero, { estado: 'menu_usuario_recurrente' });
        respuestaVolver = `👋 ¡Hola de nuevo! Estas son tus opciones:\n1️⃣ Ver mis alertas\n2️⃣ Crear nueva alerta\n3️⃣ Ver promociones\n4️⃣ Ingresar un Código Fiddo`;
      } else {
        await actualizarSesion(numero, { estado: 'esperando_codigo' });
        respuestaVolver = mensajeBienvenida;
      }
      break;
  }

  return respuestaVolver;
};
