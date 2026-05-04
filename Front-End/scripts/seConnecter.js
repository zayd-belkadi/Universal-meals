const API = 'http://localhost:3001/api';

let userExistant = JSON.parse(localStorage.getItem('utilisateur'));
if (userExistant) {
    if (userExistant.role === 'Admin') {
        window.location.href = 'admin.html';
    } else if (userExistant.role === 'Employe') {
        window.location.href = 'employe.html';
    } else {
        window.location.href = 'menu.html';
    }
}

document.querySelector('.seConnecterB').addEventListener('click', async () => {

    let email = document.getElementById('usernameC').value.trim();
    let motDePasse = document.getElementById('passwordC').value.trim();

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
            localStorage.setItem('utilisateur', JSON.stringify(data.utilisateur));
            localStorage.setItem('token', data.token);

            if (data.utilisateur.role === 'Admin') {
                window.location.href = 'admin.html';
            } else if (data.utilisateur.role === 'Employe') {
                window.location.href = 'employe.html';
            } else {
                window.location.href = 'menu.html';
            }
        } else {
            alert(data.message);
        }

    } catch (erreur) {
        alert('Erreur serveur : ' + erreur.message);
    }
});
document.querySelector('.senregistrerB').addEventListener('click', async () => {

    let email = document.getElementById('usernameE').value.trim();
    let motDePasse = document.getElementById('passwordE').value.trim();

    if (email === '' || motDePasse === '') {
        alert('Remplissez tous les champs.');
        return;
    }

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
            document.getElementById('usernameE').value = '';
            document.getElementById('passwordE').value = '';
        } else {
            alert(data.message);
        }

    } catch (erreur) {
        alert('Erreur serveur : ' + erreur.message);
    }
});