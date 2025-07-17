const db = require('../../models/index');
const typeDocuments = require('../seedersEnum/typeDocumentEnum'); // Importer la liste des types de documents

async function seedTypeDocuments() {
  try {
    for (const typeDocument of typeDocuments) {
      const [existingType, created] = await db.TypeDocument.findOrCreate({
        where: { code: typeDocument.code },
        defaults: typeDocument,
      });

      if (created) {
        console.log(`Type Document ${typeDocument.libelle} créé avec succès.`);
      } else {
        // Vérifier si les autres valeurs diffèrent
        let needsUpdate = false;
        for (const key in typeDocument) {
          if (key !== 'code' && existingType[key] !== typeDocument[key]) {
            needsUpdate = true;
            break;
          }
        }

        if (needsUpdate) {
          await existingType.update(typeDocument);
          console.log(`Type Document ${typeDocument.libelle} mis à jour.`);
        } else {
          console.log(`Le type document ${typeDocument.libelle} existe déjà avec les mêmes valeurs.`);
        }
      }
    }

    console.log('Seeding des types de documents terminé.');
  } catch (error) {
    console.error('Erreur lors du seeding des types de documents :', error);
  }
}

module.exports = seedTypeDocuments;