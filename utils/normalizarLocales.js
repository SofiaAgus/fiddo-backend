const connectDB = require('../db/connect');
const Local = require('../models/Local');

function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // quita tildes
    .toLowerCase()
    .trim();
}

async function normalizarLocales() {
  await connectDB();

  const locales = await Local.find();

  for (const local of locales) {
    let modificado = false;

    if (local.localidad) {
      const original = local.localidad;
      local.localidad = normalizarTexto(local.localidad);
      if (local.localidad !== original) modificado = true;
    }

    if (local.partido) {
      const original = local.partido;
      local.partido = normalizarTexto(local.partido);
      if (local.partido !== original) modificado = true;
    }

    if (local.zona) {
      const original = local.zona;
      local.zona = normalizarTexto(local.zona);
      if (local.zona !== original) modificado = true;
    }

    if (local.rubro) {
      const original = local.rubro;
      local.rubro = normalizarTexto(local.rubro);
      if (local.rubro !== original) modificado = true;
    }

    if (modificado) {
      await local.save();
      console.log(`✅ Local actualizado: ${local.nombre}`);
    }
  }

  console.log('🎉 Normalización finalizada.');
  process.exit();
}

normalizarLocales();
