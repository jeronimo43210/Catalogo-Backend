// Importa el grupo de conexiones PostgreSQL que ya usa el resto del proyecto.
const pool = require('./db');
// Guarda la preparación de la tabla y sus datos de ejemplo.
async function initializeMultimediaDatabase() {
  // Crea la tabla si no existe; la clave primaria crea automáticamente un índice B-Tree único para id.
  await pool.query('CREATE TABLE IF NOT EXISTS multimedia (id SERIAL PRIMARY KEY, titulo VARCHAR(255), tipo VARCHAR(50), genero VARCHAR(50), anio INTEGER, duracion INTEGER)');
  // Cuenta los registros existentes para evitar repetir la carga de datos.
  const result = await pool.query('SELECT COUNT(*) AS total FROM multimedia');
  // Convierte el conteo de texto a un número fácil de comparar.
  const total = Number(result.rows[0].total);
  // Carga los ejemplos solo cuando la tabla está vacía.
  if (total === 0) {
    // Inserta 105,000 filas desde PostgreSQL con una sola operación eficiente.
    await pool.query("INSERT INTO multimedia (titulo, tipo, genero, anio, duracion) SELECT 'Título multimedia ' || numero, (ARRAY['Película', 'Serie', 'Documental', 'Cortometraje'])[ ((numero - 1) % 4) + 1 ], (ARRAY['Acción', 'Comedia', 'Drama', 'Ciencia ficción', 'Aventura', 'Terror', 'Animación', 'Romance', 'Misterio', 'Fantasía'])[ ((numero - 1) % 10) + 1 ], 1980 + ((numero - 1) % 45), 60 + ((numero - 1) % 121) FROM generate_series(1, 105000) AS numero");
    // Informa que la carga inicial terminó.
    console.log('Se cargaron 105000 registros sintéticos en multimedia.');
  }
  // Informa que la tabla está lista para recibir consultas.
  console.log('Tabla multimedia lista.');
}
// Permite que el servidor ejecute esta preparación al iniciar.
module.exports = initializeMultimediaDatabase;
