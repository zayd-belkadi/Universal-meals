const express = require('express');
const router = express.Router();
const commandeController = require('../controllers/commandeController');

router.post('/creer', commandeController.creerCommande);
router.get('/toutes', commandeController.getToutesLesCommandes);

module.exports = router;