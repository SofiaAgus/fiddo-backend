// handlers/gestionarAccionEnAlerta.js
const modificarAlerta = require('./modificarAlerta');
const pausarAlerta = require('./pausarAlerta');
const eliminarAlerta = require('./eliminarAlerta');
const reanudarAlerta = require('./reanudarAlerta');
const { actualizarSesion } = require('../session/sessionManager');

module.exports = async function gestionarAccionEnAlerta(mensaje, numero, sesion) {
  const alertaId = sesion.alertaEnGestionId;
  if (!alertaId || !sesion.alertasDisponibles) {
    return '❌ No encontré la alerta en gestión. Escribí “volver” para regresar.';
  }

  const alertaSeleccionada = sesion.alertasDisponibles.find(a => a._id.toString() === alertaId.toString());
if (!alertaSeleccionada) {
    return '❌ La alerta seleccionada ya no está disponible.';
  }

  const estaActiva = alertaSeleccionada.activa;

  if (estaActiva) {
    switch (mensaje) {
      case '1': // Modificar
        return await modificarAlerta('mostrar_instrucciones', numero, sesion);

      case '2': // Pausar
        return await pausarAlerta(mensaje, numero, sesion);

      case '3': // Eliminar
        sesion.estado = 'confirmar_eliminacion_alerta';
        await actualizarSesion(numero, sesion);
        return '⚠️ Estás por eliminar esta alerta. ¿Estás seguro?\n✍️ Escribí “sí” para confirmar\n❌ O escribí “no” para cancelar';

      case '4': // Volver
        sesion.estado = 'menu_usuario_recurrente';
        delete sesion.alertaEnGestionId;
        await actualizarSesion(numero, sesion);
        return '🔙 Volviste al menú principal';

      default:
        return '😕 Opción inválida. Escribí 1, 2, 3 o 4.';
    }
  } else {
    switch (mensaje) {
      case '1': // Reanudar
        return await reanudarAlerta(mensaje, numero, sesion);

      case '2': // Eliminar
        sesion.estado = 'confirmar_eliminacion_alerta';
        await actualizarSesion(numero, sesion);
        return '⚠️ Estás por eliminar esta alerta. ¿Estás seguro?\n✍️ Escribí “sí” para confirmar\n❌ O escribí “no” para cancelar';

      case '3': // Volver
        sesion.estado = 'menu_usuario_recurrente';
        delete sesion.alertaEnGestionId;
        await actualizarSesion(numero, sesion);
        return '🔙 Volviste al menú principal';

      default:
        return '😕 Opción inválida. Escribí 1, 2 o 3.';
    }
  }
};
