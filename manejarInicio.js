// manejarInicio.js (en la RAÍZ)

const Usuario = require('./models/Usuario');
const { actualizarSesion } = require('./session/sessionManager');

module.exports = async function manejarInicio(numero) {
  const usuario = await Usuario.findOne({ telefono: numero });

  if (usuario) {
    await actualizarSesion(numero, { estado: 'menu_usuario_recurrente' });
    return `👋 ¡Hola de nuevo! Estas son tus opciones:
1⃣⃣ Ver mis alertas 
2⃣⃣ Crear nueva alerta
3⃣⃣ Ver promociones
4⃣⃣ Ingresar un Código Fiddo`;
  } else {
    await Usuario.create({ telefono: numero });
    await actualizarSesion(numero, { estado: 'esperando_codigo' });
    return require('./messages/bienvenida');
  }
};
