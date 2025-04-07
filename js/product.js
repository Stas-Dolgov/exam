const productGrid = document.getElementById('product-grid');
const productsPerPage = 9; 
let products = productsData; 
let displayedProducts = 0; 

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createProductCard(product) {
    let priceHTML = `<p class="card-text">Цена: ${product.price} ₽</p>`;
    if (product.discount > 0) { // Проверяем, есть ли скидка (discount > 0)
        const discountedPrice = product.price * (1 - product.discount); // Расчет скидки
        priceHTML = `
            <p class="card-text"><del>${product.price} ₽</del> ${discountedPrice.toFixed(2)} ₽</p>
        `;
    }
    return `
        <div class="col-md-4 product-card">
            <div class="card">
                <img src=${product.image} class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
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
    displayedProducts += (end - start < products.length) ? (end - start) : (products.length - start); // Обновляем счетчик отображенных товаров
}

function loadMoreProducts() {
    displayProducts(displayedProducts, displayedProducts + productsPerPage);
    // Скрываем кнопку "Загрузить ещё", если все товары отображены
    if (displayedProducts >= products.length) {
        document.querySelector('.load-more').style.display = 'none';
    }
}

function generateProducts() {
    const numberOfProducts = 27; // Количество товаров для генерации
    for (let i = 0; i < numberOfProducts; i++) {
        products.push(generateProductData());
    }
}

function addToCart(productId) {
    // Получаем корзину из localStorage или создаем пустой массив
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Проверяем, есть ли уже этот товар в корзине
    const existingProduct = cart.find(item => item.id === productId);

    if (existingProduct) {
        // Если товар уже есть в корзине, увеличиваем количество (если нужно)
        existingProduct.quantity = (existingProduct.quantity || 1) + 1;
    } else {
        // Если товара нет в корзине, добавляем его
        const productToAdd = products.find(product => product.id === productId);
        cart.push({ ...productToAdd, quantity: 1 });
    }

    // Сохраняем корзину в localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    console.log('Товар добавлен в корзину.  Текущая корзина:', cart);  // Выводим корзину в консоль для проверки
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    displayProducts(0, productsPerPage);
    if (products.length <= productsPerPage) {
        document.querySelector('.load-more').style.display = 'none';
    }

    document.querySelector('.load-more').addEventListener('click', loadMoreProducts);

    productGrid.addEventListener('click', function(event) {
        if (event.target.classList.contains('add-to-cart')) {
            const productId = parseInt(event.target.dataset.productId);
            addToCart(productId);
        }
    });
});