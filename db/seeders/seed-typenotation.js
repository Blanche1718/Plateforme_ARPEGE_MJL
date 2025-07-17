const db = require('../../models/index');
const typenotations = require('../seedersEnum/typeNotationEnum'); // Assurez-vous que le chemin est correct

async function seedTypeNotations() {
  try {
    for (const notation of typenotations) {
      const [existingNotation, created] = await db.TypeNotation.findOrCreate({
        where: { code: notation.code }, // Utiliser 'code' pour la recherche
        defaults: {
          label: notation.label, // Utiliser le libellé adapté
          code: notation.code,
        },
      });

      if (created) {
        console.log(`Notation ${notation.label} créée avec succès.`);
      } else {
        // Vérifier si d'autres valeurs diffèrent
        let needsUpdate = false;
        for (const key in notation) {
          if (key !== 'code' && existingNotation[key] !== notation[key]) {
            needsUpdate = true;
            break;
          }
        }

        if (needsUpdate) {
          await existingNotation.update({  notation });
          console.log(`Notation ${notation.label} mise à jour.`);
        } else {
          console.log(`La notation ${notation.label} existe déjà avec les mêmes valeurs.`);
        }
      }
    }

    console.log('Seeding des types de notations terminé.');
  } catch (error) {
    console.error('Erreur lors du seeding des types de notations:', error);
  }
}


module.exports = seedTypeNotations;