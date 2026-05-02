const express = require('express');
const router = express.Router();
const categorieController = require('../controllers/categorieController');
const auth = require('../middlewares/authMiddleware'); // Importation du vigile

// Tout le monde peut voir les catégories
router.get('/', categorieController.getAllCategories);

// Seul l'Admin peut créer une catégorie
router.post('/', auth.verifierToken, auth.estAdmin, categorieController.creerCategorie);

module.exports = router;