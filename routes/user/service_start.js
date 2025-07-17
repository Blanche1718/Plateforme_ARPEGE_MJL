const express = require("express");
const router = express.Router();
const path = require('path');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const ServiceStartController = require('../../controllers/service_start');
const Validator = require('../../helpers/validator'); // Adjust the path as necessary
const AuthModule = require('../../middlewares/is-auth');

// Get the project root directory
const projectRoot = path.resolve(__dirname, '../../');


/**
 * @swagger
 * /api/agent/service-start/submit:
 *   post:
 *     summary: Créer une demande d'attestation de prise de service
 *     tags: [Attestation de Prise de service]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               service_id:
 *                 type: string
 *                 description: ID du service (DSPJ ou DPAF).
 *                 example: "98eb2337-cff0-4670-9d7d-68a8e5f6d9a0"
 *               prevalidators:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Liste des IDs des prévalidateurs.
 *                 example: ["984e09cf-6edb-47e8-b889-e9c063ef4b95", "1a2c1443-925c-4bd3-ae59-3620b52ae2b5"]
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
 *                       example: "53a06a94-9a3a-4e07-9fce-c41ac68d3640"
 *                     validated:
 *                       type: boolean
 *                       example: false
 *                     auto_sign:
 *                       type: boolean
 *                       example: false
 *                     user_id:
 *                       type: string
 *                       example: "3203610d-a230-4fd7-b174-a669d33af291"
 *                     signataire_id:
 *                       type: string
 *                       example: "98eb2337-cff0-4670-9d7d-68a8e5f6d9a0"
 *                     numero:
 *                       type: string
 *                       example: "Z548LXZRIF-2025"
 *                     prevalidators:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "984e09cf-6edb-47e8-b889-e9c063ef4b95"
 *                           visa:
 *                             type: boolean
 *                             example: false
 *                     statut_id:
 *                       type: integer
 *                       example: 1
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-25T09:04:03.951Z"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-25T09:04:03.951Z"
 *                     comment:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     acte_id:
 *                       type: string
 *                       nullable: true
 *                       example: null
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
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: [
 *                     "Les paramètres requis ne sont pas fournis.",
 *                     "Veuillez fournir le service de traitement.",
 *                     "Veuillez fournir la liste des prévalidateurs."
 *                   ]
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
 *                   example: "Authentifiez-vous."
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
router.post('/submit', AuthModule.isAuth, ServiceStartController.createServiceStartCertificateRequest);


/**
 * @swagger
 * /api/agent/service-start/list:
 *   get:
 *     summary: Récupérer la liste des demandes d'attestation de début de service
 *     tags: [Attestation de Prise de service]
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
 *           example: null
 *       - name: startDate
 *         in: query
 *         description: Start date for filtering requests (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: null
 *       - name: endDate
 *         in: query
 *         description: End date for filtering requests (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: null
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
 *                         example: "53a06a94-9a3a-4e07-9fce-c41ac68d3640"
 *                       validated:
 *                         type: boolean
 *                         example: false
 *                       auto_sign:
 *                         type: boolean
 *                         example: false
 *                       user_id:
 *                         type: string
 *                         example: "3203610d-a230-4fd7-b174-a669d33af291"
 *                       signataire_id:
 *                         type: string
 *                         example: "98eb2337-cff0-4670-9d7d-68a8e5f6d9a0"
 *                       numero:
 *                         type: string
 *                         example: "Z548LXZRIF-2025"
 *                       prevalidators:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "984e09cf-6edb-47e8-b889-e9c063ef4b95"
 *                             visa:
 *                               type: boolean
 *                               example: false
 *                       statut_id:
 *                         type: integer
 *                         example: 1
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-25T09:04:03.951Z"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-25T09:04:03.951Z"
 *                       comment:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       acte_id:
 *                         type: string
 *                         nullable: true
 *                         example: null
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
 *                   example: "Authentifiez-vous."
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
router.get('/list', AuthModule.isAuth, ServiceStartController.getServiceStartCertificateRequests);

/**
 * @swagger
 * /api/agent/service-start/details/{id}:
 *   get:
 *     summary: Récupérer une demande d'attestation de début de service par ID
 *     tags: [Attestation de Prise de service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         description: L'ID de la demande d'attestation de début de service à récupérer
 *         required: true
 *         schema:
 *           type: string
 *           example: "53a06a94-9a3a-4e07-9fce-c41ac68d3640"
 *     responses:
 *       200:
 *         description: Demande récupérée avec succès
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
 *                   example: "Demande récupérée avec succès."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "53a06a94-9a3a-4e07-9fce-c41ac68d3640"
 *                     validated:
 *                       type: boolean
 *                       example: false
 *                     auto_sign:
 *                       type: boolean
 *                       example: false
 *                     numero:
 *                       type: string
 *                       example: "Z548LXZRIF-2025"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-25T09:04:03.951Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-25T09:04:03.951Z"
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
 *                   example: "Authentifiez-vous."
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
 *                   example: "Demande de certificat non trouvée."
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
router.get('/details/:id', AuthModule.isAuth, ServiceStartController.getServiceStartCertificateRequestById);

/**
 * @swagger
 * /api/agent/service-start/list/my/requests:
 *   get:
 *     summary: Récupérer la liste des demandes d'attestation de début de service
 *     tags: [Attestation de Prise de service]
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
 *           example: null
 *       - name: startDate
 *         in: query
 *         description: Start date for filtering requests (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: null
 *       - name: endDate
 *         in: query
 *         description: End date for filtering requests (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: null
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
 *                         example: "53a06a94-9a3a-4e07-9fce-c41ac68d3640"
 *                       validated:
 *                         type: boolean
 *                         example: false
 *                       auto_sign:
 *                         type: boolean
 *                         example: false
 *                       user_id:
 *                         type: string
 *                         example: "3203610d-a230-4fd7-b174-a669d33af291"
 *                       signataire_id:
 *                         type: string
 *                         example: "98eb2337-cff0-4670-9d7d-68a8e5f6d9a0"
 *                       numero:
 *                         type: string
 *                         example: "Z548LXZRIF-2025"
 *                       prevalidators:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "984e09cf-6edb-47e8-b889-e9c063ef4b95"
 *                             visa:
 *                               type: boolean
 *                               example: false
 *                       statut_id:
 *                         type: integer
 *                         example: 1
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-25T09:04:03.951Z"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-25T09:04:03.951Z"
 *                       comment:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       acte_id:
 *                         type: string
 *                         nullable: true
 *                         example: null
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
 *                 agent:
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
 *                           decision_decret_number:
 *                             type: string
 *                             example: "PMOL 2015-01-10"
 *                           cause:
 *                             type: string
 *                             example: "Maladie"
 *                           time_period:
 *                             type: string
 *                             example: "deux mois"
 *                           start_date:
 *                             type: string
 *                             format: date
 *                             example: "2015-01-10"
 *                           end_date:
 *                             type: string
 *                             format: date
 *                             example: "2015-01-10"
 *                     family:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           conjoint_e:
 *                             type: string
 *                             example: "Mme AZONLI Pièrrette"
 *                           date_of_marriage:
 *                             type: string
 *                             format: date-time
 *                             example: "2015-06-20T00:00:00.000Z"
 *                           place_of_marriage:
 *                             type: string
 *                             example: "Paris"
 *                           family_address:
 *                             type: string
 *                             example: "123 Rue de Paris, 75001 Paris, France"
 *                           children:
 *                             type: array
 *                             items:
 *                               type: object
 *                               properties:
 *                                 name:
 *                                   type: string
 *                                   example: "Alice Dupont"
 *                                 date_of_birth:
 *                                   type: string
 *                                   example: "2015-01-10"
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
 *                             format: date
 *                             example: "2013-07-15"
 *                           award_place:
 *                             type: string
 *                             example: "Abomey-Calavi/BENIN"
 *                           award_universite:
 *                             type: string
 *                             example: "EPAC"
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
 *                         date_of_integration:
 *                           type: string
 *                           format: date
 *                           example: "2023-01-01"   
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
 *                       signataire:
 *                         type: object
 *                         nullable: true
 *                         example: "DJOGBE Pièrre"
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
 *                   example: "Authentifiez-vous."
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
router.get('/list/my/requests', AuthModule.isAuth, ServiceStartController.getOwnServiceStartCertificateRequests);

/**
 * @swagger
 * /api/agent/service-start/list/others/requests:
 *   get:
 *     summary: Récupérer la liste des demandes d'attestation de début de service
 *     tags: [Attestation de Prise de service]
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
 *           example: null
 *       - name: startDate
 *         in: query
 *         description: Start date for filtering requests (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: null
 *       - name: endDate
 *         in: query
 *         description: End date for filtering requests (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           format: date
 *           example: null
 *       - name: userID
 *         in: query
 *         description: Id de l'utilisateur
 *         required: false
 *         schema:
 *           type: string
 *           example: null
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
 *                         example: "53a06a94-9a3a-4e07-9fce-c41ac68d3640"
 *                       validated:
 *                         type: boolean
 *                         example: false
 *                       auto_sign:
 *                         type: boolean
 *                         example: false
 *                       user_id:
 *                         type: string
 *                         example: "3203610d-a230-4fd7-b174-a669d33af291"
 *                       signataire_id:
 *                         type: string
 *                         example: "98eb2337-cff0-4670-9d7d-68a8e5f6d9a0"
 *                       numero:
 *                         type: string
 *                         example: "Z548LXZRIF-2025"
 *                       prevalidators:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             id:
 *                               type: string
 *                               example: "984e09cf-6edb-47e8-b889-e9c063ef4b95"
 *                             visa:
 *                               type: boolean
 *                               example: false
 *                       statut_id:
 *                         type: integer
 *                         example: 1
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-25T09:04:03.951Z"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-06-25T09:04:03.951Z"
 *                       comment:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       acte_id:
 *                         type: string
 *                         nullable: true
 *                         example: null
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
 *                   example: "Authentifiez-vous."
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
router.get('/list/others/requests', AuthModule.isManager, ServiceStartController.getOthersServiceStartCertificateRequests);


/**
 * @swagger
 * /api/agent/service-start/validate/{id}:
 *   post:
 *     summary: Valider une demande d'attestation de début de service
 *     tags: [Attestation de Prise de service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la demande à valider
 *         schema:
 *           type: string
 *           example: "eda9b15a-16e4-439b-ba9f-e9694669d32b"
 *     responses:
 *       200:
 *         description: Demande validée avec succès
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
 *                   example: "Demande validée avec succès."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "53a06a94-9a3a-4e07-9fce-c41ac68d3640"
 *                     numero:
 *                       type: string
 *                       example: "Z548LXZRIF-2025"
 *                     prevalidators:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "984e09cf-6edb-47e8-b889-e9c063ef4b95"
 *                           visa:
 *                             type: boolean
 *                             example: false
 *                     comment:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     validated:
 *                       type: boolean
 *                       example: true
 *                     auto_sign:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-25T09:04:03.951Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-25T09:41:04.530Z"
 *                     user_id:
 *                       type: string
 *                       example: "3203610d-a230-4fd7-b174-a669d33af291"
 *                     signataire_id:
 *                       type: string
 *                       example: "98eb2337-cff0-4670-9d7d-68a8e5f6d9a0"
 *                     statut_id:
 *                       type: integer
 *                       example: 7
 *                     acte_id:
 *                       type: string
 *                       nullable: true
 *                       example: null
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
 *       400:
 *         description: Paramètres manquants ou demande non en attente
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
 *                   example: "Paramètres manquants."
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
 *                   example: "Authentifiez-vous."
 *       403:
 *         description: Accès non autorisé
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
 *                   example: "Accès non autorisé."
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
 *                   example: "Demande non trouvée."
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
 *                   example: "Une erreur est survenue lors de la validation."
 */
router.post('/validate/:id', AuthModule.isManager, ServiceStartController.validateServiceStartCertificateRequest);

/**
 * @swagger
 * /api/agent/service-start/reject/{id}:
 *   post:
 *     summary: Rejeter une demande d'attestation de début de service
 *     tags: [Attestation de Prise de service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la demande à rejeter
 *         schema:
 *           type: string
 *           example: "53a06a94-9a3a-4e07-9fce-c41ac68d3640"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - comment
 *             properties:
 *               comment:
 *                 type: string
 *                 example: "Rejet de la demande"
 *     responses:
 *       200:
 *         description: Demande rejetée avec succès
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
 *                   example: "Demande validée avec succès."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "53a06a94-9a3a-4e07-9fce-c41ac68d3640"
 *                     statutIn:
 *                       type: object
 *                       properties:
 *                         code:
 *                           type: string
 *                           example: "rejected"
 *                         label:
 *                           type: string
 *                           example: "Rejeté"
 *       400:
 *         description: Paramètres manquants
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
 *                   example: "Paramètres manquants."
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
 *                   example: "Authentifiez-vous."
 *       403:
 *         description: Accès non autorisé
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
 *                   example: "Accès non autorisé."
 *       404:
 *         description: Demande non trouvée ou déjà signée
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
 *                   example: "Demande non trouvée ou Demande déjà signée."
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
 *                   example: "Une erreur est survenue lors de la validation."
 */
router.post('/reject/:id', AuthModule.isService, ServiceStartController.rejetServiceStartCertificateRequest);


/**
 * @swagger
 * /api/agent/service-start/visa/{id}/{action}:
 *   post:
 *     summary: Donner son visa pour une demande d'attestation de début de service
 *     tags: [Attestation de Prise de service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la demande à valider
 *         schema:
 *           type: string
 *           example: "eda9b15a-16e4-439b-ba9f-e9694669d32b"
 *       - name: action
 *         in: path
 *         required: true
 *         description: Action à effectuer (visaOk ou visaNoOk)
 *         schema:
 *           type: string
 *           example: "visaOk"
 *     responses:
 *       200:
 *         description: Visa donné avec succès
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
 *                   example: "Demande validée avec succès."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "53a06a94-9a3a-4e07-9fce-c41ac68d3640"
 *                     validated:
 *                       type: boolean
 *                       example: false
 *                     auto_sign:
 *                       type: boolean
 *                       example: false
 *                     user_id:
 *                       type: string
 *                       example: "3203610d-a230-4fd7-b174-a669d33af291"
 *                     signataire_id:
 *                       type: string
 *                       example: "98eb2337-cff0-4670-9d7d-68a8e5f6d9a0"
 *                     numero:
 *                       type: string
 *                       example: "Z548LXZRIF-2025"
 *                     prevalidators:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "984e09cf-6edb-47e8-b889-e9c063ef4b95"
 *                           visa:
 *                             type: boolean
 *                             example: false
 *                     statut_id:
 *                       type: integer
 *                       example: 1
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-25T09:04:03.951Z"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-25T09:04:03.951Z"
 *                     comment:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     acte_id:
 *                       type: string
 *                       nullable: true
 *                       example: null
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
 *       400:
 *         description: Paramètres manquants ou demande non valide
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
 *                   example: "La demande n'est pas en attente."
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
 *                   example: "Authentifiez-vous."
 *       403:
 *         description: Accès non autorisé
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
 *                   example: "Accès non autorisé."
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
 *                   example: "Demande non trouvée."
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
 *                   example: "Une erreur est survenue lors de la validation."
 */
router.post('/visa/:id/:action', AuthModule.isAuth, ServiceStartController.visaServiceStartCertificateRequest);



/**
 * @swagger
 * /api/agent/service-start/signer/{id}:
 *   post:
 *     summary: Signer une demande d'attestation de début de service
 *     tags: [Attestation de Prise de service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la demande à signer
 *         schema:
 *           type: string
 *           example: "53a06a94-9a3a-4e07-9fce-c41ac68d3640"
 *     responses:
 *       201:
 *         description: Document signé avec succès
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
 *                   example: "Transfert effectué avec succès."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "53a06a94-9a3a-4e07-9fce-c41ac68d3640"
 *                     numero:
 *                       type: string
 *                       example: "Z548LXZRIF-2025"
 *                     prevalidators:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                             example: "984e09cf-6edb-47e8-b889-e9c063ef4b95"
 *                           visa:
 *                             type: boolean
 *                             example: false
 *                     comment:
 *                       type: string
 *                       nullable: true
 *                       example: null
 *                     validated:
 *                       type: boolean
 *                       example: true
 *                     auto_sign:
 *                       type: boolean
 *                       example: false
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-25T09:04:03.951Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2025-06-25T10:03:55.964Z"
 *                     user_id:
 *                       type: string
 *                       example: "3203610d-a230-4fd7-b174-a669d33af291"
 *                     signataire_id:
 *                       type: string
 *                       example: "3203610d-a230-4fd7-b174-a669d33af291"
 *                     statut_id:
 *                       type: integer
 *                       example: 8
 *                     acte_id:
 *                       type: string
 *                       example: "439d6adc-1a73-4011-8f13-8fe5d2f925d8"
 *                     statutIn:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 8
 *                         label:
 *                           type: string
 *                           example: "Signé"
 *                         code:
 *                           type: string
 *                           example: "signed"
 *                         description:
 *                           type: string
 *                           nullable: true
 *                           example: null
 *                         createdAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-29T12:37:34.897Z"
 *                         updatedAt:
 *                           type: string
 *                           format: date-time
 *                           example: "2025-05-29T12:37:34.897Z"
 *                 acte:
 *                   type: string
 *                   example: "http://192.168.0.125:8000/api/utils/auth/displayFiles/439d6adc-1a73-4011-8f13-8fe5d2f925d8?mode=preview"
 *                 agent:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "b95c5977-a9de-4009-b89e-f7c47decfaa7"
 *                     first_name:
 *                       type: string
 *                       example: "Pierre"
 *                     last_name:
 *                       type: string
 *                       example: "Martin"
 *       400:
 *         description: Demande non trouvée ou signature non valide
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "failure"
 *                     message:
 *                       type: string
 *                       example: "Demande d'attestation non trouvée."
 *                 - type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       example: "error"
 *                     message:
 *                       type: string
 *                       example: [
 *                          "Demande d'attestation non trouvée.",
 *                          "Demande déjà signée.",
 *                          "La demande doit être validée au préalable."
 *                       ] 
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
 *                   example: "Authentifiez-vous."
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
 *                   example: "Veuillez mettre à jour votre signature."
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
router.post('/signer/:id', AuthModule.isManager, ServiceStartController.signServiceStartCertificateRequest);
// Return router
module.exports = router;