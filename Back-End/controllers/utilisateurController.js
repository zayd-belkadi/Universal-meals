const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// 1. Fonction pour créer un compte (Inscription)
exports.inscription = async (req, res) => {
    const { nom, email, mot_de_passe, role } = req.body;

    if (!nom || !email || !mot_de_passe) {
        return res.status(400).json({ success: false, message: "Tous les champs sont obligatoires." });
    }

    try {
        // On vérifie si l'email existe déjà
        const [utilisateurExistant] = await db.query('SELECT * FROM Utilisateurs WHERE email = ?', [email]);
        if (utilisateurExistant.length > 0) {
            return res.status(400).json({ success: false, message: "Cet email est déjà utilisé." });
        }

        // On crypte le mot de passe (10 correspond au niveau de complexité)
        const motDePasseCrypte = await bcrypt.hash(mot_de_passe, 10);

        // On définit le rôle (Client par défaut si rien n'est précisé)
        const roleUtilisateur = role || 'Client';

        // On insère le nouvel utilisateur dans la base
        const [resultat] = await db.query(
            'INSERT INTO Utilisateurs (nom, email, mot_de_passe, role) VALUES (?, ?, ?, ?)',
            [nom, email, motDePasseCrypte, roleUtilisateur]
        );

        res.status(201).json({ success: true, message: "Compte créé avec succès !", utilisateurId: resultat.insertId });

    } catch (error) {
        console.error("Erreur d'inscription :", error.message);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};

// 2. Fonction pour se connecter
exports.connexion = async (req, res) => {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
        return res.status(400).json({ success: false, message: "Email et mot de passe requis." });
    }

    try {
        // On cherche l'utilisateur par son email
        const [utilisateurs] = await db.query('SELECT * FROM Utilisateurs WHERE email = ?', [email]);
        
        if (utilisateurs.length === 0) {
            return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect." });
        }

        const utilisateur = utilisateurs[0];

        // On compare le mot de passe tapé avec celui crypté dans la base
        const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
        
        if (!motDePasseValide) {
            return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect." });
        }

        // Si tout est bon, on génère le "badge" (Token JWT)
        const token = jwt.sign(
            { id: utilisateur.id, role: utilisateur.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' } // Le token expire dans 24 heures
        );

        res.status(200).json({ 
            success: true, 
            message: "Connexion réussie !", 
            token: token,
            utilisateur: { id: utilisateur.id, nom: utilisateur.nom, role: utilisateur.role }
        });

    } catch (error) {
        console.error("Erreur de connexion :", error.message);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};
// 3. Fonction pour récupérer tous les utilisateurs (Pour l'Admin)
exports.getAllUtilisateurs = async (req, res) => {
    try {
        // On ne sélectionne pas les mots de passe pour des raisons de sécurité !
        const [utilisateurs] = await db.query('SELECT id, nom, email, role, date_creation FROM Utilisateurs');
        res.status(200).json({ success: true, data: utilisateurs });
    } catch (error) {
        console.error("Erreur récupération utilisateurs :", error.message);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};