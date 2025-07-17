const db = require('../../models/index');
const juridictions = require('../seedersEnum/juridictionEnum'); // Chemin vers votre fichier de juridictions

async function seedJuridictions() {
  try {
    for (const juris of juridictions) {
      const [existingJuris, created] = await db.Juridiction.findOrCreate({
        where: { code: juris.code },
        defaults: juris,
      });

      if (created) {
        console.log(`Juridiction ${juris.label} créée avec succès.`);
      } else {
        // Vérifier si les autres valeurs diffèrent
        let needsUpdate = false;
        for (const key in juris) {
          if (key !== 'code' && existingJuris[key] !== juris[key]) {
            needsUpdate = true;
            break;
          }
        }

        if (needsUpdate) {
          await existingJuris.update(juris);
          console.log(`Juridiction ${juris.label} mise à jour.`);
        } else {
          console.log(`La juridiction ${juris.label} existe déjà avec les mêmes valeurs.`);
        }
      }
    }

    console.log('Seeding des juridictions terminé.');
  } catch (error) {
    console.error('Erreur lors du seeding des juridictions:', error);
  }
}

module.exports = seedJuridictions;