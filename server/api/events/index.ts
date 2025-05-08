import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    const query = getQuery(event);
    const page = Number(query.page) || 1;
    const iblockId = Number(query.iblockId) || 13; // Динамический IBLOCK_ID, по умолчанию 13
    const limit = Number(query.limit) || 15; // Количество элементов на странице
    const getAllFiles = query.GET_ALL_FILES || 'Y'; // Извлекаем GET_ALL_FILES, по умолчанию 'Y'

    const requestBody = {
        key: apiKey,
        'params[filter][IBLOCK_ID]': iblockId,
        'params[filter][ACTIVE]': 'Y',
        'params[select][0]': 'PROPERTY_*', // Все свойства
        'params[resize][0]': 320, // Ширина для ресайза
        'params[resize][1]': 240, // Высота для ресайза
        'params[resize][2]': '1', // Обрезка по меньшей стороне
        'params[resize_WHEN_GALL][0]': 640, // Ширина для галереи
        'params[resize_WHEN_GALL][1]': 480, // Высота для галереи
        'params[resize_WHEN_GALL][2]': '1', // Обрезка для галереи
        'params[pager][start]': page,
        'params[pager][limit]': limit,
    };

    // Добавляем GET_ALL_FILES, если указано
    if (getAllFiles === 'Y') {
        Object.assign(requestBody, {
            'params[GET_ALL_FILES]': 'Y',
        });
    }

    try {
        const response = await $fetch(`${apiUrl}?method=items&act=get`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(requestBody).toString(),
        });

        if (!response.RESULT || !response.RESULT.ITEMS || !response.RESULT.ITEMS.RU) {
            throw new Error('Неверная структура ответа API');
        }

        return {
            events: response.RESULT.ITEMS.RU || [],
            pagination: {
                currentPage: response.RESULT.PAGENAV?.PAGE || 1,
                limit: response.RESULT.PAGENAV?.LIMIT || limit,
                total: response.RESULT.PAGENAV?.TOTAL || 0,
            },
        };
    } catch (error) {
        console.error('Ошибка при запросе мероприятий:', error);
        return {
            error: 'Не удалось загрузить мероприятия',
            details: error.message,
        };
    }
});