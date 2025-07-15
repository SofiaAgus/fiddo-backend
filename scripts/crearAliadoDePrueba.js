// scripts/crearAliadoDePrueba.js

const mongoose = require('mongoose');
require('dotenv').config();

const Local = require('../models/Local');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const aliado = new Local({
    nombre: 'El Bosque Padel',
    rubro: 'padel',
    zona: 'Zona Norte',
    partido: 'San Isidro',
    localidad: 'Martínez',
    direccion: 'Av. Santa Fe 1234',
    contacto: '1122334455',
    reputacion: '4.7 ⭐️ (Google)',
    promociones: [],
    codigoFiddo: 'CF11224',
    telefono: 'whatsapp:+5491166666666',
    premium: true
  });

  await aliado.save();
  console.log('✅ Aliado creado con éxito');
  process.exit();
};

run().catch(err => {
  console.error('❌ Error creando el aliado:', err);
  process.exit(1);
});
