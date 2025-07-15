const buscarAliadoPorNombre = require('../services/buscarAliadoPorNombre');
const normalizarTexto = require('../utils/normalizarTexto');

module.exports = async function interpretarAliado(texto) {
  console.log("👋 interpretando aliado:", texto); // <-- ESTE

  const nombreIngresado = normalizarTexto(texto);
  if (!nombreIngresado || nombreIngresado.length < 3) return null;

  try {
    const candidatos = await buscarAliadoPorNombre(nombreIngresado);
    if (!candidatos || candidatos.length === 0) return null;

    // 🎯 Buscar coincidencia exacta (nombre normalizado)
    const matchExacto = candidatos.find(
      local => normalizarTexto(local.nombre) === nombreIngresado
    );
    if (matchExacto) {
      console.log("🎯 Coincidencia exacta encontrada:", matchExacto.nombre);
      return [matchExacto];
    }

    // ✅ Solo una coincidencia parcial → aceptamos
    if (candidatos.length === 1) {
      console.log("✅ Coincidencia parcial única encontrada:", candidatos[0].nombre);
      return [candidatos[0]];
    }

    // 🧪 Si hay múltiples coincidencias, devolvemos todas para que el usuario elija
    console.log("📋 Múltiples coincidencias encontradas:", candidatos.map(c => c.nombre));
    return candidatos;

  } catch (err) {
    console.error('❌ Error al interpretar nombre de aliado:', err);
    return null;
  }
};
