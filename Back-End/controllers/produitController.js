const db = require('../config/db'); // Retour en arrière d'un dossier (..) puis config

// Récupérer tous les produits
exports.getAllProduits = async (req, res) => {
    try {
        const [produits] = await db.query('SELECT * FROM Produits');
        res.status(200).json({ success: true, data: produits });
    } catch (error) {
        console.error("Erreur :", error.message);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};