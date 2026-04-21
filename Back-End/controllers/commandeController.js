const db = require('../config/db');

exports.creerCommande = async (req, res) => {
    const { utilisateur_id, panier, creneau_retrait } = req.body;

    if (!panier || panier.length === 0) {
        return res.status(400).json({ success: false, message: "Le panier est vide." });
    }

    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        let montant_total = 0;
        const lignesAInserer = [];

        for (const item of panier) {
            const [produits] = await connection.query(
                'SELECT prix, est_disponible, nom FROM Produits WHERE id = ?',
                [item.produit_id]
            );

            if (produits.length === 0) throw new Error(`Produit introuvable.`);
            if (!produits[0].est_disponible) throw new Error(`Produit indisponible.`);

            montant_total += produits[0].prix * item.quantite;
            lignesAInserer.push({
                produit_id: item.produit_id,
                quantite: item.quantite,
                prix_unitaire: produits[0].prix
            });
        }

        const [resultatCommande] = await connection.query(
            'INSERT INTO Commandes (utilisateur_id, montant_total, creneau_retrait) VALUES (?, ?, ?)',
            [utilisateur_id, montant_total, creneau_retrait]
        );

        for (const ligne of lignesAInserer) {
            await connection.query(
                'INSERT INTO Lignes_Commande (commande_id, produit_id, quantite, prix_unitaire) VALUES (?, ?, ?, ?)',
                [resultatCommande.insertId, ligne.produit_id, ligne.quantite, ligne.prix_unitaire]
            );
        }

        await connection.commit();
        res.status(201).json({ success: true, message: "Commande validée !", commandeId: resultatCommande.insertId });

    } catch (error) {
        await connection.rollback();
        res.status(400).json({ success: false, message: error.message });
    } finally {
        connection.release();
    }
};

exports.getToutesLesCommandes = async (req, res) => {
    try {
        const [commandes] = await db.query(`
            SELECT c.id, u.nom AS nom_client, c.montant_total, c.statut, c.creneau_retrait 
            FROM Commandes c JOIN Utilisateurs u ON c.utilisateur_id = u.id ORDER BY c.creneau_retrait ASC
        `);
        res.status(200).json({ success: true, data: commandes });
    } catch (error) {
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};