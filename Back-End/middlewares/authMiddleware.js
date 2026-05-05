const jwt = require('jsonwebtoken');

// verif connexion
exports.verifierToken = (req, res, next) => {
    
    const authHeader = req.headers.authorization;
    
    // pas d token
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: "Accès refusé. Vous devez être connecté." });
    }

    // 
    const token = authHeader.split(' ')[1];

    try {
        // vérification du badge avec mdp secret du .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // sauvegarde des infos du badge (id et role) dans la requête
        req.utilisateur = decoded; 
        
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: "Token invalide ou expiré. Veuillez vous reconnecter." });
    }
};

// Vérification d'Admin role
exports.estAdmin = (req, res, next) => {
    // bloquage (non admin)
    if (req.utilisateur.role !== 'Admin') {
        return res.status(403).json({ success: false, message: "Accès interdit. Cette action est réservée aux Administrateurs." });
    }
    
    next(); // admin,laisser passer
};

// Vérifier si user Employé/Admin
exports.estEmployeOuAdmin = (req, res, next) => {
    const role = req.utilisateur.role;
    if (role !== 'Admin' && role !== 'Employe') {
        return res.status(403).json({ success: false, message: "Accès interdit. Réservé au staff." });
    }
    next(); //laisser passer
};