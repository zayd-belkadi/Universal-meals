const express = require('express');
require('dotenv').config();
const db = require('./config/db'); // Connexion à ta base de données XAMPP

const app = express();
const PORT = 3001;

// Middleware pour lire le JSON
app.use(express.json());

// Importation et utilisation de tes routes
const produitRoutes = require('./routes/produitRoutes');
app.use('/api/produits', produitRoutes);

// Importation et utilisation des routes de commandes
const commandeRoutes = require('./routes/commandeRoutes');
app.use('/api/commandes', commandeRoutes);

// Route de test simple (optionnelle)
app.get('/', (req, res) => {
    res.send("Bienvenue sur l'API de Universal Meals !");
});

// Lancement du serveur (C'est cette partie qui maintient le terminal actif !)
app.listen(PORT, () => {
    console.log(`🚀 Serveur démarré avec succès sur http://localhost:${PORT}`);
});