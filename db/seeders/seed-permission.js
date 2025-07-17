const db = require('../../models/index');
const permissions = require('../seedersEnum/permissionEnum'); // Assurez-vous que le chemin est correct

async function seedPermissions() {
  try {
    for (const permission of permissions) {
      console.log("Rôle:", permission.role);
      console.log("Permission:", permission.code);

      // Récupérer l'ID du rôle
      const role = await db.Role.findOne({ where: { code: permission.role } });

      if (!role) {
        throw new Error(`Rôle ${permission.role} non trouvé.`);
      }

      // Récupérer l'ID de la permission
      const permissionType = await db.TypePermission.findOne({ where: { code: permission.code } });
      if (!permissionType) {
        throw new Error(`Permission ${permission.code} non trouvée.`);
      }

      console.log("Rôle et permission trouvées:", role, permissionType);

      const [existingPermission, created] = await db.Permission.findOrCreate({
        where: {
          role_id: role.id,
          type_permission_id: permissionType.id,
        },
        defaults: {
          role_id: role.id,
          type_permission_id: permissionType.id,
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
    console.error('Erreur lors du seeding des permissions:', error.message);
  }
}

module.exports = seedPermissions;