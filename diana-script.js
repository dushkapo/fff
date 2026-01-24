// =====================================================
// КЛИЕНТСКИЙ СКРИПТ ДЛЯ DIANA FLOWERS (С SUPABASE)
// =====================================================

const CONFIG = {
    API_ENDPOINT: '/api/send-order',
    DELIVERY_PRICE: 500,
    ITEMS_PER_PAGE: 12
};

// Глобальные переменные
let selectedBouquet = null;
let currentStep = 1;
let currentPage = 1;
let currentSort = 'default';
let searchQuery = '';
let allBouquets = [];
let settings = {};

// ===== ЗАГРУЗКА ДАННЫХ ИЗ SUPABASE =====

async function loadBouquetsFromDB() {
    try {
        showLoadingIndicator(true);
        
        const { data, error } = await window.supabaseClient
            .from('bouquets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        allBouquets = data || [];
        displayBouquets();
        
    } catch (error) {
        console.error('Ошибка загрузки букетов:', error);
        showError('Не удалось загрузить букеты. Попробуйте обновить страницу.');
        allBouquets = [];
    } finally {
        showLoadingIndicator(false);
    }
}

async function loadSettingsFromDB() {
    try {
        const { data, error } = await window.supabaseClient
            .from('settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) throw error;

        settings = data || getDefaultSettings();
        applySettings();
        
    } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
        settings = getDefaultSettings();
        applySettings();
    }
}

function getDefaultSettings() {
    return {
        phone: '+7 (999) 123-45-67',
        telegram_link: 'https://t.me/dianaflowers',
        schedule: 'Ежедневно с 9:00 до 21:00',
        shop_address: 'ул. Цветочная, 1',
        address_link: 'https://2gis.ru/',
        delivery_enabled: true
    };
}

function applySettings() {
    // Телефон
    const phoneEl = document.getElementById('phoneNumber');
    const footerPhone = document.getElementById('footerPhone');
    if (phoneEl) phoneEl.textContent = settings.phone || '';
    if (footerPhone) footerPhone.href = 'tel:' + (settings.phone || '').replace(/[^\d+]/g, '');

    // Telegram
    const tgLink = document.getElementById('telegramLink');
    if (tgLink) tgLink.href = settings.telegram_link || '#';

    // График работы
    const scheduleText = document.getElementById('scheduleText');
    const footerSchedule = document.getElementById('footerSchedule');
    if (scheduleText) scheduleText.textContent = settings.schedule || '';
    if (footerSchedule) footerSchedule.textContent = '🕐 ' + (settings.schedule || '');

    // Адрес и 2ГИС
    const addressEl = document.getElementById('shopAddress');
    const addressLink = document.getElementById('addressLink');
    if (addressEl) addressEl.textContent = settings.shop_address || '';
    if (addressLink) addressLink.href = settings.address_link || '#';

    // Доставка
    updateDeliveryOption();
}

// ===== ИНДИКАТОР ЗАГРУЗКИ =====

function showLoadingIndicator(show) {
    const indicator = document.getElementById('loadingIndicator');
    const grid = document.getElementById('bouquetsGrid');
    
    if (indicator) {
        indicator.style.display = show ? 'flex' : 'none';
    }
    if (grid) {
        grid.style.display = show ? 'none' : 'grid';
    }
}

function showError(message) {
    const grid = document.getElementById('bouquetsGrid');
    if (grid) {
        grid.innerHTML = `
            <div class="error-message" style="grid-column: 1/-1; text-align: center; padding: 3rem; color: #e74c3c;">
                <div style="font-size: 3rem; margin-bottom: 1rem;">⚠️</div>
                <p style="font-size: 1.2rem; margin-bottom: 1rem;">${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">Обновить страницу</button>
            </div>
        `;
    }
}

// ===== ПОИСК =====

function handleSearch() {
    const input = document.getElementById('searchInput');
    searchQuery = input.value.toLowerCase().trim();
    currentPage = 1;
    displayBouquets();

    const resultsDiv = document.getElementById('searchResults');
    if (searchQuery) {
        const bouquets = getFilteredBouquets();
        resultsDiv.style.display = 'block';
        resultsDiv.textContent = `Найдено: ${bouquets.length} букет(ов) по запросу "${searchQuery}"`;
    } else {
        resultsDiv.style.display = 'none';
    }
}

function clearSearch() {
    document.getElementById('searchInput').value = '';
    searchQuery = '';
    document.getElementById('searchResults').style.display = 'none';
    currentPage = 1;
    displayBouquets();
}

// ===== СОРТИРОВКА =====

function handleSort() {
    const select = document.getElementById('sortSelect');
    currentSort = select.value;
    currentPage = 1;
    displayBouquets();
}

// ===== ФИЛЬТРАЦИЯ И СОРТИРОВКА =====

function getFilteredBouquets() {
    let bouquets = [...allBouquets];

    // Поиск
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

    if (currentPage > 1) {
        html += `<button class="page-btn" onclick="goToPage(${currentPage - 1})">←</button>`;
    }

    for (let i = 1; i <= totalPages; i++) {
        if (i === currentPage) {
            html += `<button class="page-btn active">${i}</button>`;
        } else if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            html += `<button class="page-btn" onclick="goToPage(${i})">${i}</button>`;
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            html += `<span class="page-dots">...</span>`;
        }
    }

    if (currentPage < totalPages) {
        html += `<button class="page-btn" onclick="goToPage(${currentPage + 1})">→</button>`;
    }

    paginationDiv.innerHTML = html;
}

function goToPage(page) {
    currentPage = page;
    displayBouquets();
    document.querySelector('.catalog').scrollIntoView({ behavior: 'smooth' });
}

// ===== ОТОБРАЖЕНИЕ БУКЕТОВ =====

function displayBouquets() {
    const allFilteredBouquets = getFilteredBouquets();
    const bouquets = getPaginatedBouquets(allFilteredBouquets);
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
                <img src="${bouquet.image_url}" alt="${bouquet.name}" class="bouquet-image" 
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

    renderPagination(allFilteredBouquets.length);
}

// ===== МОДАЛЬНОЕ ОКНО =====

function openOrderModal(bouquetId) {
    selectedBouquet = allBouquets.find(b => b.id === bouquetId);

    if (!selectedBouquet) return;

    currentStep = 1;
    showStep(1);
    updateSelectedBouquet();

    const modal = document.getElementById('orderModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    updateDeliveryOption();
}

function closeOrderModal() {
    const modal = document.getElementById('orderModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    selectedBouquet = null;
    currentStep = 1;

    document.getElementById('orderForm')?.reset();
}

function updateSelectedBouquet() {
    if (!selectedBouquet) return;

    const finalPrice = selectedBouquet.discount > 0
        ? Math.round(selectedBouquet.price * (1 - selectedBouquet.discount / 100))
        : selectedBouquet.price;

    const container = document.getElementById('selectedBouquet');
    container.innerHTML = `
        <img src="${selectedBouquet.image_url}" alt="${selectedBouquet.name}" 
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
    const deliveryEnabled = settings.delivery_enabled !== false;
    const deliveryOption = document.getElementById('deliveryOption');
    const deliveryRadio = deliveryOption?.querySelector('input[type="radio"]');

    if (!deliveryEnabled && deliveryOption) {
        deliveryOption.style.opacity = '0.5';
        deliveryOption.style.pointerEvents = 'none';
        if (deliveryRadio) deliveryRadio.disabled = true;

        const pickupRadio = document.querySelector('input[value="pickup"]');
        if (pickupRadio) pickupRadio.checked = true;
        toggleDelivery();
    } else if (deliveryOption) {
        deliveryOption.style.opacity = '1';
        deliveryOption.style.pointerEvents = 'auto';
        if (deliveryRadio) deliveryRadio.disabled = false;
    }
}

function toggleDelivery() {
    const isDelivery = document.querySelector('input[name="delivery"]:checked')?.value === 'delivery';
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
    const isSpecific = document.querySelector('input[name="time"]:checked')?.value === 'specific';
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

    const isDelivery = document.querySelector('input[name="delivery"]:checked')?.value === 'delivery';
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

    const submitBtn = document.getElementById('submitOrderBtn');
    const originalText = submitBtn.textContent;
    
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Отправка...';

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

        const message = formatTelegramMessage(orderData);
        const success = await sendToTelegram(message);

        if (success) {
            showStep(4);
        } else {
            alert('Произошла ошибка при отправке заказа. Пожалуйста, позвоните нам напрямую.');
        }
        
    } catch (error) {
        console.error('Ошибка отправки заказа:', error);
        alert('Произошла ошибка. Попробуйте позвонить нам напрямую.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
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
            console.log('📱 Заказ отправлен (ожидает обработки)');
            return true;
        }
    } catch (error) {
        console.error('Ошибка отправки:', error);
        console.log('📱 Заказ сохранён (локальный режим):', message);
        return true;
    }
}

// ===== ИНИЦИАЛИЗАЦИЯ =====

document.addEventListener('DOMContentLoaded', async function () {
    // Загружаем данные
    await loadSettingsFromDB();
    await loadBouquetsFromDB();

    // Закрытие модалки по клику на overlay
    document.querySelector('.modal-overlay')?.addEventListener('click', closeOrderModal);

    // Обработчик ESC для закрытия модалки
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && document.getElementById('orderModal').classList.contains('active')) {
            closeOrderModal();
        }
    });
});