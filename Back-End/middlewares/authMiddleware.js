const jwt = require('jsonwebtoken');

// 1. Le Vigile de base : Vérifie si l'utilisateur est connecté
exports.verifierToken = (req, res, next) => {
    // Le token est envoyé dans l'en-tête (Header) de la requête
    const authHeader = req.headers.authorization;
    
    // Si aucun token n'est fourni
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: "Accès refusé. Vous devez être connecté." });
    }

    // On récupère juste la partie "eyJhb..." sans le mot "Bearer"
    const token = authHeader.split(' ')[1];

    try {
        // On vérifie que le badge est vrai avec notre mot de passe secret du .env
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // On sauvegarde les informations du badge (id et role) dans la requête
        req.utilisateur = decoded; 
        
        next(); // Le badge est bon, on laisse passer le client vers la suite !
    } catch (error) {
        return res.status(401).json({ success: false, message: "Token invalide ou expiré. Veuillez vous reconnecter." });
    }
};

// 2. Le Vigile VIP : Vérifie si l'utilisateur a le rôle 'Admin'
exports.estAdmin = (req, res, next) => {
    // Si la personne n'est pas Admin, on bloque !
    if (req.utilisateur.role !== 'Admin') {
        return res.status(403).json({ success: false, message: "Accès interdit. Cette action est réservée aux Administrateurs." });
    }
    
    next(); // C'est un Admin, on le laisse passer !
};