// scripts/actualizarPromos.js

const mongoose = require('mongoose');
require('dotenv').config();
const Local = require('../models/Local');

const promosPorNombre = {
  'El Bosque Pádel': '🏆 Torneo relámpago este viernes',
  'Punto de Oro': '🎾 2x1 en clases los miércoles',
  'Peluquería Los Hermanos': '💇‍♂️ 20% de descuento los martes',
  'Peluquería María': '🎁 Corte + peinado a $500',
  // Agregá más si querés
};

async function actualizarPromos() {
  await mongoose.connect(process.env.MONGO_URI);

  for (const [nombre, promo] of Object.entries(promosPorNombre)) {
    const actualizado = await Local.findOneAndUpdate(
      { nombre: new RegExp(`^${nombre}$`, 'i') },
      { promocion: promo },
      { new: true }
    );

    if (actualizado) {
      console.log(`✅ Promo actualizada para: ${actualizado.nombre}`);
    } else {
      console.warn(`⚠️ No se encontró el local: ${nombre}`);
    }
  }

  mongoose.disconnect();
}

actualizarPromos();
