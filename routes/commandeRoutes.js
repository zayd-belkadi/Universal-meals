const express = require('express');
const router = express.Router();
const commandeController = require('../controllers/commandeController');

// Quand le frontend fait un POST sur /creer, on lance la fonction de création
router.post('/creer', commandeController.creerCommande);

module.exports = router;