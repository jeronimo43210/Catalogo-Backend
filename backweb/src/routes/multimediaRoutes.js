// Importa la función para crear rutas de Express.
const { Router } = require('express');
// Importa la lógica que responde las solicitudes del catálogo.
const MultimediaController = require('../controllers/multimediaController');
// Crea un grupo de rutas separado para multimedia.
const router = Router();
// Atiende las solicitudes GET que llegan a esta ruta.
/**
 * @swagger
 *  /api/multimedia:
 *   get:
 *     summary: Obtener el catálogo multimedia completo
 *     description: Retorna la lista de todos los elementos multimedia disponibles en el catálogo (soporta grandes volúmenes de registros).
 *     tags:
 *       - Multimedia
 *     responses:
 *       200:
 *         description: Catálogo multimedia obtenido con éxito.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     description: ID único del registro multimedia.
 *                   titulo:
 *                     type: string
 *                     description: Título de la obra o archivo.
 *       500:
 *         description: Error interno del servidor al procesar la consulta.
 */
// Atiende las solicitudes GET que llegan a esta ruta.
router.get('/', MultimediaController.getCatalog);
// Exporta la ruta para que el servidor la pueda montar.
module.exports = router;