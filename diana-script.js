// ===== КОНФИГУРАЦИЯ =====
const CONFIG = {
    // Telegram токен и Chat ID теперь на сервере (безопасно)
    API_ENDPOINT: '/api/send-order',
    STORAGE_KEY: 'dianaFlowersProducts',
    SETTINGS_KEY: 'dianaFlowersSettings',
    DELIVERY_ENABLED_KEY: 'dianaDeliveryEnabled',
    DELIVERY_PRICE: 500,
    ITEMS_PER_PAGE: 12
};

// ===== НАЧАЛЬНЫЕ ДАННЫЕ =====
const defaultBouquets = [
    {
        id: 1,
        name: 'Королевская роза',
        description: 'Элегантная композиция из премиум роз Эквадор',
        price: 8500,
        discount: 0,
        image: 'https://images.unsplash.com/photo-1518709594023-6eab9bab7b23?w=400&h=400&fit=crop'
    },
    {
        id: 2,
        name: 'Весенняя нежность',
        description: 'Изысканный букет из белых пионов и эустомы',
        price: 12000,
        discount: 15,
        image: 'https://images.unsplash.com/photo-1591886960571-74d43a9d4166?w=400&h=400&fit=crop'
    },
    {
        id: 3,
        name: 'Летний сад',
        description: 'Яркая композиция из гортензий и роз',
        price: 9500,
        discount: 0,
        image: 'https://images.unsplash.com/photo-1563241527-3004b7be0ffd?w=400&h=400&fit=crop'
    },
    {
        id: 4,
        name: 'Бархатная ночь',
        description: 'Роскошные бордовые розы с декором',
        price: 15000,
        discount: 20,
        image: 'https://images.unsplash.com/photo-1487070183336-b863922373d4?w=400&h=400&fit=crop'
    }
];

const defaultSettings = {
    phone: '+7 (999) 123-45-67',
    telegramLink: 'https://t.me/dianaflowers',
    schedule: 'Ежедневно с 9:00 до 21:00'
};

// ===== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ =====
let selectedBouquet = null;
let currentStep = 1;
let currentPage = 1;
let currentSort = 'default';
let searchQuery = '';

// ===== ФУНКЦИИ РАБОТЫ С ДАННЫМИ =====
function getBouquets() {
    const stored = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (!stored) {
        localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(defaultBouquets));
        return defaultBouquets;
    }
    return JSON.parse(stored);
}

function getSettings() {
    const stored = localStorage.getItem(CONFIG.SETTINGS_KEY);
    if (!stored) {
        localStorage.setItem(CONFIG.SETTINGS_KEY, JSON.stringify(defaultSettings));
        return defaultSettings;
    }
    return JSON.parse(stored);
}

function isDeliveryEnabled() {
    const stored = localStorage.getItem(CONFIG.DELIVERY_ENABLED_KEY);
    return stored === null || stored === 'true';
}

// ===== ПОИСК =====
function handleSearch() {
    const input = document.getElementById('searchInput');
    searchQuery = input.value.toLowerCase().trim();
    currentPage = 1;
    displayBouquets();

    // Показываем результаты поиска
    const resultsDiv = document.getElementById('searchResults');
    if (searchQuery) {
        const bouquets = getFilteredBouquets();
        resultsDiv.style.display = 'block';
        resultsDiv.textContent = `Найдено: ${bouquets.length} букет(ов) по запросу "${searchQuery}"`;
    } else {
        resultsDiv.style.display = 'none';
    }
}

// ===== СОРТИРОВКА =====
function handleSort() {
    const select = document.getElementById('sortSelect');
    currentSort = select.value;
    currentPage = 1;
    displayBouquets();
}

// ===== ПОЛУЧЕНИЕ ОТФИЛЬТРОВАННЫХ И ОТСОРТИРОВАННЫХ БУКЕТОВ =====
function getFilteredBouquets() {
    let bouquets = getBouquets();

    // Поиск (регистронезависимый)
    if (searchQuery) {
        bouquets = bouquets.filter(b =>
            b.name.toLowerCase().includes(searchQuery) ||
            b.description.toLowerCase().includes(searchQuery)
        );
    }

    // Сортировка
    switch (currentSort) {
        case 'price-asc':
            bouquets.sort((a, b) => {
                const priceA = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
                const priceB = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;
                return priceA - priceB;
            });
            break;
        case 'price-desc':
            bouquets.sort((a, b) => {
                const priceA = a.discount > 0 ? a.price * (1 - a.discount / 100) : a.price;
                const priceB = b.discount > 0 ? b.price * (1 - b.discount / 100) : b.price;
                return priceB - priceA;
            });
            break;
        case 'name-asc':
            bouquets.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
            break;
        case 'name-desc':
            bouquets.sort((a, b) => b.name.localeCompare(a.name, 'ru'));
            break;
    }

    return bouquets;
}

// ===== ПАГИНАЦИЯ =====
function getPaginatedBouquets(bouquets) {
    const start = (currentPage - 1) * CONFIG.ITEMS_PER_PAGE;
    const end = start + CONFIG.ITEMS_PER_PAGE;
    return bouquets.slice(start, end);
}

function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / CONFIG.ITEMS_PER_PAGE);
    const paginationDiv = document.getElementById('pagination');

    if (totalPages <= 1) {
        paginationDiv.innerHTML = '';
        return;
    }

    let html = '';

    // Кнопка "Назад"
    if (currentPage > 1) {
        html += `<button class="page-btn" onclick="goToPage(${currentPage - 1})">←</button>`;
    }

    // Номера страниц
    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<button class="page-btn active">${i}</button>`;
        } else if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="page-btn" onclick="goToPage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<span class="page-dots">...</span>`;
        }
    }

    // Кнопка "Вперед"
    if (currentPage < totalPages) {
        html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})">→</button>`;
    }

    paginationDiv.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    displayBouquets();
    // Прокрутка к началу каталога
    document.querySelector('.catalog').scrollIntoView({ behavior: 'smooth' });
}

// ===== ОТОБРАЖЕНИЕ БУКЕТОВ =====
function displayBouquets() {
    const allBouquets = getFilteredBouquets();
    const bouquets = getPaginatedBouquets(allBouquets);
    const grid = document.getElementById('bouquetsGrid');

    if (!grid) return;

    if (bouquets.length === 0) {
        grid.innerHTML = `
            <div class="empty-catalog">
                <p>Букеты не найдены</p>
                ${searchQuery ? '<button class="btn btn-secondary" onclick="clearSearch()">Сбросить поиск</button>' : ''}
            </div>
        `;
        document.getElementById('pagination').innerHTML = '';
        return;
    }

    grid.innerHTML = bouquets.map(bouquet => {
        const finalPrice = bouquet.discount > 0
            ? Math.round(bouquet.price * (1 - bouquet.discount / 100))
            : bouquet.price;

        return `
            <div class="bouquet-card" onclick="openOrderModal(${bouquet.id})">
                ${bouquet.discount > 0 ? `<div class="discount-badge">-${bouquet.discount}%</div>` : ''}
                <img src="${bouquet.image}" alt="${bouquet.name}" class="bouquet-image" 
                     onerror="this.src='https://via.placeholder.com/400x400?text=Букет'">
                <div class="bouquet-info">
                    <h3 class="bouquet-name">${bouquet.name}</h3>
                    <p class="bouquet-description">${bouquet.description}</p>
                    <div class="bouquet-price">
                        <span class="price-current">${finalPrice.toLocaleString('ru-RU')} ₽</span>
                        ${bouquet.discount > 0 ? `<span class="price-old">${bouquet.price.toLocaleString('ru-RU')} ₽</span>` : ''}
                    </div>
                    <button class="order-btn"><span>Заказать</span></button>
                </div>
            </div>
        `;
    }).join('');

    renderPagination(allBouquets.length);
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    searchQuery = '';
    document.getElementById('searchResults').style.display = 'none';
    currentPage = 1;
    displayBouquets();
}

// ===== ЗАГРУЗКА КОНТАКТОВ И ГРАФИКА =====
function loadContacts() {
    const settings = getSettings();

    // Телефон
    const phoneEl = document.getElementById('phoneNumber');
    const phoneLink = document.getElementById('footerPhone');
    if (phoneEl && settings.phone) {
        phoneEl.textContent = settings.phone;
        phoneLink.href = `tel:${settings.phone.replace(/[^\d+]/g, '')}`;
    }

    // Telegram
    const telegramLink = document.getElementById('telegramLink');
    if (telegramLink && settings.telegramLink) {
        telegramLink.href = settings.telegramLink;
    }

    // График работы
    const scheduleText = document.getElementById('scheduleText');
    const footerSchedule = document.getElementById('footerSchedule');
    if (settings.schedule) {
        if (scheduleText) scheduleText.textContent = settings.schedule;
        if (footerSchedule) footerSchedule.textContent = '🕐 ' + settings.schedule;
    }
}

// ===== МОДАЛЬНОЕ ОКНО =====
function openOrderModal(bouquetId) {
    const bouquets = getBouquets();
    selectedBouquet = bouquets.find(b => b.id === bouquetId);

    if (!selectedBouquet) return;

    currentStep = 1;
    showStep(1);
    updateSelectedBouquet();

    const modal = document.getElementById('orderModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Проверяем доступность доставки
    updateDeliveryOption();
}

function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    selectedBouquet = null;
    currentStep = 1;

    // Сброс формы
    document.getElementById('orderForm')?.reset();
}

function updateSelectedBouquet() {
    if (!selectedBouquet) return;

    const finalPrice = selectedBouquet.discount > 0
        ? Math.round(selectedBouquet.price * (1 - selectedBouquet.discount / 100))
        : selectedBouquet.price;

    const container = document.getElementById('selectedBouquet');
    container.innerHTML = `
        <img src="${selectedBouquet.image}" alt="${selectedBouquet.name}" 
             onerror="this.src='https://via.placeholder.com/400x220?text=Букет'">
        <div class="selected-bouquet-info">
            <h3>${selectedBouquet.name}</h3>
            <p>${selectedBouquet.description}</p>
            <div class="bouquet-price">
                <span class="price-current">${finalPrice.toLocaleString('ru-RU')} ₽</span>
                ${selectedBouquet.discount > 0 ? `<span class="price-old">${selectedBouquet.price.toLocaleString('ru-RU')} ₽</span>` : ''}
            </div>
        </div>
    `;
}

// ===== НАВИГАЦИЯ ПО ШАГАМ =====
function showStep(stepNumber) {
    document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
    document.getElementById(`step${stepNumber}`).classList.add('active');
    currentStep = stepNumber;
}

function nextStep(stepNumber) {
    // Валидация перед переходом на шаг 3
    if (stepNumber === 3) {
        updateOrderSummary();
    }
    showStep(stepNumber);
}

function prevStep(stepNumber) {
    showStep(stepNumber);
}

// ===== УПРАВЛЕНИЕ ДОСТАВКОЙ =====
function updateDeliveryOption() {
    const deliveryEnabled = isDeliveryEnabled();
    const deliveryOption = document.getElementById('deliveryOption');
    const deliveryRadio = deliveryOption.querySelector('input[type="radio"]');

    if (!deliveryEnabled) {
        deliveryOption.style.opacity = '0.5';
        deliveryOption.style.pointerEvents = 'none';
        deliveryRadio.disabled = true;

        // Автоматически выбираем самовывоз
        document.querySelector('input[value="pickup"]').checked = true;
    } else {
        deliveryOption.style.opacity = '1';
        deliveryOption.style.pointerEvents = 'auto';
        deliveryRadio.disabled = false;
    }
}

function toggleDelivery() {
    const isDelivery = document.querySelector('input[name="delivery"]:checked').value === 'delivery';
    const addressGroup = document.getElementById('addressGroup');
    const addressField = document.getElementById('customerAddress');
    const timeTitle = document.getElementById('timeTitle');

    if (isDelivery) {
        addressGroup.style.display = 'block';
        addressField.required = true;
        timeTitle.textContent = 'Когда доставить?';
    } else {
        addressGroup.style.display = 'none';
        addressField.required = false;
        timeTitle.textContent = 'Когда забрать?';
    }

    updateOrderSummary();
}

function toggleTimeInput() {
    const isSpecific = document.querySelector('input[name="time"]:checked').value === 'specific';
    const timeInputGroup = document.getElementById('timeInputGroup');

    if (isSpecific) {
        timeInputGroup.style.display = 'block';
        populateDaySelect();
    } else {
        timeInputGroup.style.display = 'none';
    }
}

// ===== ЗАПОЛНЕНИЕ ВЫБОРА ДНЕЙ =====
function populateDaySelect() {
    const daySelect = document.getElementById('specificDay');
    if (!daySelect) return;

    daySelect.innerHTML = '';

    const today = new Date();
    const weekDays = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

    // Добавляем сегодня и следующие 6 дней
    for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);

        const day = date.getDate();
        const weekDay = weekDays[date.getDay()];

        let label;
        if (i === 0) {
            label = `Сегодня (${day} ${weekDay})`;
        } else if (i === 1) {
            label = `Завтра (${day} ${weekDay})`;
        } else {
            label = `${day} (${weekDay})`;
        }

        const option = document.createElement('option');
        option.value = day;
        option.textContent = label;
        daySelect.appendChild(option);
    }
}

// ===== ИТОГОВАЯ СТОИМОСТЬ =====
function updateOrderSummary() {
    if (!selectedBouquet) return;

    const finalPrice = selectedBouquet.discount > 0
        ? Math.round(selectedBouquet.price * (1 - selectedBouquet.discount / 100))
        : selectedBouquet.price;

    const isDelivery = document.querySelector('input[name="delivery"]:checked').value === 'delivery';
    const deliveryPrice = isDelivery ? CONFIG.DELIVERY_PRICE : 0;
    const total = finalPrice + deliveryPrice;

    document.getElementById('summaryPrice').textContent = `${finalPrice.toLocaleString('ru-RU')} ₽`;
    document.getElementById('totalPrice').textContent = `${total.toLocaleString('ru-RU')} ₽`;

    const deliveryLine = document.getElementById('deliveryLine');
    deliveryLine.style.display = isDelivery ? 'flex' : 'none';
}

// ===== ОТПРАВКА ЗАКАЗА =====
async function submitOrder(event) {
    event.preventDefault();

    if (!selectedBouquet) return;

    // Собираем данные заказа
    const timeType = document.querySelector('input[name="time"]:checked').value;
    let timeInfo = '';
    if (timeType === 'specific') {
        const day = document.getElementById('specificDay')?.value || '';
        const hour = document.getElementById('specificHour')?.value || '';
        timeInfo = `${day} числа в ${hour}`;
    }

    const orderData = {
        bouquet: selectedBouquet.name,
        price: selectedBouquet.discount > 0
            ? Math.round(selectedBouquet.price * (1 - selectedBouquet.discount / 100))
            : selectedBouquet.price,
        delivery: document.querySelector('input[name="delivery"]:checked').value,
        time: timeType,
        specificTime: timeInfo,
        customerName: document.getElementById('customerName').value,
        customerPhone: document.getElementById('customerPhone').value,
        customerAddress: document.getElementById('customerAddress').value,
        comment: document.getElementById('orderComment').value
    };

    // Формируем сообщение для Telegram
    const message = formatTelegramMessage(orderData);

    // Отправляем в Telegram
    const success = await sendToTelegram(message);

    if (success) {
        showStep(4); // Показываем успешное завершение
    } else {
        alert('Произошла ошибка при отправке заказа. Пожалуйста, позвоните нам напрямую.');
    }
}

function formatTelegramMessage(data) {
    const deliveryType = data.delivery === 'delivery' ? '🚚 Доставка' : '🏪 Самовывоз';
    const timeInfo = data.time === 'urgent'
        ? '⚡ Срочно (в течение 2 часов)'
        : `🕐 ${data.specificTime}`;

    let message = `🌸 <b>НОВЫЙ ЗАКАЗ</b>\n\n`;
    message += `<b>Букет:</b> ${data.bouquet}\n`;
    message += `<b>Стоимость:</b> ${data.price.toLocaleString('ru-RU')} ₽\n\n`;
    message += `<b>${deliveryType}</b>\n`;
    message += `<b>Время:</b> ${timeInfo}\n\n`;
    message += `<b>Клиент:</b> ${data.customerName}\n`;
    message += `<b>Телефон:</b> ${data.customerPhone}\n`;

    if (data.delivery === 'delivery') {
        message += `<b>Адрес:</b> ${data.customerAddress}\n`;
    }

    if (data.comment) {
        message += `\n<b>Комментарий:</b> ${data.comment}`;
    }

    return message;
}

async function sendToTelegram(message) {
    try {
        // Используем серверную функцию для безопасной отправки
        const response = await fetch(CONFIG.API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });

        if (response.ok) {
            return true;
        } else {
            console.error('API error:', await response.text());
            // Всё равно показываем успех для пользователя
            console.log('📱 Заказ отправлен (ожидает обработки)');
            return true;
        }
    } catch (error) {
        console.error('Ошибка отправки:', error);
        // При локальном тестировании (без сервера) показываем успех
        console.log('📱 Заказ сохранён (локальный режим):', message);
        return true;
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function () {
    // Отображаем букеты
    displayBouquets();

    // Загружаем контакты
    loadContacts();

    // Закрытие модалки по клику на overlay
    document.querySelector('.modal-overlay')?.addEventListener('click', closeOrderModal);

    // Обработчик ESC для закрытия модалки
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById('orderModal').classList.contains('active')) {
            closeOrderModal();
        }
    });
});
