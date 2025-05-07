import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    const query = getQuery(event);
    const iblockId = Number(query.iblockId) || 13; // Динамический IBLOCK_ID, по умолчанию 13
    const eventCode = event.context.params.code; // Получаем code из URL

    if (!eventCode) {
        return {
            error: 'Не указан код мероприятия',
            details: 'Параметр code обязателен',
        };
    }

    const requestBody = {
        key: apiKey,
        'params[filter][IBLOCK_ID]': iblockId,
        'params[filter][CODE]': eventCode,
        'params[select][0]': 'NAME',
        'params[select][1]': 'IBLOCK_ID',
        'params[select][2]': 'ID',
        'params[select][3]': 'DATE_ACTIVE_FROM',
        'params[select][4]': 'PREVIEW_PICTURE',
        'params[select][5]': 'DETAIL_TEXT',
        'params[select][6]': 'CODE',
        'params[select][7]': 'PROPERTY_*', // Все свойства
        'params[resize][0]': 640, // Ширина для ресайза
        'params[resize][1]': 480, // Высота для ресайза
        'params[resize][2]': 'true', // Обрезка по меньшей стороне
    };

    try {
        const response = await $fetch(`${apiUrl}?method=item&act=get`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(requestBody).toString(),
        });

        console.log('Event API Response:', JSON.stringify(response, null, 2));

        if (!response.RESULT || !response.RESULT.ITEM || !response.RESULT.ITEM.RU) {
            throw new Error('Неверная структура ответа API');
        }

        return {
            event: response.RESULT.ITEM.RU || null,
        };
    } catch (error) {
        console.error('Ошибка при запросе мероприятия:', error);
        return {
            error: 'Не удалось загрузить мероприятие',
            details: error.message,
        };
    }
});