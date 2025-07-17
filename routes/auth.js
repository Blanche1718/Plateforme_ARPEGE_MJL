const express = require("express");
const router = express.Router();
const path = require('path');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const AgentController = require('../controllers/agent');
const UserLogin = require('../controllers/users');

const AuthModule = require('../middlewares/is-auth');
// Get the project root directory
const projectRoot = path.resolve(__dirname, '../../');

/**
 * @swagger
 * /api/auth/login_in:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: greffier@gouv.bj
 *               password:
 *                 type: string
 *                 example: password
 *     responses:
 *       200:
 *         description: Successful login and user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 userToSend:
 *                   type: object
 *                   properties:
 *                     refreshToken:
 *                       type: string
 *                       example: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "b8085131-873a-4e0c-90ff-82c18ab87e6f"
 *                         nom:
 *                           type: string
 *                           example: "Doe"
 *                         prenoms:
 *                           type: string
 *                           example: "John"
 *                         email:
 *                           type: string
 *                           example: "user@example.com"
 *                         tel:
 *                           type: string
 *                           nullable: true
 *                         first_connect:
 *                           type: boolean
 *                           example: false
 *                         derniere_connexion:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-20T12:36:25.859Z"
 *                         status:
 *                           type: string
 *                           example: "Actif"
 *                         role:
 *                           type: string
 *                           example: "Utilisateur"
 *                         organisation:
 *                           type: string
 *                           example: "Organisation XYZ"
 *       400:
 *         description: Invalid input or user not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failure
 *                 message:
 *                   type: string
 *                   example: "Nom d'utilisateur incorrect ou utilisateur désactivé."
 *       401:
 *         description: Incorrect password
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failure
 *                 message:
 *                   type: string
 *                   example: "Nom d'utilisateur ou mot de passe incorrect."
 *       403:
 *         description: Too many active connections
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failure
 *                 message:
 *                   type: string
 *                   example: "Vous avez beaucoup de comptes actifs, déconnectez-vous de l'un."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failure
 *                 message:
 *                   type: string
 *                   example: "Un problème interne. Veuillez patienter."
 */
router.post('/login_in', UserLogin.login);


/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: User logout
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successful logout message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Déconnexion réussie."
 *       400:
 *         description: User ID is missing
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failure
 *                 message:
 *                   type: string
 *                   example: "Utilisateur non trouvé. Vous devez être connecté pour vous déconnecter."
 *       401:
 *         description: Invalid token or unauthorized access
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failure
 *                 message:
 *                   type: string
 *                   example: "Veuillez vous connecter."
 *       500:
 *         description: Error during logout
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failure
 *                 message:
 *                   type: string
 *                   example: "Un problème lors de la déconnexion. Veuillez réessayer."
 */
router.post('/logout', AuthModule.isAuth, UserLogin.logout);


/**
 * @swagger
 * /api/auth/session:
 *   get:
 *     summary: Retrieve user session information
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user session information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "b95c5977-a9de-4009-b89e-f7c47decfaa7"
 *                         first_name:
 *                           type: string
 *                           example: "Pierre"
 *                         last_name:
 *                           type: string
 *                           example: "Martin"
 *                         email:
 *                           type: string
 *                           example: "greffier@gouv.bj"
 *                         tel:
 *                           type: string
 *                           nullable: true
 *                           example: null
 *                         last_connexion:
 *                           type: string
 *                           format: date-time
 *                           example: "2023-04-19T16:00:00.000Z"
 *                         status:
 *                           type: string
 *                           example: "Actif"
 *                         role:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: integer
 *                               example: 13
 *                             label:
 *                               type: string
 *                               example: "Le greffier en chef"
 *                             code:
 *                               type: string
 *                               example: "gec"
 *                             disabled:
 *                               type: boolean
 *                               example: false
 *                             hidden:
 *                               type: boolean
 *                               example: false
 *                             createdAt:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-05-22T01:17:40.195Z"
 *                             updatedAt:
 *                               type: string
 *                               format: date-time
 *                               example: "2025-05-22T01:17:40.195Z"
 *                             parent_id:
 *                               type: integer
 *                               example: 3
 *                     jwt:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "b22dc8ac-b2da-4c3b-9945-1e47b36079f1"
 *                         token:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                         refreshToken:
 *                           type: string
 *                           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                           nullable: true
 *       401:
 *         description: Unauthorized - User not logged in or invalid token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "failure"
 *                 message:
 *                   type: string
 *                   example: "Veuillez vous connecter."
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "failure"
 *                 message:
 *                   type: string
 *                   example: "Veuillez envoyer un bon utilisateur."
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "failure"
 *                 message:
 *                   type: string
 *                   example: "Un problème lors de la récupération de l'utilisateur."
 */
router.get('/session', AuthModule.isAuth, UserLogin.session);



/**
 * @swagger
 * /api/auth/changePwd:
 *   post:
 *     summary: Update user password
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: "user@example.com"
 *               apassword:
 *                 type: string
 *                 example: "oldPassword123"
 *               password:
 *                 type: string
 *                 example: "newPassword123"
 *               password_confirmation:
 *                 type: string
 *                 example: "newPassword123"
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 id:
 *                   type: string
 *                   example: "b8085131-873a-4e0c-90ff-82c18ab87e6f"
 *       400:
 *         description: Validation error or incorrect input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failure
 *                 message:
 *                   type: string
 *                   example: "Remplissez tous les champs correctement"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failure
 *                 message:
 *                   type: string
 *                   example: "Un problème lors de la mise à jour. Veuillez réessayer."
 */
router.put('/changePwd', AuthModule.isAuth, UserLogin.updateProfilePassword);


/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Refresh access token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               jwtToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               refreshToken:
 *                 type: string
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Tokens refreshed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: "Tokens rafraîchis avec succès."
 *                 accessToken:
 *                   type: string
 *                   example: "newAccessToken"
 *                 refreshToken:
 *                   type: string
 *                   example: "newRefreshToken"
 *       400:
 *         description: Missing token or refresh token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failure
 *                 message:
 *                   type: string
 *                   example: "Token d'accès ou refresh token manquant."
 *       401:
 *         description: Session expired or refresh token invalid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failure
 *                 message:
 *                   type: string
 *                   example: "Session expirée, veuillez vous reconnecter."
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: failure
 *                 message:
 *                   type: string
 *                   example: "Une erreur interne s'est produite."
 */
router.post('/refresh-token', AuthModule.isAuth, UserLogin.handleToken);

// Return router
module.exports = router;