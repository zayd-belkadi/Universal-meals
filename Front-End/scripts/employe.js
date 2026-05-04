const API = 'http://localhost:3001/api';

let utilisateur = JSON.parse(localStorage.getItem('utilisateur'));
if (!utilisateur || utilisateur.role != 'Employe') {
    window.location.href = 'seConnecter.html';
}

document.getElementById('btnLogout').addEventListener('click', ()=>{
    localStorage.removeItem('utilisateur');
    localStorage.removeItem('token');
    window.location.href = 'seConnecter.html';
});

let today = new Date().toISOString().split('T')[0];
document.getElementById('filtreDate').value = today;

document.getElementById('btnFiltrer').addEventListener('click', ()=>{
    chargerCommandes();
});

async function chargerCommandes() {
    try {
        let reponse = await fetch(API + '/commandes/toutes/details');
        let data = await reponse.json();

        if (!data.success) {
            document.getElementById('listeCommandes').innerHTML = '<p>Erreur de chargement.</p>';
            return;
        }

        let dateFiltre = document.getElementById('filtreDate').value;

        let commandesFiltrees = data.data.filter((c)=>{
            return c.creneau_retrait.startsWith(dateFiltre);
        });

        commandesFiltrees.sort((a, b)=>{
            return a.creneau_retrait > b.creneau_retrait ? 1 : -1;
        });

        if (commandesFiltrees.length == 0) {
            document.getElementById('listeCommandes').innerHTML = '<p>Aucune commande pour cette journée.</p>';
            return;
        }

        let html = '';
        commandesFiltrees.forEach((c)=>{
            let statutClass = 'statutRecue';
            if (c.statut == 'en préparation') statutClass = 'statutPrep';
            if (c.statut == 'prête') statutClass = 'statutPrete';
            if (c.statut == 'remise') statutClass = 'statutRemise';

            let itemsHtml = '';
            c.items.forEach((item)=>{
                itemsHtml += `<span class="ligneItem">• ${item.nom} x${item.quantite}</span>`;
            });

            html += `<div class="ligneGrilleEmp">
                <span>#${c.id}</span>
                <span>${c.nom_client}</span>
                <span>${c.creneau_retrait}</span>
                <div class="itemsCommande">${itemsHtml}</div>
                <span>${Number(c.montant_total).toFixed(2)}$</span>
                <select class="selectStatut" data-commande-id="${c.id}">
                    <option class="${c.statut == 'reçue' ? 'statutRecue' : ''}" value="reçue" ${c.statut == 'reçue' ? 'selected' : ''}>reçue</option>
                    <option class="${c.statut == 'en préparation' ? 'statutPrep' : ''}" value="en préparation" ${c.statut == 'en préparation' ? 'selected' : ''}>en préparation</option>
                    <option value="prête" ${c.statut == 'prête' ? 'selected' : ''}>prête</option>
                    <option value="remise" ${c.statut == 'remise' ? 'selected' : ''}>remise</option>
                </select>
            </div>`;
        });

        document.getElementById('listeCommandes').innerHTML = html;

        document.querySelectorAll('.selectStatut').forEach((select)=>{
            select.addEventListener('change', async ()=>{
                let id = select.dataset.commandeId;
                let nouveauStatut = select.value;
                try {
                    let reponse = await fetch(API + '/commandes/' + id + '/statut', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ statut: nouveauStatut })
                    });
                    let data = await reponse.json();
                    if (!data.success) {
                        alert('Erreur : ' + data.message);
                    } else {
                        chargerCommandes();
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
