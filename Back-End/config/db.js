const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'universal_meals',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test rapide de la connexion
pool.getConnection()
    .then(connection => {
        console.log("✅ Base de données MySQL connectée avec succès.");
        connection.release();
    })
    .catch(err => {
        console.error("❌ Erreur de connexion à la base de données :", err.message);
    });

module.exports = pool;