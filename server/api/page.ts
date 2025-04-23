import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    const query = getQuery(event);
    const pageId = query.id;

    if (!pageId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID страницы обязателен',
        });
    }

    const requestBody = {
        key: apiKey,
        params: pageId,
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

        console.log('Page API Response:', JSON.stringify(response, null, 2));

        if (!response) {
            throw new Error('Неверная структура ответа API для страницы');
        }

        const item = response;
        if (!item) {
            return {
                page: null,
                message: 'Страница не найдена',
            };
        }

        return {
            page: item,
        };
    } catch (error) {
        console.error('Ошибка при запросе страницы:', error);
        return {
            error: 'Не удалось загрузить страницу',
            details: error.message,
        };
    }
});

