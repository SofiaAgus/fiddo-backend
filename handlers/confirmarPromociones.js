// handlers/esperandoPromociones.js

const { actualizarSesion, reiniciarSesion } = require('../session/sessionManager');

module.exports = async function manejarPromociones(mensaje, numero, sesion) {
  let respuesta = '';

  if (mensaje === 'sí' || mensaje === 'si') {
    sesion.promocionesOk = true;
    await actualizarSesion(numero, sesion);
    reiniciarSesion(numero);
    respuesta = 'Genial, nos mantenemos en contacto 😉\n\n🖼️ (Publicidad externa opcional)\n📣 ¿Ya tenés tu pala? Equipate para tu próxima reserva\n📦 Ver ofertas en Mercado Libre';
  } else if (mensaje === 'no') {
    sesion.promocionesOk = false;
    await actualizarSesion(numero, sesion);
    reiniciarSesion(numero);
    respuesta = '👌 Perfecto. No vas a recibir promociones de estos locales.\n¡Gracias por usar Fiddo!';
  } else {
    respuesta = '✋ Por favor respondé “sí” o “no” para saber si querés recibir promociones.';
  }

  return respuesta;
};
