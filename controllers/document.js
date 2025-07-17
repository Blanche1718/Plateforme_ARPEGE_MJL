const db = require('../models/index');
const fs = require('fs');
require('dotenv').config();
const check = require('../helpers/checkBody');
const minioClient = require('../helpers/minio')



// Function to create a bucket if it doesn't exist
const createBucketIfNotExists = async () => {
    try {
      const bucketExists = await minioClient.bucketExists(process.env.MINIO_BUCKET_NAME);
      if (!bucketExists) {
        await minioClient.makeBucket(process.env.MINIO_BUCKET_NAME, 'us-east-1');
        console.log(`Bucket "${process.env.MINIO_BUCKET_NAME}" created successfully.`);
      } else {
        console.log(`Bucket "${process.env.MINIO_BUCKET_NAME}" already exists.`);
      }
    } catch (error) {
      console.error('Error creating bucket:', error);
    }
}

// Fonction pour créer un document
const createDocument = async (file) => {

    await createBucketIfNotExists();
    // Commencer une transaction
    let transaction = null;
    try {
        transaction =  await db.sequelize.transaction();

        // Vérifier si le fichier est présent
        if (!file) {
            throw new Error('Aucun fichier téléchargé.');
        }

        const filePath = file.path; // Chemin du fichier temporaire sur le serveur
        const objectName = file.originalname; // Nom du fichier

        
        // Téléverser le fichier dans MinIO
        await minioClient.fPutObject(process.env.MINIO_BUCKET_NAME, objectName, filePath);

        // Créer une entrée dans le modèle Document
        const document = await db.Document.create({
            path: objectName, // Stocker le nom du fichier dans la base de données
        }, { transaction });

        // Commit de la transaction
        await transaction.commit();

        // Supprimer le fichier temporaire du serveur
        fs.unlinkSync(filePath);
        console.log("Document créé avec succès", filePath)
        return { message: 'Document créé avec succès', document };
    } catch (error) {
        // Annuler la transaction si une erreur se produit
        if (transaction) {
            await transaction.rollback();
        }

        console.error('Erreur lors de la création du document :', error);
        // Supprimer le fichier temporaire si une erreur se produit
        if (req.file) {
            fs.unlinkSync(req.file.path);
        }
        return { error: 'Erreur lors de la création du document', message: error  };
    }
};

const getAllDocuments = async () => {
    try {
        const documents = await db.Document.findAll({
            include: [{ model: db.TypeDocument, as: 'typeDocument' }]
        });
        const documentsWithMinioLinks = documents.map(document => ({
            ...document.toJSON(),
            minioLink: `${process.env.MINIO_ENDPOINT}/${process.env.MINIO_BUCKET_NAME}/${document.path}`
          }));
        return res.json(documentsWithMinioLinks);
    } catch (err) {
        console.error('Error fetching documents:', err);
        return res.status(500).send('Internal Server Error');
    }
};

const getDocumentById = async () => {
    try {
        const document = await db.Document.findByPk(req.params.id, {
            include: [{ model: db.TypeDocument, as: 'typeDocument' }]
        });
        
        if (!document) return res.status(404).send('Document not found');
        return res.json(document);
    } catch (err) {
        console.error('Error fetching document:', err);
        return res.status(500).send('Internal Server Error');
    }
};

const updateDocument = async () => {
    check.validateUpdateDocument(req.body);
    try {
        const document = await db.Document.findByPk(req.params.id);
        if (!document) return res.status(404).send('Document not found');

        // Préparer les données à mettre à jour
        let updatedData = {
            titre: req.body.titre,
            dateCreation: req.body.dateCreation,
            description: req.body.description
        };

        // Si un nouveau fichier a été envoyé, téléversez-le et mettez à jour le chemin
        if (req.file) {
            const filePath = req.file.path; // Chemin du fichier temporaire sur le serveur
            const objectName = req.file.originalname; // Nom du fichier

            // Téléverser le nouveau fichier dans MinIO
            await minioClient.fPutObject(process.env.MINIO_BUCKET_NAME, objectName, filePath);
            updatedData.path = objectName; // Mettre à jour le chemin du fichier

            // Supprimer l'ancien fichier de MinIO
            await minioClient.removeObject(process.env.MINIO_BUCKET_NAME, document.path);

            // Supprimer le fichier temporaire du serveur
            // fs.unlinkSync(filePath);
        }
        console.log(updatedData);
        await document.update(updatedData);
        console.log(document)
        return res.json(document);
    } catch (err) {
        console.error('Error updating document:', err);
        return res.status(500).send('Internal Server Error');
    }
};

const deleteDocument = async () => {
    try {
        const document = await db.Document.findByPk(req.params.id);
        if (!document) return res.status(404).send('Document not found');

        // Supprimer le fichier de MinIO
        await minioClient.removeObject(process.env.MINIO_BUCKET_NAME, document.path);

        await document.destroy();
        return res.status(204).send(); // No content
    } catch (err) {
        console.error('Error deleting document:', err);
        return res.status(500).send('Internal Server Error');
    }
};
// Fonction pour créer un dossier virtuel
const createFolder = async () => {
    const { folderName } = req.body;
    try {
        await minioClient.putObject(process.env.MINIO_BUCKET_NAME, `${folderName}/`, Buffer.from(''), -1);
        return res.status(201).send(`Dossier "${folderName}" créé avec succès.`);
    } catch (error) {
        console.error('Erreur lors de la création du dossier :', error);
        return res.status(500).send('Erreur lors de la création du dossier');
    }
};

// Fonction pour uploader un fichier
const uploadFile = async () => {
    const { fileName } = req.body;

    try {
        if (!req.file) {
            throw new Error('Aucun fichier téléchargé.');
        }
        const filePath = req.file.path; // Chemin du fichier temporaire sur le serveur
        await minioClient.fPutObject(process.env.MINIO_BUCKET_NAME, fileName, filePath);
        fs.unlinkSync(filePath); // Supprimer le fichier temporaire
        return res.status(201).send(`Fichier "${fileName}" uploadé avec succès.`);
    } catch (error) {
        console.error('Erreur lors de l\'upload du fichier :', error);
        return res.status(500).send('Erreur lors de l\'upload du fichier');
    }
};

// Fonction pour uploader plusieurs fichiers
const uploadMultipleFiles = async () => {
    try {
        const prestationId = req.body.prestationId;

        // getting prestation
        const files = req.files; // Assurez-vous que vous utilisez le middleware pour gérer les fichiers multiples
        if (!files || files.length === 0) {
            throw new Error('Aucun fichier téléchargé.');
        }

        await Promise.all(files.map(async (file) => {
            const filePath = file.path;
            await minioClient.fPutObject(process.env.MINIO_BUCKET_NAME, file.originalname, filePath);
            // fs.unlinkSync(filePath); // Supprimer le fichier temporaire
        }));

        return res.status(201).send('Tous les fichiers ont été uploadés avec succès.');
    } catch (error) {
        console.error('Erreur lors de l\'upload de plusieurs fichiers :', error);
        return res.status(500).send('Erreur lors de l\'upload de plusieurs fichiers');
    }
};

// Fonction pour lister les fichiers d'un bucket
const listFiles = async () => { console.log('in list')
    try {
        const files = await minioClient.listObjects(process.env.MINIO_BUCKET_NAME, '', true);
        const fileList = [];
        files.on('data', (obj) => {
            fileList.push(obj);
        });
        files.on('end', () => {
            return res.status(200).json(fileList);
        });
    } catch (error) {
        console.error('Erreur lors de la liste des fichiers :', error);
        return res.status(500).send('Erreur lors de la liste des fichiers');
    }
};

// Fonction pour déplacer un fichier
const moveFile = async () => {
    const { sourcePath, destPath } = req.body;

    try {
        await minioClient.copyObject(process.env.MINIO_BUCKET_NAME, destPath, process.env.MINIO_BUCKET_NAME, sourcePath);
        await minioClient.removeObject(process.env.MINIO_BUCKET_NAME, sourcePath);
        return res.status(200).send(`Fichier déplacé de "${sourcePath}" vers "${destPath}".`);
    } catch (error) {
        console.error('Erreur lors du déplacement du fichier :', error);
        return res.status(500).send('Erreur lors du déplacement du fichier');
    }
};

// Fonction pour copier un fichier
const copyFile = async () => {
    const { sourcePath, destPath } = req.body;

    try {
        await minioClient.copyObject(process.env.MINIO_BUCKET_NAME, destPath, process.env.MINIO_BUCKET_NAME, sourcePath);
        return res.status(200).send(`Fichier copié de "${sourcePath}" vers "${destPath}".`);
    } catch (error) {
        console.error('Erreur lors de la copie du fichier :', error);
        return res.status(500).send('Erreur lors de la copie du fichier');
    }
};

// Fonction pour télécharger un fichier
const downloadFile = async () => {
    const { fileName } = req.params;

    try {
        const fileStream = await minioClient.getObject(process.env.MINIO_BUCKET_NAME, fileName);
        res.set('Content-Type', 'application/octet-stream');
        fileStream.pipe(res);
    } catch (error) {
        console.error('Erreur lors du téléchargement du fichier :', error);
        return res.status(500).send('Erreur lors du téléchargement du fichier');
    }
};

// Fonction pour ajouter ou mettre à jour les balises d'un fichier
const normalizeString = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Normalisation et suppression des accents
};

const setFileTags = async () => {
    const { fileName, tags } = req.body;

    try {
        // Récupérer le contenu du fichier
        const dataStream = await minioClient.getObject(process.env.MINIO_BUCKET_NAME, fileName);

        // Convertir les tags en format de métadonnées
        const metaData = Object.keys(tags).reduce((acc, key) => {
            const sanitizedKey = normalizeString(key).replace(/[^a-zA-Z0-9-]/g, '_'); // Remplacer les caractères non valides et supprimer les accents
            acc[`x-amz-meta-${sanitizedKey}`] = tags[key];
            return acc;
        }, {});

        console.log('Setting metadata:', metaData);

        // Mettre à jour le fichier avec les nouvelles métadonnées
        await minioClient.putObject(process.env.MINIO_BUCKET_NAME, fileName, dataStream, metaData);
        return res.status(200).send(`Tags définis pour le fichier "${fileName}".`);
    } catch (error) {
        console.error('Erreur lors de la définition des tags :', error);
        return res.status(500).send('Erreur lors de la définition des tags');
    }
};





// Fonction pour lister les balises d'un fichier
const listFileTags = async () => {
    const { fileName } = req.params;
    console.log(`Listing tags for file: ${fileName}`);
    
    try {
        // Obtenir les statistiques de l'objet
        const stat = await minioClient.statObject(process.env.MINIO_BUCKET_NAME, fileName);
        console.log('File stat:', stat);

        // Filtrer et formater les métadonnées pour exclure 'content-type'
        const filteredMetaData = Object.keys(stat.metaData)
            .filter(key => key.toLowerCase() !== 'content-type') // Exclure 'content-type'
            .reduce((acc, key) => {
                acc[key] = stat.metaData[key]; // Conserver les autres métadonnées
                return acc;
            }, {});

        console.log('Filtered Metadata:', filteredMetaData);
        return res.status(200).json(filteredMetaData);
    } catch (error) {
        console.error('Erreur lors de la liste des tags :', error);
        return res.status(500).send('Erreur lors de la liste des tags');
    }
};




// Fonction pour vérifier si un fichier existe
const checkFileExists = async () => {
    const { fileName } = req.params;

    try {
        await minioClient.statObject(process.env.MINIO_BUCKET_NAME, fileName);
        return res.status(200).send(`Le fichier "${fileName}" existe.`);
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'existence du fichier :', error);
        return res.status(404).send(`Le fichier "${fileName}" n'existe pas.`);
    }
};

// Fonction pour lire le contenu d'un fichier
const readFile = async () => {
    const { fileName } = req.params;

    try {
        const fileStream = await minioClient.getObject(process.env.MINIO_BUCKET_NAME, fileName);
        const data = [];
        fileStream.on('data', chunk => {
            data.push(chunk);
        });
        fileStream.on('end', () => {
            return res.status(200).send(Buffer.concat(data).toString());
        });
    } catch (error) {
        console.error('Erreur lors de la lecture du fichier :', error);
        return res.status(500).send('Erreur lors de la lecture du fichier');
    }
};

// Fonction pour mettre à jour le contenu d'un fichier
const updateFile = async () => {
    const { fileName } = req.params;

    try {
        if (!req.file) {
            throw new Error('Aucun fichier téléchargé.');
        }
        const filePath = req.file.path;
        await minioClient.fPutObject(process.env.MINIO_BUCKET_NAME, fileName, filePath);
        // fs.unlinkSync(filePath); // Supprimer le fichier temporaire
        return res.status(200).send(`Fichier "${fileName}" mis à jour avec succès.`);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du fichier :', error);
        return res.status(500).send('Erreur lors de la mise à jour du fichier');
    }
};

// Fonction pour supprimer un fichier
const deleteFile = async () => {
    const { fileName } = req.params;

    try {
        await minioClient.removeObject(process.env.MINIO_BUCKET_NAME, fileName);
        return res.status(204).send(); // No content
    } catch (error) {
        console.error('Erreur lors de la suppression du fichier :', error);
        return res.status(500).send('Erreur lors de la suppression du fichier');
    }
};

// Fonction pour rechercher des fichiers selon un mot-clé
const searchFiles = async () => {
    const { keyword } = req.params;

    try {
        const files = await minioClient.listObjects(process.env.MINIO_BUCKET_NAME, '', true);
        const result = [];
        files.on('data', (obj) => {
            if (obj.name.includes(keyword)) {
                result.push(obj);
            }
        });
        files.on('end', () => {
            return res.status(200).json(result);
        });
    } catch (error) {
        console.error('Erreur lors de la recherche des fichiers :', error);
        return res.status(500).send('Erreur lors de la recherche des fichiers');
    }
};

// Fonction pour récupérer les métadonnées d'un fichier
const fileMetadata = async () => {
    const { fileName } = req.params;

    try {
        const stat = await minioClient.statObject(process.env.MINIO_BUCKET_NAME, fileName);
        return res.status(200).json(stat);
    } catch (error) {
        console.error('Erreur lors de la récupération des métadonnées :', error);
        return res.status(500).send('Erreur lors de la récupération des métadonnées');
    }
};

// Fonction pour restaurer un fichier (fonctionnalité non disponible dans MinIO, implémenter selon vos besoins)
const restoreFile = async () => {
    return res.status(501).send('La fonctionnalité de restauration de fichier n\'est pas implémentée.');
};

// Fonction pour activer le versioning pour un bucket (fonctionnalité non disponible dans MinIO, implémenter selon vos besoins)
const enableVersioning = async () => {
    return res.status(501).send('La fonctionnalité d\'activation du versioning n\'est pas implémentée.');
};

// Fonction pour lister les versions d'un fichier (fonctionnalité non disponible dans MinIO, implémenter selon vos besoins)
const listFileVersions = async () => {
    return res.status(501).send('La fonctionnalité de liste des versions de fichier n\'est pas implémentée.');
};

// Fonction pour générer une URL pré-signée pour accéder à un fichier
const generatePresignedUrl = async () => {
    const { fileName } = req.params;

    try {
        const presignedUrl = await minioClient.presignedGetObject(process.env.MINIO_BUCKET_NAME, fileName, 24*60*60); // URL valide pendant 24 heures
        return res.status(200).json({ url: presignedUrl });
    } catch (error) {
        console.error('Erreur lors de la génération de l\'URL pré-signée :', error);
        return res.status(500).send('Erreur lors de la génération de l\'URL pré-signée');
    }
};

module.exports = {
    createFolder,
    uploadFile,
    uploadMultipleFiles,
    listFiles,
    moveFile,
    copyFile,
    downloadFile,
    setFileTags,
    listFileTags,
    checkFileExists,
    readFile,
    updateFile,
    deleteFile,
    searchFiles,
    fileMetadata,
    restoreFile,
    enableVersioning,
    listFileVersions,
    generatePresignedUrl,
    createDocument,
    getAllDocuments,
    getDocumentById,
    updateDocument,
    deleteDocument
};
