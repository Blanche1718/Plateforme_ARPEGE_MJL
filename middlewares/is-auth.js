// middlewares/auth.js
const AuthService = require('../helpers/auth');

const isAuth = async (req, res, next) => {
  const result = await AuthService.authenticate(req, [
    'admin',
    'gs', // Garde des seaux
    'rh',
    'dc', // Garde des seaux
    'dspj', // DSPJ
    'ressources_humaines', // Ressources humaines
    'sgm', // Sécrétaire Général
    'directeur', // Directeur
    'procureur', // Procureur
    'president_tribunal', // Président du tribunal
    'gec', // Greffier en chef
    'juge_instruction', // Juge d'instruction
    'agent_simple', // Simple agent du tribunal
    'agent_parquet', // Agent au parquet
    'agent_greffe', // Agent greffe
    'agent_presidence', // Agent à la présidence
    "super_admin"
  ]);
  if (result.status === 200) {
    return next();
  }
  return res.status(result.status).json({
    status: 'failure',
    message: result.message || 'Veuillez vous authentifier.',
    statusCode: result.status,
  });
};


const isSuperAdmin = async (req, res, next) => {
  const result = await AuthService.authenticate(req, ['super_admin']);
  if (result.status === 200) {
    return next();
  }
  return res.status(result.status).json({
    status: 'failure',
    message: result.message || 'Veuillez vous authentifier en tant que super admin.',
    statusCode: result.status,
  });
};

const isAdmin = async (req, res, next) => {
  const result = await AuthService.authenticate(req, ['admin', 'dspj', 'ressources_humaines']);
  if (result.status === 200) {
    return next();
  }
  return res.status(result.status).json({
    status: 'failure',
    message: result.message || 'Veuillez vous authentifier en tant qu\'admin.',
    statusCode: result.status,
  });
};

const isMagistrat = async (req, res, next) => {
  const result = await AuthService.authenticate(req, ['dspj', 'juge_instruction', 'president_tribunal', 'procureur']);
  if (result.status === 200) {
    return next();
  }
  return res.status(result.status).json({
    status: 'failure',
    message: result.message || 'Veuillez vous authentifier en tant que Magistrat.',
    statusCode: result.status,
  });
};

const isGreffier = async (req, res, next) => {
  const result = await AuthService.authenticate(req, ['gec']);
  if (result.status === 200) {
    return next();
  }
  return res.status(result.status).json({
    status: 'failure',
    message: result.message || 'Veuillez vous authentifier en tant que Greffier.',
    statusCode: result.status,
  });
};

const isSGM = async (req, res, next) => {
  const result = await AuthService.authenticate(req, ['sgm']);
  if (result.status === 200) {
    return next();
  }
  return res.status(result.status).json({
    status: 'failure',
    message: result.message || 'Veuillez vous authentifier en tant que Secrétaire.',
    statusCode: result.status,
  });
};


const isDc = async (req, res, next) => {
  const result = await AuthService.authenticate(req, ['dc', 'super_admin']);
  if (result.status === 200) {
    return next();
  }
  return res.status(result.status).json({
    status: 'failure',
    message: result.message || 'Veuillez vous authentifier en tant que Secrétaire.',
    statusCode: result.status,
  });
};


const isDcGS = async (req, res, next) => {
  const result = await AuthService.authenticate(req, ['dc','gs', 'super_admin']);
  if (result.status === 200) {
    return next();
  }
  return res.status(result.status).json({
    status: 'failure',
    message: result.message || 'Veuillez vous authentifier en tant que Secrétaire.',
    statusCode: result.status,
  });
};

const isManager = async (req, res, next) => {
  const result = await AuthService.authenticate(req, ['dpaf','dspj', 'dc']);
  if (result.status === 200) {
    return next();
  }
  return res.status(result.status).json({
    status: 'failure',
    message: result.message || 'Veuillez vous authentifier en tant que Secrétaire.',
    statusCode: result.status,
  });
};

const isService = async (req, res, next) => {
  const result = await AuthService.authenticate(req, ['dpaf','dspj', 'dc']);
  if (result.status === 200) {
    return next();
  }
  return res.status(result.status).json({
    status: 'failure',
    message: result.message || 'Veuillez vous authentifier en tant que Secrétaire.',
    statusCode: result.status,
  });
};

const isAttache = async (req, res, next) => {
  const result = await AuthService.authenticate(req, ['attach-serjud']);
  if (result.status === 200) {
    return next();
  }
  return res.status(result.status).json({
    status: 'failure',
    message: result.message || 'Veuillez vous authentifier en tant qu\'Attaché.',
    statusCode: result.status,
  });
};

const isAPI = async (req, res, next) => {
  const result = await AuthService.authenticate(req, ['api']);
  if (result.status === 200) {
    return next();
  }
  return res.status(result.status).json({
    status: 'failure',
    message: result.message || 'Veuillez vous authentifier pour l\'API.',
    statusCode: result.status,
  });
};

// Middleware pour Procureur
const isProcureur = async (req, res, next) => {
  const result = await AuthService.authenticate(req, ['procureur']);
  if (result.status === 200) {
    return next();
  }
  return res.status(result.status).json({
    status: 'failure',
    message: result.message || 'Veuillez vous authentifier en tant que Procureur.',
    statusCode: result.status,
  });
};

// Middleware pour Président du tribunal
const isPresident = async (req, res, next) => {
  const result = await AuthService.authenticate(req, ['president_tribunal']);
  if (result.status === 200) {
    return next();
  }
  return res.status(result.status).json({
    status: 'failure',
    message: result.message || 'Veuillez vous authentifier en tant que Président du tribunal.',
    statusCode: result.status,
  });
};

const checkUserOwnership = (req, res, next) => {
  const userId = req.params.id;
  const authenticatedUserId = req.userId;

  if (userId !== authenticatedUserId) {
    return res.status(403).json({ message: 'Vous ne pouvez pas accéder à cette ressource' });
  }
  next();
};

module.exports = {
  isAuth,
  isSuperAdmin,
  isAdmin,
  isMagistrat,
  isGreffier,
  isSGM,
  isAttache,
  isAPI,
  isProcureur,
  isPresident,
  checkUserOwnership,
  isDc,
  isDcGS,
  isManager,
  isService
};