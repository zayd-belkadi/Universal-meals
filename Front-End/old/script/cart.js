import {panier, updatePanier} from '../data/cart.js'
import {listMenu} from '../data/menuList.js'

export let panierAlt = [];
let panierProduit = '';

function panierNum(){
    let totalQuantite = 0;
    panier.forEach((produit)=>{
        totalQuantite += Number(produit.quantite)
    })
    document.querySelector(".panierNum").innerHTML= `(${totalQuantite})`;
}

function panierHTML(){
    panierInner()
    function panierInner (){
    panierProduit = '';
    panier.forEach((produit) => {
        let itemForm = `
        <div class="card">
            <img src="${produit.image}" >

            <div class="cardCentre">
                <p class="cardName">${produit.name}</p>
                <div class="quantityDiv">
            <button class="arrowQLeft" data-produit-id = "${produit.id}"><</button><span class="quantite${produit.id}">${produit.quantite}</span><button class="arrowQRight" data-produit-id = "${produit.id}">></button>
            </div>
            </div>

            <div class="cardBottom">
                <p class="cardPrice">$${(((produit.price)* produit.quantite) / 100).toFixed(2)}</p>
                <button class="delete" data-produit-nom= "${produit.name}">X</button>
            </div>
        </div>`;

        panierProduit += itemForm;
        
       

    })

    document.querySelector(".menuHolder").innerHTML= panierProduit;
}

    
    document.querySelectorAll(".arrowQLeft")
    .forEach((btn) => {
        btn.addEventListener('click' , ()=>{
            panierAlt == JSON.parse(localStorage.getItem('panier'));
            panierAlt.forEach((element)=>{
                if (element.id == btn.dataset.produitId && element.quantite > 1){
                    element.quantite -= 1;
            
                }
            })
            localStorage.setItem('panier', JSON.stringify(panierAlt));
            updatePanier();
            panierHTML();
            panierNum();

        })
        
    })

    document.querySelectorAll(".arrowQRight")
    .forEach((btn) => {
        btn.addEventListener('click' , ()=>{

            panierAlt == JSON.parse(localStorage.getItem('panier'));
            panierAlt.forEach((element)=>{
                if (element.id == btn.dataset.produitId){
                    element.quantite = Number(element.quantite) + 1;
            
                }
            })
            
            localStorage.setItem('panier', JSON.stringify(panierAlt));
            updatePanier();
            panierHTML();
            panierNum();

        })
    })

    
    document.querySelectorAll(".delete")
    .forEach((btn) => {
        btn.addEventListener('click' , ()=>{
            let newPanier = [];
            let button =  btn.dataset.produitNom;
            
            panier
            .forEach((item) =>{
                if (item.name !== button){
                    newPanier.push({id : item.id, name : item.name, quantite : item.quantite});
                }
            })
            panierAlt = newPanier;
            localStorage.setItem('panier', JSON.stringify(panierAlt));
            updatePanier();panierNum();
            panierHTML();
            
        })
    })

}


if (JSON.parse(localStorage.getItem('panier')) !== null){
    panierAlt = JSON.parse(localStorage.getItem('panier'));

    updatePanier(); 
    panierHTML();
    panierNum();

}else{
    panier.length=0;
    panierAlt.length=0;
}

