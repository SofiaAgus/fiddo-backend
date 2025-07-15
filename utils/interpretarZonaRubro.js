const Zona = require('../models/Zona');
const Local = require('../models/Local');

function normalizarTexto(texto) {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

async function interpretarZonaRubro(mensaje) {
  const texto = normalizarTexto(mensaje);

  // Todos los rubros ya normalizados
  const rubros = [
    "peluqueria", "padel", "psicologo", "psicologia",
    "clinica", "nutricionista", "cardiologo", "tenis", "futbol", "kinesiologia"
  ];

  const rubroDetectado = rubros.find(r => texto.includes(r));
  if (!rubroDetectado) return null;

  const locales = await Local.find({
    rubro: { $regex: rubroDetectado, $options: 'i' }
  });

  if (locales.length > 0) {
    const lugaresEncontrados = locales.filter(local => {
      const zona = normalizarTexto(local.zona || '');
      const partido = normalizarTexto(local.partido || '');
      const localidad = normalizarTexto(local.localidad || '');
      return texto.includes(zona) || texto.includes(partido) || texto.includes(localidad);
    });

    if (lugaresEncontrados.length > 0) {
      const primerCoincidencia = lugaresEncontrados[0];
      const zona = primerCoincidencia.zona || null;
      const partido = primerCoincidencia.partido || null;
      const localidad = primerCoincidencia.localidad || null;

      const localesFiltrados = lugaresEncontrados
        .filter(l => l.localidad === localidad && l.partido === partido)
        .map(l => l.nombre);

      return {
        rubro: rubroDetectado,
        zona,
        partido,
        localidad,
        locales: [...new Set(localesFiltrados)]
      };
    }
  }

  const zonas = await Zona.find({});
  const zonaDetectada = zonas.find(z => texto.includes(normalizarTexto(z.nombre)));

  if (zonaDetectada) {
    return {
      rubro: rubroDetectado,
      zona: zonaDetectada.nombre,
      locales: []
    };
  }

  return null;
}

module.exports = interpretarZonaRubro;
