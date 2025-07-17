const db = require("../models/index");
const seedRoles = require('./seeders/seed-roles');
const seedCorps = require('./seeders/seed-corps');
const seedStatus = require('./seeders/seed-status');
const seedTypeDoc = require('./seeders/seed-type-documents');
const seedUsers = require('./seeders/seed-users');
const seedJuridiction = require('./seeders/seed-juridiction');
const seedEntites = require('./seeders/seed-entite');
const seedCriteria = require('./seeders/seed-criteria');
const seedTypePermissions = require('./seeders/seed-typepermission');
const seedTypeNotations = require('./seeders/seed-typenotation');
const seedPermissions = require('./seeders/seed-permission');

async function runSeed() {
  console.log('Démarrage du seeding...');
  try {
    await db.sequelize.sync({logging: console.log, alter: true  });
    await db.sequelize.query('CREATE EXTENSION IF NOT EXISTS pg_trgm;');
    await seedRoles();
    await seedEntites();
    await seedCorps();
    await seedStatus();
    await seedTypeDoc();
    await seedJuridiction();
    // await seedCriteria(); // Spécifique à la notation
    await seedUsers();
    await  seedTypePermissions();
    // await seedTypeNotations(); // Spécifique à la notation
    await seedPermissions();
    console.log('Seeding terminé.');
    // process.exit(0);
  } catch (error) {
    console.error('Erreur lors de l\'exécution du seeder:', error);
    // process.exit(1);
  }
}

runSeed();


module.exports = runSeed;