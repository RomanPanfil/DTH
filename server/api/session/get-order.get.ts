// получение данных заказа из сессии
import { defineEventHandler, useSession } from 'h3';

export default defineEventHandler(async (event) => {
    // Проверка наличия секрета
    const password = process.env.SESSION_PASSWORD;
    if (!password) {
        console.error('SESSION_PASSWORD is not set in environment variables');
        throw createError({
            statusCode: 500,
            statusMessage: 'Server configuration error: SESSION_PASSWORD is missing',
        });
    }

    // Инициализация сессии
    const session = await useSession(event, {
        password: password,
        name: 'nuxt-session',
        cookie: {
            maxAge: 60 * 60 * 24 * 7, // 7 дней
        },
    });

    // Логирование данных сессии для отладки
    console.log('Session data:', session.data);

    const order = session.data?.order || null;

    return { order };
});