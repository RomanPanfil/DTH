import { defineEventHandler, readBody, createError, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    const query = getQuery(event);
    const body = await readBody(event);

    // Валидация токена
    const token = body?.params?.TOKEN;
    if (!token || typeof token !== 'string' || !token.trim()) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Токен обязателен и должен быть строкой',
        });
    }

    // Валидация пагинации
    const validatedPager = {
        start: Number(query.page) || 1,
        limit: Number(body?.params?.pager?.limit) || Number(query.limit) || 5,
    };
    if (!Number.isInteger(validatedPager.start) || validatedPager.start < 1) {
        validatedPager.start = 1;
    }
    if (!Number.isInteger(validatedPager.limit) || validatedPager.limit < 1) {
        validatedPager.limit = 5;
    }

    // Формирование requestBody
    const requestBody = {
        key: apiKey,
        'params[TOKEN]': token.trim(),
        'params[pager][start]': validatedPager.start.toString(),
        'params[pager][limit]': validatedPager.limit.toString(),
        'params[GET_ALL_FILES]': query.GET_ALL_FILES || 'Y',
    };

    // Обработка select
    const defaultSelect = ['NAME', 'IBLOCK_ID', 'ID', 'PREVIEW_PICTURE', 'PROPERTY_*'];
    if (body?.params?.select && Array.isArray(body.params.select)) {
        if (body.params.select.includes('PROPERTY_*') && !body.params.select.includes('IBLOCK_ID')) {
            body.params.select.push('IBLOCK_ID');
        }
        body.params.select.forEach((item, index) => {
            requestBody[`params[select][${index}]`] = item;
        });
    } else {
        defaultSelect.forEach((item, index) => {
            requestBody[`params[select][${index}]`] = item;
        });
    }

    // Обработка сортировки
    if (body?.params?.sort && typeof body.params.sort === 'object') {
        Object.entries(body.params.sort).forEach(([key, value]) => {
            requestBody[`params[sort][${key}]`] = value;
        });
    } else {
        requestBody['params[sort][ACTIVE_FROM]'] = 'DESC';
    }

    // Обработка resize
    const defaultResize = [320, 240, true];
    if (body?.params?.resize && Array.isArray(body.params.resize)) {
        body.params.resize.forEach((item, index) => {
            requestBody[`params[resize][${index}]`] = item.toString();
        });
    } else {
        defaultResize.forEach((item, index) => {
            requestBody[`params[resize][${index}]`] = item.toString();
        });
    }

    // Обработка resize_WHEN_GALL
    const defaultResizeWhenGall = [640, 480, true];
    if (body?.params?.resize_WHEN_GALL && Array.isArray(body.params.resize_WHEN_GALL)) {
        body.params.resize_WHEN_GALL.forEach((item, index) => {
            requestBody[`params[resize_WHEN_GALL][${index}]`] = item.toString();
        });
    } else {
        defaultResizeWhenGall.forEach((item, index) => {
            requestBody[`params[resize_WHEN_GALL][${index}]`] = item.toString();
        });
    }

    try {
        console.log('Request body:', JSON.stringify(requestBody, null, 2));
        const response = await $fetch(`${apiUrl}?method=GetLectorWebinarsList&act=auth`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(requestBody).toString(),
        });

        if (!response.RESULT || !response.RESULT.ITEMS) {
            throw new Error('Неверная структура ответа API');
        }

        return {
            courses: response.RESULT.ITEMS || [],
            pagination: {
                currentPage: response.RESULT.PAGENAV?.PAGE || 1,
                limit: response.RESULT.PAGENAV?.LIMIT || validatedPager.limit,
                total: response.RESULT.PAGENAV?.TOTAL || 0,
            },
        };
    } catch (error) {
        console.error('Ошибка при запросе курсов лектора:', error);
        const errorMessage = error.message || 'Неизвестная ошибка';
        let userFriendlyMessage = 'Ошибка при получении курсов лектора';
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
            data: { error: errorMessage, requestBody },
        });
    }
});