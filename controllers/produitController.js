const db = require('../config/db');

exports.getProduitsDisponibles = async (req, res) => {
    try {
        const [lignes] = await db.query(
            `SELECT p.id, p.nom, p.description, p.prix, p.image_url, c.nom AS categorie 
             FROM Produits p 
             JOIN Categories c ON p.categorie_id = c.id 
             WHERE p.est_disponible = TRUE`
        );

        res.status(200).json({
            success: true,
            compte: lignes.length,
            data: lignes
        });
    } catch (error) {
        console.error("Erreur :", error);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};