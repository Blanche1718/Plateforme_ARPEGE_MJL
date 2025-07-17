const db = require('../../models/index');
const roles = require('../seedersEnum/roleEnum'); // Importer la liste des rôles

async function seedRoles() {
  try {
    for (const role of roles) {
      const defaults = { ...role };

      // Si 'parent' existe, trouver le parent et ajouter parent_id
      if (role.parent) {
        const parentRole = await db.Role.findOne({ where: { code: role.parent } });
        defaults.parent_id = parentRole ? parentRole.id : null; // Définir parent_id si le parent existe
      }

      const [existingRole, created] = await db.Role.findOrCreate({
        where: { code: role.code },
        defaults,
      });

      if (created) {
        console.log(`Rôle ${role.label} créé avec succès.`);
      } else {
        // Vérifier si les autres valeurs diffèrent
        let needsUpdate = false;
        for (const key in role) {
          if (key !== 'code' && existingRole[key] !== role[key]) {
            needsUpdate = true;
            break;
          }
        }

        if (needsUpdate) {
          await existingRole.update(defaults);
          console.log(`Rôle ${role.label} mis à jour.`);
        } else {
          console.log(`Le rôle ${role.label} existe déjà avec les mêmes valeurs.`);
        }
      }
    }

    console.log('Seeding des rôles terminé.');
  } catch (error) {
    console.error('Erreur lors du seeding des rôles:', error);
  }
}

module.exports = seedRoles;