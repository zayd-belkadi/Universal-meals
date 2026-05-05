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

        let taxes = montant_total * 0.15;
        montant_total = montant_total + taxes;

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
// mettre à jour le statut d'une commande (Cuisine)
exports.mettreAJourStatut = async (req, res) => {
    //récupèration d'ID 
    const { id } = req.params; 
    //récuppératio,n de status
    const { statut } = req.body;

    // Vérification de statut avoué 
    if (!statut) {
        return res.status(400).json({ success: false, message: "Le nouveau statut est requis." });
    }

    try {
        // Mise à jour db
        const [resultat] = await db.query(
            'UPDATE Commandes SET statut = ? WHERE id = ?',
            [statut, id]
        );

        // aucune ligne modofié = ID n'existe pas
        if (resultat.affectedRows === 0) {
            return res.status(404).json({ success: false, message: "Commande introuvable." });
        }

        res.status(200).json({
            success: true,
            message: `Le statut de la commande n°${id} est passé à '${statut}'.`
        });

    } catch (error) {
        console.error("Erreur lors de la mise à jour du statut :", error.message);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};
// récupérer l'historique d'un client
exports.getCommandesUtilisateur = async (req, res) => {
    // On récupère l'ID de l'utilisateur passé dans l'URL
    const { utilisateur_id } = req.params;

    try {
        // On sélectionne uniquement les commandes de ce client précis
        const [commandes] = await db.query(`
            SELECT id, montant_total, statut, creneau_retrait, date_commande
            FROM Commandes
            WHERE utilisateur_id = ?
            ORDER BY date_commande DESC
        `, [utilisateur_id]);

        res.status(200).json({
            success: true,
            compte: commandes.length,
            data: commandes
        });

    } catch (error) {
        console.error("Erreur lors de la récupération de l'historique :", error.message);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};
exports.getToutesLesCommandesDetails = async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT c.id, u.nom AS nom_client, c.montant_total, c.statut, c.creneau_retrait,
                   p.nom AS produit_nom, lc.quantite, lc.prix_unitaire
            FROM Commandes c
            JOIN Utilisateurs u ON c.utilisateur_id = u.id
            LEFT JOIN Lignes_Commande lc ON lc.commande_id = c.id
            LEFT JOIN Produits p ON lc.produit_id = p.id
            ORDER BY c.creneau_retrait ASC
        `);

        let map = {};
        rows.forEach((row)=>{
            if (!map[row.id]) {
                map[row.id] = {
                    id: row.id,
                    nom_client: row.nom_client,
                    montant_total: row.montant_total,
                    statut: row.statut,
                    creneau_retrait: row.creneau_retrait,
                    items: []
                };
            }
            if (row.produit_nom) {
                map[row.id].items.push({
                    nom: row.produit_nom,
                    quantite: row.quantite,
                    prix_unitaire: row.prix_unitaire
                });
            }
        });

        res.status(200).json({ success: true, data: Object.values(map) });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
};

exports.getVentes = async (req, res) => {
    try {
        const [totaux] = await db.query(
            'SELECT COUNT(*) as nb_commandes, COALESCE(SUM(montant_total), 0) as revenus_total FROM Commandes'
        );
        const [parStatut] = await db.query(
            'SELECT statut, COUNT(*) as nb FROM Commandes GROUP BY statut'
        );
        const [parProduit] = await db.query(`
            SELECT p.nom, SUM(lc.quantite) as nb_vendus, SUM(lc.quantite * lc.prix_unitaire) as revenus
            FROM Lignes_Commande lc
            JOIN Produits p ON lc.produit_id = p.id
            GROUP BY p.id, p.nom
            ORDER BY nb_vendus DESC
        `);
        res.status(200).json({ success: true, data: { totaux: totaux[0], parStatut, parProduit } });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
};

// annuler ou supprimer une commande
exports.supprimerCommande = async (req, res) => {
    
    const { id } = req.params;

    // On démarre une transaction sécurisée
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // Supprimer le contenu du panier
        await connection.query('DELETE FROM Lignes_Commande WHERE commande_id = ?', [id]);

        // Supprimer la commande principale
        const [resultat] = await connection.query('DELETE FROM Commandes WHERE id = ?', [id]);

        
        if (resultat.affectedRows === 0) {
            await connection.rollback(); // annuler tout
            return res.status(404).json({ success: false, message: "Commande introuvable." });
        }

        // valider la suppression !
        await connection.commit();
        res.status(200).json({ 
            success: true, 
            message: `La commande n°${id} a été annulée et supprimée avec succès.` 
        });

    } catch (error) {
        // annuler l'opération (cas d'un prob)
        await connection.rollback();
        console.error("Erreur lors de la suppression :", error.message);
        res.status(500).json({ success: false, message: "Erreur serveur lors de l'annulation." });
    } finally {
    
        connection.release();
    }
};