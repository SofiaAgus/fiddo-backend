const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/webhook', async (req, res) => {
  console.log('Mensaje recibido de Twilio:', req.body);

  const from = req.body.From;
  const body = req.body.Body;

  if (from && body) {
    const texto = body.trim().toLowerCase();

    const saludosReconocidos = [
      'hola',
      'hola fiddo',
      'hola fido',
      'hi',
      'hello'
    ];

    let message;

    if (saludosReconocidos.includes(texto)) {
      message = `👋 ¡Hola, Bienvenido! Soy Fiddo, el avisador de turnos que a VOS te interesan 😉\n\n` +
                `1️⃣ Configuración de perfil\n` +
                `2️⃣ Definir una alerta sin guardar perfil\n` +
                `3️⃣ Tengo Código Fiddo\n` +
                `📩 Respondé con el número de la opción`;
    } else {
      message = '🤖 No entendí ese mensaje. Escribí "Hola" para comenzar.';
    }

    try {
      await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        new URLSearchParams({
          To: from,
          From: 'whatsapp:+14155238886',
          Body: message
        }),
        {
          auth: {
            username: process.env.TWILIO_ACCOUNT_SID,
            password: process.env.TWILIO_AUTH_TOKEN
          }
        }
      );

      console.log('Respuesta enviada correctamente a:', from);
    } catch (error) {
      console.error('Error enviando respuesta:', error.response?.data || error.message);
    }
  }

  res.send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Fiddo corriendo en puerto ${PORT}`);
});
