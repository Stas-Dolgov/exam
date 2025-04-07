let cart = JSON.parse(localStorage.getItem('cart')) || [];

function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const submitButton = document.getElementById('submit-button');


    cartItemsContainer.innerHTML = '';

    console.log('Содержимое корзины при рендеринге:', cart); // Проверяем содержимое корзины

    if (cart.length === 0) {
        emptyCartMessage.style.display = 'block';
        submitButton.disabled = true;
        return;
    } else {
        emptyCartMessage.style.display = 'none';
        submitButton.disabled = false;
    }

    let totalPrice = 0;

    cart.forEach(product => {
        const productCardHTML = createCartItemCard(product);
        cartItemsContainer.innerHTML += productCardHTML;
        totalPrice += product.price * (product.quantity || 1) * (1 - (product.discount || 0));
    });

    document.getElementById('total-price').textContent = totalPrice + ' ₽'; // Обновляем текст
}

function createCartItemCard(product) {
    let quantity = product.quantity || 1;
    let price = product.price * quantity; 

    let priceHTML = `<p class="card-text">Цена: ${price} ₽</p>`;
    if (product.discount > 0) { // Есть ли скидка
        const discountedPrice = product.price * (1 - product.discount); 
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
                    <p class="card-text">Рейтинг: ⭐${product.rating}</p>
                    ${priceHTML}
                    <p class="card-text">Количество: ${quantity}</p>
                    <button class="btn btn-danger btn-sm remove-from-cart" data-product-id="${product.id}">Удалить</button>
                </div>
            </div>
        </div>
    `;
}

function removeFromCart(productId) {
    cart = cart.filter(product => product.id !== productId);
    localStorage.setItem('cart', JSON.stringify(cart)); // Обновляем localStorage
    renderCart();
    showNotification('Товар удален из корзины.');
}

function showNotification(message) {
    const notificationArea = document.getElementById('notification-area');
    notificationArea.textContent = message;
    notificationArea.style.display = 'block';

    setTimeout(() => {
        notificationArea.style.display = 'none';
    }, 3000);
}

function resetCart() {
    localStorage.removeItem('cart');
    cart = [];
    renderCart();
    document.getElementById('order-form').reset();
    showNotification('Корзина и форма очищены.');
}

document.addEventListener('DOMContentLoaded', () => {
    renderCart();

    // Обработчик события для удаления товара
    document.getElementById('cart-items').addEventListener('click', function(event) {
        if (event.target.classList.contains('remove-from-cart')) {
            const productId = parseInt(event.target.dataset.productId);
            removeFromCart(productId);
        }
    });

    document.getElementById('order-form').addEventListener('submit', function(event) {
        event.preventDefault(); // Предотвращаем отправку формы по умолчанию
        alert('Ваш заказ отправлен');
    });
    document.getElementById('reset-button').addEventListener('click', resetCart);
});