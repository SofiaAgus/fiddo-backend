const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
  console.log('Mensaje recibido de Twilio:', req.body);
  res.send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor Fiddo corriendo en puerto ${PORT}`);
});
