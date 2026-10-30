// Importa las consultas que trabajan con la tabla multimedia.
const MultimediaModel = require('../models/multimediaModel');
// Define la respuesta de la ruta del catálogo.
const MultimediaController = {
  // Atiende las solicitudes GET y prepara la página y sus facetas.
  async getCatalog(req, res) {
    // Lee el cursor enviado en la dirección y usa cero para la primera página.
    const cursorText = req.query.cursor === undefined ? '0' : String(req.query.cursor);
    // Convierte el cursor a número para validar que sea un entero permitido.
    const cursor = Number(cursorText);
    // Revisa que el cursor sea un entero no negativo.
    if (!Number.isSafeInteger(cursor) || cursor < 0) {
      // Avisa al cliente que el cursor no tiene un formato válido.
      return res.status(400).json({ success: false, message: 'El cursor debe ser un número entero igual o mayor que cero.' });
    }
    // Recoge los filtros de texto enviados como parámetros.
    const filters = { genero: req.query.genero, tipo: req.query.tipo };
    // Rechaza filtros que no sean valores de texto simples.
    if ((filters.genero !== undefined && typeof filters.genero !== 'string') || (filters.tipo !== undefined && typeof filters.tipo !== 'string')) {
      // Avisa al cliente que cada filtro debe tener un solo valor de texto.
      return res.status(400).json({ success: false, message: 'Los filtros genero y tipo deben ser valores de texto únicos.' });
    }
    // Evita ejecutar búsquedas con filtros vacíos.
    if (filters.genero === '' || filters.tipo === '') {
      // Avisa que un filtro enviado no puede estar vacío.
      return res.status(400).json({ success: false, message: 'Los filtros genero y tipo no pueden estar vacíos.' });
    }
    // Busca la página y los conteos de facetas en paralelo.
    try {
      // Espera las dos consultas porque ambas hacen falta para la respuesta.
      const results = await Promise.all([MultimediaModel.findPage(cursor, filters), MultimediaModel.getFacets(filters)]);
      // Guarda los registros de la página solicitada.
      const data = results[0];
      // Usa el id del último resultado como punto de partida para la página siguiente.
      const nextCursor = data.length === 20 ? data[data.length - 1].id : null;
      // Devuelve los registros, el siguiente cursor y los conteos de facetas.
      return res.json({ success: true, data: data, next_cursor: nextCursor, facets: results[1] });
    } catch (error) {
      // Guarda el detalle técnico para que el equipo pueda investigar el fallo.
      console.error('Error al consultar el catálogo multimedia:', error);
      // Informa al cliente que la consulta no pudo completarse.
      return res.status(500).json({ success: false, message: 'No se pudo consultar el catálogo multimedia.' });
    }
  },
};
// Permite que la ruta conecte con el controlador.
module.exports = MultimediaController;
