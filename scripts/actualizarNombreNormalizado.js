// scripts/actualizarNombreNormalizado.js

const mongoose = require('mongoose');
require('dotenv').config();
const normalizarTexto = require('../utils/normalizarTexto');
const Local = require('../models/Local');

async function actualizarTodosLosLocales() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const locales = await Local.find({});
    for (const local of locales) {
      const normalizado = normalizarTexto(local.nombre || '');
      local.nombreNormalizado = normalizado;
      await local.save();
      console.log(`✅ ${local.nombre} → ${normalizado}`);
    }

    console.log('✔️ Todos los locales fueron actualizados.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('❌ Error al actualizar:', err);
  }
}

actualizarTodosLosLocales();
