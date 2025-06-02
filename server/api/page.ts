import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    const query = getQuery(event);
    const pageId = query.id;
    const code = query.code;

    // Проверяем, что передан хотя бы один параметр
    if (!pageId && !code) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Требуется указать ID или CODE страницы',
        });
    }

    // Формируем params как строку: либо code, либо pageId
    const requestBody = {
        key: apiKey,
        params: code || pageId,
    };

    try {
        const response = await $fetch(`${apiUrl}?method=page&act=get`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(requestBody).toString(),
        });

        // console.log('Page API Response:', JSON.stringify(response, null, 2));

        if (!response) {
            throw new Error('Неверная структура ответа API для страницы');
        }

        // Проверяем наличие данных страницы
        if (!response.RU && !response.EN) {
            return {
                page: null,
                message: 'Страница не найдена',
            };
        }

        return {
            page: response,
        };
    } catch (error) {
        console.error('Ошибка при запросе страницы:', error);
        return {
            error: 'Не удалось загрузить страницу',
            details: error.message,
            status: 500,
        };
    }
});