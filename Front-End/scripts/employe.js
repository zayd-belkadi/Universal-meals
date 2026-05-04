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
            let opacite = c.statut == 'remise' ? 'style="opacity:0.5"' : '';

            let heure = c.creneau_retrait.split(' ')[1];

            let itemsHtml = '';
            c.items.forEach((item)=>{
                itemsHtml += `<div class="carteItem">• ${item.nom} x${item.quantite}</div>`;
            });

            html += `<div class="carteCommande" ${opacite}>
                <div class="carteEntete">
                    <span class="carteNumero">#${c.id}</span>
                    <span class="carteCreneau">${heure}</span>
                </div>
                <div class="carteClient">${c.nom_client}</div>
                <div class="carteItems">${itemsHtml}</div>
                <div class="cartePied">
                    <span class="carteTotal">${Number(c.montant_total).toFixed(2)}$</span>
                    <select class="selectStatut" data-commande-id="${c.id}">
                        <option value="reçue"          ${c.statut == 'reçue'           ? 'selected' : ''}>reçue</option>
                        <option value="en préparation" ${c.statut == 'en préparation'  ? 'selected' : ''}>en préparation</option>
                        <option value="prête"          ${c.statut == 'prête'           ? 'selected' : ''}>prête</option>
                        <option value="remise"         ${c.statut == 'remise'          ? 'selected' : ''}>remise</option>
                    </select>
                </div>
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
