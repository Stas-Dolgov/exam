const API_KEY = '5dca418b-a184-4820-a290-a7dcce4312c8';
const BASE_URL = 'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api';

let cart = JSON.parse(localStorage.getItem('cart')) || [];

function getFromLocalStorage(key) {
    return JSON.parse(localStorage.getItem(key));
}
function removeFromLocalStorage(key) {
    localStorage.removeItem(key);
}

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
        let price = product.actual_price; 
        if (product.discount_price != null) {
            price = product.discount_price
        };
        const productCardHTML = createCartItemCard(product);
        cartItemsContainer.innerHTML += productCardHTML;
        totalPrice += price * (product.quantity || 1);
    });

    document.getElementById('total-price').textContent = totalPrice + ' ₽'; // Обновляем цену
}

function createCartItemCard(product) {
    let quantity = product.quantity || 1;
    let price = product.actual_price * quantity; 
    let priceHTML = `<p class="card-text">Цена: ${price} ₽</p>`;
    const discountedPrice = product.discount_price;
    if (discountedPrice != null) {priceHTML = `
        <p class="card-text"><del>${product.actual_price} ₽</del> ${discountedPrice} ₽</p>
    `;}
 
    let truncatedName = product.name.length > 94 ? product.name.substring(0, 94) + '...' : product.name;

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

// Функция для форматирования даты в "dd.mm.yyyy"
function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

function resetCart() {
    localStorage.removeItem('cart'); 
    cart = []; 
    renderCart(); 
    document.getElementById('order-form').reset();
}



document.getElementById('order-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const fullName = document.getElementById('name').value; 
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const deliveryAddress = document.getElementById('address').value; 
    const deliveryDate = document.getElementById('delivery-date').value;
    const deliveryInterval = document.getElementById('delivery-time').value;
    const comment = document.getElementById('comment').value;
    const subscribe = document.getElementById('subscribe').checked ? 1 : 0;

    if (cart.length === 0) {
        showNotification('Корзина пуста', 'error');
        return;
    }

    const formattedDeliveryDate = formatDate(deliveryDate);

    const orderData = {
        full_name: fullName,
        email: email,
        phone: phone,
        delivery_address: deliveryAddress,
        delivery_date: formattedDeliveryDate,
        delivery_interval: deliveryInterval,
        comment: comment,
        subscribe: subscribe,
        good_ids: cart.map(item => item.id)
    };

    console.log('Данные для отправки:', JSON.stringify(orderData));

    fetch(`${BASE_URL}/orders?api_key=${API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    })
    .then(response => {
        if (response.ok) {
            return response.json(); // Читаем JSON из ответа
        } else {
            throw new Error('Ошибка при отправке заказа: ' + response.status);
        }
    })
    .then(data => {
        showNotification('Заказ успешно оформлен!');
        resetCart(); // Очищаем корзину и форму
    })
    .catch(error => {
        // Обрабатываем ошибку
        showNotification('Произошла ошибка при оформлении заказа: ' + error.message);
    });
});


document.addEventListener('DOMContentLoaded', () => {
    renderCart();

    document.getElementById('cart-items').addEventListener('click', function(event) {
        if (event.target.classList.contains('remove-from-cart')) {
            const productId = parseInt(event.target.dataset.productId);
            removeFromCart(productId);
        }
    });

    document.getElementById('reset-button').addEventListener('click', resetCart);
});
