import {panierItems} from '../data/panier.js'
import {updatePanier, panierVide, calculeFrais} from './panier.js'

document.getElementById('btnLogout').addEventListener('click', () => {
    localStorage.removeItem('utilisateur');
    localStorage.removeItem('token');
    window.location.href = 'seConnecter.html';
});

const API = 'http://localhost:3001/api';


let menuProduit = '';
let menuCategoryItem = '';
panierVide();

let produitsBackend = [];

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

        categories.forEach((cat) => {
            let categoryForm = `
            <div class="Category">
                <p class="categoryName">**${cat.nom.toUpperCase()}**</p>
                <div class="item">
                ${itemWrite(cat.id)}
                </div>
            </div>`;

            menuProduit += categoryForm;
            menuCategoryItem = '';
        });

        document.querySelector('.categoryHolder').innerHTML = menuProduit;

        ajouterEvenementsBoutons();

    } catch (erreur) {
        document.querySelector('.categoryHolder').innerHTML =
            '<p style="color:red;">Erreur serveur : ' + erreur.message + '</p>';
    }
}

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


const selectJour = document.getElementById('selectJour');

let jours = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
let mois = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'];

for (let i = 0; i < 7; i++) {

    let d = new Date();
    d.setDate(d.getDate() + i);

    let opt = document.createElement('option');
    opt.value = d.toISOString().split('T')[0];

    if (i == 0) {
        opt.textContent = "Aujourd'hui";
    } else {
        opt.textContent = jours[d.getDay()] + ' ' + d.getDate() + ' ' + mois[d.getMonth()];
    }

    selectJour.appendChild(opt);

}

const selectCreneau = document.getElementById('selectCreneau');
selectCreneau.innerHTML = `
    <option value = "" selected >Chosiser un creneau</option>
    <option value="06:00">06:00</option>
    <option value="07:00">07:00</option>
    <option value="08:00">08:00</option>
    <option value="09:00">09:00</option>
    <option value="10:00">10:00</option>
    <option value="11:00">11:00</option>
    <option value="12:00">12:00</option>
    <option value="13:00">13:00</option>
    <option value="14:00">14:00</option>
    <option value="15:00">15:00</option>
    <option value="16:00">16:00</option>
    <option value="17:00">17:00</option>
`;


document.getElementById('btnMesCommandes').addEventListener('click', () => {
    window.location.href = 'mesCommandes.html';
});

let commandeEnAttente = null;

document.getElementById('btnCommander').addEventListener('click', ()=>{

    if (panierItems.length === 0) {
        alert('Votre panier est vide !');
        return;
    }

    let utilisateur = JSON.parse(localStorage.getItem('utilisateur'));
    if (!utilisateur) {
        alert('Vous devez être connecté pour commander.');
        window.location.href = 'seConnecter.html';
        return;
    }

    let jour = selectJour.value;
    let creneau = selectCreneau.value;
    if (!creneau) {
        alert('Veuillez choisir un créneau !');
        return;
    }

    commandeEnAttente = {
        utilisateur_id: utilisateur.id,
        panier: panierItems.map(item => ({ produit_id: item.id, quantite: item.quantite })),
        creneau_retrait: jour + ' ' + creneau
    };

    let sousTotal = 0;
    panierItems.forEach((item)=>{ sousTotal += item.prix * item.quantite; });
    let taxes = sousTotal * 0.15;
    let total = sousTotal + taxes;

    let lignes = '';
    panierItems.forEach((item)=>{
        lignes += `<p>${item.name} x${item.quantite} — ${(item.prix * item.quantite).toFixed(2)}$</p>`;
    });

    document.getElementById('resumePaiement').innerHTML = `
        ${lignes}
        <p style="margin-top:10px">Sous-total : ${sousTotal.toFixed(2)}$</p>
        <p>Taxes (15%) : ${taxes.toFixed(2)}$</p>
        <p style="font-weight:bold;margin-top:5px">TOTAL : ${total.toFixed(2)}$</p>
        <p style="margin-top:10px;color:rgb(160,160,160)">Créneau : ${jour + ' ' + creneau}</p>
    `;

    document.getElementById('modalPaiement').style.display = 'flex';
});

document.getElementById('btnAnnulerPaiement').addEventListener('click', ()=>{
    commandeEnAttente = null;
    document.getElementById('modalPaiement').style.display = 'none';
});

document.getElementById('btnConfirmerPaiement').addEventListener('click', async ()=>{
    if (!commandeEnAttente) return;

    try {
        let reponse = await fetch(API + '/commandes/creer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(commandeEnAttente)
        });

        let data = await reponse.json();

        if (data.success) {
            document.getElementById('modalPaiement').style.display = 'none';
            commandeEnAttente = null;
            panierItems.length = 0;
            updatePanier();
            panierVide();
            calculeFrais();
            alert('Commande #' + data.commandeId + ' validée !');
        } else {
            alert('Erreur : ' + data.message);
        }

    } catch (erreur) {
        alert('Erreur serveur : ' + erreur.message);
    }
});

chargerMenu();
