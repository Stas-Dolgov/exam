const API_KEY = '5dca418b-a184-4820-a290-a7dcce4312c8';
const BASE_URL = 'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api';

document.addEventListener('DOMContentLoaded', () => {
    loadOrders();
});

async function loadOrders() {
    try {
        const response = await fetch(`${BASE_URL}/orders?api_key=${API_KEY}`);
        if (!response.ok) {
            throw new Error('Ошибка при загрузке заказов: ' + response.status);
        }
        const orders = await response.json();
        displayOrders(orders);
    } catch (error) {
        console.error('Ошибка при загрузке заказов:', error);
    }
}

async function displayOrders(orders) {
    const ordersTableBody = document.getElementById('orders-table-body');
    ordersTableBody.innerHTML = '';

    for (const order of orders) {
        const orderRow = document.createElement('tr');
        const formattedOrderItems = order.good_ids ? await formatOrderItems(order.good_ids) : 'Состав заказа не определён';
        const totalOrderPrice = order.good_ids ? await calculateOrderTotalPrice(order.good_ids) : 0;
        const createdAt = new Date(order.created_at);
        const formattedDate = `${createdAt.getDate().toString().padStart(2, '0')}.${(createdAt.getMonth() + 1).toString().padStart(2, '0')}.${createdAt.getFullYear()}`;
        const formattedTime = `${createdAt.getHours().toString().padStart(2, '0')}:${createdAt.getMinutes().toString().padStart(2, '0')}`;
        orderRow.innerHTML = `
            <td>${order.id}</td>
            <td>${formattedDate} ${formattedTime}</td>
            <td title="${order.good_ids ? order.good_ids.join(', ') : ''}">${formattedOrderItems}</td>
            <td>${formatPrice(totalOrderPrice + 99)}</td>
            <td>${order.delivery_date}, ${order.delivery_interval}</td>
            <td class="actions">
                <button class="btn btn-info btn-sm view-order-button" data-order-id="${order.id}" title="Просмотр">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-primary btn-sm edit-order-button" data-order-id="${order.id}" title="Редактировать">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm delete-order-button" data-order-id="${order.id}" title="Удалить">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;
        const viewButton = orderRow.querySelector('.view-order-button');
        const editButton = orderRow.querySelector('.edit-order-button');
        const deleteButton = orderRow.querySelector('.delete-order-button');

        deleteButton.addEventListener('click', () => deleteOrder(order.id));
        viewButton.addEventListener('click', () => viewOrder(order.id));
        editButton.addEventListener('click', () => editOrder(order.id));

       ordersTableBody.appendChild(orderRow);
   }

   document.getElementById('confirm-delete-button').addEventListener('click', confirmDeleteOrder);
}

async function formatOrderItems(goodIds) {
    const itemNames = [];
    for (const goodId of goodIds) {
        try {
            const response = await fetch(`${BASE_URL}/goods/${goodId}?api_key=${API_KEY}`);
            if (response.ok) {
                const item = await response.json();
                itemNames.push(item.name);
            } else {
                console.error('Ошибка при загрузке товара с ID ' + goodId + ': ' + response.status);
                itemNames.push('Товар не найден');
            }
        } catch (error) {
            console.error('Ошибка при загрузке товара с ID ' + goodId + ': ' + error.message);
            itemNames.push('Ошибка загрузки');
        }
    }
    return itemNames.join(', ');
}

async function calculateOrderTotalPrice(goodIds) {
    let total = 0;
    for (const goodId of goodIds) {
        try {
            const response = await fetch(`${BASE_URL}/goods/${goodId}?api_key=${API_KEY}`);
            if (response.ok) {
                const item = await response.json();
                total += item.discount_price || item.actual_price; // Используем цену со скидкой, если есть
            } else {
                console.error('Ошибка при загрузке товара с ID ' + goodId + ': ' + response.status);
                return 'Ошибка загрузки';
            }
        } catch (error) {
            console.error('Ошибка при загрузке товара с ID ' + goodId + ': ' + error.message);
            return 'Ошибка загрузки';
        }
    }
    return total; 
}

function formatPrice(price) {
    return price.toFixed(2) + ' ₽';
}

async function getOrderById(orderId) {
    const response = await fetch(`${BASE_URL}/orders/${orderId}?api_key=${API_KEY}`);
    if (!response.ok) {
        throw new Error('Ошибка при загрузке заказа: ' + response.status);
    }
    return response.json();
}

async function getGoodById(goodId) {
    const response = await fetch(`${BASE_URL}/goods/${goodId}?api_key=${API_KEY}`);
    if (!response.ok) {
        throw new Error('Ошибка при загрузке товара: ' + response.status);
    }
    return response.json();
}

function calculateDeliveryCost() {
    return 99; 
}

async function viewOrder(orderId) {
    try {
        const order = await getOrderById(orderId);
        const content = document.getElementById('view-order-details');
        let deliveryCost = calculateDeliveryCost();

        content.innerHTML = `
            <p><strong>Номер заказа:</strong> ${order.id}</p>
            <p><strong>Дата оформления:</strong> ${order.created_at ? order.created_at.substring(0, 10) : 'Не указана'}</p>
            <p><strong>Имя:</strong> ${order.full_name}</p>
            <p><strong>Email:</strong> ${order.email}</p>
            <p><strong>Телефон:</strong> ${order.phone}</p>
            <p><strong>Адрес доставки:</strong> ${order.delivery_address}</p>
            <p><strong>Дата доставки:</strong> ${order.delivery_date}</p>
            <p><strong>Временной интервал доставки:</strong> ${order.delivery_interval}</p>
            <p><strong>Комментарий:</strong> ${order.comment || 'Отсутствует'}</p>
            <p><strong>Подписка на рассылку:</strong> ${order.subscribe ? 'Да' : 'Нет'}</p>
            <p><strong>Состав заказа:</strong></p>
            <ul>
            </ul>
        `;

        // Получение и добавление информации о каждом товаре в заказе
        let orderGoodsList = content.querySelector('ul');
        let orderTotalPrice = 0;
        Promise.all(order.good_ids.map(goodId => getGoodById(goodId)))
            .then(goods => {
                goods.forEach(good => {
                    let listItem = document.createElement('li');
                    let price = good.discount_price ? good.discount_price : good.actual_price;
                    listItem.innerHTML = `${good.name} - ${formatPrice(price)}`;
                    orderGoodsList.appendChild(listItem);
                    orderTotalPrice += price;
                });

                // Добавление информации об общей стоимости товаров и стоимости доставки
                content.innerHTML += `<p><strong>Стоимость товаров:</strong> ${formatPrice(orderTotalPrice)}</p>`;
                content.innerHTML += `<p><strong>Стоимость доставки:</strong> ${formatPrice(deliveryCost)}</p>`;
                content.innerHTML += `<p><strong>Итоговая стоимость:</strong> ${formatPrice(orderTotalPrice + deliveryCost)}</p>`;

                $('#viewOrderModal').modal('show');
            })
            .catch(error => {
                console.error('Ошибка при получении данных о товарах:', error);
                showNotification('Ошибка при загрузке информации о товарах в заказе', 'error');
            });
    } catch (error) {
        showNotification('Ошибка при загрузке заказа', 'error');
    }
}

async function editOrder(orderId) {
    try {
        const order = await getOrderById(orderId);
        const form = document.getElementById('edit-order-details');
        form.innerHTML = `
            <div class="row">
                <div class="col-md-12">
                    <div class="form-group">
                        <label for="edit-full-name">Имя:</label>
                        <input type="text" class="form-control" id="edit-full-name" name="full-name" value="${order.full_name}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-phone">Телефон:</label>
                        <input type="text" class="form-control" id="edit-phone" name="phone" value="${order.phone}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-email">Email:</label>
                        <input type="email" class="form-control" id="edit-email" name="email" value="${order.email}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-delivery-address">Адрес доставки:</label>
                        <input type="text" class="form-control" id="edit-delivery-address" name="delivery-address" value="${order.delivery_address}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-delivery-date">Дата доставки:</label>
                        <input type="date" class="form-control" id="edit-delivery-date" name="delivery-date" value="${order.delivery_date}" required>
                    </div>
                    <div class="form-group">
                        <label for="edit-delivery-interval">Временной интервал доставки:</label>
                        <select id="edit-delivery-interval" class="form-control" name="delivery-interval" required>
                            <option value="08:00-12:00" ${order.delivery_interval === '08:00-12:00' ? 'selected' : ''}>08:00-12:00</option>
                            <option value="12:00-14:00" ${order.delivery_interval === '12:00-14:00' ? 'selected' : ''}>12:00-14:00</option>
                            <option value="14:00-18:00" ${order.delivery_interval === '14:00-18:00' ? 'selected' : ''}>14:00-18:00</option>
                            <option value="18:00-22:00" ${order.delivery_interval === '18:00-22:00' ? 'selected' : ''}>18:00-22:00</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="edit-comment">Комментарий к заказу:</label>
                        <textarea class="form-control" id="edit-comment" name="comment" rows="3">${order.comment || ''}</textarea>
                    </div>
                </div>
            </div>
            <input type="hidden" id="edit-order-id" value="${order.id}">
        `;

        $('#editOrderModal').modal('show');

    } catch (error) {
        showNotification('Ошибка при загрузке данных для редактирования', 'error');
    }
}

async function saveOrder() {
    const orderId = document.getElementById('edit-order-id').value;
    const updatedOrderData = {
        full_name: document.getElementById('edit-full-name').value,
        email: document.getElementById('edit-email').value,
        phone: document.getElementById('edit-phone').value,
        delivery_address: document.getElementById('edit-delivery-address').value,
        delivery_date: document.getElementById('edit-delivery-date').value,
        delivery_interval: document.getElementById('edit-delivery-interval').value,
        comment: document.getElementById('edit-comment').value
    };

    try {
        const response = await fetch(`${BASE_URL}/orders/${orderId}?api_key=${API_KEY}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedOrderData)
        });

        if (!response.ok) {
            throw new Error('Ошибка при обновлении заказа: ' + response.status);
        }

        showNotification('Заказ успешно обновлен', 'success');
        $('#editOrderModal').modal('hide');
        loadOrders(); // Обновляем список заказов
    } catch (error) {
        showNotification('Ошибка при обновлении заказа', 'error');
    }
}

document.getElementById('save-order-button').addEventListener('click', saveOrder);

function deleteOrder(orderId) {
    console.log('Удаление заказа с ID: ' + orderId);
    document.getElementById('confirm-delete-button').dataset.orderId = orderId; // Сохраняем ID заказа
    $('#deleteOrderModal').modal('show');
}

async function confirmDeleteOrder() {
    const orderId = document.getElementById('confirm-delete-button').dataset.orderId;

    try {
        const response = await fetch(`${BASE_URL}/orders/${orderId}?api_key=${API_KEY}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            showNotification('Заказ успешно удален!', 'light-green');
            $('#deleteOrderModal').modal('hide');
            // После успешного удаления перезагружаем список заказов
            loadOrders();
        } else {
            const errorData = await response.json();
            showNotification('Ошибка при удалении заказа: ' + (errorData.message || response.status), 'red');
        }
    } catch (error) {
        showNotification('Произошла ошибка при удалении заказа: ' + error.message, 'red');
    }
}

function addEventListenersToButtons() {
    const ordersTableBody = document.getElementById('orders-table-body');

   ordersTableBody.addEventListener('click', function(event) {
       const target = event.target;
       const orderId = target.dataset.orderId;

       if (target.classList.contains('view-order-button')) {
           viewOrder(orderId);
       } else if (target.classList.contains('edit-order-button')) {
           editOrder(orderId);
       } else if (target.classList.contains('delete-order-button')) {
           deleteOrder(orderId);
       }
   });

   document.getElementById('confirm-delete-button').addEventListener('click', confirmDeleteOrder);
   document.getElementById('save-order-button').addEventListener('click', saveOrder);
}

function showNotification(message) {
    const notificationArea = document.getElementById('notification-area');
    notificationArea.textContent = message;
    notificationArea.style.display = 'block';

    setTimeout(() => {
        notificationArea.style.display = 'none';
    }, 3000);

}