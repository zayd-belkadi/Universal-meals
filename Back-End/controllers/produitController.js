const db = require('../config/db'); // Retour en arrière d'un dossier (..) puis config

// Récupération des produits
exports.getAllProduits = async (req, res) => {
    try {
        const [produits] = await db.query('SELECT * FROM Produits');
        res.status(200).json({ success: true, data: produits });
    } catch (error) {
        console.error("Erreur :", error.message);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};
// ajouter nouveau un nouveau
exports.creerProduit = async (req, res) => {
    const { nom, description, prix, est_disponible, image_url, categorie_id } = req.body;

    if (!nom || !prix) {
        return res.status(400).json({ success: false, message: "Le nom et le prix sont obligatoires." });
    }

    try {
        const [resultat] = await db.query(
            'INSERT INTO Produits (nom, description, prix, est_disponible, image_url, categorie_id) VALUES (?, ?, ?, ?, ?, ?)',
            [
                nom, 
                description || "Aucune description", 
                prix, 
                est_disponible !== undefined ? est_disponible : true,
                image_url || null,
                categorie_id || null // La catégorie choisie par l'admin
            ]
        );

        res.status(201).json({ success: true, message: "Plat ajouté !", produitId: resultat.insertId });
    } catch (error) {
        console.error("Erreur d'ajout :", error.message);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};

// modifier les infos d'un plats
exports.mettreAJourProduit = async (req, res) => {
    const { id } = req.params;
    const { nom, description, prix, image_url, categorie_id } = req.body;

    try {
        const [resultat] = await db.query(
            'UPDATE Produits SET nom = ?, description = ?, prix = ?, image_url = ?, categorie_id = ? WHERE id = ?',
            [nom, description, prix, image_url, categorie_id, id]
        );

        if (resultat.affectedRows === 0) return res.status(404).json({ success: false, message: "Produit introuvable." });
        res.status(200).json({ success: true, message: "Plat modifié avec succès !" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};

exports.supprimerProduit = async (req, res) => {
    const { id } = req.params;
    try {
        const [resultat] = await db.query('DELETE FROM Produits WHERE id = ?', [id]);
        if (resultat.affectedRows === 0) return res.status(404).json({ success: false, message: 'Produit introuvable.' });
        res.status(200).json({ success: true, message: 'Produit supprimé.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Impossible de supprimer : ce produit est lié à des commandes.' });
    }
};

// activer/désactiver un plat
exports.changerDisponibilite = async (req, res) => {
    const { id } = req.params;
    const { est_disponible } = req.body;

    //vérification
    if (est_disponible === undefined) {
        return res.status(400).json({ success: false, message: "Le champ 'est_disponible' est requis." });
    }

    try {
        const [resultat] = await db.query(
            'UPDATE Produits SET est_disponible = ? WHERE id = ?',
            [est_disponible, id]
        );

        if (resultat.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Produit introuvable." });
        }

        // commentaire activé/désactivé
        const statut = est_disponible ? "disponible" : "en rupture de stock";
        res.status(200).json({ success: true, message: `Le plat est maintenant ${statut} !` });

    } catch (error) {
        console.error("Erreur de disponibilité :", error.message);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};