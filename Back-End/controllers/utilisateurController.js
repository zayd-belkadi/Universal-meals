const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Inscription (création acc)
exports.inscription = async (req, res) => {
    const { nom, email, mot_de_passe, role } = req.body;

    if (!nom || !email || !mot_de_passe) {
        return res.status(400).json({ success: false, message: "Tous les champs sont obligatoires." });
    }

    try {
        //vérifie email exis
        const [utilisateurExistant] = await db.query('SELECT * FROM Utilisateurs WHERE email = ?', [email]);
        if (utilisateurExistant.length > 0) {
            return res.status(400).json({ success: false, message: "Cet email est déjà utilisé." });
        }

        //cryptage mdp
        const motDePasseCrypte = await bcrypt.hash(mot_de_passe, 10);

        //définition de rôle -client par défaut
        const roleUtilisateur = role || 'Client';

        // insèrtion db (new user)
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

// (connection)
exports.connexion = async (req, res) => {
    const { email, mot_de_passe } = req.body;

    if (!email || !mot_de_passe) {
        return res.status(400).json({ success: false, message: "Email et mot de passe requis." });
    }

    try {
        // recherche par email
        const [utilisateurs] = await db.query('SELECT * FROM Utilisateurs WHERE email = ?', [email]);
        
        if (utilisateurs.length === 0) {
            return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect." });
        }

        const utilisateur = utilisateurs[0];

        //comparaison mdp tapé vs crypté dans db
        const motDePasseValide = await bcrypt.compare(mot_de_passe, utilisateur.mot_de_passe);
        
        if (!motDePasseValide) {
            return res.status(401).json({ success: false, message: "Email ou mot de passe incorrect." });
        }

        // generationdu badge (Token JWT)
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
exports.changerRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;
    if (!role) return res.status(400).json({ success: false, message: 'Rôle requis.' });
    try {
        const [resultat] = await db.query('UPDATE Utilisateurs SET role = ? WHERE id = ?', [role, id]);
        if (resultat.affectedRows === 0) return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
        res.status(200).json({ success: true, message: 'Rôle modifié.' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Erreur serveur.' });
    }
};

// 3. récupérer tous les utilisateurs (dmin role)
exports.getAllUtilisateurs = async (req, res) => {
    try {
        // sécurité mdp (pas d selection)
        const [utilisateurs] = await db.query('SELECT id, nom, email, role, date_creation FROM Utilisateurs');
        res.status(200).json({ success: true, data: utilisateurs });
    } catch (error) {
        console.error("Erreur récupération utilisateurs :", error.message);
        res.status(500).json({ success: false, message: "Erreur serveur." });
    }
};