// Script temporal para eliminar al usuario de la base de datos y que Fiddo lo reconozca como nuevo

const mongoose = require('mongoose');
require('dotenv').config();

const Usuario = require('./models/Usuario');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const numero = 'whatsapp:+54XXXXXXXXXX'; // <-- reemplazá por tu número real de pruebas
    const resultado = await Usuario.deleteOne({ telefono: numero });
    console.log('Resultado:', resultado);
    mongoose.disconnect();
  })
  .catch(err => {
    console.error('Error conectando a MongoDB:', err);
  });
