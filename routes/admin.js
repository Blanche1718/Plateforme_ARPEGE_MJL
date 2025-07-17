const express = require("express");
const router = express.Router();
const path = require('path');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const AuthModule = require('../middlewares/is-auth');
const UserLogin = require('../controllers/users');
const Utils = require('../controllers/utils');
const AdminController = require('../controllers/admin');

router.post('/registerUser', AuthModule.isAdmin, UserLogin.registerUser);


// Admin  Get Role
/**
 * @swagger
 * /api/admin/roles:
 *   get:
 *     summary: Retrieve all roles
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 roles:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       label:
 *                         type: string
 *                         example: "Le greffier en chef"
 *                       code:
 *                         type: string
 *                         example: "gec"
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
 *                   example: "Une erreur lors de l'opération"
 */
router.get('/roles', AuthModule.isSuperAdmin, Utils.getRoles);

 /**
 * @swagger
 * /api/admin/agent-list:
 *   get:
 *     summary: Retrieve a list of agents with pagination and search
 *     tags: [Admin]
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
 *         description: Number of agents to return per page
 *         required: false
 *         schema:
 *           type: integer
 *           example: 10
 *       - name: search
 *         in: query
 *         description: Search term to filter agents by name, email, or other fields
 *         required: false
 *         schema:
 *           type: string
 *           example: "John"
 *       - name: startDate
 *         in: query
 *         description: Start date for filtering by service date (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           example: "2025-01-01"
 *       - name: endDate
 *         in: query
 *         description: End date for filtering by service date (YYYY-MM-DD)
 *         required: false
 *         schema:
 *           type: string
 *           example: "2025-12-31"
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
 *                 total:
 *                   type: integer
 *                   example: 5
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 1
 *                 agents:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       all_filled:
 *                         type: boolean
 *                         example: true
 *                       completion_percentage:
 *                         type: integer
 *                         example: 50
 *                       id:
 *                         type: string
 *                         example: "b95c5977-a9de-4009-b89e-f7c47decfaa7"
 *                       first_name:
 *                         type: string
 *                         example: "Pierre"
 *                       last_name:
 *                         type: string
 *                         example: "Martin"
 *                       matricule:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       email:
 *                         type: string
 *                         example: "greffier@gouv.bj"
 *                       tel:
 *                         type: string
 *                         example: "+123456789"
 *                       title:
 *                         type: string
 *                         example: "string"
 *                       date_of_service:
 *                         type: string
 *                         format: date-time
 *                         example: "1990-05-15T00:00:00.000Z"
 *                       date_of_birth:
 *                         type: string
 *                         format: date-time
 *                         example: "1990-05-15T00:00:00.000Z"
 *                       place_of_birth:
 *                         type: string
 *                         example: "Paris"
 *                       date_of_marriage:
 *                         type: string
 *                         format: date-time
 *                         example: "2015-06-20T00:00:00.000Z"
 *                       place_of_marriage:
 *                         type: string
 *                         example: "Paris"
 *                       family_address:
 *                         type: string
 *                         example: "123 Rue de Paris, 75001 Paris, France"
 *                       spoken_languages:
 *                         type: string
 *                         example: "Français, Anglais"
 *                       military_status:
 *                         type: string
 *                         example: "Service Militaire d’Intérêt National accompli"
 *                       military_time:
 *                         type: string
 *                         example: "Durée du 1er service militaire"
 *                       actual_grade_class:
 *                         type: string
 *                         example: "A3-7"
 *                       date_actual_grade_class:
 *                         type: string
 *                         format: date-time
 *                         example: "2015-06-20T00:00:00.000Z"
 *                       recrut_class:
 *                         type: string
 *                         example: "2021"
 *                       pension_scheme:
 *                         type: string
 *                         example: "Régime de base"
 *                       services_interruptions:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             cause:
 *                               type: string
 *                               example: "Maladie"
 *                             start_date:
 *                               type: string
 *                               example: "2015-01-10"
 *                             end_date:
 *                               type: string
 *                               example: "2015-01-10"
 *                       children:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             name:
 *                               type: string
 *                               example: "Alice Dupont"
 *                             date_of_birth:
 *                               type: string
 *                               example: "2015-01-10"
 *                       diplomas:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             label:
 *                               type: string
 *                               example: "Licence en Informatique"
 *                             date_award:
 *                               type: string
 *                               example: "2013-07-15"
 *                       promotions:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             label:
 *                               type: string
 *                               example: "Promotion 2013"
 *                       mutations:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             label:
 *                               type: string
 *                               example: "Mutation 2013"
 *                       honorary_distinction:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             label:
 *                               type: string
 *                               example: "Distinction 2013"
 *                       professions:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             label:
 *                               type: string
 *                               example: "Développeur web"
 *                             appointment_date_admin_paid:
 *                               type: string
 *                               example: "2023-01-01"
 *                             appointment_date_in_context:
 *                               type: string
 *                               example: "2023-01-10"
 *                             actual_grade:
 *                               type: string
 *                               example: "Senior Developer"
 *                             duration:
 *                               type: string
 *                               example: "12 mois"
 *                             cause:
 *                               type: string
 *                               example: "Contrat renouvelé"
 *                       services:
 *                         type: object
 *                         properties:
 *                           military_service:
 *                             type: object
 *                             properties:
 *                               year:
 *                                 type: integer
 *                                 example: 12
 *                               month:
 *                                 type: integer
 *                                 example: 12
 *                               days:
 *                                 type: integer
 *                                 example: 12
 *                           civil_service_with_pension:
 *                             type: object
 *                             properties:
 *                               year:
 *                                 type: integer
 *                                 example: 12
 *                               month:
 *                                 type: integer
 *                                 example: 12
 *                               days:
 *                                 type: integer
 *                                 example: 12
 *                           civil_service_with_no_pension:
 *                             type: object
 *                             properties:
 *                               year:
 *                                 type: integer
 *                                 example: 12
 *                               month:
 *                                 type: integer
 *                                 example: 12
 *                               days:
 *                                 type: integer
 *                                 example: 12
 *                           total_service:
 *                             type: object
 *                             properties:
 *                               year:
 *                                 type: integer
 *                                 example: 12
 *                               month:
 *                                 type: integer
 *                                 example: 12
 *                               days:
 *                                 type: integer
 *                                 example: 12
 *                       last_connexion:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-04-19T16:00:00.000Z"
 *                       last_profile_modif:
 *                         type: string
 *                         format: date-time
 *                         example: "2023-04-14T08:45:00.000Z"
 *                       disabled:
 *                         type: boolean
 *                         example: false
 *                       codeOTP:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       first_connect:
 *                         type: boolean
 *                         example: false
 *                       advancement:
 *                         type: string
 *                         example: "NON"
 *                       corps_id:
 *                         type: integer
 *                         example: 1
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-05-22T01:17:41.247Z"
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                         example: "2025-05-22T02:11:33.441Z"
 *                       entite_id:
 *                         type: integer
 *                         nullable: true
 *                         example: null
 *                       juridiction_id:
 *                         type: integer
 *                         example: 8
 *                       role_id:
 *                         type: integer
 *                         example: 13
 *                       role:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 13
 *                           label:
 *                             type: string
 *                             example: "Le greffier en chef"
 *                           code:
 *                             type: string
 *                             example: "gec"
 *                       body:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           label:
 *                             type: string
 *                             example: "Magistrat"
 *                           code:
 *                             type: string
 *                             example: "magistrat"
 *                       entite:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 13
 *                           label:
 *                             type: string
 *                             example: "DSI"
 *                           code:
 *                             type: string
 *                             example: "gec"
 *                           disabled:
 *                             type: boolean
 *                             example: false
 *                           hidden:
 *                             type: boolean
 *                             example: false
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-05-22T11:28:53.080Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-05-22T11:28:53.080Z"
 *                           parent_id:
 *                             type: integer
 *                             example: 3
 *                       juridiction:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 13
 *                           label:
 *                             type: string
 *                             example: "DSI"
 *                           code:
 *                             type: string
 *                             example: "gec"
 *                           disabled:
 *                             type: boolean
 *                             example: false
 *                           hidden:
 *                             type: boolean
 *                             example: false
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-05-22T11:28:53.080Z"
 *                           updatedAt:
 *                             type: string
 *                             format: date-time
 *                             example: "2025-05-22T11:28:53.080Z"
 *                           parent_id:
 *                             type: integer
 *                             example: 3
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
 *                   example: "Un problème lors de la récupération des utilisateurs."
 */
router.get('/agent-list', AuthModule.isSuperAdmin,  UserLogin.agentList);

/**** Creation de permission ******/
/**
 * @swagger
 * /api/admin/permissions/create-type-permission:
 *   post:
 *     summary: Créer un nouveau type de permission
 *     tags:
 *       - [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *                 example: "menu_list_role"
 *               label:
 *                 type: string
 *                 example: "Menu & Liste des roles"
 *               ressource:
 *                 type: string
 *                 example: "Prise de service"
 *     responses:
 *       201:
 *         description: Type de permission créé avec succès
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
 *                   example: Type de permission créé avec succès.
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     code:
 *                       type: string
 *                       example: "menu_list_role"
 *                     label:
 *                       type: string
 *                       example: "Menu & Liste des roles"
 *       400:
 *         description: Requête invalide
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
 *                   example: Code et description sont requis.
 *       500:
 *         description: Erreur interne du serveur
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
 *                   example: Erreur lors de la création du type de permission.
 */
router.post('/permissions/create-permission', AuthModule.isSuperAdmin,  AdminController.createTypePermission);

/**
 * @swagger
 * /api/admin/users/permissions:
 *   put:
 *     summary: Mettre à jour les permissions d'un utilisateur
 *     tags:
 *       - [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: ID de l'utilisateur dont les permissions doivent être mises à jour
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ['read', 'write', 'delete']
 *     responses:
 *       200:
 *         description: Permissions mises à jour avec succès
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
 *                   example: Permissions mises à jour avec succès.
 *       401:
 *         description: Utilisateur non authentifié
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
 *                   example: Authentifiez-vous.
 *       403:
 *         description: Accès refusé
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
 *                   example: Accès refusé. Vous devez être un administrateur.
 *       404:
 *         description: Utilisateur non trouvé
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
 *                   example: Utilisateur non trouvé.
 *       500:
 *         description: Erreur interne du serveur
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
 *                   example: Erreur lors de la mise à jour des permissions.
 */
router.put('/users/permissions', AuthModule.isSuperAdmin, AdminController.updatePermissions);

/**
 * @swagger
 * /api/admin/permissions/types/{id}:
 *   delete:
 *     summary: Supprimer une permission par ID
 *     tags:
 *       - [Admin]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ID de la permission à supprimer
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Permission supprimée avec succès
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
 *                   example: Permission supprimée avec succès.
 *       403:
 *         description: Accès refusé pour les utilisateurs non administrateurs
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
 *                   example: Accès refusé. Seules les administrateurs peuvent supprimer des permissions.
 *       404:
 *         description: Permission non trouvée
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
 *                   example: Permission non trouvée.
 *       500:
 *         description: Erreur interne du serveur
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
 *                   example: Erreur lors de la suppression de la permission.
 */
router.delete('/permissions/types/:id', AuthModule.isSuperAdmin, AdminController.deleteTypePermission);

/**
 * @swagger
 * /api/admin/permissions/{role_id}/{type_permission_id}:
 *   delete:
 *     summary: Supprimer une permission par role_id et type_permission_id
 *     tags:
 *       - [Admin]
 *     parameters:
 *       - name: role_id
 *         in: path
 *         required: true
 *         description: ID du rôle associé à la permission à supprimer
 *         schema:
 *           type: integer
 *           example: 1
 *       - name: type_permission_id
 *         in: path
 *         required: true
 *         description: ID du type de permission à supprimer
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: Permission supprimée avec succès
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
 *                   example: Permission supprimée avec succès.
 *       403:
 *         description: Accès refusé pour les utilisateurs non administrateurs
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
 *                   example: Accès refusé. Seuls les administrateurs peuvent supprimer des permissions.
 *       404:
 *         description: Permission non trouvée
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
 *                   example: Permission non trouvée.
 *       500:
 *         description: Erreur interne du serveur
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
 *                   example: Erreur lors de la suppression de la permission.
 */
router.delete('/permissions/:role_id/:type_permission_id', AuthModule.isSuperAdmin, AdminController.deletePermission);

router.post('/empty-trash', AuthModule.isSuperAdmin, Utils.cleanUpInvalidDocuments);


// Return router
module.exports = router;