'use strict';

const db = require('../../models/index');
const criteria = require('../seedersEnum/criteriaEnum'); // Importer la liste des critères

async function seedCriteria() {
  try {
    for (const criterion of criteria) {
      const defaults = { ...criterion };

      const [existingCriterion, created] = await db.CriteriaEvaluation.findOrCreate({
        where: { code: criterion.code },
        defaults,
      });

      if (created) {
        console.log(`Critère ${criterion.label} créé avec succès.`);
      } else {
        // Vérifier si les autres valeurs diffèrent
        let needsUpdate = false;
        for (const key in criterion) {
          if (key !== 'code' && existingCriterion[key] !== criterion[key]) {
            needsUpdate = true;
            break;
          }
        }

        if (needsUpdate) {
          await existingCriterion.update(defaults);
          console.log(`Critère ${criterion.label} mis à jour.`);
        } else {
          console.log(`Le critère ${criterion.label} existe déjà avec les mêmes valeurs.`);
        }
      }
    }

    console.log('Seeding des critères terminé.');
  } catch (error) {
    console.error('Erreur lors du seeding des critères:', error);
  }
}

module.exports = seedCriteria;