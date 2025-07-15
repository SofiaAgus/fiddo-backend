module.exports = function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // tildes
    .replace(/[^\w\s]/g, '')          // signos
    .replace(/\s+/g, ' ')             // múltiples espacios
    .trim()
    .toLowerCase();
};
