import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    const query = getQuery(event);
    const iblockId = Number(query.iblockId) || 17;
    const getAllFiles = query.GET_ALL_FILES || 'Y';

    const requestBody = {
        key: apiKey,
        'params[filter][IBLOCK_ID]': iblockId,
        'params[filter][ACTIVE]': 'Y',
        'params[sort][SORT]': 'ASC',
    };

    Object.assign(requestBody, {
        'params[select][0]': 'NAME',
        'params[select][1]': 'SORT',
        'params[select][2]': 'ID',
        'params[select][3]': 'IBLOCK_ID',
        'params[select][4]': 'PREVIEW_TEXT',
        'params[select][5]': 'PROPERTY_ICON',
    });

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

        // console.log('Advantages API Response:', JSON.stringify(response, null, 2));

        if (!response.RESULT || !response.RESULT.ITEMS || !response.RESULT.ITEMS.RU) {
            throw new Error('Неверная структура ответа API');
        }

        return {
            title: 'Почему мы?', // Заголовок фиксированный, так как в API его нет
            items: response.RESULT.ITEMS.RU.map(item => ({
                icon: item.PROPS.ICON?.VALUE_PATH || '',
                text: item.PREVIEW_TEXT || '',
            })) || [],
        };
    } catch (error) {
        console.error('Ошибка при запросе преимуществ:', error);
        return {
            error: 'Не удалось загрузить преимущества',
            details: error.message,
        };
    }
});