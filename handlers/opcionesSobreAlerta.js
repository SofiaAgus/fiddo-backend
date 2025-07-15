// handlers/opcionesSobreAlerta.js

const { actualizarSesion } = require('../session/sessionManager');

module.exports = async function opcionesSobreAlerta(mensaje, numero, sesion) {
  const opcion = mensaje.trim().toLowerCase();

  switch (opcion) {
    case 'modificar':
      sesion.estado = 'modificar_alerta';
      await actualizarSesion(numero, sesion);
      return `📅 Actualmente tenés esta alerta para ${formatearAlerta(sesion.alertaActual)}\n✏️ Si querés modificar, agregar o reemplazar ese horario, decímelo directamente.\n🧠 Por ejemplo:\n• Reemplazar por “martes de 18 a 20”\n• Agregar “jueves después de las 19”\n📝 También podés escribir “volver” o “cancelar”`;

    case 'pausar':
      sesion.alertaActual.activa = false;
      sesion.estado = 'esperando_codigo'; // vuelve al menú principal
      await actualizarSesion(numero, sesion);
      return `⏸️ Perfecto. La alerta fue pausada.\n🔔 Cuando quieras volver a activarla, entrá a “Ver mis alertas” y seleccioná “Reanudar”.`;

    case 'eliminar':
      sesion.estado = 'confirmar_eliminacion_alerta';
      await actualizarSesion(numero, sesion);
      return `⚠️ Estás por eliminar esta alerta de ${formatearAlerta(sesion.alertaActual)}\n¿Estás seguro?\n✍️ Escribí “sí” para confirmar\n❌ O escribí “no” para cancelar`;

    case 'volver':
      sesion.estado = 'esperando_codigo';
      await actualizarSesion(numero, sesion);
      return '🔙 Volviste al menú principal.\nElegí una opción:\n1️⃣ Ver mis alertas\n2️⃣ Crear nueva alerta\n3️⃣ Ver promociones\n4️⃣ Ingresar un código Fiddo';

    default:
      return '😕 No entendí. Podés escribir “Modificar”, “Pausar”, “Eliminar” o “Volver”.';
  }
};

function formatearAlerta(alerta) {
  const nombreLocal = alerta.locales?.[0] || 'local';
  const dias = Object.entries(alerta.diasHorarios || {})
    .map(([dia, rango]) => `${capitalizar(dia)} de ${rango.desde} a ${rango.hasta}`)
    .join(' – ');
  return `${nombreLocal} – ${dias}`;
}

function capitalizar(texto) {
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}
