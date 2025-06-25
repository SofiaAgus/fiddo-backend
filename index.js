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
    const message = '👋 ¡Hola! Soy Fiddo, tu avisador de turnos 😉';

    try {
      await axios.post('https://api.twilio.com/2010-04-01/Accounts/' + process.env.TWILIO_ACCOUNT_SID + '/Messages.json', new URLSearchParams({
        To: from,
        From: process.env.TWILIO_PHONE_NUMBER,
        Body: message
      }), {
        auth: {
          username: process.env.TWILIO_ACCOUNT_SID,
          password: process.env.TWILIO_AUTH_TOKEN
        }
      });

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
