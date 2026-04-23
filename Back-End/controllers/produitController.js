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
// 3. Fonction pour modifier toutes les infos d'un plat (Option A)
exports.mettreAJourProduit = async (req, res) => {
    const { id } = req.params;
    const { nom, description, prix, image } = req.body;

    try {
        const [resultat] = await db.query(
            'UPDATE Produits SET nom = ?, description = ?, prix = ?, image = ? WHERE id = ?',
            [nom, description, prix, image, id]
        );

        if (resultat.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Produit introuvable." });
        }

        res.status(200).json({ success: true, message: "Le plat a été modifié avec succès !" });

    } catch (error) {
        console.error("Erreur lors de la modification :", error.message);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};

// 4. Fonction pour activer/désactiver rapidement un plat (Option B)
exports.changerDisponibilite = async (req, res) => {
    const { id } = req.params;
    const { est_disponible } = req.body;

    // On vérifie que la valeur est bien envoyée (true ou false)
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

        // Petit texte sympa pour dire si c'est activé ou désactivé
        const statut = est_disponible ? "disponible" : "en rupture de stock";
        res.status(200).json({ success: true, message: `Le plat est maintenant ${statut} !` });

    } catch (error) {
        console.error("Erreur de disponibilité :", error.message);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};