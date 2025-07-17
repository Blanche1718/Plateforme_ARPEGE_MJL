# Utilisation du Module `imageToBase64`

Ce document explique comment utiliser le module `imageToBase64.js`, qui convertit une image en une chaîne Base64 encodée sous forme de data URI. Ce module est utile pour intégrer des images dans des emails, des pages web, ou des API sans avoir à les servir séparément.

## Prérequis

- **Dépendances** : Le module utilise les modules natifs Node.js `fs` et `path`. Aucune installation supplémentaire n'est requise.

- **Structure du projet** : Placez le fichier `imageToBase64.js` dans un dossier approprié, par exemple `utils/`. Exemple de structure :

  ```
  project/
  ├── assets/
  │   ├── logo.jpg
  │   └── profile.png
  ├── utils/
  │   └── imageToBase64.js
  ├── app.js
  └── ...
  ```

- **Images** : Assurez-vous que les fichiers image existent dans le dossier spécifié (par exemple, `assets/`).

## Aperçu du Module

Le module exporte une fonction unique, `imageToBase64`, qui prend un chemin d'image relatif et un type MIME optionnel, et retourne une promesse résolvant un objet avec :

- `status` : `"success"` si la conversion réussit, `"failure"` sinon.
- `data` : La chaîne Base64 (data URI) si `status` est `"success"`.
- `error` : Message d'erreur si `status` est `"failure"`.

## Exemple d'Utilisation

Le code suivant, extrait d'un fichier `app.js`, montre comment utiliser `imageToBase64` pour convertir des images en Base64 dans différents scénarios.

```javascript
const { imageToBase64 } = require('./utils/imageToBase64');

// Exemple 1 : Convertir une image JPEG
async function convertJpegImage() {
  try {
    const result = await imageToBase64('assets/logo.jpg');
    if (result.status === 'success') {
      console.log('Image JPEG convertie avec succès :', result.data.slice(0, 50) + '...');
    } else {
      console.error('Échec de la conversion :', result.error);
    }
  } catch (error) {
    console.error('Erreur inattendue :', error.message);
  }
}

// Exemple 2 : Convertir une image PNG avec un type MIME spécifique
async function convertPngImage() {
  try {
    const result = await imageToBase64('assets/profile.png', 'image/png');
    if (result.status === 'success') {
      console.log('Image PNG convertie avec succès :', result.data.slice(0, 50) + '...');
    } else {
      console.error('Échec de la conversion :', result.error);
    }
  } catch (error) {
    console.error('Erreur inattendue :', error.message);
  }
}

// Exemple 3 : Gérer une image inexistante
async function convertMissingImage() {
  try {
    const result = await imageToBase64('assets/nonexistent.jpg');
    if (result.status === 'success') {
      console.log('Image convertie avec succès :', result.data.slice(0, 50) + '...');
    } else {
      console.error('Échec de la conversion :', result.error);
    }
  } catch (error) {
    console.error('Erreur inattendue :', error.message);
  }
}

// Exécuter les exemples
(async () => {
  await convertJpegImage();
  await convertPngImage();
  await convertMissingImage();
})();
```

## Intégration avec Express

Voici un exemple d'utilisation dans une route Express pour renvoyer une image Base64 via une API :

```javascript
const express = require('express');
const { imageToBase64 } = require('./utils/imageToBase64');

const app = express();

app.get('/image/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const result = await imageToBase64(`assets/${filename}`);
    if (result.status === 'success') {
      res.status(200).json({ image: result.data });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur : ' + error.message });
  }
});

app.listen(3000, () => console.log('Serveur démarré sur le port 3000'));
```

## Explications des Exemples

1. **Conversion d'une Image JPEG** (`convertJpegImage`) :

   - **Objectif** : Convertir une image JPEG en Base64 avec le type MIME par défaut (`image/jpeg`).
   - **Entrée** : Chemin relatif `assets/logo.jpg`.
   - **Sortie** : Affiche une partie de la chaîne Base64 si `status` est `"success"`, sinon affiche l'erreur.

2. **Conversion d'une Image PNG** (`convertPngImage`) :

   - **Objectif** : Convertir une image PNG avec un type MIME spécifique (`image/png`).
   - **Entrée** : Chemin relatif `assets/profile.png` et type MIME.
   - **Sortie** : Similaire au premier exemple, avec un type MIME adapté.

3. **Gestion d'une Image Inexistante** (`convertMissingImage`) :

   - **Objectif** : Tester la gestion des erreurs pour un fichier manquant.
   - **Entrée** : Chemin relatif `assets/nonexistent.jpg`.
   - **Sortie** : Affiche un message d'erreur avec `status: "failure"`.

4. **Intégration Express** :

   - **Objectif** : Fournir une API pour récupérer une image Base64.
   - **Entrée** : Paramètre d'URL `:filename`.
   - **Sortie** : JSON avec la chaîne Base64 si `status` est `"success"`, ou une erreur sinon.

## Exécution

Pour exécuter les exemples :

1. Placez `imageToBase64.js` dans `utils/` et le code d'exemple dans `app.js`.

2. Assurez-vous que les images existent dans `assets/` (par exemple, `logo.jpg`, `profile.png`).

3. Exécutez :

   ```bash
   node app.js
   ```

### Résultat Attendu

```
Image convertie en Base64 avec succès : /path/to/project/assets/logo.jpg
Image JPEG convertie avec succès : data:image/jpeg;base64,/9j/4AAQSkZJRg...
Image convertie en Base64 avec succès : /path/to/project/assets/profile.png
Image PNG convertie avec succès : data:image/png;base64,iVBORw0KGgoAAA...
Échec de la conversion : Le fichier n'existe pas : /path/to/project/assets/nonexistent.jpg
```

## Conseils

- **Formats d'image** : Spécifiez le `mimeType` correct (`image/jpeg`, `image/png`, `image/gif`, etc.) pour correspondre au format de l'image.
- **Performance** : Pour des images volumineuses, envisagez de limiter la taille ou d'utiliser un flux de lecture si nécessaire.
- **Sécurité** : Validez les chemins d'entrée pour éviter les attaques de traversée de répertoire (le module utilise `path.join` pour cela).
- **Utilisation dans les emails** : La chaîne Base64 peut être intégrée dans des emails HTML (par exemple, `<img src="data:image/jpeg;base64,...">`).

## Dépannage

- **Fichier introuvable** : Vérifiez que le chemin relatif est correct par rapport à la racine du projet.
- **Type MIME incorrect** : Assurez-vous que le `mimeType` correspond au format de l'image.
- **Erreurs inattendues** : Consultez les messages d'erreur dans la console pour identifier les problèmes (par exemple, permissions de fichier).

Ce module offre une solution simple et robuste pour convertir des images en Base64, adaptée à divers cas d'utilisation dans une application Node.js.