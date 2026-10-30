// Carga las variables de configuración guardadas en el archivo .env.
require('dotenv').config();
// Importa Express para crear el servidor web.
const express = require('express');
// Importa la interfaz web de la documentación Swagger.
const swaggerUi = require('swagger-ui-express');
// Carga la descripción de las rutas para Swagger.
const swaggerSpec = require('./config/swagger');
// Importa la preparación existente de la tabla de usuarios.
const runMigrations = require('./config/migrate');
// Importa las rutas existentes de usuarios.
const userRoutes = require('./routes/user.routes');
// Importa las rutas del catálogo multimedia.
const multimediaRoutes = require('./routes/multimediaRoutes');
// Importa la preparación de la tabla y datos de multimedia.
const initializeMultimediaDatabase = require('./config/database');
// Crea la aplicación Express.
const app = express();
// Usa el puerto configurado o el puerto 3000 como valor predeterminado.
const PORT = process.env.PORT || 3000;
// Permite que Express lea cuerpos de solicitud JSON.
app.use(express.json());
// Publica la documentación Swagger en su dirección habitual.
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
// Mantiene disponibles las rutas existentes de usuarios.
app.use('/api/users', userRoutes);
// Publica la ruta del catálogo multimedia.
app.use('/api/multimedia', multimediaRoutes);
// Mantiene una ruta sencilla para comprobar que el servidor responde.
app.get('/', (req, res) => {
  // Devuelve un mensaje y el enlace a la documentación.
  res.json({ message: 'API corriendo', docs: '/api-docs' });
});
// Inicia primero las tablas y luego pone el servidor a escuchar.
async function start() {
  try {
    await runMigrations();
    await initializeMultimediaDatabase();

    app.listen(PORT, () => {
      console.log(`Servidor en http://localhost:${PORT}`);
      console.log(`Swagger en  http://localhost:${PORT}/api-docs`);
      
      // LOG DE DIAGNÓSTICO: Esto te dirá qué rutas tiene registradas Swagger exactamente en la consola
      console.log('Rutas detectadas por Swagger:', Object.keys(swaggerSpec.paths));
    });
  } catch (err) {
    console.error('Error al iniciar:', err.message);
    process.exit(1);
  }
}
start();