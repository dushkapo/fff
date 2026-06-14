'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Plus, Trash2, Edit, Package, Settings, Upload, X, Save, Store, StoreIcon, Loader2, Flower2, ClipboardList } from 'lucide-react';
import { supabase, Product, Settings as SettingsType, Flower } from '@/lib/supabase';

export default function AdminPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [settings, setSettings] = useState<SettingsType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'products' | 'flowers' | 'settings' | 'orders'>('products');
    const [orders, setOrders] = useState<any[]>([]);
    const [notification, setNotification] = useState<{ message: string, type: string } | null>(null);

    // Product form
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        discount: '0',
        payment_url: '',
        in_stock: true,
    });
    const [imagePreview, setImagePreview] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const [dbError, setDbError] = useState<string | null>(null);

    // Flowers state (for custom bouquet builder)
    const [flowers, setFlowers] = useState<Flower[]>([]);
    const [showFlowerForm, setShowFlowerForm] = useState(false);
    const [editingFlower, setEditingFlower] = useState<Flower | null>(null);
    const [flowerForm, setFlowerForm] = useState({
        name: '',
        description: '',
        price: '',
        in_stock: true,
    });
    const [flowerImagePreview, setFlowerImagePreview] = useState<string>('');
    const [flowerImageFile, setFlowerImageFile] = useState<File | null>(null);
    const flowerFileInputRef = useRef<HTMLInputElement>(null);

    // Initial data load
    useEffect(() => {
        // Delay check slightly to ensure client init
        setTimeout(() => {
            checkDbConnection();
            loadData();
        }, 500);

        // Restore editing state from sessionStorage
        const savedProductEdit = sessionStorage.getItem('admin-editing-product');
        if (savedProductEdit) {
            try {
                const data = JSON.parse(savedProductEdit);
                setEditingProduct(data.product);
                setProductForm(data.form);
                setImagePreview(data.imagePreview || '');
                setShowProductForm(true);
            } catch (e) {
                sessionStorage.removeItem('admin-editing-product');
            }
        }

        const savedFlowerEdit = sessionStorage.getItem('admin-editing-flower');
        if (savedFlowerEdit) {
            try {
                const data = JSON.parse(savedFlowerEdit);
                setEditingFlower(data.flower);
                setFlowerForm(data.form);
                setFlowerImagePreview(data.imagePreview || '');
                setShowFlowerForm(true);
            } catch (e) {
                sessionStorage.removeItem('admin-editing-flower');
            }
        }

        // Restore active tab
        const savedTab = sessionStorage.getItem('admin-active-tab');
        if (savedTab && (savedTab === 'products' || savedTab === 'flowers' || savedTab === 'settings' || savedTab === 'orders')) {
            setActiveTab(savedTab);
        }
    }, []);

    // Save editing state to sessionStorage
    useEffect(() => {
        if (editingProduct && showProductForm) {
            sessionStorage.setItem('admin-editing-product', JSON.stringify({
                product: editingProduct,
                form: productForm,
                imagePreview: imagePreview,
            }));
        } else {
            sessionStorage.removeItem('admin-editing-product');
        }
    }, [editingProduct, productForm, imagePreview, showProductForm]);

    useEffect(() => {
        if (editingFlower && showFlowerForm) {
            sessionStorage.setItem('admin-editing-flower', JSON.stringify({
                flower: editingFlower,
                form: flowerForm,
                imagePreview: flowerImagePreview,
            }));
        } else {
            sessionStorage.removeItem('admin-editing-flower');
        }
    }, [editingFlower, flowerForm, flowerImagePreview, showFlowerForm]);

    // Save active tab
    useEffect(() => {
        sessionStorage.setItem('admin-active-tab', activeTab);
    }, [activeTab]);

    // Auto-load orders when switching to orders tab
    useEffect(() => {
        if (activeTab === 'orders' && orders.length === 0) {
            fetch('/api/admin/orders')
                .then(res => res.ok ? res.json() : [])
                .then(data => setOrders(data))
                .catch(() => {});
        }
    }, [activeTab]);

    const checkDbConnection = async () => {
        try {
            // Check bouquets table (simpler than settings)
            const { error } = await supabase.from('bouquets').select('id').limit(1);
            if (error) throw error;
            setDbError(null);
        } catch (err: any) {
            console.error('DB Check failed:', err);
            let msg = 'Ошибка подключения к базе данных.';
            if (err.message && err.message.length > 0) msg = err.message;
            if (err.code === '42P01') msg = 'Ошибка: Таблицы не найдены. Выполните SQL-скрипт!';
            if (err.code === '42501') msg = 'Ошибка: Нет доступа (RLS). Выполните SQL-скрипт!';
            setDbError(msg);
        }
    };

    const loadData = async () => {
        setIsLoading(true);
        const [productsRes, settingsRes, flowersRes] = await Promise.all([
            supabase.from('bouquets').select('*').order('created_at', { ascending: false }),
            supabase.from('settings').select('*').single(),
            supabase.from('flowers').select('*').order('created_at', { ascending: false }),
        ]);
        if (productsRes.data) setProducts(productsRes.data);
        if (flowersRes.data) setFlowers(flowersRes.data);

        // Use settings from DB or create default
        if (settingsRes.data) {
            setSettings(settingsRes.data);
        } else {
            // Default settings if none in DB
            setSettings({
                id: '',
                shop_open: true,
                delivery_enabled: true,
                shop_name: '',
                hero_title: '',
                hero_subtitle: '',
                phone: '',
                telegram_link: '',
                address: '',
                address_link: '',
                schedule: '',
                about_enabled: false,
                about_text: '',
                schedule_enabled: false,
                delivery_price_enabled: false,
                delivery_price: '',
                delivery_info: '',
                pickup_info: '',
                payment_info: '',
            });
        }
        setIsLoading(false);
    };

    const showNotif = (message: string, type: string = 'info') => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleLogout = async () => {
        if (confirm('Выйти из админ-панели?')) {
            await fetch('/api/admin/logout', { method: 'POST' });
            router.push('/admin/login');
            router.refresh();
        }
    };

    // Upload image to server API -> Supabase Storage
    const uploadImage = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/admin/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.error || 'Upload failed');
        }

        const data = await response.json();
        return data.url;
    };

    // Image handling
    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            showNotif('Файл слишком большой! Максимум 5MB', 'error');
            return;
        }

        setImageFile(file);
        // Show local preview while uploading
        const reader = new FileReader();
        reader.onload = (ev) => setImagePreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const clearImage = () => {
        setImagePreview('');
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Product CRUD
    const handleSaveProduct = async () => {
        if (!productForm.name || !productForm.price) {
            showNotif('Заполните название и цену', 'error');
            return;
        }

        if (!editingProduct && !imageFile && !imagePreview) {
            showNotif('Добавьте фото букета', 'error');
            return;
        }

        setIsSaving(true);

        try {
            let imageUrl = editingProduct?.image_url || '';

            // Upload new image to Supabase Storage via API
            if (imageFile) {
                imageUrl = await uploadImage(imageFile);
            }

            const productData = {
                name: productForm.name,
                description: productForm.description,
                price: parseInt(productForm.price) || 0,
                discount: parseInt(productForm.discount) || 0,
                image_url: imageUrl,
                payment_url: productForm.payment_url,
                in_stock: productForm.in_stock,
            };

            const method = editingProduct ? 'PUT' : 'POST';
            const body = editingProduct ? { id: editingProduct.id, ...productData } : productData;

            const response = await fetch('/api/admin/products', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Не удалось сохранить');
            }

            showNotif(editingProduct ? 'Букет обновлён!' : 'Букет добавлен!', 'success');
            resetForm();
            await loadData();
        } catch (error: any) {
            console.error('Save error:', error);
            showNotif(`Ошибка: ${error.message || 'Не удалось сохранить'}`, 'error');
        }

        setIsSaving(false);
    };

    const handleEditProduct = (product: Product) => {
        setEditingProduct(product);
        setProductForm({
            name: product.name,
            description: product.description,
            price: product.price.toString(),
            discount: product.discount.toString(),
            payment_url: product.payment_url || '',
            in_stock: product.in_stock,
        });
        setImagePreview(product.image_url);
        setShowProductForm(true);
    };

    const handleDeleteProduct = async (id: string) => {
        if (confirm('Удалить этот букет?')) {
            try {
                const response = await fetch(`/api/admin/products?id=${id}`, { method: 'DELETE' });
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || 'Не удалось удалить');
                }
                showNotif('Букет удалён', 'info');
                await loadData();
            } catch (error: any) {
                showNotif(`Ошибка: ${error.message}`, 'error');
            }
        }
    };

    const resetForm = () => {
        setShowProductForm(false);
        setEditingProduct(null);
        setProductForm({ name: '', description: '', price: '', discount: '0', payment_url: '', in_stock: true });
        setImagePreview('');
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Settings - via server API
    const handleSaveSettings = async () => {
        if (!settings) return;
        setIsSaving(true);

        try {
            const response = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Не удалось сохранить');
            }

            await loadData();
            showNotif('✅ Настройки сохранены!', 'success');
        } catch (error: any) {
            console.error('Save error:', error);
            showNotif(`❌ Ошибка: ${error.message || 'Не удалось сохранить'}`, 'error');
        }

        setIsSaving(false);
    };

    const toggleShopOpen = async () => {
        if (!settings) return;
        const newValue = !settings.shop_open;
        setSettings({ ...settings, shop_open: newValue });
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ field: 'shop_open', value: newValue }),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to update');
            }
            showNotif(newValue ? 'Магазин открыт' : 'Магазин закрыт', 'success');
        } catch (err: any) {
            console.error('Toggle shop_open error:', err);
            setSettings({ ...settings, shop_open: !newValue });
            showNotif(err.message || 'Ошибка: не удалось сохранить статус магазина', 'error');
        }
    };

    const toggleDelivery = async () => {
        if (!settings) return;
        const newValue = !settings.delivery_enabled;
        setSettings({ ...settings, delivery_enabled: newValue });
        try {
            const response = await fetch('/api/admin/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ field: 'delivery_enabled', value: newValue }),
            });
            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Failed to update');
            }
            showNotif(newValue ? 'Доставка включена' : 'Доставка отключена', 'success');
        } catch (err: any) {
            console.error('Toggle delivery error:', err);
            setSettings({ ...settings, delivery_enabled: !newValue });
            showNotif(err.message || 'Ошибка: не удалось сохранить статус доставки', 'error');
        }
    };

    // Flower image handling (same logic as products)
    const handleFlowerImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            showNotif('Файл слишком большой! Максимум 5MB', 'error');
            return;
        }
        setFlowerImageFile(file);
        const reader = new FileReader();
        reader.onload = (ev) => setFlowerImagePreview(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    const handleSaveFlower = async () => {
        if (!flowerForm.name || !flowerForm.price) {
            showNotif('Заполните название и цену', 'error');
            return;
        }
        setIsSaving(true);

        try {
            let imageUrl = editingFlower?.image_url || '';

            // Upload new image to Supabase Storage via API
            if (flowerImageFile) {
                imageUrl = await uploadImage(flowerImageFile);
            }

            const flowerData = {
                name: flowerForm.name,
                description: flowerForm.description,
                price: parseInt(flowerForm.price),
                image_url: imageUrl,
                in_stock: flowerForm.in_stock,
            };

            const method = editingFlower ? 'PUT' : 'POST';
            const body = editingFlower ? { id: editingFlower.id, ...flowerData } : flowerData;

            const response = await fetch('/api/admin/flowers', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Не удалось сохранить');
            }

            showNotif(editingFlower ? 'Цветок обновлён!' : 'Цветок добавлен!', 'success');
            resetFlowerForm();
            await loadData();
        } catch (error: any) {
            console.error('Save flower error:', error);
            showNotif(`Ошибка: ${error.message || 'Не удалось сохранить'}`, 'error');
        }
        setIsSaving(false);
    };

    const handleEditFlower = (flower: Flower) => {
        setEditingFlower(flower);
        setFlowerForm({
            name: flower.name,
            description: flower.description,
            price: flower.price.toString(),
            in_stock: flower.in_stock,
        });
        setFlowerImagePreview(flower.image_url);
        setShowFlowerForm(true);
    };

    const handleDeleteFlower = async (id: string) => {
        if (confirm('Удалить этот цветок?')) {
            try {
                const response = await fetch(`/api/admin/flowers?id=${id}`, { method: 'DELETE' });
                if (!response.ok) {
                    const err = await response.json();
                    throw new Error(err.error || 'Не удалось удалить');
                }
                showNotif('Цветок удалён', 'info');
                await loadData();
            } catch (error: any) {
                showNotif(`Ошибка: ${error.message}`, 'error');
            }
        }
    };

    const resetFlowerForm = () => {
        setShowFlowerForm(false);
        setEditingFlower(null);
        setFlowerForm({ name: '', description: '', price: '', in_stock: true });
        setFlowerImagePreview('');
        setFlowerImageFile(null);
        if (flowerFileInputRef.current) flowerFileInputRef.current.value = '';
    };


    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <Loader2 className="animate-spin text-gray-600" size={48} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 notranslate">
            {/* DB Error Banner */}
            {dbError && (
                <div className="bg-red-600 text-white p-4 text-center font-bold sticky top-0 z-50 shadow-lg flex flex-col items-center gap-2">
                    <p>⚠️ {dbError}</p>
                    <p className="text-xs font-normal opacity-80">(Попробуйте запустить SQL скрипт в Supabase, если видите Code: 42P01)</p>
                    <div className="bg-red-800 p-2 rounded text-xs font-mono text-left w-full max-w-lg">
                        <p>Debug Info:</p>
                        <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ ОБНАРУЖЕН' : '❌ НЕ НАЙДЕН'}</p>
                        <p>KEY: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ ОБНАРУЖЕН' : '❌ НЕ НАЙДЕН'}</p>
                        {process.env.NEXT_PUBLIC_SUPABASE_URL && (
                            <p className="opacity-75">{process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 15)}...</p>
                        )}
                    </div>
                </div>
            )}
            {/* Notification - Mobile optimized */}
            {notification && (
                <div className={`fixed top-2 left-2 right-2 sm:top-4 sm:right-4 sm:left-auto z-50 px-4 py-3 rounded-lg text-white font-medium shadow-lg text-sm sm:text-base
                    ${notification.type === 'success' ? 'bg-green-500' :
                        notification.type === 'error' ? 'bg-red-500' : 'bg-amber-500'}`}>
                    {notification.message}
                </div>
            )}

            {/* Header */}
            <header className="bg-zinc-900 text-white shadow-lg">
                <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold">Панель управления</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Shop Toggle */}
                        <button
                            onClick={toggleShopOpen}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${settings?.shop_open ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                                }`}
                        >
                            {settings?.shop_open ? <Store size={18} /> : <StoreIcon size={18} />}
                            {settings?.shop_open ? 'Открыто' : 'Закрыто'}
                        </button>
                        {/* Delivery Toggle */}
                        <button
                            onClick={toggleDelivery}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${settings?.delivery_enabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-zinc-600 hover:bg-zinc-500'
                                }`}
                        >
                            🚚 {settings?.delivery_enabled ? 'Доставка ✓' : 'Доставка ✗'}
                        </button>
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
                        >
                            <LogOut size={18} />
                            Выйти
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 py-6">
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('products')}
                        className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'products' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-700 hover:bg-zinc-100'
                            }`}
                    >
                        <Package size={20} />
                        <span className="hidden sm:inline">Букеты</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('flowers')}
                        className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'flowers' ? 'bg-pink-500 text-white' : 'bg-white text-zinc-700 hover:bg-pink-50'
                            }`}
                    >
                        <Flower2 size={20} />
                        <span className="hidden sm:inline">Цветы</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('settings')}
                        className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'settings' ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-700 hover:bg-zinc-100'
                            }`}
                    >
                        <Settings size={20} />
                        <span className="hidden sm:inline">Настройки</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('orders')}
                        className={`flex items-center gap-2 px-4 sm:px-6 py-3 rounded-lg font-semibold transition-all ${activeTab === 'orders' ? 'bg-emerald-600 text-white' : 'bg-white text-zinc-700 hover:bg-emerald-50'
                            }`}
                    >
                        <ClipboardList size={20} />
                        <span className="hidden sm:inline">Заказы</span>
                    </button>
                </div>

                {/* Products Tab */}
                {activeTab === 'products' && (
                    <div className="space-y-6">
                        {/* Add Product Button */}
                        {!showProductForm && (
                            <button
                                onClick={() => setShowProductForm(true)}
                                className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                            >
                                <Plus size={20} />
                                Добавить букет
                            </button>
                        )}

                        {/* Product Form */}
                        {showProductForm && (
                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold">
                                        {editingProduct ? 'Редактировать букет' : 'Новый букет'}
                                    </h2>
                                    <button onClick={resetForm} className="text-zinc-400 hover:text-zinc-600">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Left Column - Form Fields */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Название *</label>
                                            <input
                                                type="text"
                                                value={productForm.name}
                                                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                                                placeholder="Королевская роза"
                                                className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:border-amber-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Описание</label>
                                            <textarea
                                                value={productForm.description}
                                                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                                                placeholder="Элегантная композиция из премиум роз..."
                                                rows={2}
                                                className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:border-amber-500 focus:outline-none resize-none"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Цена (GEL) *</label>
                                                <input
                                                    type="number"
                                                    value={productForm.price}
                                                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                                                    placeholder="8500"
                                                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:border-amber-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Скидка (%)</label>
                                                <input
                                                    type="number"
                                                    value={productForm.discount}
                                                    onChange={(e) => setProductForm({ ...productForm, discount: e.target.value })}
                                                    placeholder="0"
                                                    min="0"
                                                    max="100"
                                                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:border-amber-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Ссылка на оплату</label>
                                            <input
                                                type="url"
                                                value={productForm.payment_url}
                                                onChange={(e) => setProductForm({ ...productForm, payment_url: e.target.value })}
                                                placeholder="https://pay.example.com/..."
                                                className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:border-amber-500 focus:outline-none"
                                            />
                                            <p className="text-xs text-zinc-400 mt-1">Индивидуальная ссылка для оплаты этого букета</p>
                                        </div>
                                        <label className="flex items-center gap-3 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={productForm.in_stock}
                                                onChange={(e) => setProductForm({ ...productForm, in_stock: e.target.checked })}
                                                className="w-5 h-5 accent-amber-500"
                                            />
                                            <span className="font-medium">В наличии</span>
                                        </label>
                                    </div>

                                    {/* Right Column - Image Upload */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Фото букета *</label>
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            className={`relative border-2 border-dashed rounded-lg cursor-pointer transition-colors
                                                ${imagePreview ? 'border-amber-500 bg-amber-50' : 'border-zinc-300 hover:border-amber-400 bg-zinc-50'}`}
                                            style={{ minHeight: '200px' }}
                                        >
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageSelect}
                                                className="hidden"
                                            />

                                            {imagePreview ? (
                                                <div className="relative">
                                                    <img
                                                        src={imagePreview}
                                                        alt="Preview"
                                                        className="w-full h-48 object-contain rounded-lg"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); clearImage(); }}
                                                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                                                    <Upload size={48} className="mb-3 text-zinc-400" />
                                                    <p className="font-medium">Нажмите для выбора фото</p>
                                                    <p className="text-sm text-zinc-400">JPG, PNG до 10MB</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={handleSaveProduct}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                        {editingProduct ? 'Сохранить изменения' : 'Добавить букет'}
                                    </button>
                                    <button
                                        onClick={resetForm}
                                        className="px-6 py-3 bg-zinc-200 hover:bg-zinc-300 rounded-lg font-semibold transition-colors"
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Products List */}
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <h2 className="text-xl font-bold mb-4">Букеты ({products.length})</h2>

                            {products.length === 0 ? (
                                <div className="text-center py-12 text-zinc-400">
                                    <div className="text-5xl mb-3">🌸</div>
                                    <p>Пока нет букетов. Добавьте первый!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {products.map((product) => {
                                        const finalPrice = product.discount > 0
                                            ? Math.round(product.price * (1 - product.discount / 100))
                                            : product.price;

                                        return (
                                            <div key={product.id} className="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl">
                                                <img
                                                    src={product.image_url}
                                                    alt={product.name}
                                                    className="w-20 h-20 object-cover rounded-lg bg-zinc-200"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold truncate">{product.name}</h3>
                                                    <p className="text-zinc-500 text-sm truncate">{product.description}</p>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span suppressHydrationWarning className="font-bold text-amber-600">
                                                            {finalPrice.toLocaleString('ka-GE')} GEL
                                                        </span>
                                                        {product.discount > 0 && (
                                                            <>
                                                                <span suppressHydrationWarning className="text-zinc-400 text-sm line-through">
                                                                    {product.price.toLocaleString('ka-GE')} GEL
                                                                </span>
                                                                <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                                                                    -{product.discount}%
                                                                </span>
                                                            </>
                                                        )}
                                                        <span className={`text-xs px-2 py-0.5 rounded-full ${product.in_stock ? 'bg-green-100 text-green-600' : 'bg-zinc-100 text-zinc-500'
                                                            }`}>
                                                            {product.in_stock ? 'В наличии' : 'Нет'}
                                                        </span>
                                                        {product.payment_url ? (
                                                            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">💳 Оплата</span>
                                                        ) : (
                                                            <span className="text-xs bg-zinc-100 text-zinc-400 px-2 py-0.5 rounded-full">Нет ссылки</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEditProduct(product)}
                                                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteProduct(product.id)}
                                                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Flowers Tab */}
                {activeTab === 'flowers' && (
                    <div className="space-y-6">
                        {/* Add Flower Button */}
                        {!showFlowerForm && (
                            <button
                                onClick={() => setShowFlowerForm(true)}
                                className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                            >
                                <Plus size={20} />
                                Добавить цветок
                            </button>
                        )}

                        {/* Flower Form */}
                        {showFlowerForm && (
                            <div className="bg-white rounded-xl p-6 shadow-lg">
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold">
                                        {editingFlower ? 'Редактировать цветок' : 'Добавить цветок'}
                                    </h2>
                                    <button onClick={resetFlowerForm} className="text-zinc-400 hover:text-zinc-600">
                                        <X size={24} />
                                    </button>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    {/* Left column - fields */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Название *</label>
                                            <input
                                                type="text"
                                                value={flowerForm.name}
                                                onChange={(e) => setFlowerForm({ ...flowerForm, name: e.target.value })}
                                                placeholder="Роза красная"
                                                className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:border-pink-500 focus:outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-1">Описание</label>
                                            <textarea
                                                value={flowerForm.description}
                                                onChange={(e) => setFlowerForm({ ...flowerForm, description: e.target.value })}
                                                placeholder="Красная эквадорская роза, 60 см"
                                                rows={3}
                                                className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:border-pink-500 focus:outline-none resize-none"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium mb-1">Цена за 1 шт (GEL) *</label>
                                                <input
                                                    type="number"
                                                    value={flowerForm.price}
                                                    onChange={(e) => setFlowerForm({ ...flowerForm, price: e.target.value })}
                                                    placeholder="250"
                                                    className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:border-pink-500 focus:outline-none"
                                                />
                                            </div>
                                            <div className="flex items-center gap-2 pt-6">
                                                <input
                                                    type="checkbox"
                                                    id="flower_in_stock"
                                                    checked={flowerForm.in_stock}
                                                    onChange={(e) => setFlowerForm({ ...flowerForm, in_stock: e.target.checked })}
                                                    className="w-5 h-5 rounded border-zinc-300 text-pink-500 focus:ring-pink-500"
                                                />
                                                <label htmlFor="flower_in_stock" className="text-sm font-medium">В наличии</label>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right column - image */}
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Фото</label>
                                        <input
                                            ref={flowerFileInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFlowerImageSelect}
                                            className="hidden"
                                        />
                                        <div
                                            onClick={() => flowerFileInputRef.current?.click()}
                                            className="w-full aspect-square border-2 border-dashed border-zinc-300 rounded-xl cursor-pointer hover:border-pink-400 transition-colors flex items-center justify-center overflow-hidden bg-zinc-50"
                                        >
                                            {flowerImagePreview ? (
                                                <div className="relative w-full h-full">
                                                    <img
                                                        src={flowerImagePreview}
                                                        alt="Preview"
                                                        className="w-full h-full object-cover"
                                                    />
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setFlowerImagePreview(''); }}
                                                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
                                                    <Upload size={48} className="mb-3 text-zinc-400" />
                                                    <p className="font-medium">Нажмите для выбора фото</p>
                                                    <p className="text-sm text-zinc-400">JPG, PNG до 10MB</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Save Button */}
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={handleSaveFlower}
                                        disabled={isSaving}
                                        className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
                                    >
                                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                        {editingFlower ? 'Сохранить изменения' : 'Добавить цветок'}
                                    </button>
                                    <button
                                        onClick={resetFlowerForm}
                                        className="px-6 py-3 bg-zinc-200 hover:bg-zinc-300 rounded-lg font-semibold transition-colors"
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Flowers List */}
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <h2 className="text-xl font-bold mb-4">Цветы ({flowers.length})</h2>

                            {flowers.length === 0 ? (
                                <div className="text-center py-12 text-zinc-400">
                                    <div className="text-5xl mb-3">🌸</div>
                                    <p>Пока нет цветов. Добавьте первый!</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {flowers.map((flower) => (
                                        <div key={flower.id} className="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl">
                                            <img
                                                src={flower.image_url || '/bouquet-1.jpg'}
                                                alt={flower.name}
                                                className="w-20 h-20 object-cover rounded-lg bg-zinc-200"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold truncate">{flower.name}</h3>
                                                <p className="text-zinc-500 text-sm truncate">{flower.description}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="font-bold text-pink-500">
                                                        {flower.price} GEL / шт
                                                    </span>
                                                    <span className={`text-xs px-2 py-0.5 rounded-full ${flower.in_stock ? 'bg-green-100 text-green-600' : 'bg-zinc-100 text-zinc-500'}`}>
                                                        {flower.in_stock ? 'В наличии' : 'Нет'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEditFlower(flower)}
                                                    className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteFlower(flower.id)}
                                                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && settings && (
                    <div className="space-y-6">
                        {/* Branding Section */}
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <h2 className="text-xl font-bold mb-4">Брендинг</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Название магазина</label>
                                    <input
                                        type="text"
                                        value={settings.shop_name || ''}
                                        onChange={(e) => setSettings({ ...settings, shop_name: e.target.value })}
                                        placeholder="Мир Цветов"
                                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:border-amber-500 focus:outline-none"
                                    />
                                    <p className="text-xs text-zinc-400 mt-1">Отображается в шапке сайта</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Заголовок Hero</label>
                                    <input
                                        type="text"
                                        value={settings.hero_title || ''}
                                        onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                                        placeholder="МИР ЦВЕТОВ"
                                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:border-amber-500 focus:outline-none"
                                    />
                                    <p className="text-xs text-zinc-400 mt-1">Большой текст на главном баннере</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">Подзаголовок Hero</label>
                                    <input
                                        type="text"
                                        value={settings.hero_subtitle || ''}
                                        onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                                        placeholder="Изысканные букеты для особых моментов"
                                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:border-amber-500 focus:outline-none"
                                    />
                                    <p className="text-xs text-zinc-400 mt-1">Текст под заголовком на главном баннере</p>
                                </div>
                            </div>
                        </div>

                        {/* Contacts Section */}
                        <div className="bg-white rounded-xl p-6 shadow-lg">
                            <h2 className="text-xl font-bold mb-4">Контактная информация</h2>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-1">Телефон</label>
                                    <input
                                        type="tel"
                                        value={settings.phone || ''}
                                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                                        placeholder="+7 (999) 123-45-67"
                                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:border-amber-500 focus:outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Telegram</label>
                                    <input
                                        type="url"
                                        value={settings.telegram_link || ''}
                                        onChange={(e) => setSettings({ ...settings, telegram_link: e.target.value })}
                                        placeholder="https://t.me/username"
                                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:border-amber-500 focus:outline-none"
                                    />
                                    <p className="text-xs text-zinc-400 mt-1">Иконка появится если заполнено</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Ссылка на 2ГИС</label>
                                    <input
                                        type="url"
                                        value={settings.address_link || ''}
                                        onChange={(e) => setSettings({ ...settings, address_link: e.target.value })}
                                        placeholder="https://2gis.ru/city/firm/..."
                                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:border-amber-500 focus:outline-none"
                                    />
                                    <p className="text-xs text-zinc-400 mt-1">Иконка 2ГИС появится если заполнено</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium mb-1">График работы</label>
                                    <input
                                        type="text"
                                        value={settings.schedule || ''}
                                        onChange={(e) => setSettings({ ...settings, schedule: e.target.value })}
                                        placeholder="Ежедневно с 9:00 до 21:00"
                                        className="w-full px-4 py-3 border border-zinc-200 rounded-lg focus:border-amber-500 focus:outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Content Section with Toggles */}
                        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg">
                            <h2 className="text-lg sm:text-xl font-bold mb-4">Контент сайта</h2>
                            <p className="text-xs sm:text-sm text-zinc-500 mb-4">Включите переключатель, чтобы раздел появился на сайте</p>

                            <div className="space-y-4">
                                {/* About Section Toggle */}
                                <div className="border border-zinc-200 rounded-lg p-3 sm:p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium">📝 Раздел «О нас»</label>
                                        <button
                                            onClick={() => setSettings({ ...settings, about_enabled: !settings.about_enabled })}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${settings.about_enabled ? 'bg-green-500' : 'bg-zinc-300'}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.about_enabled ? 'translate-x-6' : ''}`} />
                                        </button>
                                    </div>
                                    {settings.about_enabled && (
                                        <textarea
                                            value={settings.about_text || ''}
                                            onChange={(e) => setSettings({ ...settings, about_text: e.target.value })}
                                            placeholder="Расскажите о вашем бутике..."
                                            rows={3}
                                            className="w-full px-3 py-2 mt-2 border border-zinc-200 rounded-lg focus:border-amber-500 focus:outline-none resize-none text-sm"
                                        />
                                    )}
                                </div>

                                {/* Schedule Toggle */}
                                <div className="border border-zinc-200 rounded-lg p-3 sm:p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium">🕐 График работы</label>
                                        <button
                                            onClick={() => setSettings({ ...settings, schedule_enabled: !settings.schedule_enabled })}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${settings.schedule_enabled ? 'bg-green-500' : 'bg-zinc-300'}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.schedule_enabled ? 'translate-x-6' : ''}`} />
                                        </button>
                                    </div>
                                    {settings.schedule_enabled && (
                                        <input
                                            type="text"
                                            value={settings.schedule || ''}
                                            onChange={(e) => setSettings({ ...settings, schedule: e.target.value })}
                                            placeholder="Ежедневно с 9:00 до 21:00"
                                            className="w-full px-3 py-2 mt-2 border border-zinc-200 rounded-lg focus:border-amber-500 focus:outline-none text-sm"
                                        />
                                    )}
                                </div>

                                {/* Delivery Price Toggle */}
                                <div className="border border-zinc-200 rounded-lg p-3 sm:p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-sm font-medium">💰 Стоимость доставки</label>
                                        <button
                                            onClick={() => setSettings({ ...settings, delivery_price_enabled: !settings.delivery_price_enabled })}
                                            className={`relative w-12 h-6 rounded-full transition-colors ${settings.delivery_price_enabled ? 'bg-green-500' : 'bg-zinc-300'}`}
                                        >
                                            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.delivery_price_enabled ? 'translate-x-6' : ''}`} />
                                        </button>
                                    </div>
                                    {settings.delivery_price_enabled && (
                                        <input
                                            type="text"
                                            value={settings.delivery_price || ''}
                                            onChange={(e) => setSettings({ ...settings, delivery_price: e.target.value })}
                                            placeholder="50 GEL"
                                            className="w-full px-3 py-2 mt-2 border border-zinc-200 rounded-lg focus:border-amber-500 focus:outline-none text-sm"
                                        />
                                    )}
                                </div>

                                {/* Delivery Info */}
                                <div className="border border-zinc-200 rounded-lg p-3 sm:p-4">
                                    <label className="text-sm font-medium block mb-2">🚚 Инфо о доставке</label>
                                    <input
                                        type="text"
                                        value={settings.delivery_info || ''}
                                        onChange={(e) => setSettings({ ...settings, delivery_info: e.target.value })}
                                        placeholder="Срочная за 2 часа"
                                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:border-amber-500 focus:outline-none text-sm"
                                    />
                                </div>

                                {/* Pickup Info */}
                                <div className="border border-zinc-200 rounded-lg p-3 sm:p-4">
                                    <label className="text-sm font-medium block mb-2">🏪 Самовывоз</label>
                                    <input
                                        type="text"
                                        value={settings.pickup_info || ''}
                                        onChange={(e) => setSettings({ ...settings, pickup_info: e.target.value })}
                                        placeholder="Бесплатно"
                                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:border-amber-500 focus:outline-none text-sm"
                                    />
                                </div>

                                {/* Payment Info */}
                                <div className="border border-zinc-200 rounded-lg p-3 sm:p-4">
                                    <label className="text-sm font-medium block mb-2">💳 Оплата</label>
                                    <input
                                        type="text"
                                        value={settings.payment_info || ''}
                                        onChange={(e) => setSettings({ ...settings, payment_info: e.target.value })}
                                        placeholder="Наличные, карта"
                                        className="w-full px-3 py-2 border border-zinc-200 rounded-lg focus:border-amber-500 focus:outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Save Button - Sticky on mobile */}
                        <div className="sticky bottom-0 bg-gray-100 py-3 -mx-4 px-4 sm:static sm:bg-transparent sm:p-0">
                            <button
                                onClick={handleSaveSettings}
                                disabled={isSaving}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold disabled:opacity-50 transition-colors"
                            >
                                {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                                Сохранить настройки
                            </button>
                        </div>
                    </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-zinc-800">Заказы</h2>
                            <button
                                onClick={async () => {
                                    try {
                                        const res = await fetch('/api/admin/orders');
                                        if (res.ok) { setOrders(await res.json()); showNotif('Заказы обновлены', 'success'); }
                                    } catch { showNotif('Ошибка загрузки заказов', 'error'); }
                                }}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                🔄 Обновить
                            </button>
                        </div>

                        {orders.length === 0 ? (
                            <div className="bg-white rounded-xl p-12 text-center text-zinc-400">
                                <ClipboardList size={48} className="mx-auto mb-4 opacity-40" />
                                <p className="text-lg">Заказов пока нет</p>
                                <p className="text-sm mt-1">Когда клиент оформит букет, заказ появится здесь</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {orders.map((order: any) => (
                                    <div key={order.id} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${
                                        order.status === 'new' ? 'border-amber-500' :
                                        order.status === 'confirmed' ? 'border-blue-500' :
                                        order.status === 'completed' ? 'border-green-500' : 'border-zinc-300'
                                    }`}>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                                                        order.status === 'new' ? 'bg-amber-100 text-amber-800' :
                                                        order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                        order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-zinc-100 text-zinc-600'
                                                    }`}>
                                                        {order.status === 'new' ? '🆕 Новый' :
                                                         order.status === 'confirmed' ? '✅ Подтверждён' :
                                                         order.status === 'completed' ? '📦 Выполнен' : '❌ Отменён'}
                                                    </span>
                                                    <span className="text-xs text-zinc-400">
                                                        {new Date(order.created_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                <p className="font-semibold text-zinc-800 mt-1">
                                                    {order.order_type === 'custom_bouquet' ? '💐 ' : '📦 '}
                                                    {order.product_name}
                                                </p>
                                                <p className="text-sm text-zinc-600 mt-0.5">
                                                    👤 {order.customer_name} · 📞 <a href={`tel:${order.customer_phone}`} className="text-blue-600 hover:underline">{order.customer_phone}</a>
                                                </p>
                                                {order.address && <p className="text-sm text-zinc-500">📍 {order.address}</p>}
                                                {order.specific_time && <p className="text-sm text-zinc-500">🕐 {order.specific_time}</p>}
                                                {order.comment && <p className="text-sm text-zinc-500 italic">💬 {order.comment}</p>}
                                                {order.items && <p className="text-sm text-zinc-500">🌸 {order.items}</p>}
                                                <p className="text-base font-bold text-emerald-700 mt-1">
                                                    {order.product_price?.toLocaleString('ka-GE')} GEL
                                                    <span className="text-xs font-normal text-zinc-400 ml-2">
                                                        {order.delivery_type === 'delivery' ? '🚚 Доставка' : '🏪 Самовывоз'}
                                                    </span>
                                                </p>
                                            </div>
                                            <div className="flex gap-2 flex-wrap">
                                                {order.status !== 'confirmed' && order.status !== 'completed' && (
                                                    <button
                                                        onClick={async () => {
                                                            const res = await fetch('/api/admin/orders', {
                                                                method: 'PATCH',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ id: order.id, status: 'confirmed' }),
                                                            });
                                                            if (res.ok) {
                                                                setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'confirmed' } : o));
                                                                showNotif('Заказ подтверждён', 'success');
                                                            }
                                                        }}
                                                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                                                    >
                                                        ✅ Подтвердить
                                                    </button>
                                                )}
                                                {order.status !== 'completed' && (
                                                    <button
                                                        onClick={async () => {
                                                            const res = await fetch('/api/admin/orders', {
                                                                method: 'PATCH',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ id: order.id, status: 'completed' }),
                                                            });
                                                            if (res.ok) {
                                                                setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'completed' } : o));
                                                                showNotif('Заказ выполнен', 'success');
                                                            }
                                                        }}
                                                        className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium transition-colors"
                                                    >
                                                        📦 Выполнен
                                                    </button>
                                                )}
                                                {order.status !== 'cancelled' && (
                                                    <button
                                                        onClick={async () => {
                                                            const res = await fetch('/api/admin/orders', {
                                                                method: 'PATCH',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ id: order.id, status: 'cancelled' }),
                                                            });
                                                            if (res.ok) {
                                                                setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o));
                                                                showNotif('Заказ отменён', 'success');
                                                            }
                                                        }}
                                                        className="px-3 py-1.5 bg-zinc-400 hover:bg-zinc-500 text-white rounded-lg text-xs font-medium transition-colors"
                                                    >
                                                        ❌ Отменить
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
