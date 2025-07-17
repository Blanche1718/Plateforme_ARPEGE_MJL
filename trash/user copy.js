const express = require("express");
const router = express.Router();
const path = require('path');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const AgentController = require('../controllers/agent');
const userController = require('../controllers/users');
const Validator = require('../helpers/validator'); // Adjust the path as necessary
const AuthModule = require('../middlewares/is-auth');

// Get the project root directory
const projectRoot = path.resolve(__dirname, '../../');


/**
 * @swagger
 * /api/agent/get-profile-demandeur/{id}:
 *   get:
 *     summary: Retrieve user profile by ID
 *     tags: [Agent Profile]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *         description: The ID of the user to retrieve
 *     responses:
 *       200:
 *         description: Utilisateur trouvé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Utilisateur trouvé"
 *                 data:
 *                   type: object
 *                   properties:
 *                     all_filled:
 *                       type: boolean
 *                       example: true
 *                     completion_percentage:
 *                       type: integer
 *                       example: 50
 *                     id:
 *                       type: string
 *                       example: "b95c5977-a9de-4009-b89e-f7c47decfaa7"
 *                     first_name:
 *                       type: string
 *                       example: "Pierre"
 *                     last_name:
 *                       type: string
 *                       example: "Martin"
 *                     matricule:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     email:
 *                       type: string
 *                       example: "greffier@gouv.bj"
 *                     tel:
 *                       type: string
 *                       example: "string"
 *                     title:
 *                       type: string
 *                       example: "string"
 *                     date_of_service:
 *                       type: string
 *                       format: date-time
 *                       example: "1990-05-15T00:00:00.000Z"
 *                     date_of_birth:
 *                       type: string
 *                       format: date-time
 *                       example: "1990-05-15T00:00:00.000Z"
 *                     place_of_birth:
 *                       type: string
 *                       example: "Paris"
 *                     date_of_marriage:
 *                       type: string
 *                       format: date-time
 *                       example: "2015-06-20T00:00:00.000Z"
 *                     place_of_marriage:
 *                       type: string
 *                       example: "Paris"
 *                     family_address:
 *                       type: string
 *                       example: "123 Rue de Paris, 75001 Paris, France"
 *                     spoken_languages:
 *                       type: string
 *                       example: "Français, Anglais"
 *                     military_status:
 *                       type: string
 *                       example: "Service Militaire d’Intérêt National accompli"
 *                     military_time:
 *                       type: string
 *                       example: "Durée du 1er service militaire"
 *                     actual_grade_class:
 *                       type: string
 *                       example: "A3-7"
 *                     date_actual_grade_class:
 *                       type: string
 *                       format: date-time
 *                       example: "2015-06-20T00:00:00.000Z"
 *                     recrut_class:
 *                       type: string
 *                       example: "2021"
 *                     pension_scheme:
 *                       type: string
 *                       example: "Régime de base"
 *                     services_interruptions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           cause:
 *                             type: string
 *                             example: "Maladie"
 *                           start_date:
 *                             type: string
 *                             example: "2015-01-10"
 *                           end_date:
 *                             type: string
 *                             example: "2015-01-10"
 *                     children:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Alice Dupont"
 *                           date_of_birth:
 *                             type: string
 *                             example: "2015-01-10"
 *                     diplomas:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: "Licence en Informatique"
 *                           date_award:
 *                             type: string
 *                             example: "2013-07-15"
 *                     promotions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: "Promotion 2013"
 *                     mutations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: "Mutation 2013"
 *                     honorary_distinction:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: "Distinction 2013"
 *                     professions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: "Développeur web"
 *                           appointment_date_admin_paid:
 *                             type: string
 *                             example: "2023-01-01"
 *                           appointment_date_in_context:
 *                             type: string
 *                             example: "2023-01-10"
 *                           actual_grade:
 *                             type: string
 *                             example: "Senior Developer"
 *                           duration:
 *                             type: string
 *                             example: "12 mois"
 *                           cause:
 *                             type: string
 *                             example: "Contrat renouvelé"
 *                     services:
 *                       type: object
 *                       properties:
 *                         military_service:
 *                           type: object
 *                           properties:
 *                             year:
 *                               type: integer
 *                               example: 12
 *                             month:
 *                               type: integer
 *                               example: 12
 *                             days:
 *                               type: integer
 *                               example: 12
 *                         civil_service_with_pension:
 *                           type: object
 *                           properties:
 *                             year:
 *                               type: integer
 *                               example: 12
 *                             month:
 *                               type: integer
 *                               example: 12
 *                             days:
 *                               type: integer
 *                               example: 12
 *                         civil_service_with_no_pension:
 *                           type: object
 *                           properties:
 *                             year:
 *                               type: integer
 *                               example: 12
 *                             month:
 *                               type: integer
 *                               example: 12
 *                             days:
 *                               type: integer
 *                               example: 12
 *                         total_service:
 *                           type: object
 *                           properties:
 *                             year:
 *                               type: integer
 *                               example: 12
 *                             month:
 *                               type: integer
 *                               example: 12
 *                             days:
 *                               type: integer
 *                               example: 12
 *                     last_connexion:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-04-19T16:00:00.000Z"
 *                     last_profile_modif:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-04-14T08:45:00.000Z"
 *                     disabled:
 *                       type: boolean
 *                       example: false
 *                     codeOTP:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     first_connect:
 *                       type: boolean
 *                       example: false
 *                     advancement:
 *                       type: string
 *                       example: "NON"
 *                     corps_id:
 *                       type: integer
 *                       example: 1
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-22T01:17:41.247Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-22T02:11:33.441Z"
 *                     entite_id:
 *                       type: integer
 *                       nullable: true
 *                       example: null
 *                     juridiction_id:
 *                       type: integer
 *                       example: 8
 *                     role_id:
 *                       type: integer
 *                       example: 13
 *                     role:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 13
 *                         label:
 *                           type: string
 *                           example: "Le greffier en chef"
 *                         code:
 *                           type: string
 *                           example: "gec"
 *                     body:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         label:
 *                           type: string
 *                           example: "Magistrat"
 *                         code:
 *                           type: string
 *                           example: "magistrat"
 *                     entite:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 13
 *                         label:
 *                           type: string
 *                           example: "DSI"
 *                         code:
 *                           type: string
 *                           example: "gec"
 *                         disabled:
 *                           type: boolean
 *                           example: false
 *                         hidden:
 *                           type: boolean
 *                           example: false
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-22T11:28:53.080Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-22T11:28:53.080Z"
 *                         parent_id:
 *                           type: integer
 *                           example: 3
 *                     juridiction:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 13
 *                         label:
 *                           type: string
 *                           example: "DSI"
 *                         code:
 *                           type: string
 *                           example: "gec"
 *                         disabled:
 *                           type: boolean
 *                           example: false
 *                         hidden:
 *                           type: boolean
 *                           example: false
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-22T11:28:53.080Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-22T11:28:53.080Z"
 *                         parent_id:
 *                           type: integer
 *                           example: 3
 *       401:
 *         description: Non authorisé
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
 *                   example: "Authentifiez-vous"
 *       400:
 *         description: Bad request
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
 *                   example: "Mauvaise requête"
 *       404:
 *         description: User not found
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
 *                   example: "Utilisateur non trouvé"
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
 *                   example: "Erreur Interne"
 */
router.get('/get-profile-demandeur/:id', AuthModule.isAuth,  AgentController.getOneProfile);


/**
 * @swagger
 * /api/agent/profile:
 *   get:
 *     summary: Retrieve user profile by ID
 *     tags: [Agent Profile]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Utilisateur trouvé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Utilisateur trouvé"
 *                 data:
 *                   type: object
 *                   properties:
 *                     all_filled:
 *                       type: boolean
 *                       example: true
 *                     completion_percentage:
 *                       type: integer
 *                       example: 50
 *                     id:
 *                       type: string
 *                       example: "b95c5977-a9de-4009-b89e-f7c47decfaa7"
 *                     first_name:
 *                       type: string
 *                       example: "Pierre"
 *                     last_name:
 *                       type: string
 *                       example: "Martin"
 *                     matricule:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     email:
 *                       type: string
 *                       example: "greffier@gouv.bj"
 *                     tel:
 *                       type: string
 *                       example: "string"
 *                     title:
 *                       type: string
 *                       example: "string"
 *                     date_of_service:
 *                       type: string
 *                       format: date-time
 *                       example: "1990-05-15T00:00:00.000Z"
 *                     date_of_birth:
 *                       type: string
 *                       format: date-time
 *                       example: "1990-05-15T00:00:00.000Z"
 *                     place_of_birth:
 *                       type: string
 *                       example: "Paris"
 *                     date_of_marriage:
 *                       type: string
 *                       format: date-time
 *                       example: "2015-06-20T00:00:00.000Z"
 *                     place_of_marriage:
 *                       type: string
 *                       example: "Paris"
 *                     family_address:
 *                       type: string
 *                       example: "123 Rue de Paris, 75001 Paris, France"
 *                     spoken_languages:
 *                       type: string
 *                       example: "Français, Anglais"
 *                     military_status:
 *                       type: string
 *                       example: "Service Militaire d’Intérêt National accompli"
 *                     military_time:
 *                       type: string
 *                       example: "Durée du 1er service militaire"
 *                     actual_grade_class:
 *                       type: string
 *                       example: "A3-7"
 *                     date_actual_grade_class:
 *                       type: string
 *                       format: date-time
 *                       example: "2015-06-20T00:00:00.000Z"
 *                     recrut_class:
 *                       type: string
 *                       example: "2021"
 *                     pension_scheme:
 *                       type: string
 *                       example: "Régime de base"
 *                     services_interruptions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           cause:
 *                             type: string
 *                             example: "Maladie"
 *                           start_date:
 *                             type: string
 *                             example: "2015-01-10"
 *                           end_date:
 *                             type: string
 *                             example: "2015-01-10"
 *                     children:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Alice Dupont"
 *                           date_of_birth:
 *                             type: string
 *                             example: "2015-01-10"
 *                     diplomas:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: "Licence en Informatique"
 *                           date_award:
 *                             type: string
 *                             example: "2013-07-15"
 *                     promotions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: "Promotion 2013"
 *                     mutations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: "Mutation 2013"
 *                     honorary_distinction:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: "Distinction 2013"
 *                     professions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: "Développeur web"
 *                           appointment_date_admin_paid:
 *                             type: string
 *                             example: "2023-01-01"
 *                           appointment_date_in_context:
 *                             type: string
 *                             example: "2023-01-10"
 *                           actual_grade:
 *                             type: string
 *                             example: "Senior Developer"
 *                           duration:
 *                             type: string
 *                             example: "12 mois"
 *                           cause:
 *                             type: string
 *                             example: "Contrat renouvelé"
 *                     services:
 *                       type: object
 *                       properties:
 *                         military_service:
 *                           type: object
 *                           properties:
 *                             year:
 *                               type: integer
 *                               example: 12
 *                             month:
 *                               type: integer
 *                               example: 12
 *                             days:
 *                               type: integer
 *                               example: 12
 *                         civil_service_with_pension:
 *                           type: object
 *                           properties:
 *                             year:
 *                               type: integer
 *                               example: 12
 *                             month:
 *                               type: integer
 *                               example: 12
 *                             days:
 *                               type: integer
 *                               example: 12
 *                         civil_service_with_no_pension:
 *                           type: object
 *                           properties:
 *                             year:
 *                               type: integer
 *                               example: 12
 *                             month:
 *                               type: integer
 *                               example: 12
 *                             days:
 *                               type: integer
 *                               example: 12
 *                         total_service:
 *                           type: object
 *                           properties:
 *                             year:
 *                               type: integer
 *                               example: 12
 *                             month:
 *                               type: integer
 *                               example: 12
 *                             days:
 *                               type: integer
 *                               example: 12
 *                     last_connexion:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-04-19T16:00:00.000Z"
 *                     last_profile_modif:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-04-14T08:45:00.000Z"
 *                     disabled:
 *                       type: boolean
 *                       example: false
 *                     codeOTP:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     first_connect:
 *                       type: boolean
 *                       example: false
 *                     advancement:
 *                       type: string
 *                       example: "NON"
 *                     corps_id:
 *                       type: integer
 *                       example: 1
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-22T01:17:41.247Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-22T02:11:33.441Z"
 *                     entite_id:
 *                       type: integer
 *                       nullable: true
 *                       example: null
 *                     juridiction_id:
 *                       type: integer
 *                       example: 8
 *                     role_id:
 *                       type: integer
 *                       example: 13
 *                     role:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 13
 *                         label:
 *                           type: string
 *                           example: "Le greffier en chef"
 *                         code:
 *                           type: string
 *                           example: "gec"
 *                     body:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         label:
 *                           type: string
 *                           example: "Magistrat"
 *                         code:
 *                           type: string
 *                           example: "magistrat"
 *                     entite:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 13
 *                         label:
 *                           type: string
 *                           example: "DSI"
 *                         code:
 *                           type: string
 *                           example: "gec"
 *                         disabled:
 *                           type: boolean
 *                           example: false
 *                         hidden:
 *                           type: boolean
 *                           example: false
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-22T11:28:53.080Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-22T11:28:53.080Z"
 *                         parent_id:
 *                           type: integer
 *                           example: 3
 *                     juridiction:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 13
 *                         label:
 *                           type: string
 *                           example: "DSI"
 *                         code:
 *                           type: string
 *                           example: "gec"
 *                         disabled:
 *                           type: boolean
 *                           example: false
 *                         hidden:
 *                           type: boolean
 *                           example: false
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-22T11:28:53.080Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-22T11:28:53.080Z"
 *                         parent_id:
 *                           type: integer
 *                           example: 3
 *       400:
 *         description: Bad request
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
 *                   example: "Mauvaise requête"
 *       404:
 *         description: User not found
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
 *                   example: "Utilisateur non trouvé"
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
 *                   example: "Erreur Interne"
 */
router.get('/profile', AuthModule.isAuth,  AgentController.getOneUser);



/**
 * @swagger
 * /api/agent/profile/update_user_info:
 *   patch:
 *     summary: Update user profile information
 *     tags: [Agent Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               first_name:
 *                 type: string
 *                 example: "Jean"
 *               last_name:
 *                 type: string
 *                 example: "Dupont"
 *               tel:
 *                 type: string
 *                 nullable: true
 *               matricule:
 *                 type: string
 *                 example: "154895"
 *               title:
 *                 type: string
 *                 nullable: true
 *               date_of_birth:
 *                 type: string
 *                 format: date
 *                 example: "1990-05-15"
 *               date_of_service:
 *                 type: string
 *                 format: date
 *                 example: "1990-05-15"
 *               place_of_birth:
 *                 type: string
 *                 example: "Paris"
 *               date_of_marriage:
 *                 type: string
 *                 format: date
 *                 example: "2015-06-20"
 *               place_of_marriage:
 *                 type: string
 *                 example: "Paris"
 *               family_address:
 *                 type: string
 *                 example: "123 Rue de Paris, 75001 Paris, France"
 *               spoken_languages:
 *                 type: string
 *                 example: "Français, Anglais"
 *               military_status:
 *                 type: string
 *                 example: "Service Militaire d’Intérêt National accompli"
 *               military_time:
 *                 type: string
 *                 example: "Durée du 1er service militaire"
 *               recrut_class:
 *                 type: string
 *                 example: "2021"
 *               actual_grade_class:
 *                 type: string
 *                 example: "A3-7"
 *               date_actual_grade_class:
 *                 type: string
 *                 format: date
 *                 example: "2015-06-20"
 *               pension_scheme:
 *                 type: string
 *                 example: "Régime de base"
 *               corps_id:
 *                 type: integer
 *                 example: 1  
 *               entite_id:
 *                 type: integer
 *                 example: 5  
 *               juridiction_id:
 *                 type: integer
 *                 nullable: true
 *                 example: null  
 *               services_interruptions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     cause:
 *                       type: string
 *                       example: "Maladie"
 *                     start_date:
 *                       type: string
 *                       format: date
 *                       example: "2015-01-10"
 *                     end_date:
 *                       type: string
 *                       format: date
 *                       example: "2015-01-10"
 *               children:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       example: "Alice Dupont"
 *                     date_of_birth:
 *                       type: string
 *                       format: date
 *                       example: "2015-01-10"
 *               diplomas:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                       example: "Licence en Informatique"
 *                     date_award:
 *                       type: string
 *                       format: date
 *                       example: "2013-07-15"
 *               promotions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                       example: "Promotion 2013"
 *               mutations:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                       example: "Mutation 2013"
 *               honorary_distinction:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     label:
 *                       type: string
 *                       example: "Distinction 2013"
 *               professions:
 *                 type: object
 *                 properties:
 *                   label:
 *                     type: string
 *                     example: "Développeur web"
 *                   appointment_date_admin_paid:
 *                     type: string
 *                     format: date
 *                     example: "2023-01-01"
 *                   appointment_date_in_context:
 *                     type: string
 *                     format: date
 *                     example: "2023-01-10"
 *               services:
 *                 type: object
 *                 properties:
 *                   military_service:
 *                     type: object
 *                     properties:
 *                       year:
 *                         type: integer
 *                         example: 12
 *                       month:
 *                         type: integer
 *                         example: 12
 *                       days:
 *                         type: integer
 *                         example: 12
 *                   civil_service_with_pension:
 *                     type: object
 *                     properties:
 *                       year:
 *                         type: integer
 *                         example: 12
 *                       month:
 *                         type: integer
 *                         example: 12
 *                       days:
 *                         type: integer
 *                         example: 12
 *                   civil_service_with_no_pension:
 *                     type: object
 *                     properties:
 *                       year:
 *                         type: integer
 *                         example: 12
 *                       month:
 *                         type: integer
 *                         example: 12
 *                       days:
 *                         type: integer
 *                         example: 12
 *                   total_service:
 *                     type: object
 *                     properties:
 *                       year:
 *                         type: integer
 *                         example: 12
 *                       month:
 *                         type: integer
 *                         example: 12
 *                       days:
 *                         type: integer
 *                         example: 12
 *               advancement:
 *                 type: string
 *                 example: "NON"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Utilisateur mis à jour avec succès"
 *                 user:
 *                   type: object
 *                   properties:
 *                     all_filled:
 *                       type: boolean
 *                       example: true
 *                     completion_percentage:
 *                       type: integer
 *                       example: 50
 *                     id:
 *                       type: string
 *                       example: "0936a8af-d50f-4e01-b940-e5882415703b"
 *                     first_name:
 *                       type: string
 *                       example: "Jean"
 *                     last_name:
 *                       type: string
 *                       example: "Dupont"
 *                     email:
 *                       type: string
 *                       example: "greffier@gouv.bj"
 *                     tel:
 *                       type: string
 *                       example: "string"
 *                     matricule:
 *                       type: string
 *                       example: "154895"
 *                     title:
 *                       type: string
 *                       example: "string"
 *                     date_of_service:
 *                       type: string
 *                       format: date-time
 *                       example: "1990-05-15T00:00:00.000Z"
 *                     date_of_birth:
 *                       type: string
 *                       format: date-time
 *                       example: "1990-05-15T00:00:00.000Z"
 *                     place_of_birth:
 *                       type: string
 *                       example: "Paris"
 *                     date_of_marriage:
 *                       type: string
 *                       format: date-time
 *                       example: "2015-06-20T00:00:00.000Z"
 *                     place_of_marriage:
 *                       type: string
 *                       example: "Paris"
 *                     family_address:
 *                       type: string
 *                       example: "123 Rue de Paris, 75001 Paris, France"
 *                     spoken_languages:
 *                       type: string
 *                       example: "Français, Anglais"
 *                     military_status:
 *                       type: string
 *                       example: "Service Militaire d’Intérêt National accompli"
 *                     military_time:
 *                       type: string
 *                       example: "Durée du 1er service militaire"
 *                     actual_grade_class:
 *                       type: string
 *                       example: "A3-7"
 *                     date_actual_grade_class:
 *                       type: string
 *                       format: date-time
 *                       example: "2015-06-20T00:00:00.000Z"
 *                     recrut_class:
 *                       type: string
 *                       example: "2021"
 *                     pension_scheme:
 *                       type: string
 *                       example: "Régime de base"
 *                     services_interruptions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           cause:
 *                             type: string
 *                             example: "Maladie"
 *                           start_date:
 *                             type: string
 *                             example: "2015-01-10"
 *                           end_date:
 *                             type: string
 *                             example: "2015-01-10"
 *                     children:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Alice Dupont"
 *                           date_of_birth:
 *                             type: string
 *                             example: "2015-01-10"
 *                     diplomas:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: "Licence en Informatique"
 *                           date_award:
 *                             type: string
 *                             example: "2013-07-15"
 *                     promotions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: "Promotion 2013"
 *                     mutations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: "Mutation 2013"
 *                     honorary_distinction:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: "Distinction 2013"
 *                     professions:
 *                       type: object
 *                       properties:
 *                         label:
 *                           type: string
 *                           example: "Développeur web"
 *                         appointment_date_admin_paid:
 *                           type: string
 *                           format: date
 *                           example: "2023-01-01"
 *                         appointment_date_in_context:
 *                           type: string
 *                           format: date
 *                           example: "2023-01-10"
 *                     services:
 *                       type: object
 *                       properties:
 *                         military_service:
 *                           type: object
 *                           properties:
 *                             year:
 *                               type: integer
 *                               example: 12
 *                             month:
 *                               type: integer
 *                               example: 12
 *                             days:
 *                               type: integer
 *                               example: 12
 *                         civil_service_with_pension:
 *                           type: object
 *                           properties:
 *                             year:
 *                               type: integer
 *                               example: 12
 *                             month:
 *                               type: integer
 *                               example: 12
 *                             days:
 *                               type: integer
 *                               example: 12
 *                         civil_service_with_no_pension:
 *                           type: object
 *                           properties:
 *                             year:
 *                               type: integer
 *                               example: 12
 *                             month:
 *                               type: integer
 *                               example: 12
 *                             days:
 *                               type: integer
 *                               example: 12
 *                         total_service:
 *                           type: object
 *                           properties:
 *                             year:
 *                               type: integer
 *                               example: 12
 *                             month:
 *                               type: integer
 *                               example: 12
 *                             days:
 *                               type: integer
 *                               example: 12
 *                     last_connexion:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-04-19T16:00:00.000Z"
 *                     last_profile_modif:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-23T12:20:00.712Z"
 *                     first_connect:
 *                       type: boolean
 *                       example: false
 *                     advancement:
 *                       type: string
 *                       example: "NON"
 *                     corps_id:
 *                       type: integer
 *                       example: 1
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-22T11:28:54.834Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-23T12:20:00.714Z"
 *                     entite_id:
 *                       type: integer
 *                       nullable: true
 *                       example: 5
 *                     juridiction_id:
 *                       type: integer
 *                       nullable: true
 *                       example: null
 *                     role_id:
 *                       type: integer
 *                       example: 13
 *                     body:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         label:
 *                           type: string
 *                           example: "Magistrat"
 *                         code:
 *                           type: string
 *                           example: "magistrat"
 *                         disabled:
 *                           type: boolean
 *                           example: false
 *                         hidden:
 *                           type: boolean
 *                           example: false
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-22T11:28:53.259Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-22T11:28:53.259Z"
 *                     role:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 13
 *                         label:
 *                           type: string
 *                           example: "Le greffier en chef"
 *                         code:
 *                           type: string
 *                           example: "gec"
 *                         disabled:
 *                           type: boolean
 *                           example: false
 *                         hidden:
 *                           type: boolean
 *                           example: false
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-22T11:28:53.080Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-22T11:28:53.080Z"
 *                         parent_id:
 *                           type: integer
 *                           example: 3
 *                     entite:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 13
 *                         label:
 *                           type: string
 *                           example: "DSI"
 *                         code:
 *                           type: string
 *                           example: "gec"
 *                         disabled:
 *                           type: boolean
 *                           example: false
 *                         hidden:
 *                           type: boolean
 *                           example: false
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-22T11:28:53.080Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-22T11:28:53.080Z"
 *                         parent_id:
 *                           type: integer
 *                           example: 3
 *                     juridiction:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 13
 *                         label:
 *                           type: string
 *                           example: "DSI"
 *                         code:
 *                           type: string
 *                           example: "gec"
 *                         disabled:
 *                           type: boolean
 *                           example: false
 *                         hidden:
 *                           type: boolean
 *                           example: false
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-22T11:28:53.080Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-22T11:28:53.080Z"
 *                         parent_id:
 *                           type: integer
 *                           example: 3
 *       400:
 *         description: Bad request, validation errors
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
 *                   example: "Validation échouée"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["Email est requis", "Nom est requis"]
 *       404:
 *         description: User not found or missing user ID
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
 *                   example: "Utilisateur non trouvé"
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
 *                   example: "Erreur Interne"
 */
router.patch('/profile/update_user_info',AuthModule.isAuth, AgentController.updateUserInfo);


/**
 * @swagger
 * /api/agent/profile/update_signature:
 *   patch:
 *     summary: Update user signature documents
 *     tags: [Agent Profile]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               signatures:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "3759ca4d-4976-4bbb-bd17-3afebe0c0347"
 *                     type:
 *                       type: string
 *                       example: "signature_personnelle"
 *     responses:
 *       200:
 *         description: User signature updated successfully
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
 *                   example: "Utilisateur mis à jour avec succès"
 *                 user:
 *                   type: object
 *                   properties:
 *                     all_filled:
 *                       type: boolean
 *                       example: true
 *                     completion_percentage:
 *                       type: integer
 *                       example: 50
 *                     id:
 *                       type: string
 *                       example: "b8085131-873a-4e0c-90ff-82c18ab87e6f"
 *                     first_name:
 *                       type: string
 *                       example: "Jean"
 *                     last_name:
 *                       type: string
 *                       example: "Dupont"
 *                     email:
 *                       type: string
 *                       example: "greffier@gouv.bj"
 *                     tel:
 *                       type: string
 *                       example: "string"
 *                     title:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     date_of_service:
 *                       type: string
 *                       format: date-time
 *                       example: "1990-02-01T00:00:00.000Z"
 *                     date_of_birth:
 *                       type: string
 *                       format: date-time
 *                       example: "1990-05-15T00:00:00.000Z"
 *                     place_of_birth:
 *                       type: string
 *                       example: "Paris"
 *                     date_of_marriage:
 *                       type: string
 *                       format: date-time
 *                       example: "2015-06-20T00:00:00.000Z"
 *                     family_address:
 *                       type: string
 *                       example: "123 Rue de Paris, 75001 Paris, France"
 *                     spoken_languages:
 *                       type: string
 *                       example: "Français, Anglais"
 *                     military_status:
 *                       type: string
 *                       example: "Non"
 *                     pension_scheme:
 *                       type: string
 *                       example: "Régime de base"
 *                     children:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                             example: "Alice Dupont"
 *                           date_of_birth:
 *                             type: string
 *                             example: "2015-01-10"
 *                     diplomas:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: "Licence en Informatique"
 *                           date_award:
 *                             type: string
 *                             example: "2013-07-15"
 *                     promotions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: "Promotion 2013"
 *                     mutations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: "Mutation 2013"
 *                     honorary_distinction:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: "Distinction 2013"
 *                     professions:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           label:
 *                             type: string
 *                             example: "Développeur web"
 *                           appointment_date_admin_paid:
 *                             type: string
 *                             example: "2023-01-01"
 *                           appointment_date_in_context:
 *                             type: string
 *                             example: "2023-01-10"
 *                           actual_grade:
 *                             type: string
 *                             example: "Senior Developer"
 *                           duration:
 *                             type: string
 *                             example: "12 mois"
 *                           cause:
 *                             type: string
 *                             example: "Contrat renouvelé"
 *                     services:
 *                       type: object
 *                       properties:
 *                         military_service:
 *                           type: object
 *                           properties:
 *                             year:
 *                               type: integer
 *                               example: 12
 *                             month:
 *                               type: integer
 *                               example: 12
 *                             days:
 *                               type: integer
 *                               example: 12
 *                         civil_service_with_pension:
 *                           type: object
 *                           properties:
 *                             year:
 *                               type: integer
 *                               example: 12
 *                             month:
 *                               type: integer
 *                               example: 12
 *                             days:
 *                               type: integer
 *                               example: 12
 *                         civil_service_with_no_pension:
 *                           type: object
 *                           properties:
 *                             year:
 *                               type: integer
 *                               example: 12
 *                             month:
 *                               type: integer
 *                               example: 12
 *                             days:
 *                               type: integer
 *                               example: 12
 *                         total_service:
 *                           type: object
 *                           properties:
 *                             year:
 *                               type: integer
 *                               example: 12
 *                             month:
 *                               type: integer
 *                               example: 12
 *                             days:
 *                               type: integer
 *                               example: 12
 *                     last_connexion:
 *                       type: string
 *                       format: date-time
 *                       example: "2023-04-19T16:00:00.000Z"
 *                     last_profile_modif:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-20T13:43:40.607Z"
 *                     first_connect:
 *                       type: boolean
 *                       example: false
 *                     advancement:
 *                       type: string
 *                       example: "NON"
 *                     corps_id:
 *                       type: integer
 *                       nullable: true
 *                       example: null
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-19T16:42:51.276Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-20T13:43:40.608Z"
 *                     entite_id:
 *                       type: integer
 *                       nullable: true
 *                       example: null
 *                     juridiction_id:
 *                       type: integer
 *                       example: 8
 *                     role_id:
 *                       type: integer
 *                       example: 13
 *                     superior_id:
 *                       type: integer
 *                       nullable: true
 *                       example: null
 *                     role:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 13
 *                         label:
 *                           type: string
 *                           example: "Le greffier en chef"
 *                         code:
 *                           type: string
 *                           example: "gec"
 *                         disabled:
 *                           type: boolean
 *                           example: false
 *                         hidden:
 *                           type: boolean
 *                           example: false
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-19T16:42:50.237Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-19T16:42:50.237Z"
 *                         parent_id:
 *                           type: integer
 *                           example: 3
 *                     juridiction:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 8
 *                         code:
 *                           type: string
 *                           example: "TPI-COT"
 *                         label:
 *                           type: string
 *                           example: "Tribunal de Première Instance de Première Classe de Cotonou"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-19T16:42:50.440Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-19T16:42:50.440Z"
 *                     body:
 *                       type: object
 *                       nullable: true
 *                       example: null
 *                     documents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "22758fdc-0d5a-417c-931b-04d66d8635eb"
 *                           libelle:
 *                             type: string
 *                             nullable: true
 *                             example: null
 *                           filename:
 *                             type: string
 *                             example: "signature-1747750403217-501457344.png"
 *                           path:
 *                             type: string
 *                             example: "document_ebnl__1747750403222_signature.png"
 *                           size:
 *                             type: integer
 *                             nullable: true
 *                             example: null
 *                           type:
 *                             type: string
 *                             example: "signature_personnelle"
 *                           isActe:
 *                             type: boolean
 *                             example: false
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-05-20T14:13:23.230Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-05-20T14:16:31.022Z"
 *                           identifiantDemande:
 *                             type: string
 *                             nullable: true
 *                             example: null
 *                           typeDocumentId:
 *                             type: integer
 *                             example: 4
 *                           user_id:
 *                             type: string
 *                             example: "b8085131-873a-4e0c-90ff-82c18ab87e6f"
 *                           endpoint:
 *                             type: string
 *                             example: "http://192.168.100.21:8000/api/utils/auth/displayFiles/22758fdc-0d5a-417c-931b-04d66d8635eb?mode=preview"
 */
router.patch('/profile/update_signature' , AuthModule.isAuth, AgentController.updateSignature);


/// Submit bulletin
/**
 * @swagger
 * /api/agent/bulletin/submit-bulletin:
 *   post:
 *     summary: Submit a bulletin request
 *     tags: [Bulletin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - year
 *               - evaluator_id
 *             properties:
 *               year:
 *                 type: integer
 *                 example: 2024
 *               evaluator_id:
 *                 type: string
 *                 example: "c0ba729e-d650-4878-99fb-c8f58eb4a682"
 *     responses:
 *       200:
 *         description: Bulletin request created successfully
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
 *                   example: "Demande de bulletin créée"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     user_id:
 *                       type: string
 *                       example: "f47ac10b-58cc-4372-a567-0e02b2c3d479"
 *                     year:
 *                       type: integer
 *                       example: 2024
 *                     numero:
 *                       type: string
 *                       example: null
 *                     acte_id:
 *                       type: string
 *                       example: null
 *                     superior_id:
 *                       type: string
 *                       example: "c0ba729e-d650-4878-99fb-c8f58eb4a682"
 *                     statut_id:
 *                       type: string
 *                       example: "pending"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-20T16:43:40.607Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-20T16:43:40.607Z"
 *       401:
 *         description: Unauthorized, user not authenticated
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
 *                   example: "Authentifiez vous."
 *       400:
 *         description: Validation errors
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
 *                   example: "Erreurs de validation"
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                         example: "Invalid value"
 *                       param:
 *                         type: string
 *                         example: "year"
 *                       location:
 *                         type: string
 *                         example: "body"
 *       404:
 *         description: Superior not found
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
 *                   example: "Supérieur non trouvé"
 *       500:
 *         description: Server error
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
 *                   example: "Erreur serveur"
 */
router.post('/bulletin/submit-bulletin', AuthModule.isAuth, Validator.validateBulletin, AgentController.submitBulletin);

//Get bulletin demands list
/**
 * @swagger
 * /api/agent/bulletin/get-bulletin/list:
 *   get:
 *     summary: Retrieve a list of bulletins with pagination and search
 *     tags: [Bulletin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: Number of bulletins to return per page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: search
 *         in: query
 *         description: Search term to filter bulletins by title or description
 *         required: false
 *         schema:
 *           type: string
 *           example: null
 *       - name: year
 *         in: query
 *         description: Year to filter bulletins
 *         required: false
 *         schema:
 *           type: integer
 *           example: null
 *       - name: numero
 *         in: query
 *         description: Number to filter bulletins
 *         required: false
 *         schema:
 *           type: string
 *           example: null
 *       - name: startDate
 *         in: query
 *         description: Start date for filtering bulletins (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: null
 *       - name: endDate
 *         in: query
 *         description: End date for filtering bulletins (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: null
 *     responses:
 *       200:
 *         description: Liste des bulletins récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1575402a-5bf8-4283-bf9c-d939e5bd634c"
 *                       year:
 *                         type: integer
 *                         example: 2024
 *                       numero:
 *                         type: string
 *                         example: "TM25FAYT59-2025"
 *                       evaluators:
 *                         type: string
 *                         example: "{\"id\":\"3608d12b-45ca-4b82-baea-23ed4ea6399d\",\"first_name\":\"Alain\",\"last_name\":\"MANON\",\"title\":null}"
 *                       signatures:
 *                         type: array
 *                         items: {}
 *                       comments:
 *                         type: array
 *                         items: {}
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-05-27T13:19:40.501Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-05-27T13:19:40.501Z"
 *                       user_id:
 *                         type: string
 *                         example: "56ffae62-470c-47da-927f-bf34afcd0ece"
 *                       current_evaluator_id:
 *                         type: string
 *                         example: "3608d12b-45ca-4b82-baea-23ed4ea6399d"
 *                       statut_id:
 *                         type: integer
 *                         example: 1
 *                       acte_id:
 *                         type: string
 *                         example: null
 *                       agent:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "56ffae62-470c-47da-927f-bf34afcd0ece"
 *                           first_name:
 *                             type: string
 *                             example: "Pierre"
 *                           last_name:
 *                             type: string
 *                             example: "Martin"
 *                           title:
 *                             type: string
 *                             example: null
 *                       currentEvaluator:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "3608d12b-45ca-4b82-baea-23ed4ea6399d"
 *                           first_name:
 *                             type: string
 *                             example: "Alain"
 *                           last_name:
 *                             type: string
 *                             example: "MANON"
 *                           title:
 *                             type: string
 *                             example: null
 *                           role:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 3
 *                               label:
 *                                 type: string
 *                                 example: "DSPJ"
 *                               code:
 *                                 type: string
 *                                 example: "dspj"
 *                               disabled:
 *                                 type: boolean
 *                                 example: false
 *                               hidden:
 *                                 type: boolean
 *                                 example: false
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-05-27T13:05:35.983Z"
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-05-27T13:05:35.983Z"
 *                               parent_id:
 *                                 type: string
 *                                 example: null
 *                       statutIn:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           label:
 *                             type: string
 *                             example: "Soumise"
 *                           code:
 *                             type: string
 *                             example: "pending"
 *                       evaluations:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             score:
 *                               type: integer
 *                               example: 85
 *                             evaluator:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   example: "evaluator-id-567"
 *                                 first_name:
 *                                   type: string
 *                                   example: "Alice"
 *                                 last_name:
 *                                   type: string
 *                                   example: "Johnson"
 *                             scores:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   score:
 *                                     type: integer
 *                                     example: 90
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *       401:
 *         description: Not authenticated
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
 *                   example: "Authentifiez vous."
 *       404:
 *         description: No bulletins found
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
 *                   example: "Aucun bulletin trouvé"
 *       500:
 *         description: Internal server error
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
 *                   example: "Erreur serveur"
 */
router.get('/bulletin/get-bulletin/list', AuthModule.isAuth,  AgentController.getBulletins);

/// Get ulletinRequest details to be evaluated
/**
 * @swagger
 * /api/agent/bulletin/get-bulletin/{bulletinId}:
 *   get:
 *     summary: Retrieve details of a bulletin
 *     tags: [Bulletin]
 *     parameters:
 *       - in: path
 *         name: bulletinId
 *         required: true
 *         schema:
 *           type: string
 *         description: The unique identifier of the bulletin (UUID).
 *     security:
 *       - bearerAuth: []  # Assuming you're using bearer token authentication
 *     responses:
 *       200:
 *         description: Bulletin retrieved successfully
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
 *                     id:
 *                       type: string
 *                       example: "2553a527-382e-4a96-94eb-fa60700d6669"
 *                     year:
 *                       type: integer
 *                       example: 2023
 *                     numero:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     evaluators:
 *                       type: string
 *                       example: "{\"id\":\"b95c5977-a9de-4009-b89e-f7c47decfaa7\",\"first_name\":\"Pierre\",\"last_name\":\"Martin\",\"title\":\"string\"}"
 *                     comments:
 *                       type: array
 *                       items:
 *                         type: object
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-22T02:32:51.157Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-22T02:32:51.157Z"
 *                     user_id:
 *                       type: string
 *                       example: "b95c5977-a9de-4009-b89e-f7c47decfaa7"
 *                     current_evaluator_id:
 *                       type: string
 *                       example: "b95c5977-a9de-4009-b89e-f7c47decfaa7"
 *                     statut_id:
 *                       type: integer
 *                       example: 1
 *                     acte_id:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     agent:
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
 *                         title:
 *                           type: string
 *                           example: "string"
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
 *                     currentEvaluator:
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
 *                         title:
 *                           type: string
 *                           example: "string"
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
 *                     statutIn:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 1
 *                         label:
 *                           type: string
 *                           example: "Soumise"
 *                         code:
 *                           type: string
 *                           example: "pending"
 *                     evaluations:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "ac77be7f-2b38-4c6c-b262-02b1e8590dd4"
 *                           total_score:
 *                             type: integer
 *                             example: 18
 *                           comment:
 *                             type: string
 *                             example: "Great job!"
 *                           action_date:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-05-22T02:37:26.429Z"
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-05-22T02:37:26.430Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-05-22T02:37:26.430Z"
 *                           bulletin_request_id:
 *                             type: string
 *                             example: "2553a527-382e-4a96-94eb-fa60700d6669"
 *                           evaluator_id:
 *                             type: string
 *                             example: "90aba510-377d-4c2f-ac25-69990948edfd"
 *                           evaluator:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "90aba510-377d-4c2f-ac25-69990948edfd"
 *                               first_name:
 *                                 type: string
 *                                 example: "Alain"
 *                               last_name:
 *                                 type: string
 *                                 example: "MANON"
 *                     documents:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "22758fdc-0d5a-417c-931b-04d66d8635eb"
 *                           libelle:
 *                             type: string
 *                             nullable: true
 *                             example: null
 *                           filename:
 *                             type: string
 *                             example: "signature-1747750403217-501457344.png"
 *                           path:
 *                             type: string
 *                             example: "document_ebnl__1747750403222_signature.png"
 *                           size:
 *                             type: integer
 *                             nullable: true
 *                             example: null
 *                           type:
 *                             type: string
 *                             example: "signature_personnelle"
 *                           isActe:
 *                             type: boolean
 *                             example: false
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-05-20T14:13:23.230Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-05-20T14:16:31.022Z"
 *                           identifiantDemande:
 *                             type: string
 *                             nullable: true
 *                             example: null
 *                           typeDocumentId:
 *                             type: integer
 *                             example: 4
 *                           user_id:
 *                             type: string
 *                             example: "b8085131-873a-4e0c-90ff-82c18ab87e6f"
 *                           endpoint:
 *                             type: string
 *                             example: "http://192.168.100.21:8000/api/utils/auth/displayFiles/22758fdc-0d5a-417c-931b-04d66d8635eb?mode=preview"
 *       400:
 *         description: Invalid bulletin ID
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
 *                   example: "ID de bulletin invalide."
 *       401:
 *         description: Unauthorized, user not authenticated
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
 *                   example: "Authentifiez vous."
 *       404:
 *         description: Bulletin not found
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
 *                   example: "Bulletin non trouvé."
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
 *                   example: "Erreur serveur"
 */
router.get('/bulletin/get-bulletin/:bulletinId', AuthModule.isAuth,  AgentController.getBulletinDetails);

/**
 * @swagger
 * /api/agent/bulletin/get-bulletin/superior/list:
 *   get:
 *     summary: Récupérer la liste des bulletins pour le supérieur authentifié
 *     tags: [Bulletin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Numéro de page pour la pagination
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: Nombre de bulletins à retourner par page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: search
 *         in: query
 *         description: Terme de recherche pour filtrer les bulletins par titre ou description
 *         required: false
 *         schema:
 *           type: string
 *           example: null
 *       - name: year
 *         in: query
 *         description: Filtrer les bulletins par année
 *         required: false
 *         schema:
 *           type: integer
 *           example: null
 *       - name: numero
 *         in: query
 *         description: Filtrer les bulletins par numéro
 *         required: false
 *         schema:
 *           type: string
 *           example: null
 *       - name: startDate
 *         in: query
 *         description: Date de début pour filtrer les bulletins (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: null
 *       - name: endDate
 *         in: query
 *         description: Date de fin pour filtrer les bulletins (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: null
 *       - name: statutCode
 *         in: query
 *         description: Filtrer les bulletins par code de statut
 *         required: false
 *         schema:
 *           type: string
 *           example: null
*     responses:
 *       200:
 *         description: Liste des bulletins récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "1575402a-5bf8-4283-bf9c-d939e5bd634c"
 *                       year:
 *                         type: integer
 *                         example: 2024
 *                       numero:
 *                         type: string
 *                         example: "TM25FAYT59-2025"
 *                       evaluators:
 *                         type: string
 *                         example: "{\"id\":\"3608d12b-45ca-4b82-baea-23ed4ea6399d\",\"first_name\":\"Alain\",\"last_name\":\"MANON\",\"title\":null}"
 *                       signatures:
 *                         type: array
 *                         items: {}
 *                       comments:
 *                         type: array
 *                         items: {}
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-05-27T13:19:40.501Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-05-27T13:19:40.501Z"
 *                       user_id:
 *                         type: string
 *                         example: "56ffae62-470c-47da-927f-bf34afcd0ece"
 *                       current_evaluator_id:
 *                         type: string
 *                         example: "3608d12b-45ca-4b82-baea-23ed4ea6399d"
 *                       statut_id:
 *                         type: integer
 *                         example: 1
 *                       acte_id:
 *                         type: string
 *                         example: null
 *                       agent:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "56ffae62-470c-47da-927f-bf34afcd0ece"
 *                           first_name:
 *                             type: string
 *                             example: "Pierre"
 *                           last_name:
 *                             type: string
 *                             example: "Martin"
 *                           title:
 *                             type: string
 *                             example: null
 *                           role:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 3
 *                               label:
 *                                 type: string
 *                                 example: "DSPJ"
 *                               code:
 *                                 type: string
 *                                 example: "dspj"
 *                               disabled:
 *                                 type: boolean
 *                                 example: false
 *                               hidden:
 *                                 type: boolean
 *                                 example: false
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-05-27T13:05:35.983Z"
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-05-27T13:05:35.983Z"
 *                               parent_id:
 *                                 type: string
 *                                 example: null
 *                       currentEvaluator:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "3608d12b-45ca-4b82-baea-23ed4ea6399d"
 *                           first_name:
 *                             type: string
 *                             example: "Alain"
 *                           last_name:
 *                             type: string
 *                             example: "MANON"
 *                           title:
 *                             type: string
 *                             example: null
 *                           role:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 3
 *                               label:
 *                                 type: string
 *                                 example: "DSPJ"
 *                               code:
 *                                 type: string
 *                                 example: "dspj"
 *                               disabled:
 *                                 type: boolean
 *                                 example: false
 *                               hidden:
 *                                 type: boolean
 *                                 example: false
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-05-27T13:05:35.983Z"
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-05-27T13:05:35.983Z"
 *                               parent_id:
 *                                 type: string
 *                                 example: null
 *                       statutIn:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           label:
 *                             type: string
 *                             example: "Soumise"
 *                           code:
 *                             type: string
 *                             example: "pending"
 *                       evaluations:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             score:
 *                               type: integer
 *                               example: 85
 *                             evaluator:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: string
 *                                   example: "evaluator-id-567"
 *                                 first_name:
 *                                   type: string
 *                                   example: "Alice"
 *                                 last_name:
 *                                   type: string
 *                                   example: "Johnson"
 *                             scores:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   score:
 *                                     type: integer
 *                                     example: 90
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *       401:
 *         description: Non authentifié
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
 *                   example: "Authentifiez vous."
 *       404:
 *         description: Aucun bulletin trouvé
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
 *                   example: "Aucun bulletin trouvé"
 *       500:
 *         description: Erreur serveur
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
 *                   example: "Erreur serveur"
 */
router.get('/bulletin/get-bulletin/superior/list', AuthModule.isAuth,  AgentController.getBulletinsForSuperior);

// Endpoint avaluation
/**
 * @swagger
 * /api/agent/bulletin/evaluate-bulletin:
 *   post:
 *     summary: Submit an evaluation for a bulletin
 *     tags: [Bulletin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bulletinId:
 *                 type: string
 *                 example: "19e41e6e-71dd-416c-bb93-33ee7ac34df8"
 *               evaluatorId:
 *                 type: string
 *                 example: "8a656876-6ff4-4329-adf9-6a50ead721e1"
 *               scores:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: integer
 *                       example: 6
 *                     criteriaId:
 *                       type: integer
 *                       example: 2
 *               comment:
 *                 type: string
 *                 example: "Great job!"
 *     responses:
 *       200:
 *         description: Evaluation submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Évaluation soumise avec succès."
 *                 data:
 *                   type: object
 *                   properties:
 *                     evaluation:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "1d64e9de-be4f-40d7-8ba8-c3806fbe24b4"
 *                         bulletin_request_id:
 *                           type: string
 *                           example: "e69b78e4-17f5-480b-a93d-931651bbbf55"
 *                         evaluator_id:
 *                           type: string
 *                           example: "451b5e6d-c192-47ff-a663-5d73da8fbf1a"
 *                         comment:
 *                           type: string
 *                           example: "Great job!"
 *                         action_date:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-29T11:06:35.687Z"
 *                         total_score:
 *                           type: integer
 *                           example: 18
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-29T11:06:35.687Z"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-29T11:06:35.687Z"
 *                     scores:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "1d64e9de-be4f-40d7-8ba8-c3806fbe24b4"
 *                         total_score:
 *                           type: integer
 *                           example: 18
 *                         comment:
 *                           type: string
 *                           example: "Great job!"
 *                         action_date:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-29T11:06:35.687Z"
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-29T11:06:35.687Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-29T11:06:35.687Z"
 *                         bulletin_request_id:
 *                           type: string
 *                           example: "e69b78e4-17f5-480b-a93d-931651bbbf55"
 *                         evaluator_id:
 *                           type: string
 *                           example: "451b5e6d-c192-47ff-a663-5d73da8fbf1a"
 *                         scores:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 example: "39bf0524-2fcf-4c9a-815f-94331fe564b6"
 *                               score:
 *                                 type: integer
 *                                 example: 6
 *                               createdAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-05-29T11:06:35.698Z"
 *                               updatedAt:
 *                                 type: string
 *                                 format: date-time
 *                                 example: "2025-05-29T11:06:35.698Z"
 *                               bulletin_evaluation_id:
 *                                 type: string
 *                                 example: "1d64e9de-be4f-40d7-8ba8-c3806fbe24b4"
 *                               criteria_id:
 *                                 type: integer
 *                                 example: 1
 *                               criteria:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: integer
 *                                     example: 1
 *                                   label:
 *                                     type: string
 *                                     example: "Compétence professionnelle"
 *                                   code:
 *                                     type: string
 *                                     example: "professional_competence"
 *                                   min_score:
 *                                     type: integer
 *                                     example: 0
 *                                   max_score:
 *                                     type: integer
 *                                     example: 7
 *                                   disabled:
 *                                     type: boolean
 *                                     example: false
 *                                   useCase:
 *                                     type: string
 *                                     example: "bulletin"
 *                                   createdAt:
 *                                     type: string
 *                                     format: date-time
 *                                     example: "2025-05-29T10:36:40.174Z"
 *                                   updatedAt:
 *                                     type: string
 *                                     format: date-time
 *                                     example: "2025-05-29T10:36:40.174Z"
 *       401:
 *         description: Erreur d'authentification
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
 *                   example: Authentifiez vous.
 *       400:
 *         description: Validation errors or invalid input
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
 *                   example: Erreurs de validation
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       msg:
 *                         type: string
 *                       param:
 *                         type: string
 *       403:
 *         description: Unauthorized, user not allowed to submit evaluation
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
 *                   example: Utilisateur non autorisé à soumettre une évaluation.
 *       404:
 *         description: Bulletin not found
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
 *                   example: Bulletin non trouvé.
 *       406:
 *         description: Évaluation déjà soumise
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
 *                   example: Vous avez déjà évalué, vous devez maintenant 
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
 *                   example: Erreur serveur
 */
router.post('/bulletin/evaluate-bulletin',  AuthModule.isAuth, Validator.validateEvaluation,  AgentController.submitEvaluation);


// Transferer du bulletin 
/**
 * @swagger
 * /api/agent/bulletin/transfert-bulletin:
 *   post:
 *     summary: Transferer une évaluation
 *     security:
 *       - bearerAuth: []
 *     tags: [Bulletin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bulletinId:
 *                 type: string
 *                 example: "c707c758-4bc4-4840-9d21-c0cd89b8385b"
 *               evaluatorId:
 *                 type: string
 *                 example: "02a4e291-53dc-408f-a3c6-a572e5f234ed"
 *               comment:
 *                 type: string
 *                 example: "Transfert de l'évaluation"
 *     responses:
 *       201:
 *         description: Transfert effectué avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Transfert éffectué avec succès."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "c707c758-4bc4-4840-9d21-c0cd89b8385b"
 *                     year:
 *                       type: integer
 *                       example: 2023
 *                     numero:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     evaluators:
 *                       type: string
 *                       example: "[{\"id\":\"02a4e291-53dc-408f-a3c6-a572e5f234ed\",\"first_name\":\"Pierre\",\"last_name\":\"Dupuis\",\"title\":null}]"
 *                     comments:
 *                       type: string
 *                       example: "[{\"id\":\"90aba510-377d-4c2f-ac25-69990948edfd\",\"first_name\":\"Alain\",\"last_name\":\"MANON\",\"comment\":\"Transfert de l'évaluation\"}]"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-22T03:02:00.988Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-22T03:12:43.678Z"
 *                     user_id:
 *                       type: string
 *                       example: "b95c5977-a9de-4009-b89e-f7c47decfaa7"
 *                     current_evaluator_id:
 *                       type: string
 *                       example: "02a4e291-53dc-408f-a3c6-a572e5f234ed"
 *                     statut_id:
 *                       type: integer
 *                       example: 5
 *                     acte_id:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *       400:
 *         description: Erreurs de validation
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
 *                   example: "Erreurs de validation."
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                     example: "ID de bulletin invalide."
 *       401:
 *         description: Authentification requise
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
 *                   example: "Authentifiez vous."
 *       403:
 *         description: Accès interdit
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
 *                   example: "Vous n'êtes pas autorisé à transférer cette demande."
 *       404:
 *         description: Bulletin non trouvé
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
 *                   example: "Bulletin non trouvé."
 *       500:
 *         description: Erreur serveur
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
 *                   example: "Erreur serveur"
 */
router.post('/bulletin/transfert-bulletin',  AuthModule.isAuth, Validator.validateTransfertEvaluation,  AgentController.transfererEvaluation);


// Générer une demande
/**
 * @swagger
 * /api/agent/bulletin/generer-bulletin:
 *   post:
 *     summary: Générer un bulletin d'évaluation
 *     tags: [Bulletin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bulletinId:
 *                 type: string
 *                 example: "c707c758-4bc4-4840-9d21-c0cd89b8385b"
 *     responses:
 *       201:
 *         description: Bulletin généré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Transfert éffectué avec succès."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "c707c758-4bc4-4840-9d21-c0cd89b8385b"
 *                     year:
 *                       type: integer
 *                       example: 2023
 *                     numero:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     evaluators:
 *                       type: string
 *                       example: "[{\"id\":\"02a4e291-53dc-408f-a3c6-a572e5f234ed\",\"first_name\":\"Pierre\",\"last_name\":\"Dupuis\",\"title\":null}]"
 *                     comments:
 *                       type: string
 *                       example: "[{\"id\":\"90aba510-377d-4c2f-ac25-69990948edfd\",\"first_name\":\"Alain\",\"last_name\":\"MANON\",\"comment\":\"Transfert de l'évaluation\"}]"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-22T03:02:00.988Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-22T03:12:43.678Z"
 *                     user_id:
 *                       type: string
 *                       example: "b95c5977-a9de-4009-b89e-f7c47decfaa7"
 *                     current_evaluator_id:
 *                       type: string
 *                       example: "02a4e291-53dc-408f-a3c6-a572e5f234ed"
 *                     statut_id:
 *                       type: integer
 *                       example: 5
 *                     acte_id:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *       400:
 *         description: Erreurs de validation
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
 *                   example: "Erreurs de validation."
 *                 errors:
 *                   type: string
 *                   example: "ID de bulletin invalide."
 *       401:
 *         description: Authentification requise
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
 *                   example: "Authentifiez vous."
 *       403:
 *         description: Accès interdit
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
 *                   example: "Vous n'êtes pas autorisé à générer ce bulletin."
 *       404:
 *         description: Bulletin non trouvé
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
 *                   example: "Bulletin non trouvé."
 *       500:
 *         description: Erreur serveur
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
 *                   example: "Erreur serveur"
 */
router.post('/bulletin/generer-bulletin',  AuthModule.isAuth, Validator.genererEvaluation,  AgentController.genererBulletin);



/**
 * @swagger
 * /api/agent/bulletin/signer-bulletin:
 *   post:
 *     summary: Signer un bulletin
 *     tags: [Bulletin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               bulletinId:
 *                 type: string
 *                 description: ID du bulletin à signer
 *                 example: "c707c758-4bc4-4840-9d21-c0cd89b8385b"
 *     responses:
 *       200:
 *         description: Bulletin signé avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Bulletin signé avec succès."
 *       400:
 *         description: Erreurs de validation
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
 *                   example: "Erreurs de validation."
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       401:
 *         description: Non authentifié ou utilisateur non valide
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
 *                   example: "Authentifiez vous."
 *       500:
 *         description: Erreur serveur
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
 *                   example: "Une erreur est survenue lors de la signature."
 */
router.post('/bulletin/signer-bulletin',  AuthModule.isAuth, Validator.genererEvaluation,  AgentController.signerBulletin);



/***** Attestation de presence */
/**
 * @swagger
 * /api/agent/attestation-presence/submit:
 *   post:
 *     summary: Créer une demande d'attestation de présence
 *     tags: [Attestation Presence]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               user_id:
 *                 type: string
 *                 description: ID de l'utilisateur qui créé la demande
 *                 example: "0936a8af-d50f-4e01-b940-e5882415703b"
 *     responses:
 *       201:
 *         description: Demande d'attestation créée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Demande d'attestation créée avec succès."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "0e2f9473-4efc-4a43-b8a0-e8651f561f55"
 *                     user_id:
 *                       type: string
 *                       example: "0936a8af-d50f-4e01-b940-e5882415703b"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-23T10:58:46.884Z"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-23T10:58:46.884Z"
 *                     numero:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     comment:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     signataire_id:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     acte_id:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *       400:
 *         description: Erreurs de validation ou paramètres manquants
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
 *                   example: "Les paramètres requis ne sont pas fournis."
 *       401:
 *         description: Non authentifié
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
 *                   example: "Authentifiez vous."
 *       500:
 *         description: Erreur serveur
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
 *                   example: "Une erreur est survenue lors de la création."
 */
router.post('/attestation-presence/submit', AuthModule.isAuth, AgentController.createPresenceCertificateRequest);



// Route for retrieving presence certificate requests
/**
 * @swagger
 * /api/agent/attestation-presence/list:
 *   get:
 *     summary: Récupérer la liste des demandes d'attestation de présence
 *     tags: [Attestation Presence]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: Number of requests to return per page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: search
 *         in: query
 *         description: Search term to filter requests by numero or agent's name
 *         required: false
 *         schema:
 *           type: string
 *           example: "Jean"
 *       - name: startDate
 *         in: query
 *         description: Start date for filtering requests (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-01-01"
 *       - name: endDate
 *         in: query
 *         description: End date for filtering requests (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-12-31"
 *     responses:
 *       200:
 *         description: Liste des demandes d'attestation récupérée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Récupération avec succès"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "0e2f9473-4efc-4a43-b8a0-e8651f561f55"
 *                       numero:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-05-23T10:58:46.884Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-05-23T10:58:46.884Z"
 *                       agent:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "0936a8af-d50f-4e01-b940-e5882415703b"
 *                           first_name:
 *                             type: string
 *                             example: "Jean"
 *                           last_name:
 *                             type: string
 *                             example: "Dupont"
 *                       signataire:
 *                         type: object
 *                         nullable: true
 *                         example: null
 *                       document_acte:
 *                         type: object
 *                         nullable: true
 *                         example: null
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *       401:
 *         description: Non authentifié
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
 *                   example: "Authentifiez vous."
 *       500:
 *         description: Erreur serveur
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
 *                   example: "Une erreur est survenue lors de la récupération."
 */
router.get('/attestation-presence/list',AuthModule.isDcGS, AgentController.getPresenceCertificateRequests);


// Visaliser
/**
 * @swagger
 * /api/agent/attestation-presence/generate:
 *   post:
 *     summary: Générer une demande d'attestation de présence
 *     tags: [Attestation Presence]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               requestId:
 *                 type: string
 *                 description: ID de la demande à générer
 *                 example: "0e2f9473-4efc-4a43-b8a0-e8651f561f55"
 *     responses:
 *       201:
 *         description: Attestation générée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Transfert éffectué avec succès."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "0e2f9473-4efc-4a43-b8a0-e8651f561f55"
 *                     numero:
 *                       type: string
 *                       example: "UT6S5DW56R-2025"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-23T10:58:46.884Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-23T12:52:31.212Z"
 *                     user_id:
 *                       type: string
 *                       example: "0936a8af-d50f-4e01-b940-e5882415703b"
 *                     agent:
 *                       type: object
 *                       properties:
 *                         all_filled:
 *                           type: boolean
 *                           example: true
 *                         completion_percentage:
 *                           type: integer
 *                           example: 50
 *                         id:
 *                           type: string
 *                           example: "0936a8af-d50f-4e01-b940-e5882415703b"
 *                         first_name:
 *                           type: string
 *                           example: "Jean"
 *                         last_name:
 *                           type: string
 *                           example: "Dupont"
 *                         matricule:
 *                           type: string
 *                           example: "154895"
 *                         email:
 *                           type: string
 *                           example: "greffier@gouv.bj"
 *                         tel:
 *                           type: string
 *                           example: "string"
 *                         date_of_service:
 *                           type: string
 *                           format: date-time
 *                           example: "1990-05-15T00:00:00.000Z"
 *                         date_of_birth:
 *                           type: string
 *                           format: date-time
 *                           example: "1990-05-15T00:00:00.000Z"
 *                         place_of_birth:
 *                           type: string
 *                           example: "Paris"
 *                         family_address:
 *                           type: string
 *                           example: "123 Rue de Paris, 75001 Paris, France"
 *                         services_interruptions:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               cause:
 *                                 type: string
 *                                 example: "Maladie"
 *                               start_date:
 *                                 type: string
 *                                 format: date
 *                                 example: "2015-01-10"
 *                               end_date:
 *                                 type: string
 *                                 format: date
 *                                 example: "2015-01-10"
 *                         children:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               name:
 *                                 type: string
 *                                 example: "Alice Dupont"
 *                               date_of_birth:
 *                                 type: string
 *                                 format: date
 *                                 example: "2015-01-10"
 *                         services:
 *                           type: object
 *                           properties:
 *                             military_service:
 *                               type: object
 *                               properties:
 *                                 year:
 *                                   type: integer
 *                                   example: 12
 *                                 month:
 *                                   type: integer
 *                                   example: 12
 *                                 days:
 *                                   type: integer
 *                                   example: 12
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-22T11:28:54.834Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-23T12:20:00.714Z"
 *                     acte_id:
 *                       type: string
 *                       example: "60e2f3a2-985e-4353-9df0-fef09f6c5b7f"
 *                 acte:
 *                   type: string
 *                   example: "http://192.168.1.10:8000/api/utils/auth/displayFiles/60e2f3a2-985e-4353-9df0-fef09f6c5b7f?mode=preview"
 *       401:
 *         description: Non authentifié
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
 *                   example: "Authentifiez vous."
 *       403:
 *         description: Accès interdit
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
 *                   example: "Vous n'avez pas les droits nécessaires pour signer cette attestation."
 *       404:
 *         description: Demande non trouvée
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
 *                   example: "Demande d'attestation non trouvée."
 *       500:
 *         description: Erreur serveur
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
 *                   example: "Une erreur est survenue lors de la signature."
 */
router.post('/attestation-presence/generate', AuthModule.isDcGS, AgentController.generatePresenceCertificateRequest);


/**
 * @swagger
 * /api/agent/attestation-presence/signer:
 *   post:
 *     summary: Signer une demande d'attestation de présence
 *     tags: [Attestation Presence]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               requestId:
 *                 type: string
 *                 description: ID of the request to sign
 *                 example: "0e2f9473-4efc-4a43-b8a0-e8651f561f55"
 *     responses:
 *       201:
 *         description: Document signed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Transfert éffectué avec succès."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "0e2f9473-4efc-4a43-b8a0-e8651f561f55"
 *                     numero:
 *                       type: string
 *                       example: "UT6S5DW56R-2025"
 *                     comment:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-23T10:58:46.884Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-05-23T14:23:50.275Z"
 *                     user_id:
 *                       type: string
 *                       example: "0936a8af-d50f-4e01-b940-e5882415703b"
 *                     signataire_id:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     statut_id:
 *                       type: integer
 *                       example: 8
 *                     acte_id:
 *                       type: string
 *                       example: "7825aea7-21c9-4407-ac8e-7a39b56ba521"
 *                     agent:
 *                       type: object
 *                       properties:
 *                         all_filled:
 *                           type: boolean
 *                           example: true
 *                         id:
 *                           type: string
 *                           example: "0936a8af-d50f-4e01-b940-e5882415703b"
 *                         first_name:
 *                           type: string
 *                           example: "Jean"
 *                         last_name:
 *                           type: string
 *                           example: "Dupont"
 *                         matricule:
 *                           type: string
 *                           example: "154895"
 *                         email:
 *                           type: string
 *                           example: "greffier@gouv.bj"
 *                         tel:
 *                           type: string
 *                           example: "string"
 *                         title:
 *                           type: string
 *                           example: "string"
 *                         date_of_service:
 *                           type: string
 *                           format: date-time
 *                           example: "1990-05-15T00:00:00.000Z"
 *                         # Include other properties as needed
 *                     acte:
 *                       type: string
 *                       example: "http://192.168.1.10:8000/api/utils/auth/displayFiles/7825aea7-21c9-4407-ac8e-7a39b56ba521?mode=preview"
 *       401:
 *         description: Not authenticated
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
 *                   example: "Authentifiez vous."
 *       403:
 *         description: Forbidden
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
 *                   example: "Veuillez mettre à jour votre signature."
 *       404:
 *         description: Request not found or signature not found
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
 *                   example: "Demande d'attestation non trouvée."
 *       500:
 *         description: Internal server error
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
 *                   example: "Une erreur est survenue lors de la signature."
 */
router.post('/attestation-presence/signer', AuthModule.isDcGS, AgentController.signPresenceCertificateRequest);


/**
 * @swagger
 * /api/agent/performances/submit:
 *   post:
 *     summary: Submit monthly performance
 *     tags: [Performances]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               month:
 *                 type: integer
 *                 description: Month of the performance record (1-12)
 *                 example: 5
 *               year:
 *                 type: integer
 *                 description: Year of the performance record
 *                 example: 2025
 *               performanceData:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: number
 *                       description: Score value
 *                       example: 85
 *                     criteriaId:
 *                       type: string
 *                       description: ID of the criteria for the score
 *                       example: "criteria-1234"
 *               comment:
 *                 type: string
 *                 description: Optional comment for the performance record
 *                 example: "Great performance this month."
 *     responses:
 *       200:
 *         description: Performance record updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Vous avez déjà mis à jour vos performances de ce mois."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "performance-id-1234"
 *                     month:
 *                       type: integer
 *                       example: 5
 *                     year:
 *                       type: integer
 *                       example: 2025
 *                     comment:
 *                       type: string
 *                       nullable: true
 *                       example: "Great performance this month."
 *                     user_id:
 *                       type: string
 *                       example: "user-id-1234"
 *       201:
 *         description: Performance record submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Performance soumise avec succès."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "performance-id-5678"
 *                     month:
 *                       type: integer
 *                       example: 5
 *                     year:
 *                       type: integer
 *                       example: 2025
 *                     comment:
 *                       type: string
 *                       nullable: true
 *                       example: "Great performance this month."
 *                     user_id:
 *                       type: string
 *                       example: "user-id-5678"
 *       400:
 *         description: Bad request, missing required fields
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
 *                   example: "Tous les champs sont requis."
 *       401:
 *         description: Not authenticated
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
 *                   example: "Authentifiez vous."
 *       500:
 *         description: Internal server error
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
 *                   example: "Une erreur est survenue lors de la soumission."
 */
router.post('/performances/submit', AuthModule.isAuth, AgentController.submitMonthlyPerformance);


/**
 * @swagger
 * /api/agent/performances/list:
 *   get:
 *     summary: Retrieve a list of performance records for the authenticated user
 *     tags: [Performances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: Number of performance records to return per page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: search
 *         in: query
 *         description: Search term to filter performances by agent's name
 *         required: false
 *         schema:
 *           type: string
 *           example: "Jean"
 *       - name: year
 *         in: query
 *         description: Filter performances by year
 *         required: false
 *         schema:
 *           type: integer
 *           example: 2025
 *       - name: month
 *         in: query
 *         description: Filter performances by month
 *         required: false
 *         schema:
 *           type: integer
 *           example: 5
 *       - name: startDate
 *         in: query
 *         description: Start date for filtering performances (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-01-01"
 *       - name: endDate
 *         in: query
 *         description: End date for filtering performances (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-12-31"
 *     responses:
 *       200:
 *         description: List of performance records retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "performance-id-1234"
 *                       year:
 *                         type: integer
 *                         example: 2025
 *                       month:
 *                         type: integer
 *                         example: 5
 *                       comment:
 *                         type: string
 *                         nullable: true
 *                         example: "Great performance this month."
 *                       agent:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "user-id-5678"
 *                           first_name:
 *                             type: string
 *                             example: "Jean"
 *                           last_name:
 *                             type: string
 *                             example: "Dupont"
 *                       performances:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "score-id-1234"
 *                             score:
 *                               type: integer
 *                               example: 10
 *                             criteria:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 7
 *                                 label:
 *                                   type: string
 *                                   example: "Nombre de dossiers complétés"
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *       401:
 *         description: Not authenticated
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
 *                   example: "Authentifiez vous."
 *       500:
 *         description: Internal server error
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
 *                   example: "Une erreur est survenue lors de la récupération des performances."
 */
router.get('/performances/list', AuthModule.isAuth, AgentController.listPerformances);

/**
 * @swagger
 * /api/agent/performances/{id}:
 *   get:
 *     summary: Retrieve specific performance records for the authenticated user
 *     tags: [Performances]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID of the performance record to retrieve
 *         schema:
 *           type: string
 *           example: "performance-id-1234"
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: Number of performance records to return per page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: search
 *         in: query
 *         description: Search term to filter performances by agent's name
 *         required: false
 *         schema:
 *           type: string
 *           example: "Jean"
 *       - name: year
 *         in: query
 *         description: Filter performances by year
 *         required: false
 *         schema:
 *           type: integer
 *           example: 2025
 *       - name: month
 *         in: query
 *         description: Filter performances by month
 *         required: false
 *         schema:
 *           type: integer
 *           example: 5
 *       - name: startDate
 *         in: query
 *         description: Start date for filtering performances (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-01-01"
 *       - name: endDate
 *         in: query
 *         description: End date for filtering performances (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-12-31"
 *     responses:
 *       200:
 *         description: Performance record retrieved successfully
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
 *                     id:
 *                       type: string
 *                       example: "performance-id-1234"
 *                     year:
 *                       type: integer
 *                       example: 2025
 *                     month:
 *                       type: integer
 *                       example: 5
 *                     comment:
 *                       type: string
 *                       nullable: true
 *                       example: "Great performance this month."
 *                     agent:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "user-id-5678"
 *                         first_name:
 *                           type: string
 *                           example: "Jean"
 *                         last_name:
 *                           type: string
 *                           example: "Dupont"
 *                     performances:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "score-id-1234"
 *                           score:
 *                             type: integer
 *                             example: 10
 *                           criteria:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 7
 *                               label:
 *                                 type: string
 *                                 example: "Nombre de dossiers complétés"
 *       400:
 *         description: Missing parameters
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
 *                   example: "Paramètres manquants"
 *       401:
 *         description: Not authenticated
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
 *                   example: "Authentifiez vous."
 *       404:
 *         description: Performance not found
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
 *                   example: "Performances non trouvées."
 *       500:
 *         description: Internal server error
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
 *                   example: "Une erreur est survenue lors de la récupération des performances."
 */
router.get('/performances/get-other-performance/:id', AuthModule.isAuth, AgentController.listOthersPerformances);


/**
 * @swagger
 * /api/agent/collaborator-evaluations/submit:
 *   post:
 *     summary: Submit a collaborator evaluation
 *     tags: [Collaborators Evaluations]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               month:
 *                 type: integer
 *                 description: Month of the evaluation (1-12)
 *                 example: 5
 *               year:
 *                 type: integer
 *                 description: Year of the evaluation
 *                 example: 2025
 *               collaboratorId:
 *                 type: string
 *                 description: ID of the collaborator being evaluated
 *                 example: "collaborator-id-1234"
 *               comment:
 *                 type: string
 *                 description: Optional comment for the evaluation
 *                 example: "Great performance this month."
 *               performanceData:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     value:
 *                       type: string
 *                       description: Score value
 *                       example: "85"
 *                     criteriaId:
 *                       type: string
 *                       description: ID of the criteria for the score
 *                       example: "criteria-id-5678"
 *     responses:
 *       201:
 *         description: Collaborator evaluation submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 message:
 *                   type: string
 *                   example: "Évaluation du collaborateur soumise avec succès."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "evaluation-id-1234"
 *                     month:
 *                       type: integer
 *                       example: 5
 *                     year:
 *                       type: integer
 *                       example: 2025
 *                     comment:
 *                       type: string
 *                       nullable: true
 *                       example: "Great performance this month."
 *                     agent:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "user-id-5678"
 *                         first_name:
 *                           type: string
 *                           example: "Jean"
 *                         last_name:
 *                           type: string
 *                           example: "Dupont"
 *                     collaborator:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: "collaborator-id-1234"
 *                         first_name:
 *                           type: string
 *                           example: "Alice"
 *                         last_name:
 *                           type: string
 *                           example: "Martin"
 *                     collaborator_scores:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "score-id-1234"
 *                           score:
 *                             type: integer
 *                             example: 10
 *                           criteria:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                                 example: 7
 *                               label:
 *                                 type: string
 *                                 example: "Nombre de dossiers complétés"
 *       400:
 *         description: Bad request, missing required fields
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
 *                   example: "Tous les champs sont requis."
 *       401:
 *         description: Not authenticated
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
 *                   example: "Authentifiez vous."
 *       500:
 *         description: Internal server error
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
 *                   example: "Une erreur est survenue lors de la soumission."
 */
router.post('/collaborator-evaluations/submit', AuthModule.isAuth, AgentController.submitCollaboratorEvaluation);


/**
 * @swagger
 * /api/agent/evaluations/collaborators:
 *   get:
 *     summary: Retrieve a list of collaborator evaluations for the authenticated user
 *     tags: [Collaborators Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: Number of evaluations to return per page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: search
 *         in: query
 *         description: Search term to filter evaluations by agent or collaborator's name
 *         required: false
 *         schema:
 *           type: string
 *           example: "Jean"
 *       - name: year
 *         in: query
 *         description: Filter evaluations by year
 *         required: false
 *         schema:
 *           type: integer
 *           example: 2025
 *       - name: month
 *         in: query
 *         description: Filter evaluations by month
 *         required: false
 *         schema:
 *           type: integer
 *           example: 5
 *       - name: startDate
 *         in: query
 *         description: Start date for filtering evaluations (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-01-01"
 *       - name: endDate
 *         in: query
 *         description: End date for filtering evaluations (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-12-31"
 *     responses:
 *       200:
 *         description: List of collaborator evaluations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "evaluation-id-1234"
 *                       year:
 *                         type: integer
 *                         example: 2025
 *                       month:
 *                         type: integer
 *                         example: 5
 *                       agent:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "user-id-5678"
 *                           first_name:
 *                             type: string
 *                             example: "Jean"
 *                           last_name:
 *                             type: string
 *                             example: "Dupont"
 *                       collaborator:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "collab-id-91011"
 *                           first_name:
 *                             type: string
 *                             example: "Alice"
 *                           last_name:
 *                             type: string
 *                             example: "Martin"
 *                       collaborator_scores:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "score-id-1234"
 *                             score:
 *                               type: integer
 *                               example: 85
 *                             criteria:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 7
 *                                 label:
 *                                   type: string
 *                                   example: "Nombre de dossiers complétés"
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *       401:
 *         description: Not authenticated
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
 *                   example: "Authentifiez vous."
 *       500:
 *         description: Internal server error
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
 *                   example: "Une erreur est survenue lors de la récupération."
 */
router.get('/collaborator-evaluations/list', AuthModule.isAuth, AgentController.listCollaboratorEvaluations);


/**
 * @swagger
 * /api/agent/evaluations/collaborators:
 *   get:
 *     summary: Retrieve a list of collaborator evaluations for the authenticated user
 *     tags: [Collaborators Evaluations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number for pagination
 *         required: false
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: limit
 *         in: query
 *         description: Number of evaluations to return per page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: search
 *         in: query
 *         description: Search term to filter evaluations by agent or collaborator's name
 *         required: false
 *         schema:
 *           type: string
 *           example: "Jean"
 *       - name: year
 *         in: query
 *         description: Filter evaluations by year
 *         required: false
 *         schema:
 *           type: integer
 *           example: 2025
 *       - name: month
 *         in: query
 *         description: Filter evaluations by month
 *         required: false
 *         schema:
 *           type: integer
 *           example: 5
 *       - name: startDate
 *         in: query
 *         description: Start date for filtering evaluations (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-01-01"
 *       - name: endDate
 *         in: query
 *         description: End date for filtering evaluations (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: "2025-12-31"
 *     responses:
 *       200:
 *         description: List of collaborator evaluations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "evaluation-id-1234"
 *                       year:
 *                         type: integer
 *                         example: 2025
 *                       month:
 *                         type: integer
 *                         example: 5
 *                       agent:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "user-id-5678"
 *                           first_name:
 *                             type: string
 *                             example: "Jean"
 *                           last_name:
 *                             type: string
 *                             example: "Dupont"
 *                       collaborator:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "collab-id-91011"
 *                           first_name:
 *                             type: string
 *                             example: "Alice"
 *                           last_name:
 *                             type: string
 *                             example: "Martin"
 *                       collaborator_scores:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "score-id-1234"
 *                             score:
 *                               type: integer
 *                               example: 85
 *                             criteria:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                   example: 7
 *                                 label:
 *                                   type: string
 *                                   example: "Nombre de dossiers complétés"
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Missing parameters
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
 *                   example: "Paramètres manquants"
 *       401:
 *         description: Not authenticated
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
 *                   example: "Authentifiez vous."
 *       404:
 *         description: Evaluations not found
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
 *                   example: "Performances non trouvées."
 *       500:
 *         description: Internal server error
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
 *                   example: "Une erreur est survenue lors de la récupération."
 */
router.get('/collaborator-evaluations/get-other-evaluation/:id', AuthModule.isAuth, AgentController.listOthersCollaboratorEvaluations);






// Return router
module.exports = router;