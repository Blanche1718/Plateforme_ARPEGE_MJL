const { body } = require('express-validator');

const validateBulletin =  [
  body('year')
    .isInt()
    .withMessage(`L'année doit être un nombre valide.`),
  body('evaluator_id')
    .isUUID()
    .withMessage('L\'ID de l\'évaluateur doit être un identifiant valide.'),
];


const validateEvaluation = [
 
  body('bulletinId')
    .isUUID()
    .withMessage('L\'ID du bulletin doit être un identifiant valide.'),
  
  body('evaluatorId')
    .isUUID()
    .withMessage('L\'ID de l\'évaluateur doit être un identifiant valide.'),
  
  body('scores')
    .isArray({ min: 1 })
    .withMessage('Les scores doivent être un tableau contenant au moins un score.'),
  
  body('scores.*.value')
    .isInt({ min: 0, max: 20 })
    .withMessage('Chaque score doit être un nombre entre 0 et 20.'),
  
  body('scores.*.criteriaId')
    .isInt()
    .withMessage('Chaque ID de critère doit être un identifiant valide.'),
  
  body('comment')
    .optional()
    .isString()
    .trim()
    .withMessage('Le commentaire doit être une chaîne de caractères.'),
];


const validateTransfertEvaluation = [
 
  body('bulletinId')
    .isUUID()
    .withMessage('L\'ID du bulletin doit être un identifiant valide.'),
  
  body('evaluatorId')
    .isUUID()
    .withMessage('L\'ID de l\'évaluateur suivant doit être un identifiant valide.'),
  
  body('comment')
    .optional()
    .isString()
    .trim()
    .withMessage('Le commentaire doit être une chaîne de caractères.'),
];


const genererEvaluation = [
  body('bulletinId')
    .isUUID()
    .withMessage('L\'ID du bulletin doit être un identifiant valide.'),
];
module.exports = {
  validateBulletin,
  validateEvaluation,
  validateTransfertEvaluation,
  genererEvaluation
};