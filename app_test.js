// Importer le module http
const http = require('http');

// Définir le port
const PORT = 3000;

// Créer le serveur
const server = http.createServer((req, res) => {
  // Configurer les en-têtes de la réponse
  res.writeHead(200, { 'Content-Type': 'text/plain' });

  // Vérifier l'URL et gérer les différentes routes
  if (req.url === '/') {
    res.end('Bienvenue sur le serveur Node.js!');
  } else if (req.url === '/about') {
    res.end('À propos de cette application');
  } else {
    res.writeHead(404);
    res.end('Page non trouvée');
  }
});

// Démarrer le serveur
server.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
});
