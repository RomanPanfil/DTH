import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    const { params } = await readBody(event);

    // Валидация параметров
    if (!params || typeof params !== 'number' || !Number.isInteger(params) || params <= 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid lesson ID',
            message: 'params обязателен и должен быть целым положительным числом'
        });
    }

    // Формирование тела запроса
    const requestBody = {
        key: apiKey,
        params: params,
    };

    try {
        const response = await $fetch(`${apiUrl}?method=mainlesson&act=get`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(requestBody)
        });

        // console.log('API Response:', JSON.stringify(response, null, 2));

        if (response && typeof response === 'object') {
            return {
                ITEM: response,
            };
        }

        // Обработка ошибок API
        if (response?.ERROR || response?.error) {
            const errorMessage = response.ERROR || response.error || 'API Error';
            throw new Error(errorMessage);
        }

        throw new Error('Invalid API response format');

    } catch (error) {
        console.error('Ошибка при получении родительского вебинара:', error);

        // Если это ошибка сети или парсинга
        if (error.name === 'FetchError' || error.cause) {
            throw createError({
                statusCode: 500,
                statusMessage: 'Ошибка связи с API',
                message: 'Не удалось подключиться к API сервису'
            });
        }

        const errorMessage = error.message || 'Неизвестная ошибка';
        let userFriendlyMessage = 'Ошибка при получении родительского вебинара';
        let statusCode = 400;

        switch (errorMessage) {
            case 'ERROR_INVALID_PARAMS':
                userFriendlyMessage = 'Неверный формат параметров';
                break;
            case 'ERROR_INVALID_LESSON_ID':
                userFriendlyMessage = 'Неверный идентификатор урока';
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
            case 'Invalid API response format':
                userFriendlyMessage = 'Неверный формат ответа API';
                statusCode = 502; // Bad Gateway - проблема с внешним API
                break;
            default:
                userFriendlyMessage = 'Неизвестная ошибка';
                statusCode = 500;
        }

        throw createError({
            statusCode,
            statusMessage: userFriendlyMessage,
            message: errorMessage
        });
    }
});