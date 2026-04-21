const express = require('express');
const router = express.Router();
const commandeController = require('../controllers/commandeController');

router.post('/creer', commandeController.creerCommande);
router.get('/toutes', commandeController.getToutesLesCommandes);
// Route pour modifier le statut d'une commande spécifique (ex: ID 1)
router.patch('/:id/statut', commandeController.mettreAJourStatut);
// Route pour voir l'historique d'un client précis (ex: utilisateur n°1)
router.get('/client/:utilisateur_id', commandeController.getCommandesUtilisateur);
// Route pour supprimer une commande spécifique (ex: ID 1)
router.delete('/:id', commandeController.supprimerCommande);

module.exports = router;