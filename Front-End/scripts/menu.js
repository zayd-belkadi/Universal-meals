import {listMenu} from '../data/menuList.js'
import {panierAlt} from './cart.js'
import {panier, updatePanier} from '../data/cart.js'
import { repete } from './repete.js';

let menuProduit = '';

function panierNum(){
    let totalQuantite = 0;
    panier.forEach((produit)=>{
        totalQuantite += Number(produit.quantite)
    })
    document.querySelector(".panierNum").innerHTML= `(${totalQuantite})`;
}

listMenu.forEach((produit) => {
    let itemForm = `
    <div class="card">
        <img src="${produit.image}" >
        <div class="cardCentre">
            <p class="cardName">${produit.name}</p>
            
            <div class="produitQuantite">
                <select class="optionValeur${produit.id}">
                <option selected value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
                <option value="10">10</option>
                </select>
            </div>
        </div>
        <div class="cardBottom">
            <p class="cardPrice">$${((produit.price) / 100).toFixed(2)}</p>
            <button class="cardBtn" data-produit-id = "${produit.id}" data-produit-nom= "${produit.name}">🛒</button>
        </div>
    </div>`;

    menuProduit += itemForm;
    
    document.querySelector('.menuHolder').innerHTML = menuProduit; 

})

document.querySelectorAll('.cardBtn')
    .forEach((btn) =>{
        btn.addEventListener('click', () => {
            let id = btn.dataset.produitId;
            let quantiteValeur = document.querySelector(".optionValeur"+id).value;
            localStorage.getItem('panier') !== null?  panierAlt ==  JSON.parse(localStorage.getItem('panier')): '';
            panierAlt.push(
                {   id : btn.dataset.produitId,
                     name : btn.dataset.produitNom,
            quantite : quantiteValeur });
            localStorage.setItem('panier' , JSON.stringify(panierAlt));
            updatePanier();
            panierNum();
        });
    })

panierNum();
repete(panier);