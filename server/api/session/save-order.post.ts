// сохранение заказа в сессию
import { defineEventHandler, readBody } from 'h3';

export default defineEventHandler(async (event) => {
    const { orderId, amount, name, paymentMethod } = await readBody(event);

    if (!orderId || !amount || !name || !paymentMethod) {
        throw createError({
            statusCode: 400,
            statusMessage: 'orderId, amount и name обязательны'
        });
    }

    // Инициализация сессии с явным указанием конфигурации
    const session = await useSession(event, {
        password: process.env.SESSION_PASSWORD,
        name: 'nuxt-session',
        cookie: {
            maxAge: 60 * 60 * 24 * 7, // 7 дней
        },
    });

    await session.update({
        order: {
            orderId: Number(orderId),
            amount: Number(amount),
            name: String(name),
            paymentMethod: Number(paymentMethod)
        },
    });

    return { success: true };
});