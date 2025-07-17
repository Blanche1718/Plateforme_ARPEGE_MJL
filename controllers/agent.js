// const db = require("../models/index");
// const bodyCheck = require('../helpers/bodyCheck')
// const minioTools = require('../helpers/minioFonction');
// const path = require('path');
// const utilsTools = require('../helpers/utils');
// const { Op, Sequelize, where } = require('sequelize');
// const User = db.User;
// const { validationResult } = require('express-validator');
// const PDF = require('../helpers/pdf-generate');
// const ImageConvert = require('../helpers/image-convert');
// const { UUID, UUIDV4 } = require("sequelize");

// /***** Profiles******/ 
// const getOneUser = async (req, res) => {
//     try {
//         const userId = req.userId;
//         if (!userId) {
//             return res.status(400).json({
//                 status: 'failure',
//                 message: 'Mauvaise requête'
//             });
//         }

//         const user = await db.User.findOne({
//             where: { id: userId },
//             include: [
//               {
//                 model: db.Role,
//                 as: 'role',
//                 attributes: ['id', 'label', 'code'],
//                 include: {
//                   model: db.TypePermission,
//                   as: 'permissions'
//                 }
//               },
//               {
//                 model: db.Corps,
//                 as: 'body',
//                 attributes: ['id', 'label', 'code']
//               },
//               {
//                 model: db.Juridiction,
//                 as: 'juridiction'
//               },
//               {
//                 model: db.Entite,
//                 as: 'entite'
//               },
//               {
//                   model: db.Document,
//                   as: 'documents',
//                   attributes: {
//                       include: [
//                           [
//                               db.Sequelize.literal(`CONCAT('${process.env.APP_URL}/api/utils/auth/displayFiles/', "documents"."id", '?mode=preview')`),
//                               'endpoint'
//                           ]
//                       ]
//                   },
//                   include: [
//                       {
//                           model: db.TypeDocument,
//                           as: 'typeDocument',
//                           where: {
//                               code: {
//                                   [Op.in]: ['signature_personnelle', 'signature_professionnelle']
//                               }
//                           }
//                       }
//                   ]
//               }
//             ],
//             attributes: { exclude: ['password',  'in_ad'] } // Exclude password from the result
//         });

//         if (!user) {
//             return res.status(404).json({
//                 status: 'failure',
//                 message: 'Utilisateur non trouvé'
//             });
//         }

//         res.json({
//             status: 'success',
//             message: 'Utilisateur trouvé',
//             data: user,
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             status: 'failure',
//             message: 'Erreur Interne',
//         });
//     }
// };

// const getOneProfile = async (req, res) => {
//     try {
//         const userCon = req.userId;
//         if (!userCon) {
//             return res.status(401).json({
//                 status: 'failure',
//                 message: 'Authentifiez vous'
//             });
//         }


//         const userId = req.params.id;
//         if (!userId) {
//             return res.status(400).json({
//                 status: 'failure',
//                 message: 'Mauvaise requête'
//             });
//         }

//         const user = await db.User.findOne({
//             where: { id: userId },
//             include: [
//               {
//                 model: db.Role,
//                 as: 'role',
//                 include: {
//                   model: db.TypePermission,
//                   as: 'permissions'
//                 }
//               },
//               {
//                 model: db.Corps,
//                 as: 'body'
//               },
//               {
//                 model: db.Juridiction,
//                 as: 'juridiction'
//               },
//               {
//                 model: db.Entite,
//                 as: 'entite'
//               },
//               {
//                   model: db.Document,
//                   as: 'documents',
//                   attributes: {
//                       include: [
//                           [
//                               db.Sequelize.literal(`CONCAT('${process.env.APP_URL}/api/utils/auth/displayFiles/', "documents"."id", '?mode=preview')`),
//                               'endpoint'
//                           ]
//                       ]
//                   },
//                   include: [
//                       {
//                           model: db.TypeDocument,
//                           as: 'typeDocument',
//                           where: {
//                               code: {
//                                   [Op.in]: ['signature_personnelle', 'signature_professionnelle']
//                               }
//                           }
//                       }
//                   ]
//               }
//             ],
//             attributes: { exclude: ['password', 'in_ad'] } // Exclude password from the result
//         });

//         if (!user) {
//             return res.status(404).json({
//                 status: 'failure',
//                 message: 'Utilisateur non trouvé'
//             });
//         }

//         res.json({
//             status: 'success',
//             message: 'Utilisateur trouvé',
//             data: user,
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             status: 'failure',
//             message: 'Erreur Interne',
//         });
//     }
// };

// /***** Superior Declaration ******/ 
// const declareSuperior = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       await transaction.rollback();
//       return res.status(400).json({ status: 'failure', message: 'Erreurs de validation', errors: errors.array() });
//     }

//     const { superior_id, role } = req.body;
//     const userId = req.userId;

//     // Vérifier que le supérieur existe et est actif
//     const superior = await db.User.findOne({ where: { id: superior_id, disabled: false }, transaction });
//     if (!superior) {
//       await transaction.rollback();
//       return res.status(404).json({ status: 'failure', message: 'Supérieur non trouvé' });
//     }

//     const declaration = await db.SuperiorDeclaration.create({
//       user_id: userId,
//       superior_id,
//       role,
//       status: 'pending',
//     }, { transaction });

//     await transaction.commit();
//     return res.status(201).json({ status: 'success', message: 'Déclaration créée', data: declaration });

//   } catch (error) {
//     await transaction.rollback();
//     console.error('Erreur [declareSuperior]:', error);
//     return res.status(500).json({ status: 'failure', message: 'Erreur serveur' });
//   }
// };

// const validationDeclaration = async (req, res) => {
//   const transaction = await db.sequelize.transaction();
//   try {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       await transaction.rollback();
//       return res.status(400).json({ status: 'failure', message: 'Erreurs de validation', errors: errors.array() });
//     }

//     const { id } = req.params;
//     const { status } = req.body;
//     const userId = req.userId;

//     const declaration = await db.SuperiorDeclaration.findByPk(id, { transaction });
//     if (!declaration) {
//       await transaction.rollback();
//       return res.status(404).json({ status: 'failure', message: 'Déclaration non trouvée' });
//     }

//     if (declaration.superior_id !== userId) {
//       await transaction.rollback();
//       return res.status(403).json({ status: 'failure', message: 'Non autorisé' });
//     }

//     declaration.status = status;
//     await declaration.save({ transaction });

//     if (status === 'confirmed') {
//       await db.User.update({ superior_id: userId }, { where: { id: declaration.user_id }, transaction });
//     }

//     await transaction.commit();
//     return res.json({ status: 'success', message: 'Déclaration mise à jour', data: declaration });

//   } catch (error) {
//     await transaction.rollback();
//     console.error('Erreur [validationDeclaration]:', error);
//     return res.status(500).json({ status: 'failure', message: 'Erreur serveur' });
//   }
// };

// /*****  Bulletin evaluation ******/ 
//     const userId = req.userId;
//     // Validate the bulletinId parameter
//     if (!userId) {
//       return res.status(401).json({
//         status: 'failure',
//         message: 'Authentifiez vous.',
//       });
//     }

//     // Validate the bulletinId parameter
//     console.log("Bulletin id: ", bulletinId);
//     if (!bulletinId || !utilsTools.isValidUUID(bulletinId)) {
//       return res.status(400).json({
//         status: 'failure',
//         message: 'ID de bulletin invalide.',
//       });
//     }

//     const bulletin = await db.BulletinRequest.findOne({
//       where: {
//           id: bulletinId,
//           [Op.and]: [
//               {
//                   [Op.or]: [
//                       Sequelize.where(
//                           Sequelize.fn('EXISTS', Sequelize.literal(
//                               `(SELECT 1 FROM jsonb_array_elements("histories") AS history WHERE history->>'id' = :userId)`
//                           )),
//                           true
//                       ),
//                       {
//                           user_id: userId // Ensure the correct syntax for referencing the associated model
//                       },
//                       {
//                           current_evaluator_id: userId // Ensure the correct syntax for referencing the associated model
//                       }
//                   ]
//               }
//           ]
//       },
//       replacements: { userId: userId }, 
//       include: [
//         {
//           model: db.User,
//           as: 'agent',
//           attributes: ['id', 'first_name', 'last_name', 'title'],
//           include: [
//             {
//               model: db.Role,
//               as: "role"
//             }
//           ]
//         },
//         {
//           model: db.User,
//           as: 'currentEvaluator',
//           attributes: ['id', 'first_name', 'last_name', 'title'],
//           include: [
//             {
//               model: db.Role,
//               as: "role"
//             }
//           ]
//         },
//         {
//           model: db.Statut,
//           as: 'statutIn',
//           attributes: ['id', 'label', 'code'],
//         },
//         {
//           model: db.BulletinEvaluation,
//           as: 'evaluations',
//           include: [
//             {
//               model: db.User,
//               as: 'evaluator',
//               attributes: ['id', 'first_name', 'last_name', 'title'],
//               include: [
//                 {
//                   model: db.Role,
//                   as: "role"
//                 }
//               ]
//             },
//             {
//               model: db.EvaluationScore,
//               as: 'scores',
//               attributes: ['score'], // Adjust based on your score model structure
//               include: [
//                 {
//                   model: db.CriteriaEvaluation,
//                   as: "criteria",
//                   where: {
//                     useCase: "bulletin"
//                   }
//                 }
//               ]
//             },
           
//           ],
//           order: [['action_date', 'ASC']], // Order by action date
//         },
//         {
//             model: db.Document,
//             as: 'document_acte',
//             isActe: true,
//             attributes: {
//                 include: [
//                     [
//                         db.Sequelize.literal(`CONCAT('${process.env.APP_URL}/api/utils/auth/displayFiles/', "document_acte"."id", '?mode=preview')`),
//                         'endpoint'
//                     ]
//                 ]
//             }
//         },
//       ],
//     });

//     if (!bulletin) {
//       return res.status(400).json({ status: 'failure', message: 'Bulletin non trouvé' });
//     }

//     console.log("Bulettin: ", bulletin)
//     return res.status(200).json({
//       status: 'success',
//       data: bulletin,
//     });
//   } catch (error) {
//     console.error('Erreur [getBulletinDetails]:', error);
//     return res.status(500).json({ status: 'failure', message: 'Erreur serveur' });
//   }
// };

// // Eavaluate bulletin
// const submitEvaluation = async (req, res) => {
//   const { bulletinId, evaluatorId, scores, comment } = req.body; // Extracting necessary data
//   let transaction = null;

//   try {
//     transaction = await db.sequelize.transaction();
//     const userId = req.userId;
//     console.log('Received request:', { bulletinId, evaluatorId, scores, comment });

//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//       console.log('Validation errors:', errors.array());
//       await transaction.rollback();
//       return res.status(400).json({ status: 'failure', message: 'Erreurs de validation', errors: errors.array() });
//     }

//     // Validate bulletinId
//     if (!bulletinId || !utilsTools.isValidUUID(bulletinId)) {
//       console.log('Invalid bulletinId:', bulletinId);
//       return res.status(400).json({
//         status: 'failure',
//         message: 'ID de bulletin invalide.',
//       });
//     }

//     // Validate evaluatorId
//     if (!evaluatorId || !utilsTools.isValidUUID(evaluatorId)) {
//       console.log('Invalid evaluatorId:', evaluatorId);
//       return res.status(400).json({
//         status: 'failure',
//         message: 'ID d\'évaluateur invalide.',
//       });
//     }

//     // Check the evaluator is the current one
//     if (evaluatorId != userId) {
//       console.log('Not the evaluator curreent:', evaluatorId);
//       return res.status(400).json({
//         status: 'failure',
//         message: "Vous n'êtes pas autorisé à noter cette demande maintenant.",
//       });
//     }


//     const evaluationExist = await db.BulletinEvaluation.findOne({
//       where: {
//         bulletin_request_id: bulletinId,
//         evaluator_id: evaluatorId
//       }
//     });
//     console.log('Evaluation existence check:', evaluationExist);

//     // Validate scores
//     if (evaluationExist) {
//       console.log('Evaluation already exists for this bulletin and evaluator.');
//       return res.status(406).json({
//         status: 'failure',
//         message: 'Vous avez déjà évalué, vous devez maintenant transmettre.'
//       });
//     }

//     // Retrieve criteria IDs for the 'bulletin' use case
//     const criteriaList = await db.CriteriaEvaluation.findAll({
//       where: {
//         useCase: 'bulletin'
//       }
//     });
//     console.log('Criteria list:', criteriaList, );

//     // Extract the criteria IDs from the result
//     const criteriaIds = criteriaList.map(criteria => criteria.id);
//     console.log('Criteria IDs:', criteriaIds, scores);

//     // Check if each score has a value corresponding to its criteria
//     const missingScores = criteriaIds.filter(criteriaId => {
//       return !scores.some(score => score.criteriaId == criteriaId && score.value !== undefined);
//     });

//     // Respond if there are missing scores for any criteria
//     if (missingScores.length > 0) {
//       console.log('Missing scores for criteria:', missingScores);
//       return res.status(400).json({
//         status: 'failure',
//         message: `Scores manquants pour les critères: ${missingScores.join(', ')}. Veuillez fournir une valeur pour chaque critère.`,
//       });
//     }

//     // Validate comment
//     if (typeof comment !== 'string') {
//       console.log('Invalid comment:', comment);
//       return res.status(400).json({
//         status: 'failure',
//         message: 'Commentaire invalide.',
//       });
//     }

//     // Validate the user is an evaluator
//     const user = await db.User.findByPk(evaluatorId);
//     console.log('Evaluator user:', user);
//     if (!user || user.id !== userId) {
//       console.log('Unauthorized user attempt to submit evaluation.');
//       return res.status(403).json({
//         status: 'failure',
//         message: 'Utilisateur non autorisé à soumettre une évaluation.',
//       });
//     }

//     // Validate the bulletin exists
//     const bulletin = await db.BulletinRequest.findOne({ where: { id: bulletinId } });
//     if (!bulletin) {
//       console.log('Bulletin not found:', bulletinId);
//       return res.status(404).json({
//         status: 'failure',
//         message: 'Bulletin non trouvé.',
//       });
//     }

//     // Calculate total score
//     const totalScore = scores.reduce((sum, score) => sum + score.value, 0);
//     console.log('Total score calculated:', totalScore);

//     // Create the evaluation within the transaction
//     const evaluation = await db.BulletinEvaluation.create({
//       bulletin_request_id: bulletinId,
//       evaluator_id: evaluatorId,
//       comment,
//       action_date: new Date(), // Set the current date and time
//       total_score: totalScore,
//     }, { transaction });
//     console.log('Evaluation created:', evaluation);

//     // Save scores associated with this evaluation within the transaction
//     await Promise.all(scores.map(async (score) => {
//       console.log('Saving score:', score);
//       await db.EvaluationScore.create({
//         bulletin_evaluation_id: evaluation.id,
//         score: score.value,
//         criteria_id: score.criteriaId, // Assuming score has criteriaId
//       }, { transaction });
//     }));


//     bulletin.forTransfert = true; //  Set the bulletin for transfert
//     await bulletin.save({ transaction }); // Save the bulletin      

//     // Commit the transaction
//     await transaction.commit();
//     console.log('Transaction committed.');



//     // Fetch scores for the response
//     const detailedScores = await db.BulletinEvaluation.findOne({
//       where: { id: evaluation.id },
//       include: [{ model: db.EvaluationScore, as: 'scores', include: [{ model: db.CriteriaEvaluation, as: 'criteria' }] }],
//     });
//     console.log('Detailed scores fetched:', detailedScores);

//     return res.status(200).json({
//       status: 'success',
//       message: 'Évaluation soumise avec succès.',
//       data: {
//         evaluation,
//         scores: detailedScores,
//       },
//     });
//   } catch (error) {
//     // Rollback the transaction in case of error
//     if (transaction) await transaction.rollback();
//     console.error('Erreur [submitEvaluation]:', error);
//     return res.status(500).json({ status: 'failure', message: error.message });
//   }
// };

// //Transférer
// const transfererEvaluation = async (req, res) => {
//   const { bulletinId, evaluatorId, comment } = req.body;

//   // Validate the user is an evaluator
//   const userId = req.userId;
//   if (!userId) {
//     return res.status(401).json({
//       status: 'failure',
//       message: 'Authentifiez vous.',
//     });
//   }

//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ status: 'failure', message: 'Erreurs de validation', errors: errors.array() });
//   }

//   // Validate IDs and comment
//   if (!bulletinId || !utilsTools.isValidUUID(bulletinId) ||
//       !evaluatorId || !utilsTools.isValidUUID(evaluatorId) ||
//       typeof comment !== 'string' || comment === '') {
//     const errors = [];
    
//     if (!bulletinId || !utilsTools.isValidUUID(bulletinId)) {
//       errors.push('ID de bulletin invalide.');
//     }
//     if (!evaluatorId || !utilsTools.isValidUUID(evaluatorId)) {
//       errors.push('ID d\'évaluateur invalide.');
//     }
//     if (typeof comment !== 'string' || comment === '') {
//       errors.push('Commentaire invalide.');
//     }
    
//     return res.status(400).json({
//       status: 'failure',
//       message: 'Erreurs de validation.',
//       errors: errors,
//     });
//   }

//   let transaction = null;
//   try {
//     transaction = await db.sequelize.transaction();

//     const bulletin = await db.BulletinRequest.findOne({ 
//       where: { 
//         id: bulletinId 
//       },
//       include: [
//         {
//           model: db.BulletinEvaluation,
//           as: 'evaluations',
//           required: false,
//           where: {
//             evaluator_id: userId
//           }
//         }
//       ]
//     });
//     if (!bulletin) {
//       return res.status(404).json({
//         status: 'failure',
//         message: 'Bulletin non trouvé.',
//       });
//     }

//     // Validate the user is the current evaluator
//     if (bulletin.current_evaluator_id !== userId) {
//       return res.status(403).json({
//         status: 'failure',
//         message: 'Vous n\'êtes pas autorisé à transférer cette demande.',
//       });
//     }

//     const hasEvaluate = bulletin.evaluations.length > 0;

//     const include = [
//         {
//             model: db.Corps, 
//             as: 'body'
//         }
//     ];
//     if (hasEvaluate) {
//         include.push({
//             model: db.Document, 
//             as: 'documents',
//             required: false,
//             include: {
//                 model: db.TypeDocument,
//                 as: "typeDocument",
//                 where: {
//                     code: "signature_professionnelle"
//                 }
//             }
//         });
//     }
//     const user = await db.User.findByPk(userId, { include });

//     if (!user) {
//       return res.status(401).json({
//         status: 'failure',
//         message: 'Authentifiez-vous.',
//       });
//     }

   
//     let signatureObj = null;
//     // Check if the user's documents include the required signature
//     if(hasEvaluate){ 
//       const hasSignature = user.documents && user.documents.length > 0;
//       signatureObj = user.documents[0];

//       if (!hasSignature) {
//         return res.status(400).json({
//           status: 'failure',
//           message: 'Veuillez mettre à jour votre signature.',
//         });
//       }
//     }

//     const destinataire = await db.User.findByPk(evaluatorId, {include: {model: db.Role, as: "role"}});
//     if (!destinataire) {
//       return res.status(403).json({
//         status: 'failure',
//         message: 'Destinataire non trouvé.',
//       });
//     }

//     // Process comments and evaluators
//     let existingComments = bulletin.comments;

  
//     const newComment = {
//       id: user.id,
//       first_name: user.first_name,
//       last_name: user.last_name,
//       comment: comment,
//     };

//     const comments = [...existingComments, newComment];
//     bulletin.comments = comments;
//     // bulletin.current_evaluator_id = destinataire.id;

//     const statut = await db.Statut.findOne({ where: { code: 'transfered' } });
//     bulletin.statut_id = statut.id;
    

//     // Process history
//     let existingHistory = bulletin.histories;
    
//     // const newHistory = {
//     //   id: user.id,
//     //   first_name: user.first_name,
//     //   last_name: user.last_name,
//     //   title: user.title,
//     // };

//     // const histories = [...existingHistory, newHistory];
//     // bulletin.histories = histories; 
    
//     if(hasEvaluate){
//       const signaturesExiste = bulletin.signatures;
//       const newSignature = {
//         id: signatureObj.id,
//         path: signatureObj.path
//       };

//       bulletin.signatures = [...signaturesExiste, newSignature];

//       /// Handle evaluators (ensure superior is defined)
//       let existingEvaluators = bulletin.evaluators;
      
//       const newEvaluator = {
//         id: user.id,
//         first_name: user.first_name,
//         last_name: user.last_name,
//         title: user.title,
//       };

//       const evaluators = [...existingEvaluators, newEvaluator];
//       bulletin.evaluators = evaluators;
//     }


//     bulletin.forTransfert = false; //  Set the bulletin for transfert

//     // Check if destinataire is dspj ou dpaf
//     if(destinataire.role.code == "dspj" || destinataire.role.code == "dpaf"){
//       await bulletin.save({ transaction });
//       // Signer le bulletin
//       let resp = await signerBulletinIntern(bulletinId, transaction);
//       if(resp.status == true) {
//           transaction = resp.transaction;
//           bulletin.acte_id = resp.acte_id;
//       }else{
//         console.log("Resp is false")
//         transaction = resp.transaction; 
//         throw new Error("Erreur lors de la génération du document. Veuillez reprendre.");
//       }
//     }
    
//     await bulletin.save({ transaction });
//     await transaction.commit();

//     return res.status(201).json({
//       status: 'success',
//       message: 'Transfert éffectué avec succès.',
//       data: bulletin,
//     });
//   } catch (error) {
//     if (transaction) await transaction.rollback();
//     console.error('Erreur [Transfert de demande]:', error);
//     return res.status(500).json({ status: 'failure', message: 'Erreur serveur' });
//   }
// };


// //Signer
// const signerBulletinIntern = async (bulletinId,  transaction) => {
//   try {
//     //  Get Bulletin
  
//     let bulletin = await db.BulletinRequest.findOne({
//       where: { id: bulletinId },
//       include: [
//         {
//           model: db.User,
//           as: 'agent',
//           include: [
//             {
//               model: db.Role,
//               as: "role"
//             },
//             {
//               model: db.Corps, 
//               as: 'body'
//             }
//           ]
//         },
//         {
//           model: db.User,
//           as: 'currentEvaluator',
//           attributes: ['id', 'first_name', 'last_name', 'title'],
//           include: [
//             {
//               model: db.Role,
//               as: "role"
//             }
//           ]
//         },
//         {
//           model: db.Statut,
//           as: 'statutIn',
//           attributes: ['id', 'label', 'code'],
//         },
//         {
//           model: db.BulletinEvaluation,
//           as: 'evaluations',
//           include: [
//             {
//               model: db.User,
//               as: 'evaluator',
//               attributes: ['id', 'first_name', 'last_name', 'title'],
//               include: [
//                 {
//                   model: db.Role,
//                   as: "role"
//                 }
//               ]
//             },
//             {
//               model: db.EvaluationScore,
//               as: 'scores',
//               attributes: ['score'], // Adjust based on your score model structure
//               include: [
//                 {
//                   model: db.CriteriaEvaluation,
//                   as: "criteria",
//                   where: {
//                     useCase: "bulletin"
//                   }
//                 }
//               ]
//             },
//           ],
//           order: [['action_date', 'ASC']], // Order by action date
//         },
//       ],
//     });
//     if (!bulletin) {
//       return { status: false, transaction, message: "Bulletin non trouvé" }
//     }


//     // Formattage des dates
//     // Format the dates before sending
 
//     const formattedInterruptions = bulletin.agent.services_interruptions.map(interruption => ({
//         ...interruption,
//         start_date: utilsTools.formatDate(interruption.start_date),
//         end_date: utilsTools.formatDate(interruption.end_date)
//     }));

//     // Format the diplomas
//     const formattedDiplomas = bulletin.agent.diplomas.map(diplome => ({
//         ...diplome,
//         date_award: utilsTools.formatDate(diplome.date_award)
//     }));

//     // Format the honorary distinctions
//     const formattedFamily = bulletin.agent.family.map(fam => ({
//         ...fam,
//         date_of_marriage: utilsTools.formatDate(fam.date_of_marriage),
//         children: fam.children.map(child => ({
//             ...child,
//             date_of_birth: utilsTools.formatDate(child.date_of_birth),
//         })),
//     }));

//     console.log("formattedFamily", formattedFamily);
   

//     // const formattedServices = bulletin.agent.services.map(service => ({
//     //     ...service,
//     //     start_date: utilsTools.formatDate(interruption.start_date),
//     //     end_date: utilsTools.formatDate(interruption.end_date)
//     // }));

    



//     // Génération d'un numéro unique
//     bulletin.numero = bulletin.numero ?  bulletin.numero : await utilsTools.generateUniqueNumero(db.BulletinRequest, "numero", 10);
//     console.log("Numero validé", bulletin.numero)
//     const parameters = {
//       numero: bulletin.numero, // Assuming id corresponds to demande.numero
//       body: bulletin.agent.body?.label,
//       year: bulletin.year,
//       name: `${bulletin.agent.first_name} ${bulletin.agent.last_name}`, 
//       date_of_birth: utilsTools.formatDate(bulletin.agent.date_of_birth), 
//       place_of_birth: bulletin.agent.place_of_birth, 
//       date_of_marriage: formattedFamily[0]?.date_of_marriage,
//       place_of_marriage: formattedFamily[0]?.place_of_marriage,
//       conjoint_e: formattedFamily[0]?.conjoint_e, 
//       family_address: formattedFamily[0]?.family_address,
//       children: formattedFamily[0].children,
//       military_status: bulletin.agent.military_status,
//       recrut_class: bulletin.agent.recrut_class,
//       diplomas: formattedDiplomas,
//       date_of_service: utilsTools.formatDate(bulletin.agent.date_of_service), 
//       pension_scheme: bulletin.agent.pension_scheme,
//       actual_grade_class: bulletin.agent.actual_grade_class,
//       date_actual_grade_class: bulletin.agent.date_actual_grade_class,
//       date_actual_grade_class: bulletin.agent.date_actual_grade_class,
//       services_interruptions: formattedInterruptions,
//       services: bulletin.agent.services,
//       spoken_languages: bulletin.agent.spoken_languages,
//       honorary_distinction: bulletin.agent.honorary_distinction,
//       evaluators: bulletin.evaluators,
//       promotions: bulletin.agent.promotions,
//       mutations: bulletin.agent.mutations,
//       military_time: bulletin.agent.military_time,
//       advancement: bulletin.agent.advancement,
//       signature: bulletin.signatures,
//       agent: bulletin.agent.first_name + " " + bulletin.agent.last_name,
//       date_signature: utilsTools.formatDate(new Date()),
//     }

//     // Génération du PDF
//     console.log("Gérération PDF >>>>>>>>")

//     const genModule = await PDF.generatePDF(parameters, transaction, 'bulletin_note', true);
//     console.log("GENMODULE: ", genModule.pathFileLink);
//     transaction = genModule.t
//     console.log('t: ')
//     if (genModule.pathFileLink == null) {
//         throw new Error(`Le fichier PDF n'a pas été créé à l'emplacement`);
//     }
//     console.log("Pdf created Path: ", genModule.pathFileLink);

//     let typeDocument = await db.TypeDocument.findOne({
//         where: {
//             code: "bulletin_note"
//         }
//     });

//     // console.log("Setting Status >>>>>>>>")
//     // Réservation de la demande
//     let statusvalide = await db.Statut.findOne({ where: { code: 'signed' } }, { transaction });
//     console.log("Status: ", statusvalide.id);
//     await bulletin.setStatutIn(statusvalide, { transaction });
  
//     const acteExistes = await db.Document.findAll({
//         where: {
//             typeDocumentId: typeDocument.id,
//             tmp: bulletin.id,
//             isFinal: false
//         },
//         transaction
//     });

//     console.log("Fit isValid  >>>>>: ", acteExistes);

//     if (acteExistes.length > 0) {
//         // Suppression de chaque document trouvé
//         console.log("Deleting >>>>>: ")
//         for (const acte of acteExistes) {
//             await minioTools.deleteDocument(acte.id);  
//         }
//     }
   
//     let pdfDoc = await db.Document.create({
//         libelle: "Bulletin de note",
//         filename: "Bulletin de note-"+ bulletin.numero + ".pdf",
//         path:  genModule.pathFileLink,
//         typeDocumentId: typeDocument.id,
//         isActe: true,
//         isFinal: true
//     }, { transaction });
//     console.log("Document Crée >>>>", pdfDoc.id)
//     if(!pdfDoc) {
//         console.log('OK')
//         return { status: false, transaction, message: "Echec de validation" }
//     }
  

//     return { status: true, transaction, acte_id: pdfDoc.id}
    
//   } catch (error) {
//     console.log(error)
//     return {status: false, transaction, message: error}
//   }
// };

// //Finaliser
// const genererBulletin = async (req, res) => {
//   const { bulletinId  } = req.body;

//   // Validate the user is an evaluator
//   const userId = req.userId;
//   if (!userId) {
//     return res.status(401).json({
//       status: 'failure',
//       message: 'Authentifiez vous.',
//     });
//   }

//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ status: 'failure', message: 'Erreurs de validation', errors: errors.array() });
//   }

//   // Validate IDs and comment
//   if (!bulletinId || !utilsTools.isValidUUID(bulletinId)) {
//     const errors = 'ID de bulletin invalide.';
    
//     return res.status(400).json({
//       status: 'failure',
//       message: 'Erreurs de validation.',
//       errors: errors,
//     });
//   }

//   let transaction = null;
//   try {
//     transaction = await db.sequelize.transaction();

//     // Validate user and bulletin
//     const user = await db.User.findByPk(userId, {include: [{model: db.Corps, as: 'body'}]});
//     if (!user) {
//       return res.status(401).json({
//         status: 'failure',
//         message: 'Authentifiez vous.',
//       });
//     }

//     console.log("Body: ", user.body)
//     let bulletin = await db.BulletinRequest.findOne({
//       where: { id: bulletinId },
//       include: [
//         {
//           model: db.User,
//           as: 'agent',
//           attributes: ['id', 'first_name', 'last_name', 'title'],
//           include: [
//             {
//               model: db.Role,
//               as: "role"
//             }
//           ]
//         },
//         {
//           model: db.User,
//           as: 'currentEvaluator',
//           attributes: ['id', 'first_name', 'last_name', 'title'],
//           include: [
//             {
//               model: db.Role,
//               as: "role"
//             }
//           ]
//         },
//         {
//           model: db.Statut,
//           as: 'statutIn',
//           attributes: ['id', 'label', 'code'],
//         },
//         {
//           model: db.BulletinEvaluation,
//           as: 'evaluations',
//           include: [
//             {
//               model: db.User,
//               as: 'evaluator',
//               attributes: ['id', 'first_name', 'last_name', 'title'],
//               include: [
//                 {
//                   model: db.Role,
//                   as: "role"
//                 }
//               ]
//             },
//             {
//               model: db.EvaluationScore,
//               as: 'scores',
//               attributes: ['score'], // Adjust based on your score model structure
//               include: [
//                 {
//                   model: db.CriteriaEvaluation,
//                   as: "criteria",
//                   where: {
//                     useCase: "bulletin"
//                   }
//                 }
//               ]
//             },
//           ],
//           order: [['action_date', 'ASC']], // Order by action date
//         },
//       ],
//     });
//     if (!bulletin) {
//       return res.status(404).json({
//         status: 'failure',
//         message: 'Bulletin non trouvé.',
//       });
//     }

//     // Check if the user is part of the evaluators
//     let evaluators = [];
//     if (bulletin.evaluators && bulletin.evaluators !== '') {
//       evaluators = bulletin.evaluators;
//     }

//     //Vérifier si elle est un évaluateur pour ce bulletin
//     // const isEvaluator = evaluators.some(evaluator => evaluator.id === userId);
//     // if (!isEvaluator) {
//     //   return res.status(403).json({
//     //     status: 'failure',
//     //     message: 'Vous n\'êtes pas un évaluateur pour ce bulletin.',
//     //   });
//     // }

//     // // Pour vérifier que ce soit l'utilisateur courant qui doit générer
//     // if (bulletin.current_evaluator_id !== userId) {
//     //   return res.status(403).json({
//     //     status: 'failure',
//     //     message: 'Vous n\'êtes pas autorisé à générer ce bulletin.',
//     //   });
//     // }

    


//     // Génération d'un numéro unique
//     bulletin.numero = bulletin.numero ?  bulletin.numero : await utilsTools.generateUniqueNumero(db.BulletinRequest, "numero", 10);
//     console.log("Numero validé", bulletin.numero)
//     const parameters = {
//       numero: bulletin.numero, // Assuming id corresponds to demande.numero
//       body: user.body?.label,
//       year: bulletin.year,
//       name: `${user.first_name} ${user.last_name}`, 
//       date_of_birth: utilsTools.formatDate(user.date_of_birth), 
//       place_of_birth: user.place_of_birth, 
//       military_status: user.military_status,
//       diplomas: user.diplomas,
//       date_of_service: utilsTools.formatDate(user.date_of_service), 
//       pension_scheme: user.pension_scheme,
//       actual_grade_class: user.actual_grade_class,
//       date_actual_grade_class: user.date_actual_grade_class,
//       date_actual_grade_class: user.date_actual_grade_class,
//       services_interruptions: user.services_interruptions,
//       spoken_languages: user.spoken_languages,
//       honorary_distinction: user.honorary_distinction,
//       date_of_marriage: utilsTools.formatDate(user.date_of_marriage),
//       place_of_marriage: user.place_of_marriage,
//       children: user.children,
//       family_address: user.family_address,
//       evaluators: bulletin.evaluators,
//       promotions: user.promotions,
//       mutations: user.mutations,
//       military_time: user.military_time,
//       advancement: user.advancement,
//       signature: null,
//       agent: user.first_name + " " + user.last_name,
//       date_signature: utilsTools.formatDate(new Date()),
//     }

//     // Génération du PDF
//     console.log("Gérération PDF >>>>>>>>")

//     const genModule = await PDF.generatePDF(parameters, transaction, 'bulletin', false);
//     console.log("GENMODULE: ", genModule.pathFileLink);
//     transaction = genModule.t
//     console.log('t: ')
//     if (genModule.pathFileLink == null) {
//         throw new Error(`Le fichier PDF n'a pas été créé à l'emplacement`);
//     }
//     console.log("Pdf created Path: ", genModule.pathFileLink);

//     let typeDocument = await db.TypeDocument.findOne({
//         where: {
//             code: "bulletin_note"
//         }
//     });
  
//     const acteExistes = await db.Document.findAll({
//         where: {
//             typeDocumentId: typeDocument.id,
//             tmp: bulletin.id,
//             isFinal: false
//         },
//         transaction: t // Utiliser la transaction ici
//     });

//     console.log("Fit isValid  >>>>>: ", acteExistes);

//     if (acteExistes.length > 0) {
//         // Suppression de chaque document trouvé
//         console.log("Deleting >>>>>: ")
//         for (const acte of acteExistes) {
//             await minioTools.deleteDocument(acte.id);   signed
//         }
//     }
   
//     let pdfDoc = await db.Document.create({
//         libelle: "Bulletin de note",
//         filename: "Bulletin de note-"+ bulletin.numero + ".pdf",
//         path:  genModule.pathFileLink,
//         typeDocumentId: typeDocument.id,
//         isActe: true
//     }, { transaction });
//     console.log("Document Crée >>>>", pdfDoc.id)
//     if(!pdfDoc) {
//         console.log('OK')
//         return { status: false, message: "Echec de validation" }
//     }
    

//     bulletin.acte_id = pdfDoc.id;

//     await bulletin.save({transaction});

//     await transaction.commit();

//     return res.status(201).json({
//       status: 'success',
//       message: 'Transfert éffectué avec succès.',
//       data: bulletin,
//       acte: process.env.APP_URL + '/api/utils/auth/displayFiles/' + bulletin.acte_id + '?mode=preview'
//     });
//   } catch (error) {
//     if (transaction) await transaction.rollback();
//     console.error('Erreur [Transfert de demande]:', error);
//     return res.status(500).json({ status: 'failure', message: 'Erreur serveur' });
//   }
// };


// //Signer
// const signerBulletin = async (req, res) => {
//   const { bulletinId  } = req.body;

//   // Validate the user is an evaluator
//   const userId = req.userId;
//   if (!userId) {
//     return res.status(401).json({
//       status: 'failure',
//       message: 'Authentifiez vous.',
//     });
//   }

//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return res.status(400).json({ status: 'failure', message: 'Erreurs de validation', errors: errors.array() });
//   }

//   // Validate IDs and comment
//   if (!bulletinId || !utilsTools.isValidUUID(bulletinId)) {
//     const errors = 'ID de bulletin invalide.';
    
//     return res.status(400).json({
//       status: 'failure',
//       message: 'Erreurs de validation.',
//       errors: errors,
//     });
//   }

//   let transaction = null;
//   let signatures = null;
//   try {
//     transaction = await db.sequelize.transaction();

//     // Validate user and bulletin
//     const user = await db.User.findByPk(userId, {
//       include: [
//         {
//           model: db.Corps, 
//           as: 'body'
//         },
//         {
//           model: db.Document, 
//           as: 'documents',
//           required: true,
//           include: {
//             model: db.TypeDocument,
//             as: "typeDocument",
//             where: {
//               code: "signature_professionnelle"
//             }
//           }
          
//         }
//       ]
//     });
//     console.log("Doc: ", user.documents);
//     if (!user) {
//       return res.status(401).json({
//         status: 'failure',
//         message: 'Authentifiez vous et mettez à jour votre signature.',
//       });
//     }

  
//     //Vérifier la signature
//     if (!user.documents && user.documents[0] && user.documents[0].typeDocument.code == "signature_professionnelle") {
//       return res.status(403).json({
//         status: 'failure',
//         message: 'Vous n\'êtes pas un évaluateur pour ce bulletin.',
//       });
//     }

//     signDoc = user.documents[0].id;
//     console.log("Doc Sign Id: ", signDoc);
//     console.log("Getting signature");
//     let signatures = [];

//     // Check if the bulletin has existing signatures
//     if (bulletin.signatures && bulletin.signatures !== '') {
//         signatures = bulletin.signatures;
//     }

//     // Add the new signature
//     signatures.push({
//         user_id: userId, // Replace with the actual user ID
//         doc_id: documentId // Replace with the actual document ID
//     });

//     // Array to hold converted signatures
//     const convertedSignatures = [];

//     // Iterate over each signature
//     for (const signature of signatures) {
//         try {
//             // Assuming GSUser.signature contains the signature data for the specific document
//             const convertedSignature = await ImageConvert(signature.doc_id);
//             convertedSignatures.push(convertedSignature);
//         } catch (error) {
//             console.error(`Erreur lors de la conversion de la signature pour doc_id ${signature.doc_id}:`, error);
//         }
//     }

//     // Now convertedSignatures contains all the converted signature images
//     console.log("Converted Signatures:", convertedSignatures);


//     console.log("Body: ", user.body)
//     let bulletin = await db.BulletinRequest.findOne({
//       where: { id: bulletinId },
//       include: [
//         {
//           model: db.User,
//           as: 'agent',
//           attributes: ['id', 'first_name', 'last_name', 'title'],
//           include: [
//             {
//               model: db.Role,
//               as: "role"
//             }
//           ]
//         },
//         {
//           model: db.User,
//           as: 'currentEvaluator',
//           attributes: ['id', 'first_name', 'last_name', 'title'],
//           include: [
//             {
//               model: db.Role,
//               as: "role"
//             }
//           ]
//         },
//         {
//           model: db.Statut,
//           as: 'statutIn',
//           attributes: ['id', 'label', 'code'],
//         },
//         {
//           model: db.BulletinEvaluation,
//           as: 'evaluations',
//           include: [
//             {
//               model: db.User,
//               as: 'evaluator',
//               attributes: ['id', 'first_name', 'last_name', 'title'],
//               include: [
//                 {
//                   model: db.Role,
//                   as: "role"
//                 }
//               ]
//             },
//             {
//               model: db.EvaluationScore,
//               as: 'scores',
//               attributes: ['score'], // Adjust based on your score model structure
//               include: [
//                 {
//                   model: db.CriteriaEvaluation,
//                   as: "criteria",
//                   where: {
//                     useCase: "bulletin"
//                   }
//                 }
//               ]
//             },
//           ],
//           order: [['action_date', 'ASC']], // Order by action date
//         },
//       ],
//     });
//     if (!bulletin) {
//       return res.status(404).json({
//         status: 'failure',
//         message: 'Bulletin non trouvé.',
//       });
//     }

//     // Check if the user is part of the evaluators
//     let evaluators = [];
//     if (bulletin.evaluators && bulletin.evaluators !== '') {
//        evaluators = bulletin.evaluators;
//     }

    

//     // // Pour vérifier que ce soit l'utilisateur courant qui doit générer
//     // if (bulletin.current_evaluator_id !== userId) {
//     //   return res.status(403).json({
//     //     status: 'failure',
//     //     message: 'Vous n\'êtes pas autorisé à générer ce bulletin.',
//     //   });
//     // }

//     const isEvaluator = evaluators.some(evaluator => evaluator.id === userId);
//     if (!isEvaluator) {
//       return res.status(403).json({
//         status: 'failure',
//         message: 'Vous n\'êtes pas un évaluateur pour ce bulletin.',
//       });
//     }


    


//     // Génération d'un numéro unique
//     bulletin.numero = bulletin.numero ?  bulletin.numero : await utilsTools.generateUniqueNumero(db.BulletinRequest, "numero", 10);
//     console.log("Numero validé", bulletin.numero)
//     const parameters = {
//       numero: bulletin.numero, // Assuming id corresponds to demande.numero
//       body: user.body?.label,
//       year: bulletin.year,
//       name: `${user.first_name} ${user.last_name}`, 
//       date_of_birth: utilsTools.formatDate(user.date_of_birth), 
//       place_of_birth: user.place_of_birth, 
//       military_status: user.military_status,
//       diplomas: user.diplomas,
//       date_of_service: utilsTools.formatDate(user.date_of_service), 
//       pension_scheme: user.pension_scheme,
//       actual_grade_class: user.actual_grade_class,
//       date_actual_grade_class: user.date_actual_grade_class,
//       date_actual_grade_class: user.date_actual_grade_class,
//       services_interruptions: user.services_interruptions,
//       spoken_languages: user.spoken_languages,
//       honorary_distinction: user.honorary_distinction,
//       date_of_marriage: utilsTools.formatDate(user.date_of_marriage),
//       place_of_marriage: user.place_of_marriage,
//       children: user.children,
//       family_address: user.family_address,
//       evaluators: bulletin.evaluators,
//       promotions: user.promotions,
//       mutations: user.mutations,
//       military_time: user.military_time,
//       advancement: user.advancement,
//       signature: convertedSignatures,
//       agent: user.first_name + " " + user.last_name,
//       date_signature: utilsTools.formatDate(new Date()),
//     }

//     // Génération du PDF
//     console.log("Gérération PDF >>>>>>>>")

//     const genModule = await PDF.generatePDF(parameters, transaction, 'bulletin_note', false);
//     console.log("GENMODULE: ", genModule.pathFileLink);
//     transaction = genModule.t
//     console.log('t: ')
//     if (genModule.pathFileLink == null) {
//         throw new Error(`Le fichier PDF n'a pas été créé à l'emplacement`);
//     }
//     console.log("Pdf created Path: ", genModule.pathFileLink);

//     let typeDocument = await db.TypeDocument.findOne({
//         where: {
//             code: "bulletin_note"
//         }
//     });

//     // console.log("Setting Status >>>>>>>>")
//     // Réservation de la demande
//     let statusvalide = await db.Status.findOne({ where: { libelle: 'signed' } }, { transaction: t });
//     console.log("Status: ", statusvalide.id);
//     await bulletin.setStatutIn(statusvalide, { transaction: t });
  
//     const acteExistes = await db.Document.findAll({
//         where: {
//             typeDocumentId: typeDocument.id,
//             tmp: bulletin.id,
//             isFinal: false
//         },
//         transaction: t // Utiliser la transaction ici
//     });

//     console.log("Fit isValid  >>>>>: ", acteExistes);

//     if (acteExistes.length > 0) {
//         // Suppression de chaque document trouvé
//         console.log("Deleting >>>>>: ")
//         for (const acte of acteExistes) {
//             await minioTools.deleteDocument(acte.id); 
//         }
//     }
   
//     let pdfDoc = await db.Document.create({
//         libelle: "Bulletin de note",
//         filename: "Bulletin de note-"+ bulletin.numero + ".pdf",
//         path:  genModule.pathFileLink,
//         typeDocumentId: typeDocument.id,
//         isActe: true,
//         isFinal: true
//     }, { transaction });
//     console.log("Document Crée >>>>", pdfDoc.id)
//     if(!pdfDoc) {
//         console.log('OK')
//         return { status: false, message: "Echec de validation" }
//     }
    

//     bulletin.acte_id = pdfDoc.id;
    

//     // Update the bulletin's signatures
//     bulletin.signatures = signatures;

//     await bulletin.save({transaction});

//     await transaction.commit();

//     return res.status(201).json({
//       status: 'success',
//       message: 'Transfert éffectué avec succès.',
//       data: bulletin,
//       acte: process.env.APP_URL + '/api/utils/auth/displayFiles/' + bulletin.acte_id + '?mode=preview'
//     });
//   } catch (error) {
//     if (transaction) await transaction.rollback();
//     console.error('Erreur [Signature de demande]:', error);
//     return res.status(500).json({ status: 'failure', message: 'Erreur serveur' });
//   }
// };

// const getAllUsers = async (req, res) => {
//     try {
//         const { page = 1, limit = 10, search = '' } = req.query;
    
//         // Validate page and limit parameters
//         const pageNum = parseInt(page);
//         const limitNum = parseInt(limit);
    
//         if (isNaN(pageNum) || pageNum <= 0 || isNaN(limitNum) || limitNum <= 0) {
//             return res.status(400).json({
//                 status: 'failure',
//                 message: 'Mauvaise requête : les paramètres "page" et "limit" doivent être des nombres positifs',
//                 data: null,
//             });
//         }
    
//         const offset = (pageNum - 1) * limitNum;
    
//         // Conditions de recherche
//         const where = search
//           ? { email: { [Op.like]: `%${search}%` } }
//           : {};
    
//         const { count, rows } = await db.User.findAndCountAll({
//           where,
//           limit: limitNum,
//           offset: offset,
//           distinct: true
//         });
    
//         return res.json({
//           status: 'success',
//           message: 'Utilisateurs récupérés avec succès',
//           total: count,
//           pages: Math.ceil(count / limitNum),
//           currentPage: pageNum,
//           data: rows,
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//           status: 'failure',
//           message: 'Erreur Interne'
//         });
//     }
// }

// const updateUserInfo = async (req, res) => {
//   let transaction = null;
//   try {
//     transaction = await db.sequelize.transaction(); // Init transaction
//     const userId = req.userId;
//     // const userId = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

//     if (!userId) {
//       await transaction.rollback();
//       console.log('[updateUserInfo] Échec : ID utilisateur manquant');
//       return res.status(404).json({
//         status: 'failure',
//         message: 'Mauvaise requête, ID utilisateur manquant'
//       });
//     }

//     const validationErrors = bodyCheck.updateProfile(req.body);
//     if (validationErrors.length > 0) {
//       await transaction.rollback();
//       console.log('[updateUserInfo] Échec de validation :', validationErrors);
//       return res.status(400).json({
//         status: 'failure',
//         message: 'Validation échouée',
//         errors: validationErrors,
//       });
//     }

//     const {
//       first_name,
//       last_name,
//       // email,
//       tel,
//       title,
//       matricule,
//       date_of_service,
//       date_of_birth,
//       place_of_birth,
//       spoken_languages,
//       military_status,
//       military_time,
//       actual_grade_class,
//       date_actual_grade_class,
//       recrut_class,
//       pension_scheme,
//       services_interruptions,
//       family,
//       diplomas,
//       promotions,
//       mutations,
//       honorary_distinction,
//       professions,
//       services,
//       corps_id,
//       entite_id,
//       juridiction_id,
//       numero_note_service,
//       date_note_service
//     } = req.body;

//     const user = await User.findByPk(userId, { transaction });
//     if (!user) {
//       await transaction.rollback();
//       console.log('[updateUserInfo] Échec : utilisateur non trouvé');
//       return res.status(404).json({
//         status: 'failure',
//         message: 'Utilisateur non trouvé',
//       });
//     }


//     // Validation: Check if both entite_id and juridiction_id are filled
//     if (entite_id && juridiction_id) {
//         await transaction.rollback();
//         return res.status(400).json({
//             status: 'failure',
//             message: 'Vous ne pouvez pas remplir à la fois entite et juridiction.',
//         });
//     }


//     const updateData = {};
//     const fieldsToUpdate = {
//       first_name,
//       last_name,
//       tel,
//       title,
//       matricule,
//       date_of_service,
//       date_of_birth,
//       place_of_birth,
//       spoken_languages,
//       military_status,
//       military_time,
//       actual_grade_class,
//       date_actual_grade_class,
//       recrut_class,
//       pension_scheme,
//       services_interruptions,
//       family,
//       diplomas,
//       promotions,
//       mutations,
//       honorary_distinction,
//       professions,
//       services,
//       corps_id,
//       entite_id,
//       juridiction_id,
//       date_note_service,
//       numero_note_service
//     };

//     for (const [key, value] of Object.entries(fieldsToUpdate)) {
//       if (value !== undefined) {
//         updateData[key] = value;
//       }
//     }

//     updateData.last_profile_modif = new Date();



//     // Validation: Ensure that the user is either in an entite or a juridiction
//     if (entite_id) {
//       const entite = await db.Entite.findByPk(entite_id);
//       if (!entite) {
//         await transaction.rollback();
//         return res.status(400).json({
//           status: 'failure',
//           message: 'Entité introuvable',
//         });
//       }
//       user.entite_id = entite_id;
//       // Si entite.code fait partir des code de juridiction 
//       if(utilsTools.juridictionCodes().includes(entite.code)){
//         // Get juridiction 
//         const juridiction = await db.Juridiction.findOne({ where: { code: entite.code } });
//         if (juridiction) {
//           user.juridiction_id = juridiction.id; // Ajouter le juridiction_id à l'utilisateur
//         } else {
//           user.juridiction_id = juridiction_id || null; // Clear juridiction_id
//         }
//       }else {
//           user.juridiction_id = juridiction_id || null; // Clear juridiction_id
//       }
//     } else if (juridiction_id) {
//       const juri = await db.Juridiction.findByPk(juridiction_id);
//       if (!juri) {
//         await transaction.rollback();
//         return res.status(400).json({
//           status: 'failure',
//           message: 'Juridiction introuvable',
//         });
//       }
//       user.juridiction_id = juridiction_id;
//       if(utilsTools.juridictionCodes().includes(juri.code)){
//         // Get entite
//         const entite = await db.Entite.findOne({ where: { code: juri.code } });
//         if (entite) {
//           user.entite_id = entite.id; // Ajouter l'entite_id à l'utilisateur
//         }else{
//           user.entite_id = entite_id || null;
//         }
//       }else{
//           user.entite_id = entite_id || null;
//       }
      
//     }

//     await user.save({ transaction });
//     await user.update(updateData, { transaction });

//     await transaction.commit();
//     const updatedUser = await User.findByPk(userId, {
//       attributes: { exclude: ['password', 'codeOTP', 'disabled', 'in_ad', 'signature'] },
//       include: [
//         {
//           model: db.Corps,
//           as: "body",
//         },
//         {
//           model: db.Role,
//           as: "role",
//         },
//         {
//           model: db.Juridiction,
//           as: 'juridiction'
//         },
//         {
//           model: db.Entite,
//           as: 'entite'
//         },
//       ]
//     });

//     console.log('[updateUserInfo] Succès : utilisateur mis à jour');
//     return res.status(200).json({
//       status: 'success',
//       message: 'Utilisateur mis à jour avec succès',
//       user: updatedUser,
//     });

//   } catch (error) {
//     if(transaction) await transaction.rollback();
//     console.error('[updateUserInfo] Erreur interne :', error);
//     return res.status(500).json({
//       status: 'failure',
//       message: 'Erreur Interne',
//     });
//   }
// };



// const updateSignature = async (req, res) => {
//   let transaction = null;

//   try {
//     transaction = await db.sequelize.transaction(); // Initialisation transactionnelle

//     const userId = req.userId;
//     // const userId = "f47ac10b-58cc-4372-a567-0e02b2c3d479";

//     if (!userId) {
//       await transaction.rollback();
//       console.log('[updateSignature] Échec : ID utilisateur manquant');
//       return res.status(404).json({
//         status: 'failure',
//         message: 'Mauvaise requête, ID utilisateur manquant'
//       });
//     }

//     const validationErrors = bodyCheck.updateProfile(req.body);
//     if (validationErrors.length > 0) {
//       await transaction.rollback();
//       console.log('[updateSignature] Échec de validation :', validationErrors);
//       return res.status(400).json({
//         status: 'failure',
//         message: 'Validation échouée',
//         errors: validationErrors,
//       });
//     }

//     const { signatures } = req.body;

//     const user = await User.findByPk(userId, { transaction });
//     if (!user) {
//       await transaction.rollback();
//       console.log('[updateSignature] Échec : utilisateur non trouvé');
//       return res.status(404).json({
//         status: 'failure',
//         message: 'Utilisateur non trouvé',
//       });
//     }

//     for (const piece of signatures) {
//       const pieceCreated = await db.Document.findOne({
//         where: { id: piece.id },
//         transaction,
//       });

//       let typeDocument = null;

//       if (piece.type) {
//         typeDocument = await db.TypeDocument.findOne({
//           where: { code: piece.type },
//           transaction,
//         });

//         if (!typeDocument) {
//           await transaction.rollback();
//           return res.status(404).json({
//             status: "failure",
//             message: 'Type de document non trouvé'
//           });
//         }

//         // Suppression des anciens documents de ce type pour l'utilisateur
//         const allpiecesExist = await db.Document.findAll({
//           where: {
//             user_id: user.id,
//             typeDocumentId: typeDocument.id
//           },
//           transaction,
//         });

//         console.log("AllPieces: ", allpiecesExist)
//         for (const element of allpiecesExist) {
//           // await minioTools.deleteDocument(element.id); // Suppression dans MinIO
//           // await element.destroy({ transaction });      // Suppression dans la base
//           element.user_id = null;
//           await element.save();
//         }
//       }

//       // Mise à jour ou rattachement du document
//       if (pieceCreated) {
//         pieceCreated.type = piece.type;
//         pieceCreated.user_id = user.id;
//         pieceCreated.typeDocumentId = typeDocument?.id || null;
//         await pieceCreated.save({ transaction });
//       }
//     }

//     await transaction.commit();

//     const updatedUser = await User.findByPk(userId, {
//       attributes: { exclude: ['password', 'codeOTP', 'disabled', 'in_ad'] },
//       include: [
//         {
//             model: db.Document,
//             as: 'documents',
//             attributes: {
//                 include: [
//                     [
//                         db.Sequelize.literal(`CONCAT('${process.env.APP_URL}/api/utils/auth/displayFiles/', "documents"."id", '?mode=preview')`),
//                         'endpoint'
//                     ]
//                 ]
//             }
//         }
//       ]
//     });

//     console.log('[updateSignature] Succès : utilisateur mis à jour');
//     return res.status(200).json({
//       status: 'success',
//       message: 'Utilisateur mis à jour avec succès',
//       user: updatedUser,
//     });

//   } catch (error) {
//     console.log(error)
//     if (transaction) await transaction.rollback();
//     console.error('[updateSignature] Erreur interne :', error);
//     return res.status(500).json({
//       status: 'failure',
//       message: 'Erreur Interne',
//     });
//   }
// };

// const updatePermissions = async (req, res) => {
//     try {
//         const userId = req.userId; // ID de l'utilisateur connecté
//         const auto_validate_service_start = req.body.auto_validate_service_start; // Permissions à mettre à jour
//         const auto_validate_post_presence = req.body.auto_validate_post_presence;
        

//         let newPermissions = [];
//         if (auto_validate_service_start) {
//             newPermissions.push('auto_validate_service_start');
//         }
//         if (auto_validate_post_presence) {
//             newPermissions.push('auto_validate_post_presence');
//         }

//         // Vérifier si l'utilisateur est authentifié
//         if (!userId) {
//             return res.status(401).json({
//                 status: 'failure',
//                 message: 'Authentifiez-vous.',
//             });
//         }

//         // Trouver l'utilisateur connecté
//         const user = await db.User.findByPk(userId, 
//           {
//             include: [
//               {
//                 model: db.Role,
//                 as: 'role',
//                 include: {
//                   model: db.TypePermission,
//                   as: 'permissions'
//                 }
//               }
//             ]
//           }
//         );

//         if (!user) {
//             return res.status(404).json({
//                 status: 'failure',
//                 message: 'Utilisateur non rencontré.',
//             });
//         }
        
//         // Trouver le rôle cible
//         const role = await db.Role.findByPk(user.role.id, {
//             include: {
//                 model: db.TypePermission,
//                 as: 'permissions',
//             },
//             transaction,
//         });

//         if (!role) {
//             return res.status(404).json({
//                 status: 'failure',
//                 message: 'Rôle non trouvé.',
//             });
//         }

//         // Récupérer les permissions actuelles
//         const currentPermissions = role.permissions.map(permission => permission.code);

//         // Déterminer les permissions à ajouter et à supprimer
//         let  permissionsToAdd = null;
//         if (auto_validate_service_start) {
//             permissionsToAdd = newPermissions.filter(
//                 perm => !currentPermissions.includes(perm)
//             );
//         }
        

//         let permissionsToRemove = null;
//         permissionsToRemove = currentPermissions.filter(
//             perm => !newPermissions.includes(perm)
//         );

//         // Ajouter les nouvelles permissions
//         await role.addPermissions(permissionsToAdd, { transaction });

//         // Supprimer les permissions non désirées
//         await role.removePermissions(permissionsToRemove, { transaction });

//         // Valider la transaction
//         await transaction.commit();

//         return res.status(200).json({
//             status: 'success',
//             message: 'Permissions mises à jour avec succès.',
//         });
//     } catch (error) {
//         // Annuler la transaction en cas d'erreur
//         await transaction.rollback();
//         console.error('Erreur lors de la mise à jour des permissions:', error);
//         return res.status(500).json({
//             status: 'failure',
//             message: 'Erreur lors de la mise à jour des permissions.',
//         });
//     }
// }


// const createPresenceCertificateRequest = async (req, res) => {
//     let transaction = null;
//     try {
//       const userId = req.userId;
//         if(!userId){
//           return res.status(401).json({
//               status: 'failure',
//               message: 'Authentifiez vous.',
//           });
//         }
//         transaction = await db.sequelize.transaction(); // Start a new transaction
//         let numero = await utilsTools.generateUniqueNumero(db.PresenceCertificateRequest, "numero", 10)
//         const request = await db.PresenceCertificateRequest.create({
//             user_id: userId,
//             numero
//         }, { transaction }); // Pass the transaction

//         await transaction.commit(); // Commit the transaction

//         return res.status(201).json({
//             status: 'success',
//             message: 'Demande d\'attestation créée avec succès.',
//             data: request,
//         });
//     } catch (error) {
//         if(transaction) await transaction.rollback(); // Rollback the transaction on error
//         console.error('Erreur lors de la création de la demande:', error);
//         return res.status(500).json({
//             status: 'failure',
//             message: 'Une erreur est survenue lors de la création.',
//         });
//     }
// };

// const getPresenceCertificateRequests = async (req, res) => {
//     try {
//         const userId = req.userId;
//         const { page = 1, limit = 10, search = '', startDate, endDate } = req.query;

//         if (!userId) {
//             return res.status(401).json({
//                 status: 'failure',
//                 message: 'Authentifiez vous.',
//             });
//         }

//         const offset = (page - 1) * limit;

//          // Build where clause for PresenceCertificateRequest
//         const whereClause = {
//             ...(search && {
//                 [Op.or]: [
//                     { numero: { [Op.iLike]: `%${search}%` } },
//                     { '$agent.first_name$': { [Op.iLike]: `%${search}%` } },
//                     { '$agent.last_name$': { [Op.iLike]: `%${search}%` } },
//                     { '$signataire.first_name$': { [Op.iLike]: `%${search}%` } },
//                     { '$signataire.last_name$': { [Op.iLike]: `%${search}%` } },
//                 ]
//             }),
//             ...(startDate && { createdAt: { [Op.gte]: new Date(startDate) } }),
//             ...(endDate && { createdAt: { [Op.lte]: new Date(endDate) } }),
//         };

//         const { count, rows: requests } = await db.PresenceCertificateRequest.findAndCountAll({
//             where: whereClause,
//             include: [
//                 {
//                     model: User,
//                     as: 'agent',
//                     include: [
//                         {
//                             model: db.Role,
//                             as: 'role',
//                             attributes: ['id', 'label', 'code']
//                         },
//                         {
//                             model: db.Corps,
//                             as: 'body',
//                             attributes: ['id', 'label', 'code']
//                         },
//                     ]
//                 },
//                 {
//                     model: User,
//                     as: 'signataire',
//                     attributes: ['id', 'first_name', 'last_name'],
//                 },
//                 {
//                     model: db.Document,
//                     as: 'document_acte',
//                     attributes: {
//                         include: [
//                             [
//                                 db.Sequelize.literal(`CONCAT('${process.env.APP_URL}/api/utils/auth/displayFiles/', "document_acte"."id", '?mode=preview')`),
//                                 'endpoint'
//                             ]
//                         ]
//                     }
//                 },
//             ],
//             limit,
//             offset,
//             distinct: true
//         });

//         return res.status(200).json({
//             status: 'success',
//             message: "Récupération avec succès",
//             data: requests,
//             total: count,
//             page: Number(page),
//             totalPages: Math.ceil(count / limit),
//         });
//     } catch (error) {
//         console.error('Erreur lors de la récupération des demandes:', error);
//         return res.status(500).json({
//             status: 'failure',
//             message: 'Une erreur est survenue lors de la récupération.',
//         });
//     }
// };

// const generatePresenceCertificateRequest = async (req, res) => {
//     const { requestId } = req.body;

//     // Check if the user is authenticated
//     const userId = req.userId;
//     if (!userId) {
//         return res.status(401).json({
//             status: 'failure',
//             message: 'Authentifiez vous.',
//         });
//     }

//     let transaction;
//     try {
//         transaction = await db.sequelize.transaction();

//         // Check user role and associated documents
//         const user = await db.User.findByPk(userId, {
//             include: [
//                 {
//                     model: db.Role,
//                     as: 'role',
//                 }
//             ],
//         });

//         if (!user || user.role.libelle !== 'dc') {
//             return res.status(403).json({
//                 status: 'failure',
//                 message: 'Vous n\'avez pas les droits nécessaires pour signer cette attestation.',
//             });
//         }

//         // Check if the user has a valid signature
//         // const userDocument = user.documents.find(doc => doc.typeDocument.code === 'signature_professionnelle');
//         // if (!userDocument) {
//         //     return res.status(404).json({
//         //         status: 'failure',
//         //         message: 'Signature professionnelle non trouvée.',
//         //     });
//         // }

//         // Fetch the presence certificate request
//         const request = await db.PresenceCertificateRequest.findByPk(requestId, {
//             include: [
//                 {
//                     model: db.User,
//                     as: "agent",
//                     include: [
//                         {
//                             model: db.Corps,
//                             as: 'body',
//                         },
//                         {
//                           model: db.Juridiction,
//                           as: 'juridiction'
//                         },
//                         {
//                           model: db.Entite,
//                           as: 'entite'
//                         },
//                     ],
//                 },
//             ],
//         });

//         if (!request) {
//             return res.status(404).json({
//                 status: 'failure',
//                 message: 'Demande d\'attestation non trouvée.',
//             });
//         }

//         const entityOrJurisdictionLabel = request.agent.entite 
//                                             ? request.agent.entite.label 
//                                             : request.agent.juridiction 
//                                                 ? request.agent.juridiction.label 
//                                                 : ''; // Fallback if neither is filled

//         const date_signature = new Date();
//         // Prepare parameters for PDF generation
//         request.numero = request.numero || await utilsTools.generateUniqueNumero(db.PresenceCertificateRequest, "numero", 10);
//         const parameters = {
//             numero: request.numero,
//             orgNumero: request.orgNumero, // Assuming orgNumero is part of the request
//             first_name: request.agent.first_name,
//             last_name: request.agent.last_name,
//             corps: request.agent.body.label,
//             grade: request.agent.actual_grade_class,
//             matricule: request.agent.matricule,
//             date_demande: utilsTools.formatDate(request.createdAt), // Assuming createdAt is the date of the request
//             date_signature: utilsTools.formatDate(date_signature),
//             structure: entityOrJurisdictionLabel,
//             signature: null,
//             signataire: user.first_name + " " + user.last_name,
//         };

//         // Génération du PDF
//         console.log("Gérération PDF >>>>>>>>")

//         const genModule = await PDF.generatePDF(parameters, transaction, 'attestation_presence_poste', false);
//         console.log("GENMODULE: ", genModule.pathFileLink);
//         if (genModule.pathFileLink == null) {
//             throw new Error(`Le fichier PDF n'a pas été créé à l'emplacement`);
//         }
//         console.log("Pdf created Path: ", genModule.pathFileLink);
//         transaction = genModule.t
//         console.log('t: ')
//         let typeDocument = await db.TypeDocument.findOne({
//             where: {
//                 code: "attestation_presence_poste"
//             }
//         });

//         // console.log("Setting Status >>>>>>>>")
//         // Réservation de la demande
//         let statusvalide = await db.Statut.findOne({ where: { code: 'validated' } }, { transaction });
//         console.log("Status: ", statusvalide.id);
//         await request.setStatutIn(statusvalide, { transaction });
      
//         const acteExistes = await db.Document.findAll({
//             where: {
//                 typeDocumentId: typeDocument.id,
//                 tmp: request.id,
//                 isFinal: false
//             },
//             transaction
//         });

//         console.log("Fit isValid  >>>>>: ", acteExistes);

//         if (acteExistes.length > 0) {
//             // Suppression de chaque document trouvé
//             console.log("Deleting >>>>>: ")
//             for (const acte of acteExistes) {
//                 await minioTools.deleteDocument(acte.id);
//             }
//         }
      
//         let pdfDoc = await db.Document.create({
//             libelle: "Attestation de présence au poste",
//             filename: "Attestation de présence au poste-"+ request.numero + ".pdf",
//             path:  genModule.pathFileLink,
//             typeDocumentId: typeDocument.id,
//             isActe: true,
//             tmp: request.id,
//             isFinal: false
//         }, { transaction });
//         console.log("Document Crée >>>>", pdfDoc.id)
//         if(!pdfDoc) {
//             console.log('OK')
//             return { status: false, message: "Echec de validation" }
//         }
        

//         request.acte_id = pdfDoc.id;
//         request.date_signature = date_signature;

//         await request.save({transaction});

//         await transaction.commit();

//         return res.status(201).json({
//           status: 'success',
//           message: 'Génération éffectuée avec succès.',
//           data: request,
//           acte: process.env.APP_URL + '/api/utils/auth/displayFiles/' + request.acte_id + '?mode=preview'
//         });
//     } catch (error) {
//         if (transaction) await transaction.rollback(); // Rollback on error
//         console.error('Erreur lors de la signature de la demande:', error);
//         return res.status(500).json({
//             status: 'failure',
//             message: 'Une erreur est survenue lors de la signature.',
//         });
//     }
// };


// // Attestation de prise de service
// const createServiceStartCertificateRequest = async (req, res) => {
//     let transaction = null;
//     try {
//         const userId = req.userId;
//         if (!userId) {
//             return res.status(401).json({
//                 status: 'failure',
//                 message: 'Authentifiez-vous.',
//             });
//         }
        
//         transaction = await db.sequelize.transaction(); // Démarrer une nouvelle transaction
//         let numero = await utilsTools.generateUniqueNumero(db.ServiceStartCertificateRequest, "numero", 10);
        
//         const request = await db.ServiceStartCertificateRequest.create({
//             user_id: userId,
//             numero
//         }, { transaction }); // Passer la transaction

//         await transaction.commit(); // Valider la transaction

//         return res.status(201).json({
//             status: 'success',
//             message: 'Demande d\'attestation de prise de service créée avec succès.',
//             data: request,
//         });
//     } catch (error) {
//         if (transaction) await transaction.rollback(); // Annuler la transaction en cas d'erreur
//         console.error('Erreur lors de la création de la demande:', error);
//         return res.status(500).json({
//             status: 'failure',
//             message: 'Une erreur est survenue lors de la création.',
//         });
//     }
// };

// const signPresenceCertificateRequest = async (req, res) => {
//     const { requestId } = req.body;

//     // Check if the user is authenticated
//     const userId = req.userId;
//     if (!userId) {
//         return res.status(401).json({
//             status: 'failure',
//             message: 'Authentifiez vous.',
//         });
//     }

//     let transaction;
//     try {
//         transaction = await db.sequelize.transaction();

//         // Check user role and associated documents
//         const user = await db.User.findByPk(userId, {
//             include: [
//                 {
//                     model: db.Role,
//                     as: 'role',
//                 },
//                 {
//                     model: db.Document,
//                     as: 'documents',
//                     include: {
//                         model: db.TypeDocument,
//                         as: 'typeDocument',
//                         where: {
//                             code: 'signature_professionnelle',
//                         },
//                     },
//                 },
//             ],
//         });

//         // if (!user || user.role.libelle !== 'dc') {
//         //     return res.status(403).json({
//         //         status: 'failure',
//         //         message: 'Vous n\'avez pas les droits nécessaires pour signer cette attestation.',
//         //     });
//         // }


//         // Check if user.documents is defined and is an empty array
//         if (!user.documents || user.documents.length == 0) {
//             return res.status(403).json({
//                 status: 'failure',
//                 message: 'Veuillez mettre à jour votre signature.',
//             });
//         }

//         // Check if the user has a valid signature
//         const userDocument = user.documents.find(doc => doc.typeDocument.code === 'signature_professionnelle');
//         if (!userDocument) {
//             return res.status(404).json({
//                 status: 'failure',
//                 message: 'Signature professionnelle non trouvée.',
//             });
//         }

//         // Store the document ID in a variable
//         const documentId = userDocument.id;

//         // Fetch the presence certificate request
//         const request = await db.PresenceCertificateRequest.findByPk(requestId, {
//             include: [
//                 {
//                   model: db.Statut,
//                   as: 'statutIn',
//                   where: {
//                     code: 'pending'
//                   }
//                 },
//                 {
//                     model: db.User,
//                     as: "agent",
//                     include: [
//                         {
//                             model: db.Corps,
//                             as: 'body',
//                         },
//                         {
//                           model: db.Juridiction,
//                           as: 'juridiction'
//                         },
//                         {
//                           model: db.Entite,
//                           as: 'entite'
//                         },
//                     ],
//                 },
//             ],
//         });

//         if (!request) {
//             return res.status(400).json({
//                 status: 'failure',
//                 message: 'Demande d\'attestation non trouvée.',
//             });
//         }

//          if (!request.statutIn.code != 'pending') {
//             return res.status(400).json({
//                 status: 'failure',
//                 message: 'Demande déjà signée',
//             });
//         }

//         const entityOrJurisdictionLabel = request.agent.entite 
//                                             ? request.agent.entite.label 
//                                             : request.agent.juridiction 
//                                                 ? request.agent.juridiction.label 
//                                                 : ''; // Fallback if neither is filled

//         const date_signature = new Date();
//         let signature = await ImageConvert(documentId);
//         if (!signature) {
//             return res.status(404).json({
//                 status: 'failure',
//                 message: 'Veuillez mettre à jour votre signature.',
//             });
//         }
//         // Prepare parameters for PDF generation
//         request.numero = request.numero || await utilsTools.generateUniqueNumero(db.PresenceCertificateRequest, "numero", 10);
//         const parameters = {
//             numero: request.numero,
//             orgNumero: request.orgNumero, // Assuming orgNumero is part of the request
//             first_name: request.agent.first_name,
//             last_name: request.agent.last_name,
//             corps: request.agent.body.label,
//             grade: request.agent.actual_grade_class,
//             matricule: request.agent.matricule,
//             date_demande: utilsTools.formatDate(request.createdAt), // Assuming createdAt is the date of the request
//             date_signature: utilsTools.formatDate(date_signature),
//             date_of_service: utilsTools.formatDate(request.agent.date_of_service),
//             structure: entityOrJurisdictionLabel,
//             signature: signature,
//             signataire: user.first_name + " " + user.last_name,
//         };


//         // Génération du PDF
//         console.log("Gérération PDF >>>>>>>>")

//         const genModule = await PDF.generatePDF(parameters, transaction, 'attestation_presence_poste', true);
//         console.log("GENMODULE: ", genModule.pathFileLink);
//         transaction = genModule.t
//         console.log('t: ')
//         if (genModule.pathFileLink == null) {
//             throw new Error(`Le fichier PDF n'a pas été créé à l'emplacement`);
//         }
//         console.log("Pdf created Path: ", genModule.pathFileLink);

//         let typeDocument = await db.TypeDocument.findOne({
//             where: {
//                 code: "attestation_presence_poste"
//             }
//         });

//         // console.log("Setting Status >>>>>>>>")
//         // Réservation de la demande
//         let statusvalide = await db.Statut.findOne({ where: { code: 'signed' } }, { transaction });
//         console.log("Status: ", statusvalide.id);
//         await request.setStatutIn(statusvalide, { transaction });
      
//         const acteExistes = await db.Document.findAll({
//             where: {
//                 typeDocumentId: typeDocument.id,
//                 tmp: request.id,
//                 isFinal: false
//             },
//             transaction // Utiliser la transaction ici
//         });

//         console.log("Fit isValid  >>>>>: ", acteExistes);

//         if (acteExistes.length > 0) {
//             // Suppression de chaque document trouvé
//             console.log("Deleting >>>>>: ")
//             for (const acte of acteExistes) {
//                 await minioTools.deleteDocument(acte.id);
//             }
//         }
      
//         let pdfDoc = await db.Document.create({
//             libelle: "Attestation de présence au poste",
//             filename: "Attestation de présence au poste-"+ request.numero + ".pdf",
//             path:  genModule.pathFileLink,
//             typeDocumentId: typeDocument.id,
//             tmp: null,
//             isActe: true,
//             isFinal: true
//         }, { transaction });
//         console.log("Document Crée >>>>", pdfDoc.id)
//         if(!pdfDoc) {
//             console.log('OK')
//             return { status: false, message: "Echec de validation" }
//         }
        

//         request.acte_id = pdfDoc.id;
//         request.date_signature = date_signature;
//         request.signataire_id = request.agent.id;

//         await request.save({transaction});

//         await transaction.commit();

//         return res.status(201).json({
//           status: 'success',
//           message: 'Signature du document éffectué avec succès.',
//           data: request,
//           acte: process.env.APP_URL + '/api/utils/auth/displayFiles/' + request.acte_id + '?mode=preview'
//         });
//     } catch (error) {
//         if (transaction) await transaction.rollback(); // Rollback on error
//         console.error('Erreur lors de la signature de la demande:', error);
//         return res.status(500).json({
//             status: 'failure',
//             message: 'Une erreur est survenue lors de la signature.',
//         });
//     }
// };

    
// const submitMonthlyPerformance = async (req, res) => {
//     const { month, year, performanceData, comment } = req.body;

//     // Validate input
//     if (!month || !year || !performanceData) {
//         return res.status(400).json({
//             status: 'failure',
//             message: 'Tous les champs sont requis.',
//         });
//     }

//     // Check if the user is authenticated
//     const userId = req.userId;
//     if (!userId) {
//         return res.status(401).json({
//             status: 'failure',
//             message: 'Authentifiez vous.',
//         });
//     }

//     let transaction;
//     try {
//         transaction = await db.sequelize.transaction();

//         // Check if a performance record for the user already exists for the given month and year
//         const existingRecord = await db.PerformanceRecord.findOne({
//             where: {
//                 user_id: userId,
//                 month,
//                 year,
//             },
//             transaction,
//         });

//         if (existingRecord) {
//             // Update existing record
//             existingRecord.comment = comment || existingRecord.comment; // Update comment if provided
//             await existingRecord.save({ transaction });
//             await transaction.commit();
//             return res.status(200).json({
//                 status: 'success',
//                 message: 'Vous avez déjà mis à jour vos performances de ce mois.',
//                 data: existingRecord,
//             });
//         } else {
//             // Create a new performance record
//             const newRecord = await db.PerformanceRecord.create({
//                 user_id: userId,
//                 month,
//                 year,
//                 comment,
//             }, { transaction });


//             // Save scores associated with this evaluation within the transaction
//             await Promise.all(performanceData.map(async (score) => {
//               await db.EvaluationScore.create({
//                 performance_score_id: newRecord.id,
//                 score: score.value,
//                 criteria_id: score.criteriaId, // Assuming score has criteriaId
//               }, { transaction });
//             }));

            
//             await transaction.commit();


//             // Create a new performance record
//             const toSendRecord = await db.PerformanceRecord.findOne({
//                 where: {
//                   id: newRecord.id
//                 },
//                 include: [
//                   {
//                     model: db.User,
//                     as: "agent"
//                   },
//                   {
//                     model: db.EvaluationScore,
//                     as: "performances",
//                     include: {
//                       model: db.CriteriaEvaluation,
//                       as: "criteria"
//                     }
//                   }
//                 ]
//             });

//             return res.status(201).json({
//                 status: 'success',
//                 message: 'Performance soumise avec succès.',
//                 data: toSendRecord,
//             });
//         }
//     } catch (error) {
//         if (transaction) await transaction.rollback(); // Rollback on error
//         console.error('Erreur lors de la soumission de la performance:', error);
//         return res.status(500).json({
//             status: 'failure',
//             message: 'Une erreur est survenue lors de la soumission.',
//         });
//     }
// };


// const listPerformances = async (req, res) => {
//     const userId = req.userId;
//     const { page = 1, limit = 10, search = '', year, month, startDate, endDate } = req.query;

//     if (!userId) {
//         return res.status(401).json({
//             status: 'failure',
//             message: 'Authentifiez vous.',
//         });
//     }

//     try {
//         const offset = (page - 1) * limit;

//         // Build where clause for PerformanceRecord
//         const whereClause = {
//             user_id: userId,
//             ...(search && {
//                 [Op.or]: [
//                     { '$agent.first_name$': { [Op.iLike]: `%${search}%` } },
//                     { '$agent.last_name$': { [Op.iLike]: `%${search}%` } },
//                 ]
//             }),
//             ...(year && { year }),
//             ...(month && { month }),
//             ...(startDate && { createdAt: { [Op.gte]: new Date(startDate) } }),
//             ...(endDate && { createdAt: { [Op.lte]: new Date(endDate) } }),
//         };

//         const { count, rows: performances } = await db.PerformanceRecord.findAndCountAll({
//             where: whereClause,
//             include: [
//                 {
//                     model: db.User,
//                     as: "agent"
//                 },
//                 {
//                     model: db.EvaluationScore,
//                     as: "performances",
//                     include: {
//                         model: db.CriteriaEvaluation,
//                         as: "criteria"
//                     }
//                 }
//             ],
//             order: [['year', 'DESC'], ['month', 'DESC']],
//             limit,
//             offset,
//             distinct: true
//         });

//         return res.status(200).json({
//             status: 'success',
//             data: performances,
//             total: count,
//             page: Number(page),
//             totalPages: Math.ceil(count / limit),
//         });
//     } catch (error) {
//         console.error('Erreur lors de la récupération des performances:', error);
//         return res.status(500).json({
//             status: 'failure',
//             message: 'Une erreur est survenue lors de la récupération des performances.',
//         });
//     }
// };


// const listOthersPerformances = async (req, res) => {
//     const userId = req.userId;
//     const requestId = req.params.id;
//     const { page = 1, limit = 10, search = '', year, month, startDate, endDate } = req.query;

//     // Validate input
//     if (!requestId) {
//         return res.status(400).json({
//             status: 'failure',
//             message: 'Paramètres manquants',
//         });
//     }

//     if (!userId) {
//         return res.status(401).json({
//             status: 'failure',
//             message: 'Authentifiez vous.',
//         });
//     }

//     try {
//         const offset = (page - 1) * limit;

//         // Build where clause for PerformanceRecord
//         const whereClause = {
//             id: requestId,
//             ...(search && {
//                 [Op.or]: [
//                     { '$agent.first_name$': { [Op.iLike]: `%${search}%` } },
//                     { '$agent.last_name$': { [Op.iLike]: `%${search}%` } },
//                 ]
//             }),
//             ...(year && { year }),
//             ...(month && { month }),
//             ...(startDate && { createdAt: { [Op.gte]: new Date(startDate) } }),
//             ...(endDate && { createdAt: { [Op.lte]: new Date(endDate) } }),
//         };

//         const performances = await db.PerformanceRecord.findOne({
//             where: whereClause,
//             include: [
//                 {
//                     model: db.User,
//                     as: "agent"
//                 },
//                 {
//                     model: db.EvaluationScore,
//                     as: "performances",
//                     include: {
//                         model: db.CriteriaEvaluation,
//                         as: "criteria"
//                     }
//                 }
//             ],
//             order: [['year', 'DESC'], ['month', 'DESC']]
//         });

//         if (!performances) {
//             return res.status(404).json({
//                 status: 'failure',
//                 message: 'Performances non trouvées.',
//             });
//         }

//         return res.status(200).json({
//             status: 'success',
//             data: performances,
//         });
//     } catch (error) {
//         console.error('Erreur lors de la récupération des performances:', error);
//         return res.status(500).json({
//             status: 'failure',
//             message: 'Une erreur est survenue lors de la récupération des performances.',
//         });
//     }
// };


// const submitCollaboratorEvaluation = async (req, res) => {
//     const { month, year, collaboratorId, comment, performanceData } = req.body;

//     // Validate input
//     if (!month || !year || !collaboratorId || !performanceData) {
//         return res.status(400).json({
//             status: 'failure',
//             message: 'Tous les champs sont requis.',
//         });
//     }

//     const userId = req.userId; // Assuming userId comes from authentication middleware
//     if (!userId) {
//         return res.status(401).json({
//             status: 'failure',
//             message: 'Authentifiez vous.',
//         });
//     }

//     let transaction;
//     try {
//         transaction = await db.sequelize.transaction();

//         // Create a new collaborator evaluation record
//         const newEvaluation = await db.CollaboratorEvaluation.create({
//             user_id: userId,
//             collaborator_id: collaboratorId,
//             month,
//             year,
//             comment,
//         }, { transaction });

//         // Save scores associated with this evaluation
//         await Promise.all(performanceData.map(async (score) => {
//             await db.EvaluationScore.create({
//                 collaborator_score_id: newEvaluation.id,
//                 score: score.value,
//                 criteria_id: score.criteriaId,
//             }, { transaction });
//         }));

//         await transaction.commit();

//         // Retrieve and send the newly created evaluation
//         const toSendEvaluation = await db.CollaboratorEvaluation.findOne({
//             where: { id: newEvaluation.id },
//             include: [
//                 { model: db.User, as: 'agent' },
//                 { model: db.User, as: 'collaborator' },
//                 {
//                     model: db.EvaluationScore,
//                     as: 'collaborator_scores',
//                     include: { model: db.CriteriaEvaluation, as: 'criteria' }
//                 }
//             ]
//         });

//         return res.status(201).json({
//             status: 'success',
//             message: 'Évaluation du collaborateur soumise avec succès.',
//             data: toSendEvaluation,
//         });
//     } catch (error) {
//         if (transaction) await transaction.rollback();
//         console.error('Erreur lors de la soumission de l\'évaluation du collaborateur:', error);
//         return res.status(500).json({
//             status: 'failure',
//             message: 'Une erreur est survenue lors de la soumission.',
//         });
//     }
// };


// const listCollaboratorEvaluations = async (req, res) => {
//     const userId = req.userId; // Assuming userId comes from authentication middleware
//     const { page = 1, limit = 10, search = '', year, month, startDate, endDate } = req.query;

//     if (!userId) {
//         return res.status(401).json({
//             status: 'failure',
//             message: 'Authentifiez vous.',
//         });
//     }

//     try {
//         const offset = (page - 1) * limit;

//         // Build where clause for CollaboratorEvaluation
//         const whereClause = {
//             user_id: userId,
//             ...(search && {
//                 [Op.or]: [
//                     { '$agent.first_name$': { [Op.iLike]: `%${search}%` } },
//                     { '$agent.last_name$': { [Op.iLike]: `%${search}%` } },
//                     { '$collaborator.first_name$': { [Op.iLike]: `%${search}%` } },
//                     { '$collaborator.last_name$': { [Op.iLike]: `%${search}%` } },
//                 ]
//             }),
//             ...(year && { year }),
//             ...(month && { month }),
//             ...(startDate && { createdAt: { [Op.gte]: new Date(startDate) } }),
//             ...(endDate && { createdAt: { [Op.lte]: new Date(endDate) } }),
//         };

//         const { count, rows: evaluations } = await db.CollaboratorEvaluation.findAndCountAll({
//             where: whereClause,
//             include: [
//                 { model: db.User, as: 'agent' },
//                 { model: db.User, as: 'collaborator' },
//                 {
//                     model: db.EvaluationScore,
//                     as: 'collaborator_scores',
//                     include: { model: db.CriteriaEvaluation, as: 'criteria' }
//                 }
//             ],
//             order: [['year', 'DESC'], ['month', 'DESC']],
//             limit,
//             offset,
//         });

//         return res.status(200).json({
//             status: 'success',
//             data: evaluations,
//             total: count,
//             page: Number(page),
//             totalPages: Math.ceil(count / limit),
//         });
//     } catch (error) {
//         console.error('Erreur lors de la récupération des évaluations des collaborateurs:', error);
//         return res.status(500).json({
//             status: 'failure',
//             message: 'Une erreur est survenue lors de la récupération.',
//         });
//     }
// };


// const listOthersCollaboratorEvaluations = async (req, res) => {
//     const userId = req.userId;

//     const requestId = req.params.id;
//     // Validate input
//     if (!requestId) {
//         return res.status(400).json({
//             status: 'failure',
//             message: 'Paramètres manquants',
//         });
//     }

//     if (!userId) {
//         return res.status(401).json({
//             status: 'failure',
//             message: 'Authentifiez vous.',
//         });
//     }

//     const { page = 1, limit = 10, search = '', year, month, startDate, endDate } = req.query;

//     try {
//         const offset = (page - 1) * limit;

//         // Build where clause for CollaboratorEvaluation
//         const whereClause = {
//             user_id: userId,
//             ...(search && {
//                 [Op.or]: [
//                     { '$agent.first_name$': { [Op.iLike]: `%${search}%` } },
//                     { '$agent.last_name$': { [Op.iLike]: `%${search}%` } },
//                     { '$collaborator.first_name$': { [Op.iLike]: `%${search}%` } },
//                     { '$collaborator.last_name$': { [Op.iLike]: `%${search}%` } },
//                 ]
//             }),
//             ...(year && { year }),
//             ...(month && { month }),
//             ...(startDate && { createdAt: { [Op.gte]: new Date(startDate) } }),
//             ...(endDate && { createdAt: { [Op.lte]: new Date(endDate) } }),
//         };

//         const { count, rows: evaluations } = await db.CollaboratorEvaluation.findAndCountAll({
//             where: whereClause,
//             include: [
//                 { model: db.User, as: 'agent' },
//                 { model: db.User, as: 'collaborator' },
//                 {
//                     model: db.EvaluationScore,
//                     as: 'collaborator_scores',
//                     include: { model: db.CriteriaEvaluation, as: 'criteria' }
//                 }
//             ],
//             order: [['year', 'DESC'], ['month', 'DESC']],
//             limit,
//             offset,
//         });

//         return res.status(200).json({
//             status: 'success',
//             data: evaluations,
//             total: count,
//             page: Number(page),
//             totalPages: Math.ceil(count / limit),
//         });
//     } catch (error) {
//         console.error('Erreur lors de la récupération des évaluations des collaborateurs:', error);
//         return res.status(500).json({
//             status: 'failure',
//             message: 'Une erreur est survenue lors de la récupération.',
//         });
//     }
// };


// module.exports = {
//     getOneUser,
//     getOneProfile,
//     getAllUsers,  
//     updateUserInfo,
//     updateSignature,
//     submitEvaluation,
//     declareSuperior,
//     submitBulletin,
//     validationDeclaration,
//     getBulletinDetails,
//     transfererEvaluation,
//     genererBulletin,
//     signerBulletin,
//     createPresenceCertificateRequest,
//     getPresenceCertificateRequests,
//     generatePresenceCertificateRequest,
//     signPresenceCertificateRequest,
//     submitMonthlyPerformance,
//     listPerformances,
//     listOthersPerformances,
//     submitCollaboratorEvaluation,
//     listCollaboratorEvaluations,
//     listOthersCollaboratorEvaluations,
//     getBulletins,
//     getBulletinsForSuperior,
//     createServiceStartCertificateRequest
// }
