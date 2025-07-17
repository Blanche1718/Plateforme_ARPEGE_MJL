const db = require('../../models/index');
const typepermissions = require('../seedersEnum/typePermissionEnum'); // Assurez-vous que le chemin est correct

async function seedTypePermissions() {
  try {
    for (const permission of typepermissions) {
      console.log("Permission", permission);
      const [existingPermission, created] = await db.TypePermission.findOrCreate({
        where: { code: permission.code }, // Utiliser 'code' pour la recherche
        defaults: {
          label: permission.label, // Assurez-vous que 'label' est utilisé
          code: permission.code,
          ressource: permission.ressource
        },
      });

      if (created) {
        console.log(`Permission ${permission.label} créée avec succès.`);
      } else {
        // Vérifier si les autres valeurs diffèrent
        let needsUpdate = false;
        for (const key in permission) {
          if (key !== 'code' && existingPermission[key] !== permission[key]) {
            needsUpdate = true;
            break;
          }
        }

        if (needsUpdate) {
          await existingPermission.update(permission);
          console.log(`Permission ${permission.label} mise à jour.`);
        } else {
          console.log(`La permission ${permission.label} existe déjà avec les mêmes valeurs.`);
        }
      }
    }


    console.log('Seeding des types de permissions terminé.');
  } catch (error) {
    console.error('Erreur lors du seeding des types de permissions:', error);
  }
}

module.exports = seedTypePermissions;