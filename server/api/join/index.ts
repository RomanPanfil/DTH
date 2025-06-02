import { defineEventHandler, getHeader } from 'h3';

export default defineEventHandler(async (event) => {
    // console.log('Items route triggered'); // Confirm route is called

    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    // Логируем конфигурацию (без ключа для безопасности)
    // console.log('API URL:', apiUrl);
    // console.log('Request body preparation started');

    // Логируем входящие заголовки
    const headers = event.node.req.headers;
    // console.log('Входящие заголовки:', headers);

    // Извлекаем Authorization
    const authHeader = getHeader(event, 'Authorization');
    // console.log('Заголовок Authorization:', authHeader);

    const requestBody: Record<string, string> = {
        key: apiKey,
        'params[filter][IBLOCK_ID]': '18',
        'params[filter][ACTIVE]': 'Y',
        'params[sort][SORT]': 'ASC',
        'params[select][0]': 'NAME',
        'params[select][1]': 'IBLOCK_ID',
        'params[select][2]': 'ID',
        'params[select][3]': 'PREVIEW_TEXT',
        'params[select][4]': 'PREVIEW_PICTURE',
        'params[select][5]': 'PROPERTY_*',
        'params[filter][GET_ALL_FILES]': 'Y',
    };

    // console.log('Request body:', requestBody); // Log body before sending

    try {
        const response = await $fetch(`${apiUrl}?method=items&act=get`, {
            method: 'POST',
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(requestBody).toString(),
        });

        // console.log('Items API Raw Response:', JSON.stringify(response, null, 2));

        if (!response || typeof response !== 'object') {
            console.warn('Ответ API пустой или неверного формата');
            return { items: [] };
        }

        if (!response.RESULT?.ITEMS?.RU) {
            console.warn('Ожидаемая структура RESULT.ITEMS.RU отсутствует. Получено:', Object.keys(response));
            return { items: [] };
        }

        // console.log('Returning items:', response.RESULT.ITEMS.RU.length, 'items');
        return {
            items: response.RESULT.ITEMS.RU || [],
        };
    } catch (error) {
        console.error('Ошибка при запросе элементов:', error);
        throw createError({
            statusCode: 500,
            statusMessage: 'Error fetching items',
            data: error.message,
        });
    }
});