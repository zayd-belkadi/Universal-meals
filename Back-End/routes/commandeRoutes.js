const express = require('express');
const router = express.Router();
const commandeController = require('../controllers/commandeController');

router.post('/creer', commandeController.creerCommande);
router.get('/toutes', commandeController.getToutesLesCommandes);
// Route pour modifier le statut d'une commande spécifique (ex: ID 1)
router.patch('/:id/statut', commandeController.mettreAJourStatut);

module.exports = router;