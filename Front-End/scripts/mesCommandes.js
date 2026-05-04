const API = 'http://localhost:3001/api';

let utilisateur = JSON.parse(localStorage.getItem('utilisateur'));
if (!utilisateur) {
    window.location.href = 'seConnecter.html';
}

document.getElementById('btnLogout').addEventListener('click', ()=>{
    localStorage.removeItem('utilisateur');
    localStorage.removeItem('token');
    window.location.href = 'seConnecter.html';
});

document.getElementById('btnMenu').addEventListener('click', ()=>{
    window.location.href = 'menu.html';
});

async function chargerCommandes() {
    try {
        let reponse = await fetch(API + '/commandes/client/' + utilisateur.id);
        let data = await reponse.json();

        if (!data.success) {
            document.getElementById('listeCommandes').innerHTML = '<p>Erreur de chargement.</p>';
            return;
        }

        if (data.data.length == 0) {
            document.getElementById('listeCommandes').innerHTML = '<p>Aucune commande.</p>';
            return;
        }

        let html = '';
        data.data.forEach((cmd)=>{
            let date = new Date(cmd.date_commande);
            let dateStr = date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear();

            let statutClass = 'statutRecue';
            if (cmd.statut == 'en préparation') statutClass = 'statutPrep';
            if (cmd.statut == 'prête') statutClass = 'statutPrete';
            if (cmd.statut == 'remise') statutClass = 'statutRemise';

            html += `<div class="ligneGrille5">
                <span>#${cmd.id}</span>
                <span>${cmd.creneau_retrait.split(' ')[0]}</span>
                <span><strong>${cmd.creneau_retrait.split(' ')[1]}</strong></span>
                <span>${Number(cmd.montant_total).toFixed(2)}$</span>
                <span class="${statutClass}">${cmd.statut}</span>
                <span>${dateStr}</span>
                <button class="delete" data-commande-id="${cmd.id}">[ ANNULER ]</button>
            </div>`;
        });

        document.getElementById('listeCommandes').innerHTML = html;

        document.querySelectorAll('.delete').forEach((btn)=>{
            btn.addEventListener('click', async ()=>{
                let id = btn.dataset.commandeId;
                try {
                    let reponse = await fetch(API + '/commandes/' + id, { method: 'DELETE' });
                    let data = await reponse.json();
                    if (data.success) {
                        chargerCommandes();
                    } else {
                        alert('Erreur : ' + data.message);
                    }
                } catch (erreur) {
                    alert('Erreur serveur : ' + erreur.message);
                }
            });
        });

    } catch (erreur) {
        document.getElementById('listeCommandes').innerHTML =
            '<p style="color:red;">Erreur serveur : ' + erreur.message + '</p>';
    }
}

chargerCommandes();
