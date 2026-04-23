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
// 2. Fonction pour ajouter un nouveau plat au menu (Côté Admin/Employé)
exports.creerProduit = async (req, res) => {
    // On récupère les informations du plat envoyées dans la requête
    const { nom, description, prix, est_disponible, image } = req.body;

    // Vérification de sécurité : un plat doit au moins avoir un nom et un prix
    if (!nom || !prix) {
        return res.status(400).json({ success: false, message: "Le nom et le prix sont obligatoires." });
    }

    try {
        // On insère le nouveau plat dans la base de données
        const [resultat] = await db.query(
            'INSERT INTO Produits (nom, description, prix, est_disponible, image) VALUES (?, ?, ?, ?, ?)',
            [
                nom, 
                description || "Aucune description", // Valeur par défaut si vide
                prix, 
                est_disponible !== undefined ? est_disponible : true, // Vrai par défaut
                image || null
            ]
        );

        res.status(201).json({
            success: true,
            message: `Le plat '${nom}' a été ajouté au menu avec succès !`,
            produitId: resultat.insertId
        });

    } catch (error) {
        console.error("Erreur lors de l'ajout du plat :", error.message);
        res.status(500).json({ success: false, message: "Erreur serveur lors de l'ajout du produit." });
    }
};