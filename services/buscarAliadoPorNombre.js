const Local = require('../models/Local');
const normalizarTexto = require('../utils/normalizarTexto');

module.exports = async function buscarAliadoPorNombre(texto) {
  const palabras = normalizarTexto(texto).split(/\s+/);
  const regex = new RegExp(palabras.map(p => `(?=.*${p})`).join(''), 'i');

  const resultados = await Local.find({
    nombreNormalizado: { $regex: regex }
    // ❌ SACAMOS filtro por codigoFiddo
  });

  console.log("🧪 Resultados encontrados:", resultados.map(r => r.nombre));

  return resultados;
};
