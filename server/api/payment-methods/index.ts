// Получение списка активных способов оплаты
import { defineEventHandler, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    const query = getQuery(event);
    const includeAll = query.all === 'Y';

    const requestBody: Record<string, any> = {
        key: apiKey,
        'params[ALL]': includeAll ? 'Y' : undefined,
    };

    const requestUrl = `${apiUrl}?method=PaymentMethods&act=get`;

    try {
        const response = await $fetch(requestUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cache-Control': 'no-cache',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
            },
            body: new URLSearchParams(requestBody).toString(),
        });

        // console.log('Raw API response:', JSON.stringify(response, null, 2));

        if (!response || typeof response !== 'object') {
            console.warn('Ответ API пустой или неверного формата');
            return { methods: [] };
        }

        if (response.ERROR) {
            console.error('Ошибка API:', response.ERROR);
            throw createError({
                statusCode: 500,
                statusMessage: response.ERROR || 'Error fetching payment methods',
            });
        }

        if (!response.METHODS) {
            console.warn('Ожидаемая структура METHODS отсутствует. Получено:', Object.keys(response));
            return { methods: [] };
        }

        return {
            methods: response.METHODS || [],
        };
    } catch (error) {
        console.error('Ошибка при запросе способов оплаты:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Error fetching payment methods',
            data: error.message,
        });
    }
});