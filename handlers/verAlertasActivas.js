const alertas = await Alerta.find({ telefono: numero });

if (!alertas.length) {
  return '📭 No tenés alertas configuradas en este momento.\nPodés crear una nueva alerta desde el menú principal.';
}

let respuesta = '📋 Estas son tus alertas:\n';

alertas.forEach((alerta, index) => {
  const nombreLocal = alerta.locales[0] || 'Local no especificado';
  const dias = Object.entries(alerta.diasHorarios || {})
    .map(([dia, rango]) => {
      if (rango.desde && rango.hasta) {
        return `${capitalizar(dia)} de ${rango.desde} a ${rango.hasta}`;
      }
      return capitalizar(dia);
    })
    .join(' – ');
  const estado = alerta.activa ? '' : ' (PAUSADA)';
  respuesta += `${index + 1}️⃣ ${nombreLocal} – ${dias}${estado}\n`;
});
