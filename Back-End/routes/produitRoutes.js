const express = require('express');
const router = express.Router();
const produitController = require('../controllers/produitController');

// Quand on accède à /menu, on lance la fonction du controller
router.get('/menu', produitController.getProduitsDisponibles);

module.exports = router;