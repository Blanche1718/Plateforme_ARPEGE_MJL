const db = require('../models/index');
const fs = require('fs');
const moment = require('moment');
const { Op, where } = require('sequelize');
const sendEmail = require("../helpers/sendEmail");
const user = require('../models/user');
const ImageConvert = require('../helpers/image-convert');
const utilsTools = require('./utils');
const PDF = require('../helpers/pdf-generate');


// Array of month names in French
const months = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
];



async function worktest(job) {
    console.log(`Exécution d'un job test`);
}

const deleteCodeOTP = async (id) => {
    try {
        // Attempt to delete the OTP entry with the specified ID
        await db.CodeOTP.destroy({
            where: { id: id }
        });

        console.log('Code OTP supprimé avec succès.');
        return true; // Successfully deleted
    } catch (error) {
        console.log('Une erreur s\'est produite lors du traitement:', error);
        return false; // Return false in case of an error
    }
};


const deleteDocument = async (id) => {
    try {
        // Attempt to delete the OTP entry with the specified ID
        await db.Document.destroy({
            where: { 
                id,
                user_id: null
            }
        });

        console.log('Code OTP supprimé avec succès.');
        return true; // Successfully deleted
    } catch (error) {
        console.log('Une erreur s\'est produite lors du traitement:', error);
        return false; // Return false in case of an error
    }
};


const signPresenceCertificateAutomatically = async (requestId, userId) => {
    let transaction;
    try {
        transaction = await db.sequelize.transaction();

        // Vérifier l'utilisateur
        const user = await db.User.findByPk(userId, {
            include: [
                {
                    model: db.Role,
                    as: 'role',
                },
                {
                    model: db.Document,
                    as: 'documents',
                    include: {
                        model: db.TypeDocument,
                        as: 'typeDocument',
                        where: {
                            code: 'signature_professionnelle',
                        },
                    },
                },
            ],
        });

        if (!user || user.role.code !== 'dc') {
            throw new Error('Accès non autorisé : droits insuffisants.');
        }

        // Vérifier que l'utilisateur a un document de signature valide
        if (!user.documents || user.documents.length === 0) {
            throw new Error('Veuillez mettre à jour votre signature.');
        }

        const userDocument = user.documents.find(doc => doc.typeDocument.code === 'signature_professionnelle');
        if (!userDocument) {
            throw new Error('Signature professionnelle non trouvée.');
        }

        // Récupérer la demande d'attestation de présence
        const request = await db.PresenceCertificateRequest.findByPk(requestId, {
            include: [
                {
                    model: db.Statut,
                    as: 'statutIn',
                    where: {
                        code: 'validated',
                    }
                },
                {
                    model: db.User,
                    as: "agent",
                    include: [
                        {
                            model: db.Corps,
                            as: 'body',
                        },
                        {
                            model: db.Juridiction,
                            as: 'juridiction'
                        },
                        {
                            model: db.Entite,
                            as: 'entite'
                        },
                    ],
                },
            ],
        });

        if (!request) {
            throw new Error('Demande d\'attestation validée non trouvée.');
        }

        const date_signature = new Date();
        // Format the date
        // date de demande
        const day = request.createdAt.getUTCDate(); // Get the day of the month
        const month = months[request.createdAt.getUTCMonth()]; // Get the month name in French
        const year = request.createdAt.getUTCFullYear(); // Get the full year
        const formattedDate = `${day} ${month} ${year}`;
        console.log(formattedDate); // Output: "30 Juin 2025"

        // date de signature
        const day2 = date_signature.getUTCDate(); // Get the day of the month
        const month2 = months[date_signature.getUTCMonth()]; // Get the month name in French
        const year2 = date_signature.getUTCFullYear(); // Get the full year
        const formattedDate2 = `${day2} ${month2} ${year2}`;
        console.log(formattedDate2); // Output: "30 Juin 2025"

        // date de service
        const day3 = request.agent.date_of_service.getUTCDate(); // Get the day of the month
        const month3 = months[request.agent.date_of_service.getUTCMonth()]; // Get the month name in French
        const year3 = request.agent.date_of_service.getUTCFullYear(); // Get the full year
        const formattedDate3 = `${day3} ${month3} ${year3}`;
        console.log(formattedDate3); // Output: "30 Juin 2025"
        

        const entityOrJurisdictionLabel = request.agent.entite 
                                            ? request.agent.entite.label 
                                            : request.agent.juridiction 
                                                ? request.agent.juridiction.label 
                                                : '';

        
        let signature = await ImageConvert(userDocument.id);
        if (!signature) {
            throw new Error('Veuillez mettre à jour votre signature.');
        }

        request.numero = request.numero || await utilsTools.generateUniqueNumero(db.PresenceCertificateRequest, "numero", 10);
        
        const parameters = {
            numero: request.numero,
            orgNumero: request.orgNumero,
            first_name: request.agent.first_name,
            last_name: request.agent.last_name,
            corps: request.agent.body.label,
            grade: request.agent.actual_grade_class,
            matricule: request.agent.matricule,
            date_demande: formattedDate,
            date_signature: formattedDate2,
            date_service: formattedDate3,
            structure: entityOrJurisdictionLabel,
            signature: signature,
            signataire: user.first_name + " " + user.last_name,
        };

        const genModule = await PDF.generatePDF(parameters, transaction, 'attestation_presence_poste', true);
        if (genModule.pathFileLink == null) {
            throw new Error(`Le fichier PDF n'a pas été créé à l'emplacement`);
        }

        let typeDocument = await db.TypeDocument.findOne({
            where: {
                code: "attestation_presence_poste"
            }
        });

        let statusvalide = await db.Statut.findOne({ where: { code: 'signed' } });
        await request.setStatutIn(statusvalide, { transaction });
        
        const acteExistes = await db.Document.findAll({
            where: {
                typeDocumentId: typeDocument.id,
                tmp: request.id,
                isFinal: false
            },
            transaction
        });

        if (acteExistes.length > 0) {
            for (const acte of acteExistes) {
                await minioTools.deleteDocument(acte.id);
            }
        }

        let pdfDoc = await db.Document.create({
            libelle: "Attestation de présence au poste",
            filename: "Attestation de présence au poste-" + request.numero + ".pdf",
            path: genModule.pathFileLink,
            typeDocumentId: typeDocument.id,
            tmp: null,
            isActe: true,
            isFinal: true
        }, { transaction });

        request.acte_id = pdfDoc.id;
        request.date_signature = date_signature;
        request.signataire_id = request.agent.id;
        request.auto_sign = true;

        await request.save({ transaction });
        await transaction.commit();

        console.log("Signature automatique de la demande d'attestation de présence au poste effectuée avec succès.");
        return true;
    } catch (error) {
        if (transaction) await transaction.rollback(); // Rollback on error
        console.error('Erreur lors de la signature automatique de la demande:', error);
        return false;
    }
};





  
module.exports = { 
    worktest ,
    deleteCodeOTP,
    deleteDocument,
    signPresenceCertificateAutomatically
};