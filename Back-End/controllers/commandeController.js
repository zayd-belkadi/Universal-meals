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
// 3. Fonction pour mettre à jour le statut d'une commande (Cuisine)
exports.mettreAJourStatut = async (req, res) => {
    // On récupère l'ID de la commande dans l'URL (ex: /api/commandes/1/statut)
    const { id } = req.params; 
    // On récupère le nouveau statut envoyé dans le corps de la requête
    const { statut } = req.body;

    // Vérification de sécurité : on s'assure qu'un statut a bien été envoyé
    if (!statut) {
        return res.status(400).json({ success: false, message: "Le nouveau statut est requis." });
    }

    try {
        // Mise à jour dans la base de données
        const [resultat] = await db.query(
            'UPDATE Commandes SET statut = ? WHERE id = ?',
            [statut, id]
        );

        // Si aucune ligne n'a été modifiée, c'est que l'ID n'existe pas
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
// 4. Fonction pour récupérer l'historique d'un client spécifique
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
// 5. Fonction pour annuler/supprimer une commande
exports.supprimerCommande = async (req, res) => {
    // On récupère l'ID de la commande à supprimer
    const { id } = req.params;

    // On démarre une transaction sécurisée
    const connection = await db.getConnection();
    await connection.beginTransaction();

    try {
        // Étape A : Supprimer d'abord le contenu du panier (Lignes_Commande)
        await connection.query('DELETE FROM Lignes_Commande WHERE commande_id = ?', [id]);

        // Étape B : Supprimer ensuite la commande principale
        const [resultat] = await connection.query('DELETE FROM Commandes WHERE id = ?', [id]);

        // Si aucune ligne n'a été touchée, c'est que l'ID n'existait pas
        if (resultat.affectedRows === 0) {
            await connection.rollback(); // On annule tout
            return res.status(404).json({ success: false, message: "Commande introuvable." });
        }

        // Si tout s'est bien passé, on valide la suppression !
        await connection.commit();
        res.status(200).json({ 
            success: true, 
            message: `La commande n°${id} a été annulée et supprimée avec succès.` 
        });

    } catch (error) {
        // En cas de problème, on annule l'opération pour ne rien casser
        await connection.rollback();
        console.error("Erreur lors de la suppression :", error.message);
        res.status(500).json({ success: false, message: "Erreur serveur lors de l'annulation." });
    } finally {
        // On libère la connexion
        connection.release();
    }
};