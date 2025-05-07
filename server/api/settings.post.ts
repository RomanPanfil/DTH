import { defineEventHandler, getHeader } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    const headers = event.node.req.headers;

    const authHeader = getHeader(event, 'Authorization');

    const requestBody: Record<string, string> = {
        key: apiKey,
    };

    // Если передан CODE в теле запроса, добавляем его в params
    const body = await readBody(event);
    if (body?.params?.CODE) {
        requestBody['params[CODE]'] = body.params.CODE;
    }

    try {
        const response = await $fetch(`${apiUrl}?method=settings&act=get`, {
            method: 'POST',
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(requestBody).toString(),
        });

        if (!response || typeof response !== 'object') {
            throw new Error('Неверная структура ответа API для настроек');
        }

        return response;
    } catch (error) {
        console.error('Ошибка при запросе настроек:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Error fetching settings',
            data: error.message,
        });
    }
});