// scripts/verLocal.js
const connectDB = require('../db/connect');
const Local = require('../models/Local');

async function verLocal(nombreBuscado) {
  await connectDB();
  const local = await Local.findOne({ nombre: nombreBuscado });
  console.log("🧐 Local encontrado:", local);
  process.exit(0);
}

verLocal("El Bosque Padel");
