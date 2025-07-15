// handlers/gestionarAlertaSeleccionada.js

const { actualizarSesion } = require('../session/sessionManager');

module.exports = async function gestionarAlertaSeleccionada(mensaje, numero, sesion) {
  const seleccion = parseInt(mensaje);

  const alertaElegida = sesion.alertasDisponibles?.[seleccion - 1];
  if (!alertaElegida) {
    return '❌ Número inválido. Por favor escribí el número de la alerta que querés gestionar, o escribí "volver".';
  }

  sesion.estado = 'menu_alerta_seleccionada';
  sesion.alertaActual = alertaElegida;
  await actualizarSesion(numero, sesion);

  const nombreLocal = alertaElegida.locales[0] || 'Local no especificado';
  const dias = Object.entries(alertaElegida.diasHorarios || {})
    .map(([dia, rango]) => `${capitalizar(dia)} de ${rango.desde} a ${rango.hasta}`)
    .join(' – ');

  return `📍 Elegiste la alerta de ${nombreLocal} – ${dias}\n¿Qué querés hacer con esta alerta?\n(Elegí una opción)\n🔘 Modificar\n🔘 Pausar\n🔘 Eliminar\n🔘 Volver`;
};

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
