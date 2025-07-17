// Set up multer for handling file uploads
const multer  = require('multer');
const path = require('path');
//Définir la limite  des fichiers
const maxFiles = 3;

const MAX_FILE_SIZE = 2;
// Définir la limite de taille des fichiers à 2 Mo
const maxSize = 2 * 1024 * 1024; // 2 Mo
// Configuration de Multer pour la gestion des fichiers téléchargés
// Configuration de multer pour le stockage des fichiers
const Piecestorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'Files/pieces/'); // Dossier de destination
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Nom de fichier unique
    }
});

const pieceMulter = multer({ 
    storage: Piecestorage,
    limits: { fileSize: maxSize }, // Limite de taille de fichier
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

const Raportstorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'Files/rapports/'); // Dossier de destination
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Nom de fichier unique
    }
});

const rapportMulter = multer({ 
    storage: Raportstorage,
    limits: { fileSize: maxSize } // Limite de taille de fichier de 2 Mo
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
        return res.status(500).json({ message: `Echec d'upload de fichiers` });
    }
    next();
}



// Exporter le middleware d'upload
module.exports = {
    pieceMulter,
    rapportMulter,
    handleMulterError,
    maxFiles
};
