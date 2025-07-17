const db = require('../models/index');
const fs = require('fs');
require('dotenv').config();
const minioClient = require('./minio');




// Function to create a bucket if it doesn't exist
const createBucketIfNotExists = async () => {
    try {
        console.log("create bucket if not existed")
      const bucketExists = await minioClient.bucketExists(process.env.MINIO_BUCKET_NAME);
      console.log("Created if not existed")
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
    let transaction = null;
    try {
        transaction = await db.sequelize.transaction();
        if (!file) {
            throw new Error('Aucun fichier téléchargé.');
        }

        const filePath = file.path;
        const objectName = `document_notation__${Date.now()}_${file.originalname}`;

        // 📤 Téléverser le fichier dans MinIO
        await minioClient.fPutObject(process.env.MINIO_BUCKET_NAME, objectName, filePath);
        console.log(`Fichier téléversé sur MinIO : ${objectName}`);

        // 🗄️ Créer une entrée dans la base de données
        const document = await db.Document.create({
            path: objectName,
            filename: file.filename,
            ext: file.mimetype
        }, { transaction });

        await transaction.commit();
        console.log(`Fichier temporaire crée : ${filePath}`);

        return { status: 'success', message: 'Document créé avec succès', document };
    } catch (error) {
        if (transaction) {
            await transaction.rollback();
        }

        console.error('Erreur lors de la création du document :', error);
        if (file && file.path) {
            fs.unlinkSync(file.path);
            console.log(`Fichier temporaire crée suite à une erreur : ${file.path}`);
        }

        return { status: 'failure', message: 'Erreur lors de la création du document', details: error.message };
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

        return {
            status: 'success',
            message: 'Documents récupérés avec succès',
            documents: documentsWithMinioLinks
        };
    } catch (err) {
        console.error('Error fetching documents:', err);
        return { status: 'failure', message: 'Erreur interne du serveur' };
    }
};

const getDocumentById = async (id) => {
    try {
        const document = await db.Document.findByPk(id, {
            include: [{ model: db.TypeDocument, as: 'typeDocument' }]
        });
        
        if (!document) {
            return { status: 'failure', message: 'Document non trouvé' };
        }

        return {
            status: 'success',
            message: 'Document récupéré avec succès',
            document
        };
    } catch (err) {
        console.error('Error fetching document:', err);
        return { status: 'failure', message: 'Erreur interne du serveur' };
    }
};

const updateDocument = async (id, file, updateData) => {
    try {
        const document = await db.Document.findByPk(id);
        if (!document) {
            return { status: 'failure', message: 'Document non trouvé' };
        }

        // Préparer les données à mettre à jour
        let updatedData = {
            titre: updateData.titre,
            dateCreation: updateData.dateCreation,
            description: updateData.description
        };

        // Si un nouveau fichier a été envoyé, téléversez-le et mettez à jour le chemin
        if (file) {
            const filePath = file.path;
            const objectName = file.originalname;

            // Téléverser le nouveau fichier dans MinIO
            await minioClient.fPutObject(process.env.MINIO_BUCKET_NAME, objectName, filePath);
            updatedData.path = objectName;

            // Supprimer l'ancien fichier de MinIO
            await minioClient.removeObject(process.env.MINIO_BUCKET_NAME, document.path);

            // Supprimer le fichier temporaire du serveur
            fs.unlinkSync(filePath);
        }

        await document.update(updatedData);
        return {
            status: 'success',
            message: 'Document mis à jour avec succès',
            document
        };
    } catch (err) {
        console.error('Error updating document:', err);
        return { status: 'failure', message: 'Erreur interne du serveur' };
    }
};

const deleteDocument = async (id) => {
    try {
        console.log(`Attempting to delete document with ID: ${id}`);
        
        const document = await db.Document.findByPk(id);
        if (!document) {
            console.log('Document not found.');
            return { status: 'failure', message: 'Document non trouvé' };
        }

        console.log(`Document found`);

        // Supprimer le fichier de MinIO
        console.log(`Deleting file from MinIO: ${document.path}`);
        await minioClient.removeObject(process.env.MINIO_BUCKET_NAME, document.path);
        console.log('File deleted from MinIO.');

        await document.destroy();
        console.log('Document successfully deleted from database.');

        return { status: 'success', message: 'Document supprimé avec succès' };
    } catch (err) {
        console.error('Error deleting document:', err);
        return { status: 'failure', message: 'Erreur interne du serveur' };
    }
};


// Fonction pour créer un dossier virtuel
const createFolder = async (folderName) => {
    try {
        await minioClient.putObject(process.env.MINIO_BUCKET_NAME, `${folderName}/`, Buffer.from(''), -1);
        return { status: 'success', message: `Dossier "${folderName}" créé avec succès.` };
    } catch (error) {
        console.error('Erreur lors de la création du dossier :', error);
        return { status: 'failure', message: 'Erreur lors de la création du dossier' };
    }
};

const uploadFile = async (fileName, file) => {
    try {
        if (!file) {
            throw new Error('Aucun fichier téléchargé.');
        }
        const filePath = file.path;
        await minioClient.fPutObject(process.env.MINIO_BUCKET_NAME, fileName, filePath);
        // fs.unlinkSync(filePath); // Supprimer le fichier temporaire
        return { status: 'success', message: `Fichier "${fileName}" uploadé avec succès.` };
    } catch (error) {
        console.error('Erreur lors de l\'upload du fichier :', error);
        return { status: 'failure', message: 'Erreur lors de l\'upload du fichier' };
    }
};

const uploadMultipleFiles = async (files) => {
    try {
        if (!files || files.length === 0) {
            throw new Error('Aucun fichier téléchargé.');
        }

        await Promise.all(files.map(async (file) => {
            const filePath = file.path;
            await minioClient.fPutObject(process.env.MINIO_BUCKET_NAME, file.originalname, filePath);
            fs.unlinkSync(filePath); // Supprimer le fichier temporaire
        }));

        return { status: 'success', message: 'Tous les fichiers ont été uploadés avec succès.' };
    } catch (error) {
        console.error('Erreur lors de l\'upload de plusieurs fichiers :', error);
        return { status: 'failure', message: 'Erreur lors de l\'upload de plusieurs fichiers' };
    }
};

const listFiles = async () => {
    try {
        const files = await minioClient.listObjects(process.env.MINIO_BUCKET_NAME, '', true);
        const fileList = [];
        
        files.on('data', (obj) => {
            fileList.push(obj);
        });
        
        return new Promise((resolve, reject) => {
            files.on('end', () => {
                resolve({ status: 'success', message: 'Liste des fichiers récupérée avec succès.', files: fileList });
            });
            files.on('error', (err) => {
                reject({ status: 'failure', message: 'Erreur lors de la liste des fichiers' });
            });
        });
    } catch (error) {
        console.error('Erreur lors de la liste des fichiers :', error);
        return { status: 'failure', message: 'Erreur lors de la liste des fichiers' };
    }
};

const moveFile = async (sourcePath, destPath) => {
    try {
        await minioClient.copyObject(process.env.MINIO_BUCKET_NAME, destPath, process.env.MINIO_BUCKET_NAME, sourcePath);
        await minioClient.removeObject(process.env.MINIO_BUCKET_NAME, sourcePath);
        return { status: 'success', message: `Fichier déplacé de "${sourcePath}" vers "${destPath}".` };
    } catch (error) {
        console.error('Erreur lors du déplacement du fichier :', error);
        return { status: 'failure', message: 'Erreur lors du déplacement du fichier' };
    }
};

const copyFile = async (sourcePath, destPath) => {
    try {
        await minioClient.copyObject(process.env.MINIO_BUCKET_NAME, destPath, process.env.MINIO_BUCKET_NAME, sourcePath);
        return { status: 'success', message: `Fichier copié de "${sourcePath}" vers "${destPath}".` };
    } catch (error) {
        console.error('Erreur lors de la copie du fichier :', error);
        return { status: 'failure', message: 'Erreur lors de la copie du fichier' };
    }
};

const previewFile = async (fileName) => {
    try {
        const bucketName = process.env.MINIO_BUCKET_NAME;
        let objectName = null;

        const objectNames = minioClient.listObjects(bucketName, '', true);
        for await (const obj of objectNames) {
            if (obj.name.endsWith(fileName)) {
                objectName = obj.name; // Retourner le nom de l'objet si trouvé
            }
        }

        if (!objectName) {
            return { status: 'failure', message: 'Fichier non trouvé.' };
        }
        
        // Vérifier si le fichier existe dans MinIO
        await minioClient.statObject(bucketName, objectName);

        // Télécharger le fichier
        return new Promise((resolve, reject) => {
            minioClient.getObject(bucketName, objectName, (err, dataStream) => {
                if (err) {
                    return reject({ status: 'failure', message: 'Erreur lors du téléchargement du fichier.' });
                }

                resolve({
                    status: 'success',
                    message: 'Fichier téléchargé avec succès.',
                    dataStream // Renvoie le flux de données pour traitement ultérieur
                });
            });
        });
    } catch (error) {
        console.error('Erreur lors du téléchargement du fichier :', error);
        return { status: 'failure', message: 'Erreur lors du téléchargement du fichier' };
    }
};
// Fonction pour ajouter ou mettre à jour les balises d'un fichier
const normalizeString = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, ''); // Normalisation et suppression des accents
};

const setFileTags = async (fileName, tags) => {
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
        return { status: 'success', message: `Tags définis pour le fichier "${fileName}".` };
    } catch (error) {
        console.error('Erreur lors de la définition des tags :', error);
        return { status: 'failure', message: 'Erreur lors de la définition des tags' };
    }
};

const listFileTags = async (fileName) => {
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
        return { status: 'success', message: 'Tags récupérés avec succès.', tags: filteredMetaData };
    } catch (error) {
        console.error('Erreur lors de la liste des tags :', error);
        return { status: 'failure', message: 'Erreur lors de la liste des tags' };
    }
};

const checkFileExists = async (fileName) => {
    try {
        await minioClient.statObject(process.env.MINIO_BUCKET_NAME, fileName);
        return { status: 'success', message: `Le fichier "${fileName}" existe.` };
    } catch (error) {
        console.error('Erreur lors de la vérification de l\'existence du fichier :', error);
        return { status: 'failure', message: `Le fichier "${fileName}" n'existe pas.` };
    }
};

const readFile = async (fileName) => {
    try {
        const fileStream = await minioClient.getObject(process.env.MINIO_BUCKET_NAME, fileName);
        const data = [];
        fileStream.on('data', chunk => {
            data.push(chunk);
        });
        return new Promise((resolve, reject) => {
            fileStream.on('end', () => {
                resolve({ status: 'success', message: 'Fichier lu avec succès.', content: Buffer.concat(data).toString() });
            });
            fileStream.on('error', (err) => {
                reject({ status: 'failure', message: 'Erreur lors de la lecture du fichier' });
            });
        });
    } catch (error) {
        console.error('Erreur lors de la lecture du fichier :', error);
        return { status: 'failure', message: 'Erreur lors de la lecture du fichier' };
    }
};


const readFileToBase64 = async (fileName) => {
    try {
        // Vérifier que bucketName et fileName sont définis
        if (!process.env.MINIO_BUCKET_NAME || !fileName) {
            throw new Error('Bucket name ou nom de fichier manquant');
        }

        console.log(`Récupération du fichier ${fileName} depuis le bucket ${process.env.MINIO_BUCKET_NAME}`);

        // Récupérer les métadonnées du fichier depuis MinIO
        const statObject = await minioClient.statObject(process.env.MINIO_BUCKET_NAME, fileName);
        const mimeType = statObject.metaData['content-type'];

        console.log("MimeType: ", mimeType, statObject.metaData)

        // Vérifier que le MIME type est une image
        const validImageMimeTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!validImageMimeTypes.includes(mimeType)) {
            throw new Error('Le fichier n\'est pas une image valide');
        }

        // Récupérer le fichier depuis MinIO
        const fileStream = await minioClient.getObject(process.env.MINIO_BUCKET_NAME, fileName);
        const chunks = [];

        // Collecter les morceaux du flux
        fileStream.on('data', (chunk) => {
            chunks.push(chunk);
        });

        // Attendre la fin du flux ou gérer les erreurs
        return new Promise((resolve, reject) => {
            fileStream.on('end', async () => {
                try {
                    // Concaténer les morceaux en un Buffer
                    const fileBuffer = Buffer.concat(chunks);
                    console.log('Taille du fichier (octets) :', fileBuffer.length);

                    if (fileBuffer.length === 0) {
                        throw new Error('Le fichier est vide');
                    }

                    // Convertir en Base64
                    const base64String = fileBuffer.toString('base64');
                    console.log('Longueur de la chaîne Base64 :', base64String.length);

                    // Construire l'URI Base64
                    const base64ImageUri = `data:${mimeType};base64,${base64String}`;

                    resolve({
                        status: 'success',
                        message: 'Fichier converti en Base64 avec succès',
                        base64Uri: base64ImageUri,
                        mimeType
                    });
                } catch (error) {
                    console.error('Erreur lors de la conversion en Base64 :', error);
                    reject({
                        status: 'failure',
                        message: `Erreur lors de la conversion : ${error.message}`
                    });
                }
            });

            fileStream.on('error', (err) => {
                console.error('Erreur de flux MinIO :', err);
                reject({
                    status: 'failure',
                    message: `Erreur lors de la lecture du fichier : ${err.message}`
                });
            });
        });
    } catch (error) {
        console.error('Erreur lors de l\'accès à MinIO :', error);
        return {
            status: 'failure',
            message: `Erreur lors de l\'accès au fichier : ${error.message}`
        };
    }
};

const updateFile = async (fileName, file) => {
    try {
        if (!file) {
            throw new Error('Aucun fichier téléchargé.');
        }
        const filePath = file.path;
        await minioClient.fPutObject(process.env.MINIO_BUCKET_NAME, fileName, filePath);
        fs.unlinkSync(filePath); // Supprimer le fichier temporaire
        return { status: 'success', message: `Fichier "${fileName}" mis à jour avec succès.` };
    } catch (error) {
        console.error('Erreur lors de la mise à jour du fichier :', error);
        return { status: 'failure', message: 'Erreur lors de la mise à jour du fichier' };
    }
};

const deleteFile = async (fileName) => {
    try {
        await minioClient.removeObject(process.env.MINIO_BUCKET_NAME, fileName);
        return { status: 'success', message: 'Fichier supprimé avec succès.' };
    } catch (error) {
        console.error('Erreur lors de la suppression du fichier :', error);
        return { status: 'failure', message: 'Erreur lors de la suppression du fichier' };
    }
};

const searchFiles = async (keyword) => {
    try {
        const files = await minioClient.listObjects(process.env.MINIO_BUCKET_NAME, '', true);
        const result = [];
        files.on('data', (obj) => {
            if (obj.name.includes(keyword)) {
                result.push(obj);
            }
        });
        return new Promise((resolve, reject) => {
            files.on('end', () => {
                resolve({ status: 'success', message: 'Recherche effectuée avec succès.', files: result });
            });
            files.on('error', (err) => {
                reject({ status: 'failure', message: 'Erreur lors de la recherche des fichiers' });
            });
        });
    } catch (error) {
        console.error('Erreur lors de la recherche des fichiers :', error);
        return { status: 'failure', message: 'Erreur lors de la recherche des fichiers' };
    }
};

const fileMetadata = async (fileName) => {
    try {
        const stat = await minioClient.statObject(process.env.MINIO_BUCKET_NAME, fileName);
        return { status: 'success', message: 'Métadonnées récupérées avec succès.', metadata: stat };
    } catch (error) {
        console.error('Erreur lors de la récupération des métadonnées :', error);
        return { status: 'failure', message: 'Erreur lors de la récupération des métadonnées' };
    }
};

const restoreFile = async () => {
    return { status: 'not implemented', message: 'La fonctionnalité de restauration de fichier n\'est pas implémentée.' };
};

const enableVersioning = async () => {
    return { status: 'not implemented', message: 'La fonctionnalité d\'activation du versioning n\'est pas implémentée.' };
};

const listFileVersions = async () => {
    return { status: 'not implemented', message: 'La fonctionnalité de liste des versions de fichier n\'est pas implémentée.' };
};

const generatePresignedUrl = async (fileName) => {
    try {
        const presignedUrl = await minioClient.presignedGetObject(process.env.MINIO_BUCKET_NAME, fileName, 24 * 60 * 60); // URL valide pendant 24 heures
        return { status: 'success', message: 'URL pré-signée générée avec succès.', url: presignedUrl };
    } catch (error) {
        console.error('Erreur lors de la génération de l\'URL pré-signée :', error);
        return { status: 'failure', message: 'Erreur lors de la génération de l\'URL pré-signée' };
    }
};

module.exports = {
    createFolder,
    uploadFile,
    uploadMultipleFiles,
    listFiles,
    moveFile,
    copyFile,
    previewFile,
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
    deleteDocument,
    readFileToBase64,
    createBucketIfNotExists
};
