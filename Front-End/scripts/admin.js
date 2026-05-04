// URL de base du backend
const API = 'http://localhost:3001/api';

// Vérifier que l'utilisateur est admin
let utilisateur = JSON.parse(localStorage.getItem('utilisateur'));
let token = localStorage.getItem('token');

if (!utilisateur || utilisateur.role !== 'Admin') {
    alert('Accès refusé. Connectez-vous en tant qu\'Admin.');
    window.location.href = 'seConnecter.html';
}

// Header pour les requêtes protégées (avec le token JWT)
const headersAuth = {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
};

// ── GESTION DES ONGLETS ───────────────────────────────────────────────────────
document.querySelectorAll('.tab').forEach((btn) => {
    btn.addEventListener('click', () => {

        // Logout est traité séparément
        if (btn.id === 'btnLogout') return;

        let tabId = btn.dataset.tab;

        // Cacher tous les contenus
        document.querySelectorAll('.tabContent').forEach((c) => {
            c.style.display = 'none';
        });
        // Désactiver tous les onglets
        document.querySelectorAll('.tab').forEach((t) => {
            t.classList.remove('active');
        });

        // Afficher le bon contenu et activer l'onglet
        document.getElementById('tab-' + tabId).style.display = 'block';
        btn.classList.add('active');

        // Recharger les données de l'onglet
        if (tabId === 'produits') chargerProduits();
        if (tabId === 'categories') chargerCategories();
        if (tabId === 'utilisateurs') chargerUtilisateurs();
        if (tabId === 'commandes') chargerCommandes();
    });
});

// Déconnexion
document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.removeItem('utilisateur');
    localStorage.removeItem('token');
    window.location.href = 'seConnecter.html';
});

// ── PRODUITS ──────────────────────────────────────────────────────────────────
let categoriesCache = [];

async function chargerProduits() {
    try {
        // Charger aussi les catégories pour le menu déroulant
        const reponseCat = await fetch(API + '/categories');
        const dataCat = await reponseCat.json();
        if (dataCat.success) {
            categoriesCache = dataCat.data;
            let optionsHTML = '<option value="">-- Catégorie --</option>';
            categoriesCache.forEach((c) => {
                optionsHTML += '<option value="' + c.id + '">' + c.nom + '</option>';
            });
            document.getElementById('prodCat').innerHTML = optionsHTML;
        }

        const reponse = await fetch(API + '/produits');
        const data = await reponse.json();

        if (!data.success) {
            document.getElementById('listeProduits').innerHTML = '<p>Erreur de chargement.</p>';
            return;
        }

        let html = '';
        data.data.forEach((p) => {
            let dispoClass = p.est_disponible ? 'dispoON' : 'dispoOFF';
            let dispoTxt = p.est_disponible ? 'OUI' : 'NON';
            html += '<div class="ligne">' +
                '<span>' + p.nom + '</span>' +
                '<span>' + Number(p.prix).toFixed(2) + '$</span>' +
                '<span class="' + dispoClass + '">' + dispoTxt + '</span>' +
                '<span><button class="btnLigne" data-id="' + p.id + '" data-action="toggle">[ ' +
                (p.est_disponible ? 'Désactiver' : 'Activer') + ' ]</button></span>' +
                '</div>';
        });
        document.getElementById('listeProduits').innerHTML = html;

        // Brancher les boutons toggle disponibilité
        document.querySelectorAll('[data-action="toggle"]').forEach((btn) => {
            btn.addEventListener('click', async () => {
                let id = btn.dataset.id;
                let produit = data.data.find(p => p.id == id);
                let nouveauStatut = !produit.est_disponible;

                try {
                    const r = await fetch(API + '/produits/' + id + '/disponibilite', {
                        method: 'PATCH',
                        headers: headersAuth,
                        body: JSON.stringify({ est_disponible: nouveauStatut })
                    });
                    const result = await r.json();
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

// Ajouter un produit
document.getElementById('btnAjouterProduit').addEventListener('click', async () => {
    let nom = document.getElementById('prodNom').value.trim();
    let description = document.getElementById('prodDesc').value.trim();
    let prix = document.getElementById('prodPrix').value;
    let categorie_id = document.getElementById('prodCat').value;

    if (!nom || !prix || !categorie_id) {
        alert('Remplissez le nom, le prix et la catégorie.');
        return;
    }

    try {
        const r = await fetch(API + '/produits', {
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
        const data = await r.json();
        if (data.success) {
            // Vider les champs
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

// ── CATEGORIES ────────────────────────────────────────────────────────────────
async function chargerCategories() {
    try {
        const r = await fetch(API + '/categories');
        const data = await r.json();
        if (!data.success) {
            document.getElementById('listeCategories').innerHTML = '<p>Erreur.</p>';
            return;
        }
        let html = '';
        data.data.forEach((c) => {
            html += '<p>- ' + c.nom + '</p>';
        });
        document.getElementById('listeCategories').innerHTML = html || '<p>Aucune catégorie.</p>';
    } catch (err) {
        document.getElementById('listeCategories').innerHTML =
            '<p style="color:red;">Erreur : ' + err.message + '</p>';
    }
}

// Ajouter une catégorie
document.getElementById('btnAjouterCat').addEventListener('click', async () => {
    let nom = document.getElementById('catNom').value.trim();
    if (!nom) { alert('Nom requis.'); return; }

    try {
        const r = await fetch(API + '/categories', {
            method: 'POST',
            headers: headersAuth,
            body: JSON.stringify({ nom: nom })
        });
        const data = await r.json();
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

// ── UTILISATEURS ──────────────────────────────────────────────────────────────
async function chargerUtilisateurs() {
    try {
        const r = await fetch(API + '/utilisateurs', { headers: headersAuth });
        const data = await r.json();
        if (!data.success) {
            document.getElementById('listeUtilisateurs').innerHTML =
                '<p>Erreur : ' + (data.message || 'inconnue') + '</p>';
            return;
        }
        let html = '';
        data.data.forEach((u) => {
            let date = new Date(u.date_creation).toLocaleDateString('fr-CA');
            html += '<div class="ligne">' +
                '<span>' + u.nom + '</span>' +
                '<span>' + u.email + '</span>' +
                '<span>' + u.role + '</span>' +
                '<span>' + date + '</span>' +
                '</div>';
        });
        document.getElementById('listeUtilisateurs').innerHTML = html;
    } catch (err) {
        document.getElementById('listeUtilisateurs').innerHTML =
            '<p style="color:red;">Erreur : ' + err.message + '</p>';
    }
}

// ── COMMANDES ─────────────────────────────────────────────────────────────────
async function chargerCommandes() {
    try {
        const r = await fetch(API + '/commandes/toutes');
        const data = await r.json();
        if (!data.success) {
            document.getElementById('listeCommandes').innerHTML = '<p>Erreur.</p>';
            return;
        }
        let html = '';
        data.data.forEach((c) => {
            html += '<div class="ligne">' +
                '<span>#' + c.id + '</span>' +
                '<span>' + c.nom_client + '</span>' +
                '<span>' + Number(c.montant_total).toFixed(2) + '$</span>' +
                '<span>' + c.statut + '</span>' +
                '</div>';
        });
        document.getElementById('listeCommandes').innerHTML = html || '<p>Aucune commande.</p>';
    } catch (err) {
        document.getElementById('listeCommandes').innerHTML =
            '<p style="color:red;">Erreur : ' + err.message + '</p>';
    }
}

// Init - charger les produits par défaut
chargerProduits();
