// scripts/asignarCodigo.js
const connectDB = require('../db/connect');
const Local = require('../models/Local');

async function asignarCodigo(nombre, codigo) {
  await connectDB();
  const local = await Local.findOne({ nombre });

  if (!local) {
    console.log('❌ No se encontró el local.');
    process.exit(1);
  }

  local.codigoFiddo = codigo;
  await local.save();
  console.log(`✅ Código asignado: ${codigo} a ${local.nombre}`);
  process.exit(0);
}

asignarCodigo("El Bosque Padel", "CF11222");
