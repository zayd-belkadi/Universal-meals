// URL de base du backend
const API = 'http://localhost:3001/api';

// Si déjà connecté, aller au menu
if (localStorage.getItem('utilisateur')) {
    window.location.href = 'menu.html';
}

// Les deux formulaires partagent les mêmes classes (.usernameT, .passwordT)
// Donc on récupère TOUS les éléments et on prend par index :
//   index 0 = formulaire CONNEXION
//   index 1 = formulaire INSCRIPTION
const tousUsername = document.querySelectorAll('.usernameT');
const tousPassword = document.querySelectorAll('.passwordT');

// ── CONNEXION ─────────────────────────────────────────────────────────────────
document.querySelector('.seConnecterB').addEventListener('click', async () => {

    let email = tousUsername[0].value.trim();
    let motDePasse = tousPassword[0].value.trim();

    if (email === '' || motDePasse === '') {
        alert('Remplissez tous les champs.');
        return;
    }

    try {
        let reponse = await fetch(API + '/utilisateurs/connexion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: email,
                mot_de_passe: motDePasse
            })
        });

        let data = await reponse.json();

        if (data.success) {
            // Sauvegarder l'utilisateur et le token JWT pour les prochaines requêtes
            localStorage.setItem('utilisateur', JSON.stringify(data.utilisateur));
            localStorage.setItem('token', data.token);
            window.location.href = 'menu.html';
        } else {
            alert(data.message);
        }

    } catch (erreur) {
        alert('Erreur serveur : ' + erreur.message);
    }
});

// ── INSCRIPTION ───────────────────────────────────────────────────────────────
document.querySelector('.senregistrerB').addEventListener('click', async () => {

    let email = tousUsername[1].value.trim();
    let motDePasse = tousPassword[1].value.trim();

    if (email === '' || motDePasse === '') {
        alert('Remplissez tous les champs.');
        return;
    }

    // Comme le formulaire n'a pas de champ "nom" séparé,
    // on utilise la partie avant le @ de l'email comme nom (ex: "kabra@cafe.com" -> "kabra")
    let nom = email.split('@')[0];

    try {
        let reponse = await fetch(API + '/utilisateurs/inscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nom: nom,
                email: email,
                mot_de_passe: motDePasse,
                role: 'Client'
            })
        });

        let data = await reponse.json();

        if (data.success) {
            alert('Compte créé ! Vous pouvez maintenant vous connecter.');
            // Vider les champs d'inscription
            tousUsername[1].value = '';
            tousPassword[1].value = '';
        } else {
            alert(data.message);
        }

    } catch (erreur) {
        alert('Erreur serveur : ' + erreur.message);
    }
});
