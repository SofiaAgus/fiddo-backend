const sesiones = {};

function obtenerSesion(numero) {
  if (!sesiones[numero]) {
    sesiones[numero] = {
      estado: null,      // ⬅️ IMPORTANTE: null para que el switch lo tome bien
      datos: {}
    };
  }
  return sesiones[numero];
}

function actualizarSesion(numero, nuevosDatos) {
  if (!sesiones[numero]) sesiones[numero] = { estado: null, datos: {} }; // ⬅️ acá también

  sesiones[numero] = {
    ...sesiones[numero],
    ...nuevosDatos
  };
}


function reiniciarSesion(numero) {
  sesiones[numero] = {
    estado: null,      // ⬅️ También null, no 'inicio'
    datos: {}
  };
}


module.exports = {
  obtenerSesion,
  actualizarSesion,
  reiniciarSesion
};
