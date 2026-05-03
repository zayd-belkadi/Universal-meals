import {panierAlt} from '../scripts/cart.js'
import {listMenu} from '../data/menuList.js'


export const panier = [];

export function updatePanier(){
    panier.length = 0;
    panierAlt.forEach((item) => {
    
        listMenu.forEach((produit) => {
            if (produit.name == item.name ){
                panier.push({
                    id : produit.id,
                    image: produit.image,
                    name: produit.name,
                    price : produit.price,
                    quantite : item.quantite
                });
            }
            
        })}
        
    )
    
}



