const express = require('express');
const bodyParser = require('body-parser');
const connectDB = require('./db/connect');
const { obtenerSesion, actualizarSesion, reiniciarSesion } = require('./session/sessionManager');
const manejarCodigo = require('./handlers/esperandoCodigo');
const manejarInicio = require('./manejarInicio');
const modificarAlerta = require('./handlers/modificarAlerta');
const reanudarAlerta = require('./handlers/reanudarAlerta');
const eliminarAlerta = require('./handlers/eliminarAlerta');
const gestionarAccionEnAlerta = require('./handlers/gestionarAccionEnAlerta');
const pausarAlerta = require('./handlers/pausarAlerta');
const confirmarModificacionAlerta = require('./handlers/confirmarModificacionAlerta');
const gestionarAlerta = require('./handlers/gestionarAlerta');
const confirmarEliminarAlerta = require('./handlers/confirmarEliminarAlerta');
const Usuario = require('./models/Usuario');
const manejarBusqueda = require('./handlers/esperandoBusqueda');
const manejarLocalesExpress = require('./handlers/esperandoLocalesExpress');
const manejarHorarios = require('./handlers/esperandoHorarios');
const recibirPromoAliado = require('./handlers/recibirPromoAliado');
const manejarResumenAlerta = require('./handlers/resumenAlerta');
const manejarConfirmacionAlertaExpress = require('./handlers/esperandoConfirmacionAlertaExpress');
const manejarConfirmacionPromos = require('./handlers/confirmarPromociones');
const consultarPromosPremium = require('./handlers/consultarPromosPremium');
const manejarVolver = require('./handlers/volver');
const verificarSiEsAliado = require('./utils/verificarSiEsAliado');
const manejarMenuUsuarioRecurrente = require('./handlers/menuUsuarioRecurrente');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
connectDB();

app.post('/twilio', async (req, res) => {
  console.log('📩 Body completo:', req.body);

  const mensaje = (req.body.Body || '').trim().toLowerCase();
  const numero = req.body.From;
  console.log('📩 Mensaje recibido:', mensaje);
  let sesion = obtenerSesion(numero);
  console.log('🔁 Estado actual de sesión:', sesion.estado);
  let respuesta = '';

  if (mensaje === 'hola' || mensaje === 'cancelar') {
    const aliado = await verificarSiEsAliado(numero);
    await reiniciarSesion(numero);
    const nuevaSesion = obtenerSesion(numero);
    sesion = nuevaSesion;

    if (aliado) {
      await actualizarSesion(numero, {
        estado: 'menu_aliado',
        esAliado: true,
        localesSeleccionados: [aliado.nombre]
      });

      respuesta = `👋 ¡Hola ${aliado.nombre}! Este es tu panel de gestión en Fiddo 🛠️\n\n1️⃣ Cargar promoción\n2️⃣ Ver estadísticas (próximamente)\n3️⃣ Editar mis datos\n\n📌 Escribí el número de la opción que quieras usar.`;
    } else {
      const usuario = await Usuario.findOne({ telefono: numero });

      if (usuario && usuario.tipo === 'nuevo') {
        await actualizarSesion(numero, { estado: 'esperando_codigo' });
        respuesta = require('./messages/bienvenida');
        console.log('✅ Se cargó mensaje de bienvenida:', respuesta);
      } else if (usuario && usuario.tipo === 'recurrente') {
        await actualizarSesion(numero, { estado: 'menu_usuario_recurrente' });
        const nuevaSesion = obtenerSesion(numero);
        respuesta = await manejarMenuUsuarioRecurrente(mensaje, numero, nuevaSesion);
      } else {
        await actualizarSesion(numero, { estado: 'esperando_codigo' });
        respuesta = require('./messages/bienvenida');
      }

    }

    return res.set('Content-Type', 'text/xml').send(`<Response><Message>${respuesta}</Message></Response>`);
  }

  if (mensaje === 'volver') {
    respuesta = await manejarVolver(sesion, numero);
    return res.set('Content-Type', 'text/xml').send(`<Response><Message>${respuesta}</Message></Response>`);
  }

  if (mensaje === 'cargar promo') {
    sesion.estado = 'esperando_promo_texto';
    await actualizarSesion(numero, sesion);
    return res.set('Content-Type', 'text/xml').send(`<Response><Message>📢 Escribime el texto de tu promoción para hoy. ¡Que sea clara y atractiva!</Message></Response>`);
  }

  switch (sesion.estado) {
    case null:
    case undefined:
      console.log('📥 Estado null o undefined, mostrando menú de usuario recurrente');
      respuesta = await manejarMenuUsuarioRecurrente('menu', numero, sesion);
      return res.set('Content-Type', 'text/xml').send(`<Response><Message>${respuesta}</Message></Response>`);

    case 'menu_usuario_recurrente':
    if (mensaje === '1') {
      const verAlertasUsuario = require('./handlers/verAlertasUsuario');
      respuesta = await verAlertasUsuario(numero, sesion);
    } else {
      respuesta = await manejarMenuUsuarioRecurrente(mensaje, numero, sesion);
    }

    console.log('📤 Respuesta desde menu_usuario_recurrente:', respuesta);
    return res.set('Content-Type', 'text/xml').send(`<Response><Message>${respuesta}</Message></Response>`);


    case 'viendo_alertas':
      respuesta = await gestionarAlerta(mensaje, numero, sesion);
      return res.set('Content-Type', 'text/xml').send(`<Response><Message>${respuesta}</Message></Response>`);

    case 'esperando_confirmacion_alerta_express':
      console.log('🟡 Entrando a handler esperandoConfirmacionAlertaExpress');
      respuesta = await manejarConfirmacionAlertaExpress(mensaje, numero, sesion);
      return res.set('Content-Type', 'text/xml').send(`<Response><Message>${respuesta}</Message></Response>`);

    case 'esperando_accion_alerta':
      respuesta = await gestionarAccionEnAlerta(mensaje, numero, sesion);
      return res.set('Content-Type', 'text/xml').send(`<Response><Message>${respuesta}</Message></Response>`);

    case 'reanudar_alerta':
      respuesta = await reanudarAlerta(mensaje, numero, sesion);
      return res.set('Content-Type', 'text/xml').send(`<Response><Message>${respuesta}</Message></Response>`);

    case 'gestionar_alerta':
      respuesta = await gestionarAccionEnAlerta(mensaje, numero, sesion);
      return res.set('Content-Type', 'text/xml').send(`<Response><Message>${respuesta}</Message></Response>`);

    case 'eliminar_alerta':
      respuesta = await eliminarAlerta(mensaje, numero, sesion);
      return res.set('Content-Type', 'text/xml').send(`<Response><Message>${respuesta}</Message></Response>`);

    case 'pausar_alerta':
      respuesta = await pausarAlerta(mensaje, numero, sesion);
      return res.set('Content-Type', 'text/xml').send(`<Response><Message>${respuesta}</Message></Response>`);

    case 'modificar_alerta':
      respuesta = await modificarAlerta(mensaje, numero, sesion);
      return res.set('Content-Type', 'text/xml').send(`<Response><Message>${respuesta}</Message></Response>`);

    case 'confirmar_modificacion_alerta':
      respuesta = await confirmarModificacionAlerta(mensaje, numero, sesion);
      return res.set('Content-Type', 'text/xml').send(`<Response><Message>${respuesta}</Message></Response>`);

    case 'confirmar_eliminacion_alerta':
      respuesta = await confirmarEliminarAlerta(mensaje, numero, sesion);
      return res.set('Content-Type', 'text/xml').send(`<Response><Message>${respuesta}</Message></Response>`);

    case 'esperando_codigo': {
      const usuario = await Usuario.findOne({ telefono: numero });
      if (usuario && usuario.tipo === 'recurrente') {
        await actualizarSesion(numero, { estado: 'menu_usuario_recurrente' });
        respuesta = await manejarMenuUsuarioRecurrente(mensaje, numero, sesion);
        return res.set('Content-Type', 'text/xml').send(`<Response><Message>${respuesta}</Message></Response>`);
      }

      if (mensaje === '1') {
        sesion.estado = 'esperando_busqueda';
        sesion.buscarPorNombre = false;
        await actualizarSesion(numero, sesion);
        respuesta = '📍 Escribime el rubro y zona donde buscás un aliado.\n(Ej: "peluquería en Palermo" o "padel en Olivos")';
      } else if (mensaje === '2') {
        sesion.estado = 'esperando_busqueda';
        sesion.buscarPorNombre = true;
        await actualizarSesion(numero, sesion);
        respuesta = '🔎 Escribime el nombre del local o profesional que estás buscando.\n(Ej: "El Bosque Padel" o "Dr. Alejandro López")';
      } else if (mensaje === 'promos') {
        sesion.estado = 'esperando_promociones_menu';
        await actualizarSesion(numero, sesion);
        respuesta = '🎁 ¿Qué promo te interesa ver hoy? 😎\n(por ejemplo: Peluquerías en Villa Adelina o Tenis en Martínez)';
      } else {
        respuesta = await manejarCodigo(mensaje, numero, sesion);
      }
      return res.set('Content-Type', 'text/xml').send(`<Response><Message>${respuesta}</Message></Response>`);
    }

    case 'esperando_busqueda':
      respuesta = await manejarBusqueda(mensaje, numero, sesion);
      return res.set('Content-Type', 'text/xml').send(`<Response><Message>${respuesta}</Message></Response>`);

    case 'esperando_locales_express':
      respuesta = await manejarLocalesExpress(mensaje, numero, sesion);
      return res.set('Content-Type', 'text/xml').send(`<Response><Message>${respuesta}</Message></Response>`);

    case 'esperando_horarios':
      respuesta = await manejarHorarios(mensaje, numero, sesion);
      return res.set('Content-Type', 'text/xml').send(`<Response><Message>${respuesta}</Message></Response>`);

    case 'resumen_alerta':
      console.log('➡️ Entrando a manejarResumenAlerta con mensaje:', mensaje);
      respuesta = await manejarResumenAlerta(mensaje, numero, sesion);
      return res.set('Content-Type', 'text/xml').send(`<Response><Message>${respuesta}</Message></Response>`);

    case 'esperando_promociones':
      respuesta = await manejarConfirmacionPromos(mensaje, numero, sesion);
      return res.set('Content-Type', 'text/xml').send(`<Response><Message>${respuesta}</Message></Response>`);

    case 'esperando_promociones_menu':
      respuesta = await consultarPromosPremium(mensaje, numero, sesion);
      return res.set('Content-Type', 'text/xml').send(`<Response><Message>${respuesta}</Message></Response>`);

    case 'esperando_promo_texto':
      respuesta = await recibirPromoAliado(mensaje, numero, sesion);
      await reiniciarSesion(numero);
      return res.set('Content-Type', 'text/xml').send(`<Response><Message>${respuesta}</Message></Response>`);
  }


  if (!respuesta) {
    respuesta = '😕 No entendí bien. Podés escribirme algo como: “padel en Martínez” o “una peluquería por Palermo”.';
  }

  res.set('Content-Type', 'text/xml');
  console.log('📤 Respuesta enviada:', respuesta);
  res.send(`<Response><Message>${respuesta}</Message></Response>`);

  // --- Solo para que Render detecte un puerto abierto ---
});

const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end('Fiddo backend running');
});

server.listen(process.env.PORT || 3000, () => {
  console.log(`🟢 Fiddo backend escuchando en puerto ${process.env.PORT || 3000}`);
});
