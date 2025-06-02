import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    const query = getQuery(event);
    const iblockId = query.iblockId;
    const locale = query.locale || 'ru'; // По умолчанию 'ru', если locale не передан

    if (!iblockId) {
        console.error('Ошибка: Не указан ID инфоблока');
        return {
            error: 'Не указан ID инфоблока',
            details: 'Параметр iblockId обязателен',
        };
    }

    const requestBody = {
        key: apiKey,
        'params[ID]': parseInt(iblockId),
    };

    // Логируем URL и тело запроса
    const fullUrl = `${apiUrl}?method=filter&act=get`;
    // console.log('Запрос фильтров:');
    // console.log('URL:', fullUrl);
    // console.log('Request Body:', requestBody);
    // console.log('Locale:', locale);

    try {
        const response = await $fetch(fullUrl, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(requestBody).toString(),
        });

        // Логируем полный ответ от API
        // console.log('Ответ от API (filter):', JSON.stringify(response, null, 2));

        const localeKey = locale.toUpperCase();
        if (!response || !response.RESULT || !response.RESULT.FILTER || !response.RESULT.FILTER[localeKey]) {
            console.error('Неверная структура ответа API:', {
                hasResponse: !!response,
                hasResult: !!(response && response.RESULT),
                hasFilter: !!(response && response.RESULT && response.RESULT.FILTER),
                hasLocale: !!(response && response.RESULT && response.RESULT.FILTER && response.RESULT.FILTER[localeKey]),
            });
            throw new Error('Данные фильтра не найдены или неверная структура ответа API');
        }

        // Преобразуем объект FILTER[localeKey] в массив
        const filters = Object.values(response.RESULT.FILTER[localeKey]).map((filter: any) => ({
            ...filter,
            TYPE:
                filter.PROPERTY_TYPE === 'N' && filter.DISPLAY_TYPE === 'A'
                    ? 'RANGE'
                    : filter.CODE === 'FORMAT'
                        ? 'RADIO'
                        : 'CHECKBOX',
        }));

        return {
            filters,
        };
    } catch (error) {
        console.error(`Ошибка при запросе фильтра (iblockId: ${iblockId}, locale: ${locale}):`, {
            message: error.message,
            stack: error.stack,
            response: error.response ? JSON.stringify(error.response, null, 2) : 'Нет ответа',
        });
        return {
            error: 'Не удалось загрузить данные фильтра',
            details: error.message,
        };
    }
});