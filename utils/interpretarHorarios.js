const interpretarDiaSemana = require('./interpretarDiaSemana');

function interpretarHorarios(texto) {
  texto = texto.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quitar tildes
    .replace(/hs/g, "")
    .replace(/h/g, "")
    .replace(/ a las /g, " ")
    .replace(/,/g, " ")
    .replace(/\s+y\s+/g, " y ");

  const horarios = {};
  const bloques = texto.split(/(?=\b(?:lunes|martes|miercoles|jueves|viernes|sabado|domingo)\b)/g);

  for (const bloque of bloques) {
    const partes = bloque.trim().split(/\s+/);
    const diaRaw = partes[0];
    const dia = interpretarDiaSemana(diaRaw);
    if (!dia) continue;

    const contenido = partes.slice(1).join(" ");

    // 1. Rango explícito: "de 18 a 20", "18 hasta 20"
    const rango = contenido.match(/(?:de|entre)?\s*(\d{1,2})\s*(?:a|hasta)\s*(\d{1,2})/);
    if (rango) {
      const desde = parseInt(rango[1]);
      const hasta = parseInt(rango[2]);
      if (!isNaN(desde) && !isNaN(hasta)) {
        horarios[dia] = { desde, hasta };
        continue;
      }
    }

    // 2. Después de las XX
    const despuesMatch = contenido.match(/despues de las? (\d{1,2})/);
    if (despuesMatch) {
      const desde = parseInt(despuesMatch[1]);
      if (!isNaN(desde)) {
        horarios[dia] = { desde, hasta: 23 };
        continue;
      }
    }

    // 3. Antes de las XX
    const antesMatch = contenido.match(/antes de las? (\d{1,2})/);
    if (antesMatch) {
      const hasta = parseInt(antesMatch[1]);
      if (!isNaN(hasta)) {
        horarios[dia] = { desde: 8, hasta };
        continue;
      }
    }

    // 4. Frases generales
    if (/todo el dia/.test(contenido)) {
      horarios[dia] = { desde: 8, hasta: 23 };
      continue;
    } else if (/ma[ñn]ana/.test(contenido)) {
      horarios[dia] = { desde: 8, hasta: 12 };
      continue;
    } else if (/tarde/.test(contenido)) {
      horarios[dia] = { desde: 13, hasta: 18 };
      continue;
    } else if (/noc[he]|noxe|noce/.test(contenido)) {
      horarios[dia] = { desde: 19, hasta: 23 };
      continue;
    }

    // 5. Horas sueltas
    const horas = contenido
      .match(/\d{1,2}/g)
      ?.map(h => parseInt(h))
      .filter(h => !isNaN(h) && h >= 0 && h <= 23);

    if (horas && horas.length > 0) {
      horarios[dia] = { horas };
    }
  }

  return horarios;
}

module.exports = interpretarHorarios;
