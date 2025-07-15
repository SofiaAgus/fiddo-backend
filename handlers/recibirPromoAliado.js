// handlers/recibirPromoAliado.js

const Local = require('../models/Local');
const yaEnvioPromoHoy = require('../services/yaEnvioPromoHoy');
const registrarEnvioPromo = require('../services/registrarEnvioPromo');
const { reiniciarSesion } = require('../session/sessionManager');

module.exports = async function recibirPromoAliado(mensaje, numero, sesion) {
  let respuesta = '';

  // Validar que la sesión tenga un aliado identificado
  const nombreLocal = sesion.localesSeleccionados?.[0];
  if (!nombreLocal) {
    return '❌ No tengo identificado a qué local pertenece este número. Escribí "volver" o contactá a soporte.';
  }

  // Buscar el local por nombre
  const local = await Local.findOne({ nombre: nombreLocal });
  if (!local || !local.esPremium) {
    return '🚫 Solo los locales premium pueden enviar promociones.';
  }

  // 👇 Si está editando la promoción del perfil (promo fija visible siempre)
  if (sesion.estado === 'esperando_promo_perfil') {
    const promo = mensaje.trim();
    local.promoPerfil = promo;
    await local.save();

    await reiniciarSesion(numero);

    return '✅ Tu promoción del perfil fue actualizada con éxito 🧾. ¡Ya está visible en tu perfil público!';
  }

  // 👇 Si está cargando una promo del día (limitada a una vez)
  if (yaEnvioPromoHoy(local)) {
    return '📛 Ya cargaste una promoción hoy. Mañana vas a poder enviar otra. Gracias por usar Fiddo.';
  }

  // Guardar la promoción push
  local.promocion = mensaje;
  await registrarEnvioPromo(local);
  await local.save();

  return '✅ Tu promoción fue cargada con éxito y ya está visible para tus seguidores. 🙌';
};
