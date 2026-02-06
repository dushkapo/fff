'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut, Plus, Trash2, Edit, Package, Settings, Upload, X, Save, Store, StoreIcon, Loader2, Flower2 } from 'lucide-react';
import { supabase, Product, Settings as SettingsType, Flower } from '@/lib/supabase';

export default function AdminPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [settings, setSettings] = useState<SettingsType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState<'products' | 'flowers' | 'settings'>('products');
    const [notification, setNotification] = useState<{ message: string, type: string } | null>(null);

    // Product form
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        discount: '0',
        in_stock: true,
    });
    const [imagePreview, setImagePreview] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [error, setError] = useState('');
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
    }, []);

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

    // Helper: Compress image to max 800x800, 0.7 quality
    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return reject('No context');

                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality JPEG
                };
                img.onerror = (err) => reject(err);
            };
            reader.onerror = (err) => reject(err);
        });
    };

    // Image handling
    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            showNotif('Файл слишком большой! Максимум 10MB', 'error');
            return;
        }

        try {
            const compressed = await compressImage(file);
            setImageFile(file); // Keep file as flag
            setImagePreview(compressed); // Store compressed base64
        } catch (err) {
            console.error('Compression error:', err);
            showNotif('Ошибка обработки фото', 'error');
        }
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

        if (!editingProduct && !imagePreview) {
            showNotif('Добавьте фото букета', 'error');
            return;
        }

        setIsSaving(true);

        let imageUrl = editingProduct?.image_url || '';

        // If new image selected, use the compressed preview
        if (imageFile) {
            imageUrl = imagePreview;
        }

        const productData = {
            name: productForm.name,
            description: productForm.description,
            price: parseInt(productForm.price) || 0,
            discount: parseInt(productForm.discount) || 0,
            image_url: imageUrl,
            in_stock: productForm.in_stock,
        };

        try {
            if (editingProduct) {
                const { error } = await supabase.from('bouquets').update(productData).eq('id', editingProduct.id);
                if (error) throw error;
                showNotif('Букет обновлён!', 'success');
            } else {
                const { error } = await supabase.from('bouquets').insert(productData);
                if (error) throw error;
                showNotif('Букет добавлен!', 'success');
            }

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
            in_stock: product.in_stock,
        });
        setImagePreview(product.image_url);
        setShowProductForm(true);
    };

    const handleDeleteProduct = async (id: string) => {
        if (confirm('Удалить этот букет?')) {
            await supabase.from('bouquets').delete().eq('id', id);
            showNotif('Букет удалён', 'info');
            await loadData();
        }
    };

    const resetForm = () => {
        setShowProductForm(false);
        setEditingProduct(null);
        setProductForm({ name: '', description: '', price: '', discount: '0', in_stock: true });
        setImagePreview('');
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    // Settings - with proper error handling and upsert
    const handleSaveSettings = async () => {
        if (!settings) return;
        setIsSaving(true);

        try {
            // Check if settings row exists
            const { data: existing } = await supabase.from('settings').select('id').limit(1).single();

            if (existing) {
                // Update existing settings
                const { error } = await supabase.from('settings').update(settings).eq('id', existing.id);
                if (error) throw error;
            } else {
                // Insert new settings (first time)
                const { error } = await supabase.from('settings').insert({
                    ...settings,
                    id: undefined
                });
                if (error) throw error;
            }

            // Reload data to confirm save
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
        const newSettings = { ...settings, shop_open: !settings.shop_open };
        setSettings(newSettings);
        if (settings.id) {
            await supabase.from('settings').update({ shop_open: newSettings.shop_open }).eq('id', settings.id);
        }
        showNotif(newSettings.shop_open ? 'Магазин открыт' : 'Магазин закрыт', 'info');
    };

    const toggleDelivery = async () => {
        if (!settings) return;
        const newSettings = { ...settings, delivery_enabled: !settings.delivery_enabled };
        setSettings(newSettings);
        if (settings.id) {
            await supabase.from('settings').update({ delivery_enabled: newSettings.delivery_enabled }).eq('id', settings.id);
        }
        showNotif(newSettings.delivery_enabled ? 'Доставка включена' : 'Доставка отключена', 'info');
    };

    // Flower image handling (same logic as products)
    const handleFlowerImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        try {
            const compressed = await compressImage(file);
            setFlowerImagePreview(compressed);
            setFlowerImageFile(file);
        } catch (err) {
            showNotif('Ошибка при сжатии изображения', 'error');
        }
    };

    const handleSaveFlower = async () => {
        if (!flowerForm.name || !flowerForm.price) {
            showNotif('Заполните название и цену', 'error');
            return;
        }
        setIsSaving(true);

        // Use preview as URL (base64) for simplicity
        const imageUrl = flowerImagePreview || editingFlower?.image_url || '';

        const flowerData = {
            name: flowerForm.name,
            description: flowerForm.description,
            price: parseInt(flowerForm.price),
            image_url: imageUrl,
            in_stock: flowerForm.in_stock,
        };

        try {
            if (editingFlower) {
                const { error } = await supabase.from('flowers').update(flowerData).eq('id', editingFlower.id);
                if (error) throw error;
                showNotif('Цветок обновлён!', 'success');
            } else {
                const { error } = await supabase.from('flowers').insert(flowerData);
                if (error) throw error;
                showNotif('Цветок добавлен!', 'success');
            }
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
            await supabase.from('flowers').delete().eq('id', id);
            showNotif('Цветок удалён', 'info');
            await loadData();
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
        <div className="min-h-screen bg-gray-100">
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
                                                <label className="block text-sm font-medium mb-1">Цена (₽) *</label>
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
                                                    <p className="text-sm text-zinc-400">JPG, PNG до 5MB</p>
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
                                                        <span className="font-bold text-amber-600">
                                                            {finalPrice.toLocaleString('ru-RU')} ₽
                                                        </span>
                                                        {product.discount > 0 && (
                                                            <>
                                                                <span className="text-zinc-400 text-sm line-through">
                                                                    {product.price.toLocaleString('ru-RU')} ₽
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
                                                <label className="block text-sm font-medium mb-1">Цена за 1 шт (₽) *</label>
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
                                                    <p className="text-sm text-zinc-400">JPG, PNG до 5MB</p>
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
                                                src={flower.image_url || '/placeholder-flower.jpg'}
                                                alt={flower.name}
                                                className="w-20 h-20 object-cover rounded-lg bg-zinc-200"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold truncate">{flower.name}</h3>
                                                <p className="text-zinc-500 text-sm truncate">{flower.description}</p>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="font-bold text-pink-500">
                                                        {flower.price} ₽ / шт
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
                                        placeholder="Diana Flowers"
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
                                        placeholder="DIANA FLOWERS"
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
                                            placeholder="500 ₽"
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
            </main>
        </div>
    );
}
