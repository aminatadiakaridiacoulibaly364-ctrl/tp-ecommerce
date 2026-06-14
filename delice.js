
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales pour le LocalStorage
    var ClePanier = 'delice_cart';
    var CleFavoris = 'delice_favorites';
                     
    // Gestion du badge du panier dans le header
    var conteneurPanier = document.getElementById('cart');
    var elementCompteur = null;

    if (conteneurPanier) {
        elementCompteur = document.createElement('span');
        elementCompteur.id = 'cart-count';
        // Style du badge
        elementCompteur.style.display = 'inline-block';
        elementCompteur.style.minWidth = '20px';
        elementCompteur.style.padding = '2px 6px';
        elementCompteur.style.marginLeft = '6px';
        elementCompteur.style.background = '#e74c3c';
        elementCompteur.style.color = '#fff';
        elementCompteur.style.borderRadius = '12px';
        elementCompteur.style.fontSize = '12px';
        elementCompteur.style.textAlign = 'center';
        elementCompteur.style.fontWeight = 'bold';
        conteneurPanier.appendChild(elementCompteur);
    }
 
    // Fonctions pour le panier
    function recupererPanier() {
        var panierTexte = localStorage.getItem(ClePanier);
        if (!panierTexte) {
            return [];
        }
        return JSON.parse(panierTexte);
    }
 
    function enregistrerPanier(nouveauPanier) {
        localStorage.setItem(ClePanier, JSON.stringify(nouveauPanier));
        actualiserCompteurPanier();
    }
 
    function actualiserCompteurPanier() {
        var monPanier = recupererPanier();
        var totalArticles = 0;
        
        for (var i = 0; i < monPanier.length; i++) {
            totalArticles += monPanier[i].qty || 0;
        }

        if (elementCompteur) {
            if (totalArticles > 0) {
                elementCompteur.textContent = totalArticles;
            } else {
                elementCompteur.textContent = '';
            }
        }
    }
 
    function ajouterAuPanier(produit) {
        var monPanier = recupererPanier();
        // On cherche si le produit est déjà là
        var produitTrouve = null;
        for (var i = 0; i < monPanier.length; i++) {
            if (monPanier[i].id === produit.id) {
                produitTrouve = monPanier[i];
                break;
            }
        }

        if (produitTrouve) {
            produitTrouve.qty = (produitTrouve.qty || 0) + 1;
        } else {
            produit.qty = 1;
            monPanier.push(produit);
        }

        enregistrerPanier(monPanier);
        alert(produit.name + " ajouté au panier !");
    }
 
    // Fonctions pour les favoris
    function recupererFavoris() {
        var favorisTexte = localStorage.getItem(CleFavoris);
        if (!favorisTexte) {
            return [];
        }
        return JSON.parse(favorisTexte);
    }
 
    function enregistrerFavoris(nouveauxFavoris) {
        localStorage.setItem(CleFavoris, JSON.stringify(nouveauxFavoris));
    }
 
    // Fonction pour extraire le prix qui est dans le texte de la carte
    function chercherPrixTexte(texte) {
        if (!texte) return 0;
        var regex = /prix:?\s*([0-9]+[\.,]?[0-9]*)/i;
        var resultat = texte.match(regex);
        if (!resultat) return 0;
        
        var prixPropre = resultat[1].replace(',', '.');
        return parseFloat(prixPropre) || 0;
    }
 
    // Fonction pour récupérer les infos HTML d'une carte produit
    function recupererInfosProduit(carteHTML) {
        var elementNom = carteHTML.querySelector('strong');
        var elementDescription = carteHTML.querySelector('span > p') || carteHTML.querySelector('p');
        
        var texteDescription = elementDescription ? elementDescription.textContent : '';
        var prixProduit = chercherPrixTexte(texteDescription);
        
        var elementImg = carteHTML.querySelector('img:first-of-type');
        
        var nomPropre = elementNom ? elementNom.textContent.trim() : 'Produit';
        var idProduit = nomPropre + '_' + prixProduit;
        
        var urlImage = elementImg ? elementImg.src : '';

        return {
            id: idProduit,
            name: nomPropre,
            price: prixProduit,
            image: urlImage
        };
    }
 
    // Écouteurs d'événements sur les boutons des cartes produits
    var toutesLesCartes = document.querySelectorAll('.card');
    
    toutesLesCartes.forEach(function(carte) {
        var listeBoutons = Array.from(carte.querySelectorAll('button'));
        var boutonAjouter = listeBoutons[0];
        var boutonFavoris = listeBoutons[1];
 
        // Gestion du bouton Ajouter au panier
        if (boutonAjouter) {
            boutonAjouter.classList.add('add-to-cart');
            boutonAjouter.addEventListener('click', function(evenement) {
                evenement.preventDefault();
                var produitSelectionne = recupererInfosProduit(carte);
                ajouterAuPanier(produitSelectionne);
            });
        }
 
        // Gestion du bouton Favoris
        if (boutonFavoris) {
            boutonFavoris.classList.add('favorite-btn');
            boutonFavoris.style.cursor = 'pointer';
            boutonFavoris.addEventListener('click', function(evenement) {
                evenement.preventDefault();
                var produitSelectionne = recupererInfosProduit(carte);
                var mesFavoris = recupererFavoris();
                
                // On cherche s'il est déjà en favori
                var indexFavori = -1;
                for (var j = 0; j < mesFavoris.length; j++) {
                    if (mesFavoris[j].id === produitSelectionne.id) {
                        indexFavori = j;
                        break;
                    }
                }
 
                if (indexFavori !== -1) {
                    // Si déjà en favori, on l'enlève
                    mesFavoris.splice(indexFavori, 1);
                    boutonFavoris.classList.remove('liked');
                } else {
                    // Sinon, on l'ajoute
                    mesFavoris.push(produitSelectionne);
                    boutonFavoris.classList.add('liked');
                }
                enregistrerFavoris(mesFavoris);
            });
        }
    });
 
    // Initialisation visuelle des cœurs au chargement de la page
    var listeFavorisActuels = recupererFavoris();
    
    toutesLesCartes.forEach(function(carte) {
        var produitSelectionne = recupererInfosProduit(carte);
        var listeBoutons = Array.from(carte.querySelectorAll('button'));
        var boutonFavoris = listeBoutons[1];
        
        if (boutonFavoris) {
            for (var k = 0; k < listeFavorisActuels.length; k++) {
                if (listeFavorisActuels[k].id === produitSelectionne.id) {
                    boutonFavoris.classList.add('liked');
                    break;
                }
            }
        }
    });
 
    // Liens de redirection au clic dans le header
    if (conteneurPanier) {
        conteneurPanier.style.cursor = 'pointer';
        conteneurPanier.addEventListener('click', function() {
            window.location.href = 'panier.html';
        });
    }
 
    var iconeFavoriHeader = document.getElementById('favori');
    if (iconeFavoriHeader) {
        iconeFavoriHeader.style.cursor = 'pointer';
        iconeFavoriHeader.addEventListener('click', function() {
            window.location.href = 'favori.html';
        });
    }
 
    // Lancement du compteur au démarrage
    actualiserCompteurPanier();
});



document.addEventListener('DOMContentLoaded', () => {
    const CART_KEY = 'delice_cart';
    const cartContent = document.getElementById('cart-content');
  
    function loadCart() { 
        return JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    }

    function saveCart(cart) { 
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        renderCart(); 
    }
  
    function renderCart() {
        const cart = loadCart();
        
        if (cart.length === 0) {
            cartContent.innerHTML = '<div class="empty-cart"><p>Votre panier est vide</p></div>';
            return;
        }
        
        let html = `
            <table class="cart-table">
                <thead>
                    <tr>
                        <th>Produit</th>
                        <th>Prix</th>
                        <th>Quantité</th>
                        <th>Total</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        let grandTotal = 0;
        
        cart.forEach((item, idx) => {
            const itemTotal = item.price * item.qty;
            grandTotal += itemTotal;
            html += `
                <tr class="cart-item">
                    <td><img src="${item.image}" alt="${item.name}">${item.name}</td>
                    <td>${item.price.toFixed(2)} €</td>
                    <td>
                        <div class="qty-control">
                            <button onclick="decreaseQty(${idx})">-</button>
                            <span>${item.qty}</span>
                            <button onclick="increaseQty(${idx})">+</button>
                        </div>
                    </td>
                    <td>${itemTotal.toFixed(2)} €</td>
                    <td><button onclick="removeItem(${idx})" class="delete-btn">Supprimer</button></td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        html += `<div class="total-section">Total: ${grandTotal.toFixed(2)} €</div>`;
        html += '<button class="checkout-btn" onclick="checkout()">Passer la commande</button>';
        
        cartContent.innerHTML = html;
    }
  
    // Liaison des fonctions au scope global (window) pour les attributs HTML 'onclick'
    window.increaseQty = (idx) => {
        const cart = loadCart();
        cart[idx].qty++;
        saveCart(cart);
    };
  
    window.decreaseQty = (idx) => {
        const cart = loadCart();
        if (cart[idx].qty > 1) {
            cart[idx].qty--;
        } else {
            cart.splice(idx, 1);
        }
        saveCart(cart);
    };
  
    window.removeItem = (idx) => {
        const cart = loadCart();
        cart.splice(idx, 1);
        saveCart(cart);
    };
  
    window.checkout = () => {
        alert('Commande confirmée ! Merci pour votre achat.');
        localStorage.setItem(CART_KEY, '[]');
        renderCart();
    };
  
    // Gestion du lien des favoris
    const favIcon = document.getElementById('favori');
    if (favIcon) {
        favIcon.addEventListener('click', () => {
            window.location.href = 'favorites.html';
        });
    }
  
    // Premier affichage du panier
    renderCart();
});








// Clés pour le LocalStorage
const FAV_KEY = 'delice_favorites';
const CART_KEY = 'delice_cart';

// Fonction pour récupérer les favoris stockés
function loadFavs() { 
    var favs = localStorage.getItem(FAV_KEY);
    if (favs == null) {
        return [];
    }
    return JSON.parse(favs);
}

// Fonction pour sauvegarder les favoris et recharger l'affichage
function saveFavs(favs) { 
    localStorage.setItem(FAV_KEY, JSON.stringify(favs));
    renderFavorites(); 
}

// Fonction pour récupérer le panier stocké
function loadCart() { 
    var cart = localStorage.getItem(CART_KEY);
    if (cart == null) {
        return [];
    }
    return JSON.parse(cart);

}







// Fonction pour sauvegarder le panier
function saveCart(cart) { 
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Fonction principale pour générer la grille des favoris
function renderFavorites() {
    var favs = loadFavs();
    var favContent = document.getElementById('favorites-content');
    
    // Si la liste des favoris est vide
    if (favs.length === 0) {
        favContent.innerHTML = '<div class="empty-msg"><p>Vous n\'avez pas de favoris pour le moment</p></div>';
        return;
    }
    
    // Fabrication de la grille HTML en JavaScript
    var html = '<div class="favorites-grid">';
    
    for (var i = 0; i < favs.length; i++) {
        var item = favs[i];
        
        html += '<div class="fav-card">';
        html += '  <img src="' + item.image + '" alt="' + item.name + '">';
        html += '  <h3>' + item.name + '</h3>';
        html += '  <p>' + item.price.toFixed(2) + ' €</p>';
        html += '  <div class="fav-actions">';
        html += '    <button class="add-cart-btn" onclick="addToCart(' + i + ')">Ajouter au panier</button>';
        html += '    <button class="remove-btn" onclick="removeFav(' + i + ')">Retirer</button>';
        html += '  </div>';
        html += '</div>';
    }
    
    html += '</div>';
    
    // Injection du code généré dans la page
    favContent.innerHTML = html;
}

// Ajouter un produit favori dans le panier
function addToCart(idx) {
    var favs = loadFavs();
    var product = favs[idx];
    var cart = loadCart();
    
    // Recherche si le produit existe déjà dans le panier
    var existingItem = null;
    for (var i = 0; i < cart.length; i++) {
        if (cart[i].id === product.id) {
            existingItem = cart[i];
            break;
        }
    }
    
    // Si le produit est déjà présent, on augmente simplement sa quantité
    if (existingItem != null) {
        existingItem.qty++;
    } else {
        // Sinon, on ajoute le produit avec une quantité initiale de 1
        var newProduct = {
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            qty: 1
        };
        cart.push(newProduct);
    }
    
    saveCart(cart);
    alert(product.name + ' ajouté au panier !');
}

// Retirer un produit de la liste des favoris
function removeFav(idx) {
    var favs = loadFavs();
    favs.splice(idx, 1); // Supprime l'élément à l'index passé en paramètre
    saveFavs(favs);
}

// Événement au chargement complet de la structure DOM
document.addEventListener('DOMContentLoaded', function() {
    // Gestion du lien de l'icône panier
    var cartContainer = document.getElementById('cart');
    if (cartContainer) {
        cartContainer.addEventListener('click', function() {
            window.location.href = 'cart.html'; // Redirection vers la page panier.html (ou cart.html selon votre nommage)
        });
    }
  
    // Affichage des favoris au chargement de la page
    renderFavorites();
});





