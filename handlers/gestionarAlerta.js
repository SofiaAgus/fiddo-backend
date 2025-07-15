const { actualizarSesion } = require('../session/sessionManager');

module.exports = async function gestionarAlerta(mensaje, numero, sesion) {
  const indice = parseInt(mensaje);
  if (isNaN(indice)) return '✍️ Por favor, escribí el número de la alerta que querés gestionar.';

  const alertas = sesion.alertasDisponibles;
  const alertaSeleccionada = alertas[indice - 1];
  if (!alertaSeleccionada) return '❌ Número inválido. Escribí uno de la lista.';

  sesion.alertaEnGestionId = alertaSeleccionada._id;
  sesion.estado = 'esperando_accion_alerta';
  await actualizarSesion(numero, sesion);

  const estadoActual = alertaSeleccionada.activa ? 'Activa' : 'Pausada';
  let opciones = '';

  if (alertaSeleccionada.activa) {
    opciones = `1️⃣ Modificar\n2️⃣ Pausar\n3️⃣ Eliminar\n4️⃣ Volver`;
  } else {
    opciones = `1️⃣ Reanudar\n2️⃣ Eliminar\n3️⃣ Volver`;
  }

  return `📍 Elegiste la alerta de ${alertaSeleccionada.locales.join(', ')} – ${estadoActual}
¿Qué querés hacer con esta alerta?
${opciones}
✍️ Escribí el número de la opción que querés usar.`;
};
