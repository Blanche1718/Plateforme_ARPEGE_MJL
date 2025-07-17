'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);

const db = {};

// Configuration de base (nœud d'écriture)
const baseConfig = {
  dialect: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 5432,
  pool: {
    max: 5,
    min: 0,
    acquire: 100000,
    idle: 100000,
  },
};

// Configuration avec réplication (utilisée si NODE_DUPLICATION=1)
const replicationConfig = {
  dialect: 'postgres',
  replication: {
    write: {
      host: process.env.DB_HOST,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT || 5432,
    },
    read: [
      {
        host: process.env.DB_READ1_HOST,
        username: process.env.DB_READ1_USER,
        password: process.env.DB_READ1_PASSWORD,
        database: process.env.DB_READ1_NAME,
        port: process.env.DB_READ1_PORT || 5432,
      },
      {
        host: process.env.DB_READ2_HOST,
        username: process.env.DB_READ2_USER,
        password: process.env.DB_READ2_PASSWORD,
        database: process.env.DB_READ2_NAME,
        port: process.env.DB_READ2_PORT || 5432,
      },
    ],
  },
  pool: {
    max: 5,
    min: 0,
    acquire: 100000,
    idle: 100000,
  },
};

// Choisir la configuration en fonction de NODE_DUPLICATION
const config = process.env.NODE_DUPLICATION === '1' ? replicationConfig : baseConfig;

// Logs pour déboguer
// console.log('NODE_DUPLICATION:', process.env.NODE_DUPLICATION);
// console.log('Configuration choisie:', process.env.NODE_DUPLICATION === '1' ? 'Réplication' : 'Sans réplication');
// console.log('DB_WRITE_HOST:', process.env.DB_HOST);
// console.log('DB_WRITE_USER:', process.env.DB_USER);
// console.log('DB_WRITE_PASSWORD:', process.env.DB_PASSWORD);
// console.log('DB_WRITE_NAME:', process.env.DB_NAME);
// console.log('DB_WRITE_PORT:', process.env.DB_PORT);

// if (process.env.NODE_DUPLICATION === '1') {
//   console.log('DB_READ1_HOST:', process.env.DB_READ1_HOST);
//   console.log('DB_READ1_USER:', process.env.DB_READ1_USER);
//   console.log('DB_READ1_PASSWORD:', process.env.DB_READ1_PASSWORD);
//   console.log('DB_READ1_NAME:', process.env.DB_READ1_NAME);
//   console.log('DB_READ1_PORT:', process.env.DB_READ1_PORT);
//   console.log('DB_READ2_HOST:', process.env.DB_READ2_HOST);
//   console.log('DB_READ2_USER:', process.env.DB_READ2_USER);
//   console.log('DB_READ2_PASSWORD:', process.env.DB_READ2_PASSWORD);
//   console.log('DB_READ2_NAME:', process.env.DB_READ2_NAME);
//   console.log('DB_READ2_PORT:', process.env.DB_READ2_PORT);
// }

console.log('Config:', config);

// Initialisation de Sequelize
const sequelize = new Sequelize({
  dialect: config.dialect,
  pool: config.pool,
  retry: {
    match: [/ECONNREFUSED/],
    max: 1,
  },
  ...(config.replication ? { replication: config.replication } : {
    host: config.host,
    username: config.username,
    password: config.password,
    database: config.database,
    port: config.port,
  }),
});

// Charger les modèles
fs.readdirSync(__dirname)
  .filter(file => {
    return file.indexOf('.') !== 0 && file !== basename && file.slice(-3) === '.js';
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes);
    db[model.name] = model;
  });

// Configurer les associations
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;