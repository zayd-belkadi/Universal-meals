const db = require('../config/db');

// Fonction pour créer une nouvelle commande
exports.creerCommande = async (req, res) => {
    // 1. On récupère les données envoyées par le frontend
    const { utilisateur_id, panier, creneau_retrait } = req.body;

    // 2. Vérification de base : La commande doit contenir au moins un produit
    if (!panier || panier.length === 0) {
        return res.status(400).json({ success: false, message: "Le panier est vide." });
    }

    // 3. On démarre une transaction SQL.
    // C'est CRUCIAL. Si une erreur survient (ex: produit indisponible), on annule tout
    // pour ne pas créer une commande vide ou à moitié payée.
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        let montant_total = 0;
        const lignesAInserer = [];

        // 4. On boucle sur chaque produit du panier pour vérifier la disponibilité et calculer le prix
        for (const item of panier) {
            // On cherche le produit dans la base
            const [produits] = await connection.query(
                'SELECT prix, est_disponible, nom FROM Produits WHERE id = ?',
                [item.produit_id]
            );

            // Si le produit n'existe pas
            if (produits.length === 0) {
                throw new Error(`Le produit avec l'ID ${item.produit_id} n'existe pas.`);
            }

            const produitEnBase = produits[0];

            // Si le produit n'est plus disponible, on bloque la commande
            if (!produitEnBase.est_disponible) {
                throw new Error(`Le produit "${produitEnBase.nom}" n'est plus disponible.`);
            }

            // On calcule le total mathématiquement du côté serveur (sécurité !)
            montant_total += produitEnBase.prix * item.quantite;

            // On prépare la ligne pour l'insérer plus tard
            lignesAInserer.push({
                produit_id: item.produit_id,
                quantite: item.quantite,
                prix_unitaire: produitEnBase.prix
            });
        }

        // 5. On insère la commande principale
        const [resultatCommande] = await connection.query(
            'INSERT INTO Commandes (utilisateur_id, montant_total, creneau_retrait) VALUES (?, ?, ?)',
            [utilisateur_id, montant_total, creneau_retrait]
        );

        const commande_id = resultatCommande.insertId;

        // 6. On insère les lignes de commande
        for (const ligne of lignesAInserer) {
            await connection.query(
                'INSERT INTO Lignes_Commande (commande_id, produit_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)',
                [commande_id, ligne.produit_id, ligne.quantite, ligne.prix_unitaire]
            );
        }

        // 7. Si tout s'est bien passé, on valide la transaction !
        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Commande validée avec succès !",
            commandeId: commande_id,
            total: montant_total
        });

    } catch (error) {
        // En cas d'erreur (produit manquant, erreur SQL), on annule toutes les insertions
        await connection.rollback();
        console.error("Erreur lors de la création de la commande :", error.message);
        res.status(400).json({ success: false, message: error.message });
    } finally {
        // Quoi qu'il arrive, on libère la connexion à la base de données
        connection.release();
    }
};