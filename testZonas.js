const connectDB = require('./db/connect');
const { obtenerZonasOrganizadas } = require('./controllers/zonaController'); // ✅ ruta correcta

async function test() {
  await connectDB(); // conectar a MongoDB
  const zonas = await obtenerZonasOrganizadas();
  console.log(JSON.stringify(zonas, null, 2));
  process.exit(); // terminar el proceso
}

test();
