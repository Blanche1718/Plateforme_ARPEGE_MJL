const express = require('express');
const app = express();
const port = 4000;

app.get('/', (req, res) => {
  res.send('Serveur de test opérationnel !');
});

app.listen(port, () => {
  console.log(`Serveur en écoute sur http://localhost:${port}`);
});
