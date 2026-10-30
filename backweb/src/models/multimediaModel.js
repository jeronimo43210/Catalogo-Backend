// Importa el grupo de conexiones compartido con los demás modelos.
const pool = require('../config/db');
// Define las operaciones de lectura del catálogo.
const MultimediaModel = {
  // Busca hasta 20 registros posteriores al cursor y aplica los filtros recibidos.
  async findPage(cursor, filters) {
    // Prepara los valores que PostgreSQL recibirá de forma segura.
    const values = [cursor];
    // Empieza la consulta con el cursor de paginación.
    let sql = 'SELECT id, titulo, tipo, genero, anio, duracion FROM multimedia WHERE id > $1';
    // Agrega el filtro de género solo cuando se recibió.
    if (filters.genero) {
      // Guarda el filtro como parámetro, sin unirlo directamente al SQL.
      values.push(filters.genero);
      // Usa la posición del valor recién agregado.
      sql += ' AND genero = $' + values.length;
    }
    // Agrega el filtro de tipo solo cuando se recibió.
    if (filters.tipo) {
      // Guarda el filtro como parámetro, sin unirlo directamente al SQL.
      values.push(filters.tipo);
      // Usa la posición del valor recién agregado.
      sql += ' AND tipo = $' + values.length;
    }
    // Ordena por id para que la paginación avance siempre de forma estable.
    sql += ' ORDER BY id ASC LIMIT 20';
    // Ejecuta la consulta y devuelve sus filas.
    const result = await pool.query(sql, values);
    // Entrega los registros encontrados al controlador.
    return result.rows;
  },
  // Calcula las opciones disponibles de género y tipo según los filtros activos.
  async getFacets(filters) {
    // Prepara las condiciones que afectan los conteos de género.
    const genreValues = [];
    // Inicia el conteo de géneros agrupado por nombre.
    let genreSql = 'SELECT genero AS valor, COUNT(*)::integer AS conteo FROM multimedia WHERE genero IS NOT NULL';
    // Aplica el filtro de tipo a los conteos de género si está activo.
    if (filters.tipo) {
      // Agrega el tipo como valor protegido.
      genreValues.push(filters.tipo);
      // Filtra por el tipo seleccionado.
      genreSql += ' AND tipo = $' + genreValues.length;
    }
    // Agrupa los registros para contar cada género disponible.
    genreSql += ' GROUP BY genero ORDER BY genero';
    // Prepara las condiciones que afectan los conteos de tipo.
    const typeValues = [];
    // Inicia el conteo de tipos agrupado por nombre.
    let typeSql = 'SELECT tipo AS valor, COUNT(*)::integer AS conteo FROM multimedia WHERE tipo IS NOT NULL';
    // Aplica el filtro de género a los conteos de tipo si está activo.
    if (filters.genero) {
      // Agrega el género como valor protegido.
      typeValues.push(filters.genero);
      // Filtra por el género seleccionado.
      typeSql += ' AND genero = $' + typeValues.length;
    }
    // Agrupa los registros para contar cada tipo disponible.
    typeSql += ' GROUP BY tipo ORDER BY tipo';
    // Ejecuta ambos conteos a la vez para reducir el tiempo de espera.
    const results = await Promise.all([pool.query(genreSql, genreValues), pool.query(typeSql, typeValues)]);
    // Devuelve ambos listados en una estructura fácil de usar.
    return { generos: results[0].rows, tipos: results[1].rows };
  },
};
// Permite que el controlador utilice las consultas del catálogo.
module.exports = MultimediaModel;
