const dias = {
  lunes: ['lunes', 'luns', 'lnues','lnes','luness', 'lune', 'lne'],
  martes: ['martes', 'mrtes','marts', 'martess', 'marts', 'mte'],
  miercoles: ['miércoles', 'miercoles','miercols','miercs', 'mier', 'mié', 'mrcs'],
  jueves: ['jueves', 'juevess', 'jves', 'juev', 'jue'],
  viernes: ['viernes', 'vns','vierne', 'vier', 'vrns'],
  sabado: ['sábado', 'sabado', 'sab', 'sbd'],
  domingo: ['domingo', 'dom','domongo','domigo', 'dmng']
};

module.exports = function interpretarDiaSemana(texto) {
  const limpio = texto.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const [dia, variantes] of Object.entries(dias)) {
    if (variantes.includes(limpio)) {
      return dia;
    }
  }

  return null; // No reconocido
};
