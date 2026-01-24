// =====================================================
// КОНФИГУРАЦИЯ SUPABASE ДЛЯ DIANA FLOWERS
// =====================================================

const SUPABASE_URL = 'https://fvkexoukttzcgvcujwrp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2a2V4b3VrdHR6Y2d2Y3Vqd3JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMjg3NDIsImV4cCI6MjA4NDcwNDc0Mn0.INpgnOZSsNZpu36DDkkAbgAdDh0yE0nZPm48V8CSpG4';

// Инициализация Supabase клиента
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Storage bucket для изображений
const STORAGE_BUCKET = 'bouquet-images';

// Экспортируем для использования в других файлах
window.supabaseClient = supabase;
window.STORAGE_BUCKET = STORAGE_BUCKET;

console.log('✅ Supabase initialized successfully');