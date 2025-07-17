# Utilisation du Module `emailService`

Ce document fournit des exemples d'utilisation du module `emailService` pour envoyer des emails dans une application Node.js. Le module utilise Nodemailer pour l'envoi d'emails, Handlebars pour les modèles d'email, et une configuration externe pour les templates (`emailTemplates.js`).

## Prérequis

- **Dépendances** : Assurez-vous que les packages suivants sont installés :
  ```bash
  npm install nodemailer handlebars @dotenvx/dotenvx
  ```
- **Structure du projet** :
  ```
  project/
  ├── assets/
  │   └── instructions.pdf
  ├── config/
  │   └── emailTemplates.js
  ├── helpers/
  │   └── template/
  │       └── mail/
  │           ├── register.ejs
  │           ├── sendOtpCode.ejs
  │           ├── demandeSoumise.ejs
  │           └── ...
  ├── emailService.js
  ├── app.js
  └── .env
  ```
- **Configuration** : Configurez un fichier `.env` avec les variables suivantes :
  ```
  MAIL_HOST=smtp.example.com
  MAIL_PORT=587
  MAIL_USERNAME=votre-email@example.com
  MAIL_PASSWORD=votre-mot-de-passe
  MAIL_FROM_NAME=Votre Application
  MAIL_FROM_ADDRESS=votre-email@example.com
  MAIL_REPLYTO=support@example.com
  ```

## Exemples d'Utilisation

Le code suivant, extrait de `app.js`, montre comment utiliser `emailService` pour envoyer différents types d'emails : un email d'inscription, un code OTP avec pièce jointe, et une confirmation de demande soumise.

```javascript
const emailService = require('./emailService');

// Exemple 1 : Envoi d'un email d'inscription
async function sendRegistrationEmail() {
    try {
        const result = await emailService.sendMail({
            to: 'utilisateur@example.com',
            type: 'register',
            parameters: {
                name: 'Jean Dupont',
                verificationLink: 'https://example.com/verify?token=abc123'
            }
        });

        if (result.success) {
            console.log(`Email d'inscription envoyé avec succès : ${result.messageId}`);
        } else {
            console.error(`Échec de l'envoi de l'email : ${result.message}`);
        }
    } catch (error) {
        console.error(`Erreur inattendue : ${error.message}`);
    }
}

// Exemple 2 : Envoi d'un code OTP avec une pièce jointe
async function sendOtpEmail() {
    try {
        const result = await emailService.sendMail({
            to: 'utilisateur@example.com',
            type: 'sendOtpCode',
            parameters: {
                otpCode: '123456',
                expiryTime: '5 minutes'
            },
            attachments: [
                {
                    filename: 'instructions.pdf',
                    path: './assets/instructions.pdf'
                }
            ],
            customSubject: 'Votre code OTP personnalisé'
        });

        if (result.success) {
            console.log(`Email OTP envoyé avec succès : ${result.messageId}`);
        } else {
            console.error(`Échec de l'envoi de l'email : ${result.message}`);
        }
    } catch (error) {
        console.error(`Erreur inattendue : ${error.message}`);
    }
}

// Exemple 3 : Envoi d'un email de demande soumise
async function sendDemandeSoumiseEmail() {
    try {
        const result = await emailService.sendMail({
            to: 'utilisateur@example.com',
            type: 'demandeSoumise',
            parameters: {
                demandeId: 'REQ-001',
                submissionDate: new Date().toLocaleDateString('fr-FR')
            }
        });

        if (result.success) {
            console.log(`Email de demande soumise envoyé avec succès : ${result.messageId}`);
        } else {
            console.error(`Échec de l'envoi de l'email : ${result.message}`);
        }
    } catch (error) {
        console.error(`Erreur inattendue : ${error.message}`);
    }
}

// Exécuter les exemples
(async () => {
    await sendRegistrationEmail();
    await sendOtpEmail();
    await sendDemandeSoumiseEmail();
})();
```

## Explications des Exemples

1. **Email d'Inscription** (`sendRegistrationEmail`) :
   - **Objectif** : Envoyer un email de bienvenue avec un lien de vérification.
   - **Paramètres** :
     - `to` : Adresse email du destinataire.
     - `type` : `register` (correspond au modèle défini dans `emailTemplates.js`).
     - `parameters` : Données pour le modèle Handlebars (nom, lien de vérification).
   - **Résultat** : Affiche l'ID du message si l'envoi réussit, sinon affiche une erreur.

2. **Email OTP avec Pièce Jointe** (`sendOtpEmail`) :
   - **Objectif** : Envoyer un code OTP avec un fichier PDF en pièce jointe et un sujet personnalisé.
   - **Paramètres supplémentaires** :
     - `attachments` : Liste des pièces jointes (nom et chemin du fichier).
     - `customSubject` : Sujet personnalisé qui remplace celui défini dans `emailTemplates.js`.
   - **Résultat** : Similaire au premier exemple, avec gestion de la pièce jointe.

3. **Email de Demande Soumise** (`sendDemandeSoumiseEmail`) :
   - **Objectif** : Confirmer la soumission d'une demande avec un ID et une date.
   - **Paramètres** : Inclut un ID de demande et une date formatée en français.
   - **Résultat** : Affiche le succès ou l'échec de l'envoi.

## Exécution

Pour exécuter les exemples :
1. Placez le code dans un fichier `app.js`.
2. Assurez-vous que `emailService.js`, `config/emailTemplates.js`, et les modèles `.ejs` sont correctement configurés.
3. Exécutez la commande suivante :
   ```bash
   node app.js
   ```

### Résultat Attendu
```
Email transport initialized successfully
Email d'inscription envoyé avec succès : <messageId>
Email OTP envoyé avec succès : <messageId>
Email de demande soumise envoyé avec succès : <messageId>
```

En cas d'erreur (par exemple, fichier manquant ou problème SMTP) :
```
Échec de l'envoi de l'email : <message d'erreur>
```

## Conseils

- **Ajout de nouveau template** : Pour ajouter de nouveau template, editez le fichier `config/emailTemplates.js`.

- **Modèles EJS** : Assurez-vous que les fichiers `.ejs` (par exemple, `register.ejs`) existent dans `helpers/template/mail/` et contiennent les variables attendues (comme `{{name}}`, `{{otpCode}}`).
- **Pièces Jointes** : Vérifiez que les fichiers spécifiés dans `attachments` existent (par exemple, `./assets/instructions.pdf`).
- **Variables d'Environnement** : Protégez le fichier `.env` et vérifiez que les informations SMTP sont correctes.
- **Personnalisation** : Modifiez les sujets ou ajoutez de nouveaux types d'emails dans `config/emailTemplates.js` sans changer le code du service.

## Dépannage

- **Erreur de transport** : Vérifiez les variables d'environnement (`MAIL_HOST`, `MAIL_PORT`, etc.).
- **Modèle introuvable** : Confirmez que le chemin dans `emailTemplates.js` correspond à l'emplacement des fichiers `.ejs`.
- **Erreur d'envoi** : Consultez les journaux d'erreurs dans la console pour identifier la cause (par exemple, problème SMTP ou fichier manquant).

Ce code fournit une base solide pour intégrer `emailService` dans une application, avec des exemples couvrant les cas d'utilisation courants.