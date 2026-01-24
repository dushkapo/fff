// =====================================================
// АДМИН-СКРИПТ ДЛЯ DIANA FLOWERS (С SUPABASE)
// =====================================================

// Глобальная переменная для режима редактирования
let editingBouquetId = null;
let isAuthenticated = false;

// ===== АВТОРИЗАЦИЯ =====

async function login(password) {
    try {
        const loginError = document.getElementById('loginError');
        loginError.style.display = 'none';

        // Вызываем функцию проверки пароля из Supabase
        const { data, error } = await window.supabaseClient
            .rpc('check_admin_password', { input_password: password });

        if (error) {
            console.error('Ошибка проверки пароля:', error);
            showLoginError('Ошибка подключения к серверу');
            return false;
        }

        if (data === true) {
            isAuthenticated = true;
            // Сохраняем сессию в sessionStorage (только на время сессии браузера)
            sessionStorage.setItem('adminAuth', 'true');
            showAdminPanel();
            showNotification('Добро пожаловать!', 'success');
            return true;
        } else {
            showLoginError('Неверный пароль');
            return false;
        }
    } catch (error) {
        console.error('Ошибка входа:', error);
        showLoginError('Произошла ошибка при входе');
        return false;
    }
}

function showLoginError(message) {
    const loginError = document.getElementById('loginError');
    loginError.textContent = message;
    loginError.style.display = 'block';
    loginError.style.color = '#e74c3c';
    loginError.style.marginTop = '1rem';
    loginError.style.textAlign = 'center';
}

function checkAuth() {
    return sessionStorage.getItem('adminAuth') === 'true';
}

function logout() {
    if (confirm('Вы уверены, что хотите выйти?')) {
        sessionStorage.removeItem('adminAuth');
        isAuthenticated = false;
        hideAdminPanel();
        showNotification('Вы вышли из системы', 'info');
    }
}

function showAdminPanel() {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    loadSettings();
    loadBouquets();
    loadDeliveryStatus();
}

function hideAdminPanel() {
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
}

// ===== ЗАГРУЗКА НАСТРОЕК =====

async function loadSettings() {
    try {
        const { data, error } = await window.supabaseClient
            .from('settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (error) throw error;

        if (data) {
            document.getElementById('settingsPhone').value = data.phone || '';
            document.getElementById('settingsTelegram').value = data.telegram_link || '';
            document.getElementById('settingsSchedule').value = data.schedule || '';
            document.getElementById('settingsAddress').value = data.shop_address || '';
            document.getElementById('settingsAddressLink').value = data.address_link || '';
        }
    } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
        showNotification('Ошибка загрузки настроек', 'error');
    }
}

async function handleSettingsSubmit(event) {
    event.preventDefault();

    const settings = {
        phone: document.getElementById('settingsPhone').value.trim(),
        telegram_link: document.getElementById('settingsTelegram').value.trim(),
        schedule: document.getElementById('settingsSchedule').value.trim(),
        shop_address: document.getElementById('settingsAddress').value.trim(),
        address_link: document.getElementById('settingsAddressLink').value.trim()
    };

    try {
        const { error } = await window.supabaseClient
            .from('settings')
            .update(settings)
            .eq('id', 1);

        if (error) throw error;

        showNotification('Контакты успешно сохранены!', 'success');
    } catch (error) {
        console.error('Ошибка сохранения настроек:', error);
        showNotification('Ошибка сохранения контактов', 'error');
    }
}

// ===== УПРАВЛЕНИЕ ДОСТАВКОЙ =====

async function loadDeliveryStatus() {
    try {
        const { data, error } = await window.supabaseClient
            .from('settings')
            .select('delivery_enabled')
            .eq('id', 1)
            .single();

        if (error) throw error;

        const enabled = data?.delivery_enabled !== false;
        document.getElementById('deliveryToggle').checked = enabled;
    } catch (error) {
        console.error('Ошибка загрузки статуса доставки:', error);
    }
}

async function toggleDelivery() {
    const toggle = document.getElementById('deliveryToggle');
    const enabled = toggle.checked;

    try {
        const { error } = await window.supabaseClient
            .from('settings')
            .update({ delivery_enabled: enabled })
            .eq('id', 1);

        if (error) throw error;

        const status = enabled ? 'включена' : 'отключена';
        showNotification(`Доставка ${status}`, 'info');
    } catch (error) {
        console.error('Ошибка обновления статуса доставки:', error);
        showNotification('Ошибка обновления доставки', 'error');
        // Откатываем переключатель
        toggle.checked = !enabled;
    }
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
        // Сохраняем base64 для редактирования
        preview.dataset.imageData = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ===== ЗАГРУЗКА ИЗОБРАЖЕНИЯ В SUPABASE STORAGE =====

async function uploadImage(file) {
    try {
        // Генерируем уникальное имя файла
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${fileName}`;

        // Загружаем файл
        const { data, error } = await window.supabaseClient.storage
            .from(window.STORAGE_BUCKET)
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // Получаем публичный URL
        const { data: urlData } = window.supabaseClient.storage
            .from(window.STORAGE_BUCKET)
            .getPublicUrl(filePath);

        return urlData.publicUrl;
    } catch (error) {
        console.error('Ошибка загрузки изображения:', error);
        throw error;
    }
}

// ===== УДАЛЕНИЕ ИЗОБРАЖЕНИЯ ИЗ STORAGE =====

async function deleteImageFromStorage(imageUrl) {
    try {
        if (!imageUrl) return;

        // Извлекаем путь к файлу из URL
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1];

        const { error } = await window.supabaseClient.storage
            .from(window.STORAGE_BUCKET)
            .remove([fileName]);

        if (error) {
            console.error('Ошибка удаления изображения:', error);
        }
    } catch (error) {
        console.error('Ошибка удаления изображения из Storage:', error);
    }
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

    if (price < 0 || price > 1000000) {
        showNotification('Цена должна быть от 0 до 1 000 000 ₽', 'error');
        return;
    }

    if (discount < 0 || discount > 100) {
        showNotification('Скидка должна быть от 0 до 100%', 'error');
        return;
    }

    const submitBtn = document.getElementById('submitBouquetBtn');
    const originalText = submitBtn.textContent;
    
    try {
        submitBtn.disabled = true;
        submitBtn.textContent = editingBouquetId ? 'Сохранение...' : 'Добавление...';

        let imageUrl;

        // Если выбрано новое изображение - загружаем его
        if (imageInput.files[0]) {
            imageUrl = await uploadImage(imageInput.files[0]);
        }
        // Если редактируем и есть старое изображение
        else if (editingBouquetId && preview.dataset.currentImageUrl) {
            imageUrl = preview.dataset.currentImageUrl;
        }
        // Если это новый букет без изображения - ошибка
        else if (!editingBouquetId) {
            showNotification('Пожалуйста, выберите фото букета', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            return;
        }

        const bouquetData = {
            name,
            description,
            price,
            discount,
            image_url: imageUrl
        };

        if (editingBouquetId) {
            // Режим редактирования
            const { error } = await window.supabaseClient
                .from('bouquets')
                .update(bouquetData)
                .eq('id', editingBouquetId);

            if (error) throw error;

            // Если загрузили новое изображение - удаляем старое
            if (imageInput.files[0] && preview.dataset.currentImageUrl) {
                await deleteImageFromStorage(preview.dataset.currentImageUrl);
            }

            showNotification('Букет успешно обновлён!', 'success');
        } else {
            // Режим добавления
            const { error } = await window.supabaseClient
                .from('bouquets')
                .insert([bouquetData]);

            if (error) throw error;

            showNotification('Букет успешно добавлен!', 'success');
        }

        // Сброс формы
        resetForm();
        loadBouquets();

    } catch (error) {
        console.error('Ошибка сохранения букета:', error);
        showNotification('Ошибка при сохранении букета', 'error');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

// ===== РЕДАКТИРОВАНИЕ БУКЕТА =====

async function editBouquet(id) {
    try {
        const { data: bouquet, error } = await window.supabaseClient
            .from('bouquets')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
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
        preview.innerHTML = `<img src="${bouquet.image_url}" alt="Preview">`;
        preview.classList.add('active');
        preview.dataset.currentImageUrl = bouquet.image_url;

        // Меняем заголовок и текст кнопки
        document.getElementById('formTitle').textContent = 'Редактировать букет';
        document.getElementById('submitBouquetBtn').textContent = 'Сохранить изменения';
        
        // Показываем кнопку отмены
        document.getElementById('cancelEditBtn').style.display = 'inline-block';

        // Прокручиваем к форме
        document.querySelector('.bouquet-form').scrollIntoView({ behavior: 'smooth' });

        showNotification('Режим редактирования', 'info');

    } catch (error) {
        console.error('Ошибка загрузки букета для редактирования:', error);
        showNotification('Ошибка загрузки данных букета', 'error');
    }
}

// ===== ОТМЕНА РЕДАКТИРОВАНИЯ =====

function cancelEdit() {
    resetForm();
    showNotification('Редактирование отменено', 'info');
}

function resetForm() {
    editingBouquetId = null;
    document.getElementById('addBouquetForm').reset();
    
    const preview = document.getElementById('imagePreview');
    preview.classList.remove('active');
    preview.innerHTML = '';
    preview.dataset.currentImageUrl = '';
    preview.dataset.imageData = '';

    // Возвращаем заголовок и текст кнопки
    document.getElementById('formTitle').textContent = 'Добавить новый букет';
    document.getElementById('submitBouquetBtn').textContent = 'Добавить букет';
    
    // Скрываем кнопку отмены
    document.getElementById('cancelEditBtn').style.display = 'none';
}

// ===== УДАЛЕНИЕ БУКЕТА =====

async function deleteBouquet(id) {
    if (!confirm('Вы уверены, что хотите удалить этот букет?')) {
        return;
    }

    try {
        // Сначала получаем данные букета чтобы удалить изображение
        const { data: bouquet, error: fetchError } = await window.supabaseClient
            .from('bouquets')
            .select('image_url')
            .eq('id', id)
            .single();

        if (fetchError) throw fetchError;

        // Удаляем букет из БД
        const { error: deleteError } = await window.supabaseClient
            .from('bouquets')
            .delete()
            .eq('id', id);

        if (deleteError) throw deleteError;

        // Удаляем изображение из Storage
        if (bouquet?.image_url) {
            await deleteImageFromStorage(bouquet.image_url);
        }

        showNotification('Букет удалён', 'success');
        loadBouquets();

        // Если удаляем букет который редактируем - сбрасываем форму
        if (editingBouquetId === id) {
            resetForm();
        }

    } catch (error) {
        console.error('Ошибка удаления букета:', error);
        showNotification('Ошибка при удалении букета', 'error');
    }
}

// ===== ЗАГРУЗКА БУКЕТОВ =====

async function loadBouquets() {
    const container = document.getElementById('bouquetsList');
    const loading = document.getElementById('loadingBouquets');

    try {
        loading.style.display = 'flex';
        container.style.display = 'none';

        const { data: bouquets, error } = await window.supabaseClient
            .from('bouquets')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        loading.style.display = 'none';
        container.style.display = 'grid';

        if (!bouquets || bouquets.length === 0) {
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
                    <img src="${bouquet.image_url}" alt="${bouquet.name}" class="bouquet-item-image" 
                         onerror="this.src='https://via.placeholder.com/120x120?text=Букет'">
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

    } catch (error) {
        console.error('Ошибка загрузки букетов:', error);
        loading.style.display = 'none';
        container.style.display = 'block';
        container.innerHTML = `
            <div class="error-message" style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <p style="color: #e74c3c; margin-bottom: 1rem;">Ошибка загрузки букетов</p>
                <button class="btn btn-primary" onclick="loadBouquets()">Попробовать снова</button>
            </div>
        `;
    }
}

// ===== УВЕДОМЛЕНИЯ =====

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
        max-width: 350px;
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
        isAuthenticated = true;
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
        .login-error {
            display: none;
            color: #e74c3c;
            margin-top: 1rem;
            text-align: center;
            font-size: 0.95rem;
        }
    `;
    document.head.appendChild(style);
});