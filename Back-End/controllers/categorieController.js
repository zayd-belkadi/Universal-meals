const db = require('../config/db');

exports.getAllCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM Categories');
        res.status(200).json({ success: true, data: categories });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};

exports.creerCategorie = async (req, res) => {
    const { nom } = req.body;
    if (!nom) return res.status(400).json({ success: false, message: "Nom obligatoire." });

    try {
        const [resultat] = await db.query('INSERT INTO Categories (nom) VALUES (?)', [nom]);
        res.status(201).json({ success: true, message: "Catégorie ajoutée !", id: resultat.insertId });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};