function mapearZonas(zonas, partidos) {
  return zonas.map(zona => {
    const partidosAsociados = zona.incluye.map(idPartido => {
      return partidos.find(p => p.id === idPartido);
    }).filter(Boolean); // evita valores undefined

    return {
      id: zona.id,
      nombre: zona.nombre,
      partidos: partidosAsociados.map(p => ({
        id: p.id,
        nombre: p.nombre,
        localidades: p.incluye
      }))
    };
  });
}

module.exports = { mapearZonas };
