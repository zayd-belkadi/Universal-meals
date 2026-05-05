const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateurController');
const auth = require('../middlewares/authMiddleware');

//l'inscription
router.post('/inscription', utilisateurController.inscription);

//connexion
router.post('/connexion', utilisateurController.connexion);

//
router.get('/', auth.verifierToken, auth.estAdmin, utilisateurController.getAllUtilisateurs);

router.patch('/:id/role', auth.verifierToken, auth.estAdmin, utilisateurController.changerRole);

module.exports = router;