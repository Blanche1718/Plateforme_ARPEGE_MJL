const db = require('../../models/index');
const entites = require('../seedersEnum/entiteEnum'); // Importer la liste des entités

async function seedEntites() {
  try {
    for (const entite of entites) {
      const [existingEntite, created] = await db.Entite.findOrCreate({
        where: { code: entite.code },
        defaults: entite,
      });

      if (created) {
        console.log(`Entité ${entite.libelle} créée avec succès.`);
      } else {
        // Vérifier si les autres valeurs diffèrent
        let needsUpdate = false;
        for (const key in entite) {
          if (key !== 'code' && existingEntite[key] !== entite[key]) {
            needsUpdate = true;
            break;
          }
        }

        if (needsUpdate) {
          await existingEntite.update(entite);
          console.log(`Entité ${entite.libelle} mise à jour.`);
        } else {
          console.log(`L'entité ${entite.libelle} existe déjà avec les mêmes valeurs.`);
        }
      }
    }

    console.log('Seeding des entités terminé.');
  } catch (error) {
    console.error('Erreur lors du seeding des entités:', error);
  }
}

module.exports = seedEntites;