const express = require('express');
const router = express.Router();
const produitController = require('../controllers/produitController');
const auth = require('../middlewares/authMiddleware');

// Route publique : pas de vigile, tout le monde peut voir le menu
router.get('/', produitController.getAllProduits);

// Routes protégées : on place les vigiles AVANT le contrôleur
// Route pour ajouter un plat (POST /api/produits)
router.post('/', auth.verifierToken, auth.estAdmin, produitController.creerProduit);

// Route pour modifier tout le plat (PUT)
router.put('/:id', auth.verifierToken, auth.estAdmin, produitController.mettreAJourProduit);


// Route pour changer uniquement la disponibilité (PATCH) - Accessible par Admin ET Employé
router.patch('/:id/disponibilite', auth.verifierToken, auth.estEmployeOuAdmin, produitController.changerDisponibilite);

router.delete('/:id', auth.verifierToken, auth.estAdmin, produitController.supprimerProduit);

module.exports = router;