const express = require('express');
const router = express.Router();
const categorieController = require('../controllers/categorieController');
const auth = require('../middlewares/authMiddleware'); // Importation du vigile

// catégories visibles
router.get('/', categorieController.getAllCategories);

//privilège admin création desc catégories
router.post('/', auth.verifierToken, auth.estAdmin, categorieController.creerCategorie);

router.delete('/:id', auth.verifierToken, auth.estAdmin, categorieController.supprimerCategorie);

module.exports = router;