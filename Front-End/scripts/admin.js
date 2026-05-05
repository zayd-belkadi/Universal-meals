const API = 'http://localhost:3001/api';

let utilisateur = JSON.parse(localStorage.getItem('utilisateur'));
let token = localStorage.getItem('token');

if (!utilisateur || utilisateur.role != 'Admin') {

    alert('Accès refusé.');
    window.location.href = 'seConnecter.html';
}

let headersAuth = {

    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
};

document.querySelectorAll('.boutonNav').forEach((btn)=>{
    btn.addEventListener('click', ()=>{
        if (btn.id == 'btnLogout') return;

        let tabId = btn.dataset.tab;

        document.querySelectorAll('.sectionOnglet').forEach((c)=>{
            c.style.display = 'none';
        });
        document.querySelectorAll('.boutonNav').forEach((t)=>{
            t.classList.remove('actif');
        });

        document.getElementById('tab-' + tabId).style.display = 'block';
        btn.classList.add('actif');

        if (tabId == 'produits') chargerProduits();
        if (tabId == 'categories') chargerCategories();
        if (tabId == 'utilisateurs') chargerUtilisateurs();
        if (tabId == 'commandes') chargerCommandes();
        if (tabId == 'ventes') chargerVentes();
    });
});

document.getElementById('btnLogout').addEventListener('click', ()=>{
    localStorage.removeItem('utilisateur');
    localStorage.removeItem('token');
    window.location.href = 'seConnecter.html';
});

let categoriesCache = [];

async function chargerProduits() {
    try {

        let reponseCat = await fetch(API + '/categories');
        let dataCat = await reponseCat.json();
        if (dataCat.success) {
            categoriesCache = dataCat.data;
            let optionsHTML = '<option value="">-- Catégorie --</option>';
            categoriesCache.forEach((c)=>{
                optionsHTML += `<option value="${c.id}">${c.nom}</option>`;
            });
            document.getElementById('prodCat').innerHTML = optionsHTML;
        }

        let reponse = await fetch(API + '/produits');
        let data = await reponse.json();

        if (!data.success) {
            document.getElementById('listeProduits').innerHTML = '<p>Erreur de chargement.</p>';
            return;
        }

        let html = '';
        data.data.forEach((p)=>{
            let dispoClass = p.est_disponible ? 'dispoOui' : 'dispoNon';
            let dispoTxt = p.est_disponible ? 'OUI' : 'NON';
            let btnTxt = p.est_disponible ? 'Désactiver' : 'Activer';
            html += `<div class="ligneGrille">
                <span>${p.nom}</span>
                <span>${Number(p.prix).toFixed(2)}$</span>
                <span class="${dispoClass}">${dispoTxt}</span>
                <span>
                    <button class="boutonL" data-id="${p.id}" data-action="toggle">[ ${btnTxt} ]</button>
                    <button class="boutonL" data-id="${p.id}" data-action="supprimer">[ Supprimer ]</button>
                </span>
            </div>`;
        });

        document.getElementById('listeProduits').innerHTML = html;

        document.querySelectorAll('[data-action="toggle"]').forEach((btn)=>{
            btn.addEventListener('click', async ()=>{
                let id = btn.dataset.id;
                let produit = data.data.find((p)=> p.id == id);
                let nouveauStatut = !produit.est_disponible;
                try {
                    let r = await fetch(API + '/produits/' + id + '/disponibilite', {
                        method: 'PATCH',
                        headers: headersAuth,
                        body: JSON.stringify({ est_disponible: nouveauStatut })
                    });
                    let result = await r.json();
                    if (result.success) {
                        chargerProduits();
                    } else {
                        alert(result.message);
                    }
                } catch (err) {
                    alert('Erreur : ' + err.message);
                }
            });
        });

        document.querySelectorAll('[data-action="supprimer"]').forEach((btn)=>{
            btn.addEventListener('click', async ()=>{
                let id = btn.dataset.id;
                try {
                    let r = await fetch(API + '/produits/' + id, {
                        method: 'DELETE',
                        headers: headersAuth
                    });
                    let result = await r.json();
                    if (result.success) {
                        chargerProduits();
                    } else {
                        alert(result.message);
                    }
                } catch (err) {
                    alert('Erreur : ' + err.message);
                }
            });
        });

    } catch (erreur) {

        document.getElementById('listeProduits').innerHTML =
            '<p style="color:red;">Erreur : ' + erreur.message + '</p>';
    }
}

document.getElementById('btnAjouterProduit').addEventListener('click', async ()=>{

    let nom = document.getElementById('prodNom').value.trim();
    let description = document.getElementById('prodDesc').value.trim();
    let prix = document.getElementById('prodPrix').value;
    let categorie_id = document.getElementById('prodCat').value;

    if (!nom || !prix || !categorie_id) {

        alert('Remplissez le nom, le prix et la catégorie.');
        return;
    }

    try {

        let r = await fetch(API + '/produits', {
            method: 'POST',
            headers: headersAuth,
            body: JSON.stringify({
                nom: nom,
                description: description,
                prix: Number(prix),
                est_disponible: true,
                categorie_id: Number(categorie_id)
            })
        });

        let data = await r.json();

        if (data.success) {

            document.getElementById('prodNom').value = '';
            document.getElementById('prodDesc').value = '';
            document.getElementById('prodPrix').value = '';
            document.getElementById('prodCat').value = '';
            chargerProduits();
        } else {

            alert(data.message);
        }
    } catch (err) {

        alert('Erreur : ' + err.message);
    }
});

async function chargerCategories() {
    try {

        let r = await fetch(API + '/categories');
        let data = await r.json();

        if (!data.success) {

            document.getElementById('listeCategories').innerHTML = '<p>Erreur.</p>';
            return;
        }

        let html = '';

        data.data.forEach((c)=>{
            html += `<div class="ligneGrille" style="grid-template-columns: 1fr 120px">
                <span>${c.nom}</span>
                <span><button class="boutonL btnSupprimerCat" data-id="${c.id}">[ Supprimer ]</button></span>
            </div>`;
        });

        document.getElementById('listeCategories').innerHTML = html || '<p>Aucune catégorie.</p>';

        document.querySelectorAll('.btnSupprimerCat').forEach((btn)=>{
            btn.addEventListener('click', async ()=>{
                let id = btn.dataset.id;
                try {
                    let r = await fetch(API + '/categories/' + id, {
                        method: 'DELETE',
                        headers: headersAuth
                    });
                    let result = await r.json();
                    if (result.success) {
                        chargerCategories();
                    } else {
                        alert(result.message);
                    }
                } catch (err) {
                    alert('Erreur : ' + err.message);
                }
            });
        });

    } catch (err) {

        document.getElementById('listeCategories').innerHTML =
            '<p style="color:red;">Erreur : ' + err.message + '</p>';
    }
}

document.getElementById('btnAjouterCat').addEventListener('click', async ()=>{

    let nom = document.getElementById('catNom').value.trim();
    if (!nom) { alert('Nom requis.'); return; }

    try {

        let r = await fetch(API + '/categories', {
            method: 'POST',
            headers: headersAuth,
            body: JSON.stringify({ nom: nom })
        });

        let data = await r.json();
        if (data.success) {

            document.getElementById('catNom').value = '';
            chargerCategories();

        } else {

            alert(data.message);
        }
    } catch (err) {

        alert('Erreur : ' + err.message);
    }
});

async function chargerUtilisateurs() {
    try {

        let r = await fetch(API + '/utilisateurs', { headers: headersAuth });
        let data = await r.json();
        if (!data.success) {

            document.getElementById('listeUtilisateurs').innerHTML = '<p>Erreur.</p>';
            return;
        }

        let html = '';

        data.data.forEach((u)=>{
            let date = new Date(u.date_creation).toLocaleDateString('fr-CA');
            html += `<div class="ligneGrille" style="grid-template-columns: 1fr 1fr 80px 80px 160px">
                <span>${u.nom}</span>
                <span>${u.email}</span>
                <span>${u.role}</span>
                <span>${date}</span>
                <span>
                    <select class="selectRole creneauSelect" data-user-id="${u.id}">
                        <option value="Client"  ${u.role == 'Client'  ? 'selected' : ''}>Client</option>
                        <option value="Employe" ${u.role == 'Employe' ? 'selected' : ''}>Employé</option>
                        <option value="Admin"   ${u.role == 'Admin'   ? 'selected' : ''}>Admin</option>
                    </select>
                    <button class="boutonL btnChangerRole" data-user-id="${u.id}">[ OK ]</button>
                </span>
            </div>`;
        });

        document.getElementById('listeUtilisateurs').innerHTML = html;

        document.querySelectorAll('.btnChangerRole').forEach((btn)=>{
            btn.addEventListener('click', async ()=>{
                let id = btn.dataset.userId;
                let nouveauRole = document.querySelector(`.selectRole[data-user-id="${id}"]`).value;
                try {
                    let r = await fetch(API + '/utilisateurs/' + id + '/role', {
                        method: 'PATCH',
                        headers: headersAuth,
                        body: JSON.stringify({ role: nouveauRole })
                    });
                    let result = await r.json();
                    if (result.success) {
                        chargerUtilisateurs();
                    } else {
                        alert(result.message);
                    }
                } catch (err) {
                    alert('Erreur : ' + err.message);
                }
            });
        });
    } catch (err) {

        document.getElementById('listeUtilisateurs').innerHTML =
            '<p style="color:red;">Erreur : ' + err.message + '</p>';
    }
}

async function chargerCommandes() {
    try {

        let r = await fetch(API + '/commandes/toutes');
        let data = await r.json();

        if (!data.success) {

            document.getElementById('listeCommandes').innerHTML = '<p>Erreur.</p>';
            return;

        }
        let html = '';
        data.data.forEach((c)=>{

            html += `<div class="ligneGrille">
                <span>#${c.id}</span>
                <span>${c.nom_client}</span>
                <span>${Number(c.montant_total).toFixed(2)}$</span>
                <span>${c.statut}</span>
            </div>`;
        });

        document.getElementById('listeCommandes').innerHTML = html || '<p>Aucune commande.</p>';
    } catch (err) {
        
        document.getElementById('listeCommandes').innerHTML =
            '<p style="color:red;">Erreur : ' + err.message + '</p>';
    }
}

async function chargerVentes() {
    try {
        let r = await fetch(API + '/commandes/ventes');
        let data = await r.json();

        if (!data.success) {
            document.getElementById('statsVentes').innerHTML = '<p>Erreur.</p>';
            return;
        }

        let t = data.data.totaux;
        let statsHtml = `<div class="statsCards">
            <div class="statCard">
                <p class="statValeur">${t.nb_commandes}</p>
                <p class="statLabel">commandes</p>
            </div>
            <div class="statCard">
                <p class="statValeur">${Number(t.revenus_total).toFixed(2)}$</p>
                <p class="statLabel">revenus total</p>
            </div>`;

        data.data.parStatut.forEach((s)=>{
            let statutClass = 'statutRecue';
            if (s.statut == 'en préparation') statutClass = 'statutPrep';
            if (s.statut == 'prête') statutClass = 'statutPrete';
            if (s.statut == 'remise') statutClass = 'statutRemise';
            statsHtml += `<div class="statCard">
                <p class="statValeur ${statutClass}">${s.nb}</p>
                <p class="statLabel">${s.statut}</p>
            </div>`;
        });

        statsHtml += '</div>';
        document.getElementById('statsVentes').innerHTML = statsHtml;

        let produitsHtml = '';
        data.data.parProduit.forEach((p)=>{
            produitsHtml += `<div class="ligneGrille5" style="grid-template-columns: 1fr 120px 120px">
                <span>${p.nom}</span>
                <span>${p.nb_vendus}</span>
                <span>${Number(p.revenus).toFixed(2)}$</span>
            </div>`;
        });

        document.getElementById('ventesProduits').innerHTML = produitsHtml || '<p>Aucune vente.</p>';

    } catch (err) {
        document.getElementById('statsVentes').innerHTML =
            '<p style="color:red;">Erreur : ' + err.message + '</p>';
    }
}

chargerProduits();
