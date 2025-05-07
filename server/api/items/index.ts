import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    const query = getQuery(event);
    const page = Number(query.page) || 1;
    const iblockId = Number(query.iblockId) || 13; // Динамический IBLOCK_ID, по умолчанию 13
    const limit = Number(query.limit) || 12; // Количество элементов на странице
    const getAllFiles = query.GET_ALL_FILES || 'N'; // Извлекаем GET_ALL_FILES, по умолчанию 'N'
    const isFeatured = query.isFeatured || ''; // Новый параметр для фильтрации по избранным

    const requestBody = {
        key: apiKey,
        'params[filter][IBLOCK_ID]': iblockId,
        'params[filter][ACTIVE]': 'Y',
        'params[sort][ACTIVE_FROM]': 'DESC', // Сортировка по дате (по убыванию)
    };

    // Если указан параметр isFeatured, добавляем фильтр по свойству IS_FEATURED
    if (isFeatured === '1' || isFeatured === 'Y') {
        requestBody['params[filter][PROPERTY_IS_FEATURED]'] = '1';
    }

    Object.assign(requestBody, {
        'params[select][0]': 'NAME',
        'params[select][1]': 'IBLOCK_ID',
        'params[select][2]': 'ID',
        'params[select][3]': 'DATE_ACTIVE_FROM',
        'params[select][4]': 'PREVIEW_PICTURE',
        'params[select][5]': 'CODE',
        'params[select][6]': 'PROPERTY_*', // Все свойства
        'params[resize][0]': 320, // Ширина для ресайза
        'params[resize][1]': 240, // Высота для ресайза
        'params[resize][2]': 'true', // Обрезка по меньшей стороне
        'params[pager][start]': page,
        'params[pager][limit]': limit,
    });

    // Добавляем GET_ALL_FILES, если указано
    if (getAllFiles === 'Y') {
        Object.assign(requestBody, {
            'params[filter][GET_ALL_FILES]': 'Y',
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

        // console.log('Items API Response:', JSON.stringify(response, null, 2));

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



