import { defineEventHandler, getCookie, setCookie } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    // Получаем текущий токен из куки
    const authToken = getCookie(event, 'auth_token');

    // Логируем токен для отладки
    console.log('Токен из куки для logout:', authToken);

    if (!authToken) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Токен отсутствует',
        });
    }

    // Формируем тело запроса для Bitrix API
    const requestBody = {
        key: apiKey,
        'params[TOKEN]': authToken,
    };

    // Логируем тело запроса
    console.log('Тело запроса для Bitrix API (logout):', requestBody);

    try {
        const response = await $fetch(`${apiUrl}?method=logout&act=auth`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(requestBody).toString(),
        });

        // Логируем ответ от Bitrix API
        console.log('Ответ от Bitrix API (logout):', JSON.stringify(response, null, 2));

        if (response.MESSAGE === 'LOGGED_OUT_SUCCESSFULLY') {
            // Сбрасываем куки на сервере
            setCookie(event, 'auth_token', '', { maxAge: 0, path: '/' });
            setCookie(event, 'auth_user', '', { maxAge: 0, path: '/' });
            setCookie(event, 'auth_expires', '', { maxAge: 0, path: '/' });
            setCookie(event, 'auth_activated', '', { maxAge: 0, path: '/' });

            console.log('Сессия завершена, куки сброшены на сервере');

            return {
                success: true,
                message: 'LOGGED_OUT_SUCCESSFULLY',
            };
        }

        throw new Error('Неверный формат ответа API');
    } catch (error) {
        console.error('Ошибка при завершении сессии:', error);

        const errorMessage = error.message || 'Неизвестная ошибка';
        let userFriendlyMessage = 'Не удалось завершить сессию';

        switch (errorMessage) {
            case 'ERROR_INVALID_TOKEN':
                userFriendlyMessage = 'Неверный или истекший токен';
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
                break;
            default:
                userFriendlyMessage = errorMessage;
        }

        throw createError({
            statusCode: 401,
            statusMessage: userFriendlyMessage,
            data: { error: errorMessage },
        });
    }
});