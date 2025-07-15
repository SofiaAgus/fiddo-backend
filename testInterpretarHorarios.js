const interpretarHorarios = require('./utils/interpretarHorarios');


const entrada = "martes por la noche";
const resultado = interpretarHorarios(entrada);

console.log("🧪 Resultado final:", JSON.stringify(resultado, null, 2));
