const db = require('../../models/index');
const corps = require('../seedersEnum/corpsEnum'); // Importer la liste des rôles

async function seedCorps() {
  try {
    for (const corp of corps) {
      const [existingCorp, created] = await db.Corps.findOrCreate({
        where: { code: corp.code },
        defaults: corp,
      });

      if (created) {
        console.log(`Corps ${corp.libelle} créé avec succès.`);
      } else {
        // Vérifier si les autres valeurs diffèrent
        let needsUpdate = false;
        for (const key in corp) {
          if (key !== 'code' && existingCorp[key] !== corp[key]) {
            needsUpdate = true;
            break;
          }
        }

        if (needsUpdate) {
          await existingCorp.update(corp);
          console.log(`Corps ${corp.libelle} mis à jour.`);
        } else {
          console.log(`Le corps ${corp.libelle} existe déjà avec les mêmes valeurs.`);
        }
      }
    }

    console.log('Seeding des corps terminé.');
  } catch (error) {
    console.error('Erreur lors du seeding des corps:', error);
  }
}

module.exports = seedCorps;