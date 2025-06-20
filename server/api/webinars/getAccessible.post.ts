// // Получение доступных вебинаров
import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    const { TOKEN, sort, select, resize, resize_WHEN_GALL, pager, GET_ALL_FILES } = await readBody(event);

    if (!TOKEN || typeof TOKEN !== 'string' || !TOKEN.trim()) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Токен обязателен и должен быть строкой',
        });
    }

    // Валидация пагинации
    const validatedPager = {
        start: 1,
        limit: 20,
    };

    if (pager && typeof pager === 'object') {
        if (pager.start && Number.isInteger(Number(pager.start)) && Number(pager.start) > 0) {
            validatedPager.start = Number(pager.start);
        }
        if (pager.limit && Number.isInteger(Number(pager.limit)) && Number(pager.limit) > 0) {
            validatedPager.limit = Number(pager.limit);
        }
    }

    // Формирование тела запроса
    const requestBody = new URLSearchParams({
        key: apiKey,
        'params[TOKEN]': TOKEN.trim(),
        'params[pager][start]': validatedPager.start.toString(),
        'params[pager][limit]': validatedPager.limit.toString(),
    });

    if (sort && typeof sort === 'object') {
        Object.entries(sort).forEach(([key, value]) => {
            requestBody.append(`params[sort][${key}]`, String(value));
        });
    }

    if (select && Array.isArray(select) && select.length > 0) {
        select.forEach((field, index) => {
            requestBody.append(`params[select][${index}]`, field);
        });
    }

    if (resize && Array.isArray(resize) && resize.length >= 2) {
        resize.forEach((value, index) => {
            requestBody.append(`params[resize][${index}]`, String(value));
        });
    }

    if (resize_WHEN_GALL && Array.isArray(resize_WHEN_GALL) && resize_WHEN_GALL.length >= 2) {
        resize_WHEN_GALL.forEach((value, index) => {
            requestBody.append(`params[resize_WHEN_GALL][${index}]`, String(value));
        });
    }

    if (GET_ALL_FILES && GET_ALL_FILES === 'Y') {
        requestBody.append('params[GET_ALL_FILES]', 'Y');
    }

    try {
        // console.log('Отправляемый TOKEN:', TOKEN.trim());
        // console.log('Отправляемый requestBody:', requestBody.toString());

        const response = await $fetch(`${apiUrl}?method=GetUserWebinarsList&act=auth`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: requestBody.toString(),
        });

        // console.log('Полный ответ API:', JSON.stringify(response, null, 2));

        if (response.RESULT) {
            const result = {
                ITEMS: response.RESULT.ITEMS || [],
            };
            if (response.RESULT.PAGENAV) {
                result.PAGENAV = response.RESULT.PAGENAV;
            }
            return result;
        }

        if (response.ERROR) {
            throw new Error(response.ERROR);
        }

        throw new Error('Неверный формат ответа API');
    } catch (error) {
        console.error('Ошибка при получении доступных вебинаров:', error);
        const errorMessage = error.message || 'Неизвестная ошибка';
        let userFriendlyMessage = 'Ошибка при получении доступных вебинаров';
        let statusCode = 400;

        switch (errorMessage) {
            case 'ERROR_INVALID_TOKEN':
                userFriendlyMessage = 'Неверный или истекший токен';
                statusCode = 401;
                break;
            case 'ERROR_INVALID_PARAMS':
                userFriendlyMessage = 'Неверный формат параметров';
                break;
            case 'Incorrect method':
                userFriendlyMessage = 'Некорректный метод';
                break;
            case 'Incorrect type':
                userFriendlyMessage = 'Некорректный тип действия';
                break;
            case 'Action is not defined':
                userFriendlyMessage = 'Указанное действие не определено';
                break;
            case 'Invalid API key':
                userFriendlyMessage = 'Неверный ключ API';
                statusCode = 401;
                break;
            default:
                userFriendlyMessage = errorMessage;
        }

        throw createError({
            statusCode,
            statusMessage: userFriendlyMessage,
            data: { error: errorMessage },
        });
    }
});