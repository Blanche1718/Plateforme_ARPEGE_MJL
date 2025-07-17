# Utilisation du Module `bodyValidator`

Ce document explique comment utiliser le module `bodyValidator.js`, qui fournit des fonctions pour valider les corps de requêtes HTTP dans une application Node.js. Le module utilise la bibliothèque `simple-body-validator` pour appliquer des règles de validation sur les données entrantes, telles que les formulaires d'inscription, de connexion, ou de mise à jour de profil.

## Prérequis

- **Dépendances** : Assurez-vous que la bibliothèque suivante est installée :
  ```bash
  npm install simple-body-validator
  ```
- **Structure du projet** : Placez le fichier `bodyValidator.js` dans un dossier approprié, par exemple `utils/` ou `validators/`. Exemple de structure :
  ```
  project/
  ├── utils/
  │   └── bodyValidator.js
  ├── routes/
  │   └── auth.js
  ├── app.js
  └── ...
  ```
- **Intégration** : Le module est conçu pour être utilisé avec un framework comme Express.js, où les corps de requêtes (`req.body`) sont validés avant traitement.

## Aperçu du Module

Le module exporte plusieurs fonctions de validation, chacune correspondant à un cas d'utilisation spécifique :
- `registerBodyCheck` : Valide les données d'inscription d'un utilisateur.
- `filterBodyCheck` : Valide les clés d'un filtre pour une recherche d'entreprise.
- `utilsBodyCheck` : Valide un champ `libelle` pour des utilitaires.
- `utilsMessageUsBodyCheck` : Valide les données d'un formulaire de contact.
- `updateProfilePasswordBodyCheck` : Valide les données pour la mise à jour du mot de passe.
- `updateProfileBodyCheck` : Valide les données pour la mise à jour du profil.
- `restorePasswordBodyCheck` : Valide les données pour la réinitialisation du mot de passe.
- `loginBodyCheck` : Valide les données de connexion.

Chaque fonction retourne `true` si la validation réussit, ou `false` (ou un objet avec `valid: false` et des erreurs pour `updateProfileBodyCheck`) si elle échoue.

## Exemples d'Utilisation

Les exemples ci-dessous montrent comment intégrer ces fonctions dans une application Express.js. Assurez-vous que le module est importé dans votre fichier de routes ou contrôleur.

```javascript
const express = require('express');
const {
  registerBodyCheck,
  filterBodyCheck,
  utilsBodyCheck,
  utilsMessageUsBodyCheck,
  updateProfilePasswordBodyCheck,
  updateProfileBodyCheck,
  restorePasswordBodyCheck,
  loginBodyCheck
} = require('./utils/bodyValidator');

const router = express.Router();

// Exemple 1 : Validation de l'inscription
router.post('/register', async (req, res) => {
  const isValid = await registerBodyCheck(req.body);
  if (!isValid) {
    return res.status(400).json({ error: 'Données d\'inscription invalides', details: validator.errors().all() });
  }
  // Logique d'inscription (par exemple, sauvegarde en base de données)
  res.status(201).json({ message: 'Inscription réussie' });
});

// Exemple 2 : Validation d'un filtre d'entreprise
router.post('/filter-enterprise', async (req, res) => {
  const isValid = await filterBodyCheck(req.body);
  if (!isValid) {
    return res.status(400).json({ error: 'Clés de filtre invalides' });
  }
  // Logique de filtrage
  res.status(200).json({ message: 'Filtre appliqué' });
});

// Exemple 3 : Validation d'un utilitaire
router.post('/utils', async (req, res) => {
  const isValid = await utilsBodyCheck(req.body);
  if (!isValid) {
    return res.status(400).json({ error: 'Libellé invalide' });
  }
  // Logique pour l'utilitaire
  res.status(200).json({ message: 'Utilitaire validé' });
});

// Exemple 4 : Validation d'un message de contact
router.post('/contact', async (req, res) => {
  const isValid = await utilsMessageUsBodyCheck(req.body);
  if (!isValid) {
    return res.status(400).json({ error: 'Données de contact invalides' });
  }
  // Logique pour traiter le message
  res.status(200).json({ message: 'Message envoyé' });
});

// Exemple 5 : Validation de la mise à jour du mot de passe
router.put('/profile/password', async (req, res) => {
  const isValid = await updateProfilePasswordBodyCheck(req.body);
  if (!isValid) {
    return res.status(400).json({ error: 'Données de mot de passe invalides' });
  }
  // Logique pour mettre à jour le mot de passe
  res.status(200).json({ message: 'Mot de passe mis à jour' });
});

// Exemple 6 : Validation de la mise à jour du profil
router.put('/profile', async (req, res) => {
  const result = await updateProfileBodyCheck(req.body);
  if (!result.valid) {
    return res.status(400).json({ error: 'Données de profil invalides', details: result.errors });
  }
  // Logique pour mettre à jour le profil
  res.status(200).json({ message: 'Profil mis à jour' });
});

// Exemple 7 : Validation de la réinitialisation du mot de passe
router.post('/restore-password', async (req, res) => {
  const isValid = await restorePasswordBodyCheck(req.body);
  if (!isValid) {
    return res.status(400).json({ error: 'Données de réinitialisation invalides' });
  }
  // Logique pour réinitialiser le mot de passe
  res.status(200).json({ message: 'Demande de réinitialisation envoyée' });
});

// Exemple 8 : Validation de la connexion
router.post('/login', async (req, res) => {
  const isValid = await loginBodyCheck(req.body);
  if (!isValid) {
    return res.status(400).json({ error: 'Données de connexion invalides', details: validator.errors().all() });
  }
  // Logique de connexion
  res.status(200).json({ message: 'Connexion réussie' });
});
```

## Détails des Fonctions de Validation

### 1. `registerBodyCheck`
- **Objectif** : Valide les données d'inscription d'un utilisateur.
- **Règles** :
  - `nom` : Obligatoire, chaîne, minimum 3 caractères.
  - `prenoms` : Obligatoire, chaîne, 3 à 50 caractères.
  - `email` : Obligatoire, format email valide.
  - `telephone` : Obligatoire, chaîne, minimum 8 caractères.
  - `roleID` : Obligatoire, entier, doit être dans `[1, 2, 3, 4, 5, 6, 8, 9]`.
- **Exemple de corps valide** :
  ```json
  {
    "nom": "Dupont",
    "prenoms": "Jean Pierre",
    "email": "jean.dupont@example.com",
    "telephone": "12345678",
    "roleID": 1
  }
  ```

### 2. `filterBodyCheck`
- **Objectif** : Vérifie que les clés du corps correspondent à une liste prédéfinie pour filtrer des entreprises.
- **Clés autorisées** : `rccm`, `nomEntreprise`, `typeEntreprise`, `telephone`, `communeDomicialiation`, `juridictionReference`, `email`, `statutEntreprise`, `numeroJugement`, `nomGerant`, `prenomsGerant`.
- **Exemple de corps valide** :
  ```json
  {
    "nomEntreprise": "Entreprise XYZ",
    "typeEntreprise": "SARL",
    "email": "contact@xyz.com"
  }
  ```

### 3. `utilsBodyCheck`
- **Objectif** : Valide un champ `libelle` pour des utilitaires.
- **Règles** :
  - `libelle` : Obligatoire, chaîne, maximum 1024 caractères.
- **Exemple de corps valide** :
  ```json
  {
    "libelle": "Description de l'utilitaire"
  }
  ```

### 4. `utilsMessageUsBodyCheck`
- **Objectif** : Valide les données d'un formulaire de contact.
- **Règles** :
  - `nom` : Obligatoire, chaîne, maximum 255 caractères.
  - `email` : Obligatoire, format email, maximum 255 caractères.
  - `sujet` : Obligatoire, chaîne, maximum 255 caractères.
  - `message` : Obligatoire, chaîne, 10 à 2048 caractères.
  - `typeMessage` : Obligatoire, doit être dans `["contact", "suggestion", "probleme"]`.
- **Exemple de corps valide** :
  ```json
  {
    "nom": "Jean Dupont",
    "email": "jean.dupont@example.com",
    "sujet": "Demande d'assistance",
    "message": "J'ai un problème avec mon compte.",
    "typeMessage": "probleme"
  }
  ```

### 5. `updateProfilePasswordBodyCheck`
- **Objectif** : Valide les données pour la mise à jour du mot de passe.
- **Règles** :
  - `email` : Obligatoire, format email.
  - `apassword` : Obligatoire, chaîne (ancien mot de passe).
  - `password` : Obligatoire, chaîne, doit correspondre à `password_confirmation`.
- **Exemple de corps valide** :
  ```json
  {
    "email": "jean.dupont@example.com",
    "apassword": "ancienMotDePasse",
    "password": "nouveauMotDePasse",
    "password_confirmation": "nouveauMotDePasse"
  }
  ```

### 6. `updateProfileBodyCheck`
- **Objectif** : Valide les données pour la mise à jour du profil, avec des champs optionnels.
- **Clés autorisées** : `nom`, `prenoms`, `email`, `tel`, `centreID`.
- **Règles** :
  - `nom` : Optionnel, chaîne, minimum 3 caractères.
  - `prenoms` : Optionnel, chaîne, 3 à 50 caractères.
  - `email` : Optionnel, format email.
  - `tel` : Optionnel, chaîne.
- **Exemple de corps valide** :
  ```json
  {
    "nom": "Dupont",
    "email": "jean.dupont@example.com"
  }
  ```

### 7. `restorePasswordBodyCheck`
- **Objectif** : Valide les données pour la réinitialisation du mot de passe.
- **Règles** :
  - `email` : Obligatoire, format email.
  - `default_password` : Obligatoire, chaîne.
- **Exemple de corps valide** :
  ```json
  {
    "email": "jean.dupont@example.com",
    "default_password": "motDePasseTemporaire"
  }
  ```

### 8. `loginBodyCheck`
- **Objectif** : Valide les données de connexion.
- **Règles** :
  - `email` : Obligatoire, format email.
  - `password` : Obligatoire, chaîne.
- **Exemple de corps valide** :
  ```json
  {
    "email": "jean.dupont@example.com",
    "password": "monMotDePasse"
  }
  ```

## Conseils
- **Ajout** : Pour ajouter les fonctions suivez le format dans le fichier `bodyCheck.js`.
- **Gestion des erreurs** : Pour les fonctions qui retournent `false`, utilisez `validator.errors().all()` pour obtenir les détails des erreurs et les renvoyer au client.
- **Intégration avec Express** : Ajoutez un middleware pour parser les corps JSON :
  ```javascript
  app.use(express.json());
  ```
- **Personnalisation** : Modifiez les règles de validation dans `bodyValidator.js` pour répondre à des besoins spécifiques.
- **Sécurité** : Ne stockez pas les mots de passe en clair et validez leur complexité si nécessaire.

## Dépannage

- **Erreur de validation** : Vérifiez que les données envoyées respectent les règles (par exemple, `roleID` doit être dans la liste autorisée).
- **Clés non autorisées** : Pour `filterBodyCheck` et `updateProfileBodyCheck`, assurez-vous que seules les clés spécifiées sont envoyées.
- **Dépendance manquante** : Confirmez que `simple-body-validator` est installé.

Ce module fournit une validation robuste pour les formulaires et requêtes, améliorant la sécurité et la fiabilité de votre application.