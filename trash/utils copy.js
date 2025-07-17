const express = require("express");
const router = express.Router();
const path = require('path');
const csrf = require('csurf');
const csrfProtection = csrf({ cookie: true });
const Utils = require('../controllers/utils');


const AuthModule = require('../middlewares/is-auth');
// Get the project root directory
const projectRoot = path.resolve(__dirname, '../../');


/******************* Utils endpoints getting non work endpoints *********************/

/**
 * @swagger
 * /api/utils/getYears:
 *   get:
 *     summary: Retrieve eligible years based on user's date of service
 *     tags: [Utils]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Eligible years retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 eligibleYears:
 *                   type: array
 *                   items:
 *                     type: integer
 *                     example: [2020, 2021, 2022, 2023, 2024]
 *       404:
 *         description: User not found or missing date of service
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
 *                   example: "Utilisateur non trouvé ou date de prise de service manquante"
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
router.get('/getYears', AuthModule.isAuth, Utils.getYears);


/**
 * @swagger
 * /api/utils/getCriterias:
 *   get:
 *     summary: Retrieve criteria evaluations
 *     tags: [Utils]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: use_case
 *         required: false
 *         description: Filter criteria by use case
 *         schema:
 *           type: string
 *           enum: 
 *             - bulletin
 *             - collaborator_evaluation
 *             - performances
 *           example: "bulletin"
 *     responses:
 *       200:
 *         description: Successfully retrieved criteria
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
 *                         type: integer
 *                         example: 1
 *                       label:
 *                         type: string
 *                         example: "Compétence professionnelle"
 *                       code:
 *                         type: string
 *                         example: "professional_competence"
 *                       min_score:
 *                         type: integer
 *                         example: 0
 *                       max_score:
 *                         type: integer
 *                         example: 7
 *                       disabled:
 *                         type: boolean
 *                         example: false
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
 *                   example: "Erreur serveur"
 */
router.get('/getCriterias', AuthModule.isAuth, Utils.getCriterias);



/**
 * @swagger
 * /api/utils/getSuperiors:
 *   get:
 *     summary: Retrieve users with the same parent role
 *     description: Fetches users who have the same parent role as the authenticated user, optionally filtered by a search query.
 *     tags: [Utils]
 *     security:
 *       - bearerAuth: []  
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Optional search query to filter users by first name, last name, or email.
 *     responses:
 *       200:
 *         description: Successfully retrieved users with the parent role
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "success"
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                         example: "24f119c4-df95-4709-ba39-2a2f01f398a8"
 *                       first_name:
 *                         type: string
 *                         example: "Alain"
 *                       last_name:
 *                         type: string
 *                         example: "MANON"
 *                       email:
 *                         type: string
 *                         example: "dspj@gouv.bj"
 *                       tel:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       title:
 *                         type: string
 *                         nullable: true
 *                         example: null
 *                       role:
 *                         type: object
 *                         properties:
 *                           code:
 *                             type: string
 *                             example: "dspj"
 *                           label:
 *                             type: string
 *                             example: "DSPJ"
 *       400:
 *         description: Bad request - User ID missing or user not found
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
 *                   example: "Mauvaise requête, ID utilisateur manquant"
 *       500:
 *         description: Internal Server Error
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
 *                   example: "Une erreur lors de l'opération"
 */
router.get('/getSuperiors',AuthModule.isAuth, Utils.getUsersWithParentRole);


//Get Corps
/**
 * @swagger
 * /api/utils/get-corps:
 *   get:
 *     summary: Retrieve all corps
 *     tags: [Utils]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved corps
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
 *                         type: integer
 *                         example: 1
 *                       label:
 *                         type: string
 *                         example: "Corps example"
 *                       code:
 *                         type: string
 *                         example: "Code du corps"
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
 *                   example: "Erreur serveur"
 */
router.get('/get-corps',AuthModule.isAuth, Utils.getCoprs);


// Search users
/**
 * @swagger
 * /api/utils/search-users:
 *   get:
 *     summary: "Search for users by name or email"
 *     tags: [Utils]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         required: true
 *         schema:
 *           type: string
 *         description: Search term (at least 3 letters)
 *     responses:
 *       200:
 *         description: Successfully retrieved users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       first_name:
 *                         type: string
 *                         example: "Jean"
 *                       last_name:
 *                         type: string
 *                         example: "Dupont"
 *                       email:
 *                         type: string
 *                         example: "jean.dupont@example.com"
 *       400:
 *         description: Bad request, search term too short
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
 *                   example: "Le paramètre de recherche doit comporter au moins 3 lettres."
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
router.get('/search-users',AuthModule.isAuth, Utils.searchUsers);








/****************************  FILES HANDLING *************************************************/

// Set up multer for handling file uploads
const multer  = require('multer');
//Définir la limite  des fichiers
const maxFiles = 2;
// Définir la limite de taille des fichiers à 2 Mo
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2 Mo
// Configuration de Multer pour la gestion des fichiers téléchargés
// Configuration de multer pour le stockage des fichiers
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'Files/uploads/'); // Dossier de destination
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '_'); // Nettoie les espaces
        cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: MAX_FILE_SIZE }, // Limite de taille de fichier
    fileFilter: function (req, file, cb) {
        const filetypes = /pdf/; // Types de fichiers autorisés
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers PDF sont autorisés.'));
        }
    }
});


const storagePhotos = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'Files/photos/'); // Dossier de destination
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext).replace(/\s+/g, '_'); // Nettoie les espaces
        cb(null, `${baseName}-${uniqueSuffix}${ext}`);
    }
});


const uploadPhoto = multer({ 
    storage: storagePhotos,
    limits: { fileSize: MAX_FILE_SIZE }, // Limite de taille de fichier
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/; // Types de fichiers autorisés
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Seuls les fichiers image (JPEG, PNG, GIF) sont autorisés.'));
        }
    }
});
// Middleware pour gérer les erreurs de Multer avec des messages personnalisés
function handleMulterError(err, req, res, next) {
    console.log('Erreur: Les fichiers : ', req.files, req.file)
    if (err instanceof multer.MulterError) {
        let errorMessage;

        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                errorMessage = `Le fichier est trop volumineux. La taille maximale autorisée est de ${MAX_FILE_SIZE / 1024 / 1024}MB.`;
                break;
            case 'LIMIT_FILE_COUNT':
                errorMessage = "Nombre maximum de fichiers dépassé. Vous ne pouvez télécharger qu'un seul fichier.";
                break;
            case 'LIMIT_FIELD_KEY':
                errorMessage = "Le nom du champ de fichier est trop long.";
                break;
            case 'LIMIT_FIELD_VALUE':
                errorMessage = "La valeur d'un champ est trop longue.";
                break;
            case 'LIMIT_FIELD_COUNT':
                errorMessage = "Nombre maximal de champs dépassé.";
                break;
            case 'LIMIT_UNEXPECTED_FILE':
                errorMessage = "Un fichier inattendu a été trouvé. Veuillez vérifier vos champs de fichier.";
                break;
            default:
                errorMessage = "Erreur de téléchargement de fichier. Veuillez réessayer.";
        }

        console.log("Erreur lors de l'envoi (400):", req.file, req.files, err);
        return res.status(400).json({ message: errorMessage });
    } else if (err) {
        console.log("Erreur lors de l'envoi (500):", err);
        return res.status(500).json({ message: `Un soucs au niveau de l'envoie de fichier` });
    }
    next();
}

/**
 * @swagger
 * /api/utils/auth/uploadFiles:
 *   post:
 *     summary: Upload files (authenticated)
 *     tags: [Utils]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Files to upload
 *                 minItems: 1
 *                 maxItems: 2
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tmp:
 *                   type: string
 *                   example: "3759ca4d-4976-4bbb-bd17-3afebe0c0347"
 *                 originalName:
 *                   type: string
 *                   example: "document.pdf"
 *       400:
 *         description: Bad request, no files provided
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
 *                   example: "Pas de fichiers"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "File processing error"
 *                 message:
 *                   type: string
 *                   example: "Une erreur s'est produite lors du traitement de la demande."
 */
router.post('/auth/uploadFiles', AuthModule.isAuth, upload.array('file', maxFiles), handleMulterError, Utils.soumettreFilesToMinio);

/**
 * @swagger
 * /api/utils/uploadFiles:
 *   post:
 *     summary: Upload PDF files (public)
 *     tags: [Utils]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: PDF files to upload
 *                 minItems: 1
 *                 maxItems: 10
 *     responses:
 *       200:
 *         description: PDF files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tmp:
 *                   type: string
 *                   example: "3759ca4d-4976-4bbb-bd17-3afebe0c0347"
 *                 originalName:
 *                   type: string
 *                   example: "document.pdf"
 *       400:
 *         description: Bad request, no files provided or invalid file type
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
 *                   example: "Pas de fichiers ou type de fichier invalide"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "File processing error"
 *                 message:
 *                   type: string
 *                   example: "Une erreur s'est produite lors du traitement de la demande."
 */
router.post('/uploadFiles', upload.array('file', maxFiles), handleMulterError, Utils.soumettreFilesToMinio);




/**
 * @swagger
 * /api/utils/auth/uploadFilesPhotos:
 *   post:
 *     summary: Upload Photos (authenticated)
 *     tags: [Utils]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Files to upload
 *                 minItems: 1
 *                 maxItems: 2
 *     responses:
 *       200:
 *         description: Files uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tmp:
 *                   type: string
 *                   example: "3759ca4d-4976-4bbb-bd17-3afebe0c0347"
 *                 originalName:
 *                   type: string
 *                   example: "document.png"
 *       400:
 *         description: Bad request, no files provided
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
 *                   example: "Pas de fichiers"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "File processing error"
 *                 message:
 *                   type: string
 *                   example: "Une erreur s'est produite lors du traitement de la demande."
 */
router.post('/auth/uploadFilesPhotos', (req, res, next) => {
    console.log("req.body", req.body);
    console.log("req.files", req.files);
    next();
},  uploadPhoto.array('file', 1), handleMulterError, Utils.soumettreFilesToMinio);
//AuthModule.isAuth,

/**
 * @swagger
 * /api/utils/auth/displayFiles/{id}:
 *   get:
 *     summary: Afficher ou télécharger un document PDF
 *     tags: [Utils]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID du document à récupérer
 *         schema:
 *           type: string
 *           example: "c707c758-4bc4-4840-9d21-c0cd89b8385b"
 *       - in: query
 *         name: mode
 *         required: true
 *         description: Mode d'affichage du document ('download' ou 'preview')
 *         schema:
 *           type: string
 *           enum: [preview, download]
 *           example: "download"
 *     responses:
 *       200:
 *         description: Document récupéré avec succès
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Mauvaise requête
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
 *                   example: "Mauvaise requêtte."
 *       404:
 *         description: Document non trouvé
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
 *                   example: "Document non trouvé."
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
 *                   example: "Une erreur est survenue lors de la récupération du fichier."
 */
router.get('/auth/displayFiles/:id', Utils.displayMinioFile);


router.delete('/deleteUploadFile',  Utils.deleteSoumettreFiles);


// Return router
module.exports = router;