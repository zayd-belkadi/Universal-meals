import {menuItems, categoryList} from '../data/menudata.js'
import {panierItems} from '../data/panier.js'
import {updatePanier, panierVide,calculeFrais} from './panier.js'

let menuProduit = '';
let menuCategoryItem = '';
panierVide();

function itemWrite (item){
    
    menuItems.forEach((produit)=> {
        
    if (item == produit.category){
        
        let itemForm = `
                    <p class="itemName">${produit.name} ${((produit.prix)/100).toFixed(2)}$</p>
                    
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
                        <button class="add" data-produit-id = ${produit.id}>[+]</button>
                    </div>
                    <br>`;
            menuCategoryItem += itemForm

        }})
        return menuCategoryItem;
}



categoryList.forEach((item)=> {
    let categoryForm = `
    <div class="Category">
        <p class="categoryName">-----${item}-----</p>
        <div class="item">
        ${itemWrite(item)}
        </div>
    </div>`
    
    menuProduit += categoryForm;
    menuCategoryItem = '';
});

document.querySelector('.categoryHolder').innerHTML = menuProduit; 
document.querySelectorAll('.add').forEach((btn)=>{
        btn.addEventListener('click', () => {

            let id = Number(btn.dataset.produitId);
            let quantite = Number(document.querySelector(".optionValeur" + id).value);

            let existItem = panierItems.find(item => item.id == id);

            let select = document.querySelector(".optionValeur"+id);
            select.value = "1";

            if (existItem) {
                existItem.quantite += quantite;
            } else {
                let produit = menuItems.find(p => p.id == id);
                if (produit) {
                    panierItems.push({
                        id: produit.id,
                        name: produit.name,
                        prix: produit.prix,
                        quantite: quantite,
                    });
                }
            }

            updatePanier();
            calculeFrais();
        });
    })
