const express = require('express');
const router = express.Router();
const produitController = require('../controllers/produitController');

router.get('/', produitController.getAllProduits);
// Route pour ajouter un plat (POST /api/produits)
router.post('/', produitController.creerProduit);

module.exports = router;