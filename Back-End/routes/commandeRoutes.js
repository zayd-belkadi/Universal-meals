const express = require('express');
const router = express.Router();
const commandeController = require('../controllers/commandeController');

router.post('/creer', commandeController.creerCommande);
router.get('/toutes', commandeController.getToutesLesCommandes);
router.get('/toutes/details', commandeController.getToutesLesCommandesDetails);
router.get('/ventes', commandeController.getVentes);
//modifier le statut comm
router.patch('/:id/statut', commandeController.mettreAJourStatut);
//l'historique d'un client
router.get('/client/:utilisateur_id', commandeController.getCommandesUtilisateur);
//supprimer une commande
router.delete('/:id', commandeController.supprimerCommande);

module.exports = router;