const ADMIN_CONFIG = {
    // Ключ для хранения хэша пароля (устанавливается при первом входе)
    PASSWORD_KEY: 'dianaAdminPassword',
    STORAGE_KEY: 'dianaFlowersProducts',
    SETTINGS_KEY: 'dianaFlowersSettings',
    AUTH_KEY: 'dianaAdminAuth',
    DELIVERY_KEY: 'dianaDeliveryEnabled',
    SESSION_TIMEOUT: 24 * 60 * 60 * 1000 // 24 часа
};

// Глобальная переменная для режима редактирования
let editingBouquetId = null;

// ===== ХЭШИРОВАНИЕ ПАРОЛЯ =====
async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'diana_flowers_2026');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Проверяем есть ли уже установленный пароль
function isPasswordSet() {
    return localStorage.getItem(ADMIN_CONFIG.PASSWORD_KEY) !== null;
}

// Получаем хэш пароля
function getStoredPasswordHash() {
    return localStorage.getItem(ADMIN_CONFIG.PASSWORD_KEY);
}

// Устанавливаем пароль (при первой настройке)
async function setPassword(password) {
    const hash = await hashPassword(password);
    localStorage.setItem(ADMIN_CONFIG.PASSWORD_KEY, hash);
    return hash;
}

// ===== АВТОРИЗАЦИЯ =====
function checkAuth() {
    const authData = localStorage.getItem(ADMIN_CONFIG.AUTH_KEY);
    if (!authData) return false;

    try {
        const { hash, timestamp } = JSON.parse(authData);
        // Проверяем не истекла ли сессия
        if (Date.now() - timestamp > ADMIN_CONFIG.SESSION_TIMEOUT) {
            localStorage.removeItem(ADMIN_CONFIG.AUTH_KEY);
            return false;
        }
        return hash === getStoredPasswordHash();
    } catch {
        return false;
    }
}

function setAuth(passwordHash) {
    const authData = {
        hash: passwordHash,
        timestamp: Date.now()
    };
    localStorage.setItem(ADMIN_CONFIG.AUTH_KEY, JSON.stringify(authData));
}

async function login(password) {
    const passwordHash = await hashPassword(password);

    // Если пароль ещё не установлен - устанавливаем его
    if (!isPasswordSet()) {
        await setPassword(password);
        setAuth(passwordHash);
        showAdminPanel();
        showNotification('Пароль установлен! Запомните его.', 'success');
        return true;
    }

    // Проверяем пароль
    if (passwordHash === getStoredPasswordHash()) {
        setAuth(passwordHash);
        showAdminPanel();
        showNotification('Добро пожаловать!', 'success');
        return true;
    }

    showNotification('Неверный пароль', 'error');
    return false;
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        localStorage.removeItem(ADMIN_CONFIG.AUTH_KEY);
        hideAdminPanel();
        showNotification('Вы вышли из системы', 'info');
    }
}

function showAdminPanel() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadBouquets();
    loadDeliveryStatus();
    loadSettings();
}

function hideAdminPanel() {
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
}

// ===== РАБОТА С НАСТРОЙКАМИ =====
const defaultSettings = {
    phone: '+7 (999) 123-45-67',
    telegramLink: 'https://t.me/dianaflowers',
    schedule: 'Ежедневно с 9:00 до 21:00'
};

function getSettings() {
    const stored = localStorage.getItem(ADMIN_CONFIG.SETTINGS_KEY);
    if (!stored) {
        localStorage.setItem(ADMIN_CONFIG.SETTINGS_KEY, JSON.stringify(defaultSettings));
        return defaultSettings;
    }
    return JSON.parse(stored);
}

function saveSettings(settings) {
    localStorage.setItem(ADMIN_CONFIG.SETTINGS_KEY, JSON.stringify(settings));
}

function loadSettings() {
    const settings = getSettings();
    document.getElementById('settingsPhone').value = settings.phone || '';
    document.getElementById('settingsTelegram').value = settings.telegramLink || '';
    document.getElementById('settingsSchedule').value = settings.schedule || 'Ежедневно с 9:00 до 21:00';
}

function handleSettingsSubmit(event) {
    event.preventDefault();

    const settings = {
        phone: document.getElementById('settingsPhone').value.trim(),
        telegramLink: document.getElementById('settingsTelegram').value.trim(),
        schedule: document.getElementById('settingsSchedule').value.trim()
    };

    saveSettings(settings);
    showNotification('Контакты и график сохранены!', 'success');
}

// ===== РАБОТА С ДАННЫМИ =====
function getBouquets() {
    const stored = localStorage.getItem(ADMIN_CONFIG.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

function saveBouquets(bouquets) {
    localStorage.setItem(ADMIN_CONFIG.STORAGE_KEY, JSON.stringify(bouquets));
}

function isDeliveryEnabled() {
    const stored = localStorage.getItem(ADMIN_CONFIG.DELIVERY_KEY);
    return stored === null || stored === 'true';
}

function setDeliveryStatus(enabled) {
    localStorage.setItem(ADMIN_CONFIG.DELIVERY_KEY, enabled.toString());
}

// ===== УПРАВЛЕНИЕ ДОСТАВКОЙ =====
function toggleDelivery() {
    const toggle = document.getElementById('deliveryToggle');
    setDeliveryStatus(toggle.checked);

    const status = toggle.checked ? 'включена' : 'отключена';
    showNotification(`Доставка ${status}`, 'info');
}

function loadDeliveryStatus() {
    const enabled = isDeliveryEnabled();
    document.getElementById('deliveryToggle').checked = enabled;
}

// ===== ПРЕВЬЮ ИЗОБРАЖЕНИЯ =====
function previewImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Проверка размера (макс 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Файл слишком большой! Максимум 5MB', 'error');
        event.target.value = '';
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const preview = document.getElementById('imagePreview');
        preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
        preview.classList.add('active');
    };
    reader.readAsDataURL(file);
}

// ===== ДОБАВЛЕНИЕ/РЕДАКТИРОВАНИЕ БУКЕТА =====
async function addBouquet(event) {
    event.preventDefault();

    const name = document.getElementById('bouquetName').value.trim();
    const description = document.getElementById('bouquetDescription').value.trim();
    const price = parseInt(document.getElementById('bouquetPrice').value);
    const discount = parseInt(document.getElementById('bouquetDiscount').value) || 0;
    const imageInput = document.getElementById('bouquetImage');
    const preview = document.getElementById('imagePreview');

    // Валидация
    if (!name || !description || !price) {
        showNotification('Заполните все обязательные поля', 'error');
        return;
    }

    let imageBase64;

    // Если выбрано новое изображение - используем его
    if (imageInput.files[0]) {
        imageBase64 = await fileToBase64(imageInput.files[0]);
    }
    // Если редактируем и есть сохраненное изображение - используем его
    else if (editingBouquetId && preview.dataset.currentImage) {
        imageBase64 = preview.dataset.currentImage;
    }
    // Если это новый букет без изображения - ошибка
    else if (!editingBouquetId) {
        showNotification('Пожалуйста, выберите фото букета', 'error');
        return;
    }

    let bouquets = getBouquets();

    if (editingBouquetId) {
        // Режим редактирования - обновляем существующий букет
        const index = bouquets.findIndex(b => b.id === editingBouquetId);
        if (index !== -1) {
            bouquets[index] = {
                ...bouquets[index],
                name,
                description,
                price,
                discount,
                image: imageBase64
            };
        }
        showNotification('Букет успешно обновлён!', 'success');
    } else {
        // Режим добавления - создаем новый букет
        const newBouquet = {
            id: Date.now(),
            name,
            description,
            price,
            discount,
            image: imageBase64
        };
        bouquets.push(newBouquet);
        showNotification('Букет успешно добавлен!', 'success');
    }

    saveBouquets(bouquets);

    // Сброс формы
    resetForm();

    loadBouquets();
}

// ===== РЕДАКТИРОВАНИЕ БУКЕТА =====
function editBouquet(id) {
    const bouquets = getBouquets();
    const bouquet = bouquets.find(b => b.id === id);

    if (!bouquet) return;

    // Запоминаем ID редактируемого букета
    editingBouquetId = id;

    // Заполняем форму данными букета
    document.getElementById('bouquetName').value = bouquet.name;
    document.getElementById('bouquetDescription').value = bouquet.description;
    document.getElementById('bouquetPrice').value = bouquet.price;
    document.getElementById('bouquetDiscount').value = bouquet.discount;

    // Показываем превью существующего изображения
    const preview = document.getElementById('imagePreview');
    preview.innerHTML = `<img src="${bouquet.image}" alt="Preview">`;
    preview.classList.add('active');

    // Сохраняем текущее изображение для использования при сохранении
    preview.dataset.currentImage = bouquet.image;

    // Меняем текст кнопки и показываем кнопку отмены
    const submitBtn = document.querySelector('#addBouquetForm button[type="submit"]');
    submitBtn.textContent = 'Сохранить изменения';

    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) cancelBtn.style.display = 'inline-block';

    // Прокручиваем к форме
    document.querySelector('.bouquet-form').scrollIntoView({ behavior: 'smooth' });

    showNotification('Редактируйте букет и сохраните изменения', 'info');
}

function resetForm() {
    editingBouquetId = null;
    document.getElementById('addBouquetForm').reset();
    document.getElementById('imagePreview').classList.remove('active');
    document.getElementById('imagePreview').innerHTML = '';
    document.getElementById('imagePreview').dataset.currentImage = '';

    // Возвращаем текст кнопки и скрываем кнопку отмены
    const submitBtn = document.querySelector('#addBouquetForm button[type="submit"]');
    submitBtn.textContent = 'Добавить букет';

    const cancelBtn = document.getElementById('cancelEditBtn');
    if (cancelBtn) cancelBtn.style.display = 'none';
}

// ===== УДАЛЕНИЕ БУКЕТА =====
function deleteBouquet(id, showConfirm = true) {
    if (showConfirm && !confirm('Вы уверены, что хотите удалить этот букет?')) {
        return;
    }

    let bouquets = getBouquets();
    bouquets = bouquets.filter(b => b.id !== id);
    saveBouquets(bouquets);

    if (showConfirm) {
        showNotification('Букет удален', 'info');
    }

    loadBouquets();
}

// ===== ОТОБРАЖЕНИЕ БУКЕТОВ =====
function loadBouquets() {
    const bouquets = getBouquets();
    const container = document.getElementById('bouquetsList');

    if (bouquets.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🌸</div>
                <p>Пока нет добавленных букетов</p>
            </div>
        `;
        return;
    }

    container.innerHTML = bouquets.map(bouquet => {
        const finalPrice = bouquet.discount > 0
            ? Math.round(bouquet.price * (1 - bouquet.discount / 100))
            : bouquet.price;

        return `
            <div class="bouquet-item">
                <img src="${bouquet.image}" alt="${bouquet.name}" class="bouquet-item-image">
                <div class="bouquet-item-info">
                    <h3>${bouquet.name}</h3>
                    <p>${bouquet.description}</p>
                    <div class="bouquet-item-meta">
                        <div class="meta-item">
                            <span class="meta-label">Цена</span>
                            <span class="meta-value">${bouquet.price.toLocaleString('ru-RU')} ₽</span>
                        </div>
                        ${bouquet.discount > 0 ? `
                            <div class="meta-item">
                                <span class="meta-label">Скидка</span>
                                <span class="meta-value discount">${bouquet.discount}%</span>
                            </div>
                            <div class="meta-item">
                                <span class="meta-label">Итого</span>
                                <span class="meta-value">${finalPrice.toLocaleString('ru-RU')} ₽</span>
                            </div>
                        ` : ''}
                    </div>
                </div>
                <div class="bouquet-item-actions">
                    <button class="btn btn-edit btn-small" onclick="editBouquet(${bouquet.id})">
                        Редактировать
                    </button>
                    <button class="btn btn-delete btn-small" onclick="deleteBouquet(${bouquet.id})">
                        Удалить
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function showNotification(message, type = 'info') {
    const colors = {
        success: '#4caf50',
        error: '#e74c3c',
        warning: '#ff9800',
        info: '#D4AF37'
    };

    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colors[type] || colors.info};
        color: white;
        padding: 1rem 2rem;
        border-radius: 0;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
        z-index: 99999;
        animation: slideInRight 0.3s ease;
        font-weight: 500;
        letter-spacing: 0.5px;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function () {
    // Проверяем авторизацию
    if (checkAuth()) {
        showAdminPanel();
    } else {
        hideAdminPanel();
    }

    // Форма входа
    document.getElementById('loginForm')?.addEventListener('submit', async function (e) {
        e.preventDefault();
        const password = document.getElementById('adminPassword').value;
        await login(password);
    });

    // Форма добавления букета
    document.getElementById('addBouquetForm')?.addEventListener('submit', addBouquet);

    // Форма настроек контактов
    document.getElementById('settingsForm')?.addEventListener('submit', handleSettingsSubmit);
    // Добавляем стили для анимаций
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(400px); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(400px); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
});
