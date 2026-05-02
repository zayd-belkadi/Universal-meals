const express = require('express');
const router = express.Router();
const utilisateurController = require('../controllers/utilisateurController');
const auth = require('../middlewares/authMiddleware');

// Route pour l'inscription (POST /api/utilisateurs/inscription)
router.post('/inscription', utilisateurController.inscription);

// Route pour la connexion (POST /api/utilisateurs/connexion)
router.post('/connexion', utilisateurController.connexion);

//
router.get('/', auth.verifierToken, auth.estAdmin, utilisateurController.getAllUtilisateurs);

module.exports = router;