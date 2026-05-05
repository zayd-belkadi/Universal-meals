const express = require('express');
const router = express.Router();
const produitController = require('../controllers/produitController');
const auth = require('../middlewares/authMiddleware');


router.get('/', produitController.getAllProduits);

// Routes protégées
// ajouter un plat
router.post('/', auth.verifierToken, auth.estAdmin, produitController.creerProduit);

//modifier tout le plat
router.put('/:id', auth.verifierToken, auth.estAdmin, produitController.mettreAJourProduit);


// changerla disponibilité (Admin/Employé)
router.patch('/:id/disponibilite', auth.verifierToken, auth.estEmployeOuAdmin, produitController.changerDisponibilite);

router.delete('/:id', auth.verifierToken, auth.estAdmin, produitController.supprimerProduit);

module.exports = router;