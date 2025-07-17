const db = require('../../models/index');
const statuts = require('../seedersEnum/statutEnum'); // Importer la liste des statuts

async function seedStatuts() {
  try {
    for (const statut of statuts) {
      const [existingStatut, created] = await db.Statut.findOrCreate({
        where: { code: statut.code },
        defaults: statut,
      });

      if (created) {
        console.log(`Statut ${statut.libelle} créé avec succès.`);
      } else {
        // Vérifier si les autres valeurs diffèrent
        let needsUpdate = false;
        for (const key in statut) {
          if (key !== 'code' && existingStatut[key] !== statut[key]) {
            needsUpdate = true;
            break;
          }
        }

        if (needsUpdate) {
          await existingStatut.update(statut);
          console.log(`Statut ${statut.libelle} mis à jour.`);
        } else {
          console.log(`Le statut ${statut.libelle} existe déjà avec les mêmes valeurs.`);
        }
      }
    }

    console.log('Seeding des statuts terminé.');
  } catch (error) {
    console.error('Erreur lors du seeding des statuts:', error);
  }
}

module.exports = seedStatuts;