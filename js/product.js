const API_KEY = '5dca418b-a184-4820-a290-a7dcce4312c8';
const BASE_URL = 'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api';
const productGrid = document.getElementById('product-grid');
const productsPerPage = 9; 
let products = []; 
let displayedProducts = 0; 

async function getProductsFromApi() {
    try {
        const response = await fetch(`${BASE_URL}/goods?api_key=${API_KEY}`);
        if (!response.ok) {
            throw new Error('Ошибка при загрузке товаров: ' + response.status);
        }
        const data = await response.json();
        products = data;
        displayProducts(0, productsPerPage);
    } catch (error) {
        console.error('Ошибка при загрузке товаров:', error);
    }
}

function createProductCard(product) {
    let priceHTML = `<p class="card-text">Цена: ${product.actual_price} ₽</p>`;
    const discountedPrice = product.discount_price;
    if (discountedPrice != null) {priceHTML = `
        <p class="card-text"><del>${product.actual_price} ₽</del> ${discountedPrice} ₽</p>
    `;}
    
    let truncatedName = product.name.length > 60 ? product.name.substring(0, 60) + '...' : product.name;
    
    return `
        <div class="col-md-4 product-card">
            <div class="card">
                <a href="product.html" data-product-id="${product.id}" class="product-link">
                    <img src=${product.image_url} class="card-img-top" alt="${product.name}">
                </a>
                <div class="card-body">
                    <h5 class="card-title">${truncatedName}</h5>
                    <p class="card-text">Рейтинг: ${product.rating}⭐</p>
                    ${priceHTML}
                    <button class="btn btn-primary add-to-cart" data-product-id="${product.id}">Добавить в корзину</button>
                </div>
            </div>
        </div>
    `;
}

function displayProducts(start, end) {
    let productCardsHTML = "";
    for (let i = start; i < end && i < products.length; i++) {
        productCardsHTML += createProductCard(products[i]);
    }
    productGrid.innerHTML += productCardsHTML;
    displayedProducts += (end - start < products.length) ? (end - start) : (products.length - start);
}

function loadMoreProducts() {
    displayProducts(displayedProducts, displayedProducts + productsPerPage);
    if (displayedProducts >= products.length) {
        document.querySelector('.load-more').style.display = 'none';
    }
}

function addToCart(productId) {
    // Получаем корзину из localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Проверяем, есть ли уже этот товар в корзине
    const existingProduct = cart.find(item => item.id === productId);

    if (existingProduct) {
        // Если товар уже есть в корзине, увеличиваем количество
        existingProduct.quantity = (existingProduct.quantity || 1) + 1;
        showNotification('Товар добавлен в корзину');
    } else {
        // Если товара нет в корзине, добавляем его
        const productToAdd = products.find(product => product.id === productId);
        cart.push({ ...productToAdd, quantity: 1 });
        showNotification('Товар добавлен в корзину'); 
    }

    // Сохраняем корзину в localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
}

function showNotification(message) {
    const notificationArea = document.getElementById('notification-area');
    notificationArea.textContent = message;
    notificationArea.style.display = 'block';

    setTimeout(() => {
        notificationArea.style.display = 'none';
    }, 3000);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    getProductsFromApi(); // Получаем данные из API

    productGrid.addEventListener('click', function(event) {
        if (event.target.classList.contains('product-link')) {
            event.preventDefault();
            const productId = event.target.dataset.productId;
            const product = products.find(p => p.id == productId);

            if (product) {
                localStorage.setItem("current", JSON.stringify(product));
                window.location.href = "product.html";
            } else {
                console.error('Продукт с ID ' + productId + ' не найден.');
            }
        } else if (event.target.classList.contains('add-to-cart')) {
            const productId = parseInt(event.target.dataset.productId);
            addToCart(productId);
        }
    });

    document.querySelector('.load-more').addEventListener('click', loadMoreProducts);
});