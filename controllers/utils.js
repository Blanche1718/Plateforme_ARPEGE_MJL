const db = require("../models/index");
const minioTools = require('../helpers/minioFonction');
const minioClient = require('../helpers/minio');
const helper = require('../helpers/utils');
const zlib = require('zlib');
const { Op, Sequelize } = require('sequelize');
const TaskScheduler = require('../helpers/taskScheduler');


// Get Roles
const getRoles = async (req, res) => {
    // Recherche de tous les utilisateurs
    db.Role.findAll().then(async (roles) => { 
        // Filtrer les attributs
        const filteredRoles = roles.map(role => ({
            label: role.label,
            code: role.code
        }));
        return res.status(200).json({ status: "success", roles: filteredRoles });
    }).catch(function (error) {
        // Gestion des erreurs
        return res.status(500).json({ status: "failure", message: "Une erreur lors de l'opération" });
    });
}

// // Get year
const getYears = async (req, res) => {
    // ID utilisateur (remplacez par la logique réelle)
    // const userId = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

    console.log("Get years >>>>>");
    const userId = req.userId;
    console.log(req.userId);
    if (!userId) {
        return res.status(404).json({
            status: 'failure',
            message: 'Mauvaise requête, ID utilisateur manquant'
        });
    }

    try {
        // Recherche de l'utilisateur
        const user = await db.User.findOne({ where: { id: userId } });
        
        if (!user || !user.date_of_service) {
            return res.status(404).json({
                status: 'failure',
                message: 'Utilisateur non trouvé ou date de prise de service manquante'
            });
        }

        const dateOfService = new Date(user.date_of_service);
        const minYear = dateOfService.getFullYear() + 1; // Un an après la date de prise de service
        const maxYear = new Date().getFullYear() - 1; // L'année précédente

        // Générer les années éligibles
        const eligibleYears = [];
        for (let year = minYear; year <= maxYear; year++) {
            const yearProhibit = await db.BulletinRequest.findOne({
                where: {
                    user_id: userId,
                    year: year
                },
                include: {
                    model: db.Document,
                    as: 'document_acte',
                    required: false
                }
            })
            if(!yearProhibit || !yearProhibit.document_acte) eligibleYears.push(year);
        }

        return res.status(200).json({ status: "success", eligibleYears });
    } catch (error) {
        // Gestion des erreurs
        return res.status(500).json({ status: "failure", message: "Une erreur lors de l'opération" });
    }
};

// 
const getTypePermission = async (req, res) => {
    const userId = req.userId;

    if (!userId) {
        return res.status(400).json({
            status: 'failure',
            message: 'ID utilisateur manquant.'
        });
    }

    try {
        // Recherche de l'utilisateur
        const user = await db.User.findOne({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({
                status: 'failure',
                message: 'Utilisateur non trouvé.'
            });
        }

        // Récupérer les types de permissions
        const typePermissions = await db.TypePermission.findAll();

        if (!typePermissions.length) {
            return res.status(404).json({
                status: 'failure',
                message: 'Aucun type de permission trouvé.'
            });
        }

        return res.status(200).json({
            status: 'success',
            data: typePermissions
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des types de permissions:', error);
        return res.status(500).json({
            status: 'failure',
            message: 'Erreur lors de la récupération des types de permissions.'
        });
    }
};

const getUniqueResources = async (req, res) => {
    try {
        // Récupérer les types de permissions depuis la base de données
        const typePermissions = await db.TypePermission.findAll();

        if (!typePermissions.length) {
            return res.status(404).json({
                status: 'failure',
                message: 'Aucune permission trouvée.'
            });
        }

        // Extraire les ressources uniques
        const uniqueResources = [...new Set(typePermissions.map(permission => permission.ressource))];

        return res.status(200).json({
            status: 'success',
            data: uniqueResources
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des ressources:', error);
        return res.status(500).json({
            status: 'failure',
            message: 'Erreur lors de la récupération des ressources.'
        });
    }
};


const getEntites = async (req, res) => {
    try {
        console.log("UserId: ", req.userId);
        const searchTerm = req.query.search || '';

        // Récupérer les types de permissions depuis la base de données
        const entites = await db.Entite.findAll({
            attributes: ['id', 'label', 'code'],
            where: {
                label: {
                    [db.Sequelize.Op.like]: `%${searchTerm}%`
                }
            }
        });

        if (!entites.length) {
            return res.status(404).json({
                status: 'failure',
                message: 'Aucune entité trouvée.'
            });
        }

        return res.status(200).json({
            status: 'success',
            data: entites
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des ressources:', error);
        return res.status(500).json({
            status: 'failure',
            message: 'Erreur lors de la récupération des ressources.'
        });
    }
};


async function getTypeNotations(req, res) {
  try {
    const typeNotations = await db.TypeNotation.findAll();

    if (typeNotations.length === 0) {
      return res.status(404).json({
        status: 'failure',
        message: 'Aucune notation trouvée.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: typeNotations,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des types de notations:', error);
    return res.status(500).json({
      status: 'failure',
      message: 'Erreur lors de la récupération des types de notations.',
    });
  }
}


async function getServices(req, res) {
  try {
    const services = await db.User.findAll({
      attributes: ['id', 'first_name', 'last_name', 'email'],
      include: {
        model: db.Role,
        as: "role",
        where: {
          code: {
            [Op.in]: ['dpaf', 'dspj'] // Use Op.in for multiple values
          }
        }
      }
    });

    if (services.length === 0) {
      return res.status(404).json({
        status: 'failure',
        message: 'Aucune notation trouvée.',
      });
    }

    return res.status(200).json({
      status: 'success',
      data: services,
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des services de traitement:', error);
    return res.status(500).json({
      status: 'failure',
      message: 'Erreur lors de la récupération des services de traitement.',
    });
  }
}

// Get superiors
const getUsersWithParentRole = async (req, res) => {
    const userId = req.userId;
    const searchQuery = req.query.search || ''; // Get the search query from request parameters

    if (!userId) {
        return res.status(400).json({
            status: 'failure',
            message: 'Mauvaise requête, ID utilisateur manquant'
        });
    }

    try {
        // Recherche de l'utilisateur courant et de son rôle parent
        const user = await db.User.findOne({ 
            where: { id: userId }, 
            include: [
                {
                    model: db.Role, 
                    as: 'role',
                    include: {
                        model: db.Role,
                        as: 'next_level',
                    }
                }
            ] 
        });

        if (!user || !user.role || !user.role.next_level) {
            return res.status(400).json({
                status: 'failure',
                message: 'Utilisateur non trouvé ou pas de supérieurs'
            });
        }

        const parentRoleId = user.role.next_level.id; // Récupère l'ID du rôle parent
        console.log("Parent role ID: ", parentRoleId);

        // Recherche des utilisateurs avec le même rôle parent
        const usersWithParentRole = await db.User.findAll({
            attributes: ['id', 'first_name', 'last_name', 'email', 'tel', 'title'],
            include: [
                {
                    model: db.Role,
                    as: 'role',
                    attributes: ['code', 'label'],
                    where: searchQuery ? { code: {[Op.ne]: "super_admin"} } : { id: parentRoleId } // Inclure la vérification du rôle si aucune recherche
                }
            ],
            where: {
                id: {
                    [Op.ne]: userId // Exclure l'utilisateur courant
                },
                // Condition de recherche
                [Op.or]: [
                    { first_name: { [db.Sequelize.Op.like]: `%${searchQuery}%` } },
                    { last_name: { [db.Sequelize.Op.like]: `%${searchQuery}%` } },
                    { email: { [db.Sequelize.Op.like]: `%${searchQuery}%` } }
                ]
            }
        });

        // Retourne la liste des utilisateurs correspondants
        return res.status(200).json({ status: "success", users: usersWithParentRole });
    } catch (error) {
        // Gestion des erreurs
        console.error('Error fetching users with parent role:', error);
        return res.status(500).json({ status: "failure", message: "Une erreur lors de l'opération" });
    }
};

// Seearch users
const searchUsers = async (req, res) => {
  const { search } = req.query;

  if (!search || search.length < 3) {
    return res.status(400).json({
      status: 'failure',
      message: 'Le paramètre de recherche doit comporter au moins 3 lettres.',
    });
  }

  try {
    const users = await db.User.findAll({
      where: {
        [db.Sequelize.Op.or]: [
          { first_name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
          { last_name: { [db.Sequelize.Op.iLike]: `%${search}%` } },
          { email: { [db.Sequelize.Op.iLike]: `%${search}%` } },
        ],
      },
      attributes: ['id', 'first_name', 'last_name', 'email'],
    });

    return res.status(200).json({
      status: 'success',
      data: users,
    });
  } catch (error) {
    console.error('Erreur [searchUsers]:', error);
    return res.status(500).json({
      status: 'failure',
      message: 'Erreur serveur',
    });
  }
};


// get Criterisa
const getCriterias = async (req, res) => {
  try {
    const useCase = req.query.use_case || null; // Allow null value

    const criteria = await db.CriteriaEvaluation.findAll({
      where: useCase ? { useCase } : {}, // Use filter if useCase is provided
      attributes: ['id', 'label', 'code', 'min_score', 'max_score', 'disabled']
    });

    return res.status(200).json({ status: 'success', data: criteria });
  } catch (error) {
    console.error('Erreur [getCriterias]:', error);
    return res.status(500).json({ status: 'failure', message: 'Erreur serveur' });
  }
};


//Get Corps
const getCoprs = async (req, res) => {
  try {
    const corps = await db.Corps.findAll({
      attributes: ['id', 'label', 'code']
    });
    return res.status(200).json({ status: 'success', data: corps });
  } catch (error) {
    console.error('Erreur [getCorps]:', error);
    return res.status(500).json({ status: 'failure', message: 'Erreur serveur' });
  }
};

// Submitting files
const soumettreFilesToMinio = async (req, res) => {
    try {
        console.log("Soumission: ", req.files, req.file);
        const files = req.files || (req.file ? [req.file] : null);

        if (!files || files.length === 0) {
            return res.status(400).json({ status: "failure", message: "Pas de fichiers" });
        }

        let id = [];
        let originalNameTable = [];
        let obj = [];

        for (const file of files) {
            // 📤 **Utilisation de `createDocument` pour gérer l'upload et l'enregistrement**
            const response = await minioTools.createDocument(file, {});

            if (response.error) {
                console.error(`Erreur lors du traitement du fichier ${file.originalname} :`, response.message);
                return res.status(500).json({ error: response.error, message: response.message });
            }

            obj.push({
                tmp: response.document.id,
                originalname: file.originalname
            });
            id.push(response.document.id);
            originalNameTable.push(file.originalname);
        }

        console.log({
            tmp: id[0],
            originalName: (files.length === 1) ? originalNameTable[0] : originalNameTable
        });

        const durationInMilliseconds = 48 * 60 * 60 * 1000; // 48 heures en millisecondes
        const futureDate = new Date(Date.now() + durationInMilliseconds);
        await TaskScheduler.addJob('Suppression du document', 'del_doc', futureDate, { id: id[0] });
        return res.status(200).json({
            tmp: id[0],
            originalName: (files.length === 1) ? originalNameTable[0] : originalNameTable
        });

    } catch (error) {
        console.error("Erreur lors de l'upload des fichiers :", error);
        return res.status(500).send("Une erreur s'est produite lors de la soumission du fichier.");
    }
};
const displayMinioFile = async (req, res) => {
    const { id } = req.params;
    const mode = req.query.mode;
    console.log("Mode", mode);
    
    if (!mode || !(id && helper.isValidUUID(id))) {
        console.log("Mode not found");
        return res.status(404).json({ status: "failure", message: 'Mauvaise requête.' });
    }
    
    try {
        const document = await db.Document.findOne({
            where: { id: id },
            attributes: ['path', 'libelle']
        });

        if (!document) {
            return res.status(404).json({ message: "Document non trouvé." });
        }

        const filename = document.path;
        const libelle = document.libelle;
        const bucketName = process.env.MINIO_BUCKET_NAME;

        // Determine the file type based on the file extension
        const fileType = filename.split('.').pop().toLowerCase();

        // Define content type based on file type
        let contentType;
        switch (fileType) {
            case 'pdf':
                contentType = 'application/pdf';
                break;
            case 'xlsx':
                contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
                break;
            case 'xls':
                contentType = 'application/vnd.ms-excel';
                break;
            case 'doc':
                contentType = 'application/msword';
                break;
            case 'docx':
                contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
                break;
            case 'png':
                contentType = 'image/png';
                break;
            case 'jpeg':
            case 'jpg':
                contentType = 'image/jpeg';
                break;
            case 'csv':
                contentType = 'text/csv';
                break;
            default:
                return res.status(400).json({ message: 'Unsupported file type' });
        }

        // Set headers for download or inline display
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', mode === 'download' ? `attachment; filename="${libelle}"` : `inline; filename="${libelle}"`);
        res.setHeader('Content-Encoding', 'gzip'); // Indicate that the data is compressed

        const dataStream = await minioClient.getObject(bucketName, filename);
        const gzipStream = zlib.createGzip();

        dataStream.pipe(gzipStream).pipe(res).on('error', (error) => {
            console.error('Erreur lors du streaming compressé du fichier:', error);
            res.status(500).json({ message: 'Erreur lors du téléchargement du fichier.' });
        });

    } catch (error) {
        console.error('Erreur lors de la récupération du fichier:', error);
        return res.status(500).json({ message: 'Une erreur est survenue lors de la récupération du fichier.' });
    }
};


const cleanUpInvalidDocuments = async () => {
    try {
        // Fetch documents that are invalid (you can define your own criteria)
        const invalidDocuments = await db.Document.findAll({
            where: {
                // Example criteria: isFinal should be false and not associated with any valid entity
                isFinal: false,
                // Add more conditions as needed
            }
        });

        if (invalidDocuments.length === 0) {
            console.log('No invalid documents found.');
            return { status: 'success', message: 'No documents to clean up.' };
        }

        // Loop through each invalid document and delete it
        for (const document of invalidDocuments) {
            console.log(`Deleting document ID: ${document.id}, Title: ${document.libelle}`);
            await document.destroy(); // Delete the document
        }

        console.log(`${invalidDocuments.length} invalid documents deleted successfully.`);
        return { status: 'success', message: `${invalidDocuments.length} documents cleaned up.` };
    } catch (error) {
        console.error('Error cleaning up invalid documents:', error);
        return { status: 'failure', message: 'Error during cleanup process.' };
    }
};

const deleteSoumettreFiles = async (req, res) => {
    try {
        console.log("Req id: ", req.body);
        

        const idPiece = req.body.file;

        // Vérification si l'ID est fourni
        if (!idPiece) {
            console.log("Paramètre manquant")
            return res.status(400).json("Paramètre manquant");
        }

        // Recherche de la pièce dans la base de données
        const piece = await db.Document.findOne({
            where: {
                id: idPiece
            }
        });

        // Vérification si la pièce existe
        if (!piece) {
            return res.status(404).json("Pièce non trouvée");
        }

        // Suppression de la pièce
        await piece.destroy();

        await minioTools.deleteDocument(piece.id);

        // Réponse réussie
        return res.status(200).json({
            message: "Pièce supprimée avec succès.",
            id: idPiece
        });
    } catch (error) {
        console.error("Error occurred:", error);
        return res.status(500).send("Une erreur s'est produite lors de la suppression du document.");
    }
};


module.exports = {
    soumettreFilesToMinio,
    displayMinioFile,
    getRoles,
    getYears,
    getUsersWithParentRole,
    getCriterias,
    searchUsers,
    getCoprs,
    cleanUpInvalidDocuments,
    deleteSoumettreFiles,
    getTypeNotations,
    getServices,
    getTypePermission,
    getUniqueResources,
    getEntites
}