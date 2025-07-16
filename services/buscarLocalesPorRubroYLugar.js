const Local = require('../models/Local'); // modelo de locales

// 🔧 Normaliza texto: sin tildes, en minúsculas, tolera guiones y espacios
function normalizarTexto(texto) {
  return texto
    .normalize('NFD')                  // descompone caracteres (ej. á → a +  ́)
    .replace(/[\u0300-\u036f]/g, '')   // remueve tildes
    .replace(/[-\s]/g, '[ -]?')        // permite guión o espacio indistintamente
    .toLowerCase();
}

async function buscarLocalesPorRubroYLugar(rubro, lugar) {
  try {
    const regexRubro = new RegExp(normalizarTexto(rubro), 'i');
    const regexLugar = new RegExp(normalizarTexto(lugar), 'i');

    console.log('🔍 Buscando locales con:');
    console.log('   🏷️ Rubro (regex):', regexRubro);
    console.log('   🏘️ Localidad (regex):', regexLugar);
    console.log("🔎 Filtro rubro:", regexRubro);
    console.log("🔎 Filtro localidad:", regexLugar);
    const locales = await Local.find({
      rubro: { $regex: regexRubro },
  $or: [
  { localidad: { $regex: regexLugar } },
  { zona:      { $regex: regexLugar } },
  { partido:   { $regex: regexLugar } }
]
    });

    // Agrupar por { localidad, partido, zona }
    const agrupados = {};

    locales.forEach(local => {
      const clave = `${local.localidad}|${local.partido}|${local.zona}`;
      if (!agrupados[clave]) agrupados[clave] = [];
      agrupados[clave].push(local);
    });

    const resultados = Object.entries(agrupados).map(([clave, locales]) => {
      const [localidad, partido, zona] = clave.split('|');
      return {
        localidad,
        partido,
        zona,
        locales
      };
    });

    return resultados;

  } catch (error) {
    console.error('❌ Error en buscarLocalesPorRubroYLugar:', error);
    console.log('🔍 Buscando rubro:', rubro);
console.log('📍 Buscando localidad/zona:', lugar);
console.log('🧪 Total resultados encontrados:', resultados.length);
    return [];
  }
}

module.exports = { buscarLocalesPorRubroYLugar };
