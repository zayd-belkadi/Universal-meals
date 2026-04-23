const express = require('express');
const router = express.Router();
const produitController = require('../controllers/produitController');

router.get('/', produitController.getAllProduits);
// Route pour ajouter un plat (POST /api/produits)
router.post('/', produitController.creerProduit);
// Route pour modifier tout le plat (PUT)
router.put('/:id', produitController.mettreAJourProduit);
// Route pour changer uniquement la disponibilité (PATCH)
router.patch('/:id/disponibilite', produitController.changerDisponibilite);

module.exports = router;