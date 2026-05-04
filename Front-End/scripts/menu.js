import {panierItems} from '../data/panier.js'
import {updatePanier, panierVide, calculeFrais} from './panier.js'

document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.removeItem('utilisateur');
    localStorage.removeItem('token');
    window.location.href = 'seConnecter.html';
});

// URL de base du backend
const API = 'http://localhost:3001/api';

let menuProduit = '';
let menuCategoryItem = '';
panierVide();

// On garde les produits récupérés du backend pour les retrouver lors de l'ajout
let produitsBackend = [];

// Fonction qui crée le HTML pour les items d'une catégorie
function itemWrite(categorieId) {
    menuCategoryItem = '';

    produitsBackend.forEach((produit) => {

        if (categorieId == produit.categorie_id) {

            let dispoTexte = produit.est_disponible ? '' : ' (indisponible)';
            let disabledAttr = produit.est_disponible ? '' : 'disabled';

            let itemForm = `
                    <p class="itemName">${produit.nom} ${Number(produit.prix).toFixed(2)}$${dispoTexte}</p>
                    
                    <div class="produitQuantite">
                        <select class="optionValeur optionValeur${produit.id}">
                        <option class="option" selected value="1">1</option>
                        <option class="option" value="2">2</option>
                        <option class="option" value="3">3</option>
                        <option class="option" value="4">4</option>
                        <option class="option" value="5">5</option>
                        <option class="option" value="6">6</option>
                        <option class="option" value="7">7</option>
                        <option class="option" value="8">8</option>
                        <option class="option" value="9">9</option>
                        <option class="option" value="10">10</option>
                        </select>
                        <button class="add" data-produit-id=${produit.id} ${disabledAttr}>[+]</button>
                    </div>
                    <br>`;
            menuCategoryItem += itemForm;
        }
    });
    return menuCategoryItem;
}

// Charger les catégories et produits depuis le backend
async function chargerMenu() {
    try {
        const reponseCat = await fetch(API + '/categories');
        const dataCat = await reponseCat.json();

        const reponseProd = await fetch(API + '/produits');
        const dataProd = await reponseProd.json();

        if (!dataCat.success || !dataProd.success) {
            document.querySelector('.categoryHolder').innerHTML = '<p>Erreur de chargement.</p>';
            return;
        }

        produitsBackend = dataProd.data;
        const categories = dataCat.data;

        // Construire le HTML par catégorie
        categories.forEach((cat) => {
            let categoryForm = `
            <div class="Category">
                <p class="categoryName">-----${cat.nom.toUpperCase()}-----</p>
                <div class="item">
                ${itemWrite(cat.id)}
                </div>
            </div>`;

            menuProduit += categoryForm;
            menuCategoryItem = '';
        });

        document.querySelector('.categoryHolder').innerHTML = menuProduit;

        // Brancher les boutons [+]
        ajouterEvenementsBoutons();

    } catch (erreur) {
        document.querySelector('.categoryHolder').innerHTML =
            '<p style="color:red;">Erreur serveur : ' + erreur.message + '</p>';
    }
}

// Brancher les écouteurs sur les boutons [+]
function ajouterEvenementsBoutons() {
    document.querySelectorAll('.add').forEach((btn) => {
        btn.addEventListener('click', () => {

            let id = Number(btn.dataset.produitId);
            let quantite = Number(document.querySelector(".optionValeur" + id).value);

            let existItem = panierItems.find(item => item.id == id);

            let select = document.querySelector(".optionValeur" + id);
            select.value = "1";

            if (existItem) {
                existItem.quantite += quantite;
            } else {
                let produit = produitsBackend.find(p => p.id == id);
                if (produit) {
                    panierItems.push({
                        id: produit.id,
                        name: produit.nom,
                        prix: Number(produit.prix),
                        quantite: quantite,
                    });
                }
            }

            updatePanier();
            calculeFrais();
        });
    });
}

// ── Bouton COMMANDER ──────────────────────────────────────────────────────────
document.querySelector('.commander').addEventListener('click', async () => {

    if (panierItems.length === 0) {
        alert('Votre panier est vide !');
        return;
    }

    // Vérifier que l'utilisateur est connecté
    let utilisateur = JSON.parse(localStorage.getItem('utilisateur'));
    if (!utilisateur) {
        alert('Vous devez être connecté pour commander.');
        window.location.href = 'seConnecter.html';
        return;
    }

    // Demander un créneau de retrait
    let creneau = prompt('Choisissez votre créneau de retrait (ex: 12:00 - 12:30) :', '12:00 - 12:30');
    if (!creneau) return;

    // Préparer les données pour le backend
    let panierBackend = panierItems.map(item => ({
        produit_id: item.id,
        quantite: item.quantite
    }));

    try {
        let reponse = await fetch(API + '/commandes/creer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                utilisateur_id: utilisateur.id,
                panier: panierBackend,
                creneau_retrait: creneau
            })
        });

        let data = await reponse.json();

        if (data.success) {
            alert('Commande #' + data.commandeId + ' validée !\nCréneau : ' + creneau);
            // Vider le panier en mémoire
            panierItems.length = 0;
            updatePanier();
            panierVide();
            calculeFrais();
        } else {
            alert('Erreur : ' + data.message);
        }

    } catch (erreur) {
        alert('Erreur serveur : ' + erreur.message);
    }
});

// Init
chargerMenu();
