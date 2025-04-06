const productGrid = document.getElementById('product-grid');
const productsPerPage = 9; 
let products = []; 
let displayedProducts = 0; 

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomProductName() {
    const productNames = ["Кроссовки", "Футболка", "Шорты", "Куртка", "Брюки", "Шапка", "Перчатки", "Носки", "Ремень", "Рюкзак", "Шарф", "Тапки"];
    return productNames[Math.floor(Math.random() * productNames.length)];
}

function generateProductData() {
    return {
        name: getRandomProductName(),
        category: ["Обувь", "Одежда"][Math.floor(Math.random() * 2)], 
        price: getRandomInt(200, 2000),
        discount: Math.random() < 0.3, 
        rating: getRandomInt(3, 5),
    };
}

// Функция для создания HTML-карточки товара
function createProductCard(product) {
    let priceHTML = `<p class="card-text">Цена: ${product.price} ₽</p>`;
    if (product.discount) {
        const discountedPrice = product.price * 0.85; 
priceHTML = `
    <p class="card-text"><del>${product.price} ₽</del></p>
    <p class="card-text">Цена со скидкой: ${discountedPrice.toFixed(2)} ₽</p>
`;
}
    return `
        <div class="col-md-4 product-card">
            <div class="card">
                <img src="/img/good.jpg" class="card-img-top" alt="${product.name}">
                <div class="card-body">
                    <h5 class="card-title">${product.name}</h5>
                    <p class="card-text">Рейтинг: ⭐${product.rating}</p>
                    ${priceHTML}
                    <a href="#" class="btn btn-primary">Добавить в корзину</a>
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

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    generateProducts();
    displayProducts(0, productsPerPage); 
    if (products.length <= productsPerPage) {
        document.querySelector('.load-more').style.display = 'none'; // Скрываем кнопку, если товаров мало
    }

    document.querySelector('.load-more').addEventListener('click', loadMoreProducts);
});