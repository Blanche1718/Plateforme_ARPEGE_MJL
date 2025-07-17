const bcrypt = require('bcrypt');
const db = require('../../models/index');
const users = require('../seedersEnum/userEnum'); // Importer la liste des utilisateurs

async function seedUsers() {
    try {
        for (const user of users) {
            // Hachage du mot de passe avant de créer ou mettre à jour l'utilisateur
            if (user.password) {
                const saltPass = await bcrypt.genSalt(12);
                user.password = await bcrypt.hash(user.password, saltPass);
            }

            // Chercher le rôle correspondant au code
            const role = await db.Role.findOne({ where: { code: user.role } });
            if (role) {
                user.role_id = role.id; // Ajouter le role_id à l'utilisateur
            } else {
                console.log(`Rôle ${user.role} non trouvé pour l'utilisateur ${user.email}.`);
                continue; // Passer à l'utilisateur suivant si le rôle n'est pas trouvé
            }
   
            // Chercher la juridiction correspondant au code
            if(user.juridiction){
              const juridiction = await db.Juridiction.findOne({ where: { code: user.juridiction } });
              if (juridiction) {
                  user.juridiction_id = juridiction.id; // Ajouter le juridiction_id à l'utilisateur
              } else {
                  console.log(`Juridiction ${user} non trouvée pour l'utilisateur ${user.email}.`);
                  continue; // Passer à l'utilisateur suivant si la juridiction n'est pas trouvée
              }
            }

            // Chercher la juridiction correspondant au code
            if(user.entite){
              const entite = await db.Entite.findOne({ where: { code: user.entite } });
              if (entite) {
                  user.entite_id = entite.id; // Ajouter le juridiction_id à l'utilisateur
              } else {
                  console.log(`Entite ${user} non trouvée pour l'utilisateur ${user.email}.`);
                  continue; // Passer à l'utilisateur suivant si la juridiction n'est pas trouvée
              }
            }

            const [existingUser, created] = await db.User.findOrCreate({
                where: { email: user.email },
                defaults: user,
            });

            if (created) {
                console.log(`User ${user.email} créé avec succès.`);
            } else {
                // Vérifier si les autres valeurs diffèrent
                let needsUpdate = false;
                for (const key in user) {
                    if (key !== 'email' && existingUser[key] !== user[key]) {
                        needsUpdate = true;
                        break;
                    }
                }

                if (needsUpdate) {
                    await existingUser.update(user);
                    console.log(`User ${user.email} mis à jour.`);
                } else {
                    console.log(`Le user ${user.email} existe déjà avec les mêmes valeurs.`);
                }
            }
        }

        console.log('Seeding des users terminé.');
    } catch (error) {
        console.error('Erreur lors du seeding des users:', error);
    }
}

module.exports = seedUsers;