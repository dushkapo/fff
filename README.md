#

Премиальный сайт для цветочного бутика на Next.js 14 + Supabase.

## Технологии

- **Next.js 14** (App Router)
- **Tailwind CSS** 
- **Supabase** (Database & Auth)
- **Framer Motion** (анимации)
- **Lucide Icons**
- **Zod** (валидация)

## Установка

```bash
npm install
```

## Запуск

```bash
npm run dev
```

Сайт будет доступен на http://localhost:3000

## Деплой на Vercel

1. Залейте проект на GitHub
2. Подключите репозиторий к Vercel
3. Добавьте переменные окружения в Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `ADMIN_PASSWORD` (пароль для админки)

## Настройка Supabase

1. Зайдите в Supabase Dashboard
2. Откройте SQL Editor
3. Запустите скрипт из файла `supabase-setup.sql`

## Админ-панель

- URL: `/admin`
- Пароль по умолчанию: `diana2024` (измените через ADMIN_PASSWORD)

