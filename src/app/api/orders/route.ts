import { NextResponse } from 'next/server';
import { orderSchema } from '@/lib/validations';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // Validate with Zod
        const order = orderSchema.parse(body);

        // Format message for Telegram
        const deliveryText = order.deliveryType === 'delivery' ? '🚚 Доставка' : '🏪 Самовывоз';
        const timeText = order.timeType === 'urgent'
            ? '⚡ Срочно (в течение 2 часов)'
            : `🕐 К времени: ${order.specificTime}`;

        const message = `
🌸 <b>НОВЫЙ ЗАКАЗ</b> 🌸

📦 <b>Букет:</b> ${order.productName}
💰 <b>Сумма:</b> ${order.productPrice.toLocaleString('ru-RU')} ₽

👤 <b>Клиент:</b> ${order.name}
📞 <b>Телефон:</b> ${order.phone}
${order.address ? `📍 <b>Адрес:</b> ${order.address}` : ''}

${deliveryText}
${timeText}

${order.comment ? `💬 <b>Комментарий:</b> ${order.comment}` : ''}
`.trim();

        // Send to Telegram
        const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
        const chatId = process.env.TELEGRAM_CHAT_ID;

        if (!telegramToken || !chatId) {
            console.error('Telegram credentials not configured');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const telegramResponse = await fetch(
            `https://api.telegram.org/bot${telegramToken}/sendMessage`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: message,
                    parse_mode: 'HTML',
                }),
            }
        );

        if (!telegramResponse.ok) {
            const error = await telegramResponse.text();
            console.error('Telegram API error:', error);
            return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Order API error:', error);
        return NextResponse.json(
            { error: error instanceof Error ? error.message : 'Internal server error' },
            { status: 400 }
        );
    }
}
