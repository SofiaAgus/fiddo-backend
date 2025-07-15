const Alerta = require('../models/Alerta');
const { actualizarSesion } = require('../session/sessionManager');
const Usuario = require('../models/Usuario');

module.exports = async function confirmarAlertaExpress(mensaje, numero, sesion) {
  const msg = mensaje.toLowerCase();

  if (msg === 'sí' || msg === 'si') {
    const alerta = new Alerta({
      telefono: numero,
      locales: sesion.localesSeleccionados,
      categoria: sesion.categoriaSeleccionada || 'sin categoría',
      diasHorarios: sesion.horariosSeleccionados,
      activa: true,
      fechaCreacion: new Date()
    });

    await alerta.save();

    // ✅ Promover a recurrente
    await Usuario.updateOne({ telefono: numero }, { tipo: 'recurrente' });
    console.log('🔁 Usuario promovido a recurrente');

    // ✅ Dejar en estado de menú recurrente
    await actualizarSesion(numero, { estado: 'menu_usuario_recurrente' });

    return `🎉 ¡Listo! Tu alerta fue creada con éxito 🚀
Te voy a avisar cuando haya un turno disponible según tus preferencias.

👉 Escribí *VOLVER* para regresar al menú principal.`;
  }

  // ❌ Si escribe "no" o "cancelar", NO se guarda la alerta ni se promueve
  await actualizarSesion(numero, { estado: 'esperando_codigo' });

  // 🚫 NO cambiar el tipo en Mongo
  console.log('⛔ Alerta cancelada. Usuario sigue como tipo "nuevo".');

  return `❌ Alerta cancelada. No guardé nada 😉

📍 ¿Qué querés hacer ahora?
1. Buscar un aliado por zona y rubro
2. Buscar un aliado por nombre
🔑 O podés escribir un Código Fiddo (ej: CF11223)
🎁 Escribí PROMOS para ver promociones

📝 En cualquier momento podés escribir “volver” o “cancelar”`;
};
