// scripts/normalizarNombres.js
const mongoose = require('mongoose');
const connectDB = require('../db/connect');
const Local = require('../models/Local');
const normalizarTexto = require('../utils/normalizarTexto');

async function actualizarNombres() {
  await connectDB();

  const locales = await Local.find({});
  let actualizados = 0;

  for (const local of locales) {
    const nombreNormalizado = normalizarTexto(local.nombre || '');

    if (local.nombreNormalizado !== nombreNormalizado) {
      local.nombreNormalizado = nombreNormalizado;
      await local.save();
      actualizados++;
    }
  }

  console.log(`✅ Nombres normalizados actualizados: ${actualizados}`);
  process.exit(0);
}

actualizarNombres().catch(err => {
  console.error('❌ Error al actualizar nombres:', err);
  process.exit(1);
});
