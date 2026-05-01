const express = require('express');
require('dotenv').config();
const db = require('./config/db'); // Le bon chemin vers la DB

const app = express();
const PORT = 3001;

// Middleware pour lire le JSON envoyé par le frontend
app.use(express.json());

// Importation des routes
const produitRoutes = require('./routes/produitRoutes');
const commandeRoutes = require('./routes/commandeRoutes');
const utilisateurRoutes = require('./routes/utilisateurRoutes');
const categorieRoutes = require('./routes/categorieRoutes');

// Utilisation des routes
app.use('/api/produits', produitRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/utilisateurs', utilisateurRoutes);
app.use('/api/categories', categorieRoutes);

// Route de test
app.get('/', (req, res) => {
    res.send("Bienvenue sur l'API de Universal Meals !");
});

// Lancement du serveur
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré avec succès sur http://localhost:${PORT}`);
});