// import { defineEventHandler } from 'h3'
//
// export default defineEventHandler(async (event) => {
//     const config = useRuntimeConfig(event)
//     const apiKey = config.private.bitrixApiKey
//     const apiUrl = config.private.bitrixApiUrl
//
//     // Получаем текущий токен из куки
//     const authToken = getCookie(event, 'auth_token')
//
//     // Логируем токен для отладки
//     console.log('Токен из куки:', authToken)
//
//     if (!authToken) {
//         throw createError({
//             statusCode: 401,
//             statusMessage: 'Токен отсутствует'
//         })
//     }
//
//     // Формируем тело запроса для Bitrix API
//     const requestBody = {
//         key: apiKey,
//         'params[TOKEN]': authToken
//     }
//
//     // Логируем тело запроса
//     console.log('Тело запроса для Bitrix API:', requestBody)
//
//     try {
//         const response = await $fetch(`${apiUrl}?method=refreshtoken&act=auth`, {
//             method: 'POST',
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
//                 'Content-Type': 'application/x-www-form-urlencoded'
//             },
//             body: new URLSearchParams(requestBody).toString()
//         })
//
//         // Логируем ответ от Bitrix API
//         console.log('Ответ от Bitrix API (refresh):', response)
//
//         if (response.TOKEN && response.EXPIRES) {
//             // Сохраняем новый токен в куки
//             setCookie(event, 'auth_token', response.TOKEN, {
//                 maxAge: 1800, // 30 минут
//                 secure: true,
//                 sameSite: 'strict'
//             })
//
//             return {
//                 TOKEN: response.TOKEN,
//                 EXPIRES: response.EXPIRES
//             }
//         }
//
//         if (response.ERROR) {
//             throw new Error(response.ERROR)
//         }
//
//         throw new Error('Неверный формат ответа API')
//     } catch (error) {
//         console.error('Ошибка при обновлении токена:', error)
//
//         const errorMessage = error.message || 'Неизвестная ошибка'
//         let userFriendlyMessage = 'Не удалось обновить токен'
//
//         switch (errorMessage) {
//             case 'ERROR_INVALID_TOKEN':
//                 userFriendlyMessage = 'Неверный или истекший токен'
//                 break
//             case 'Incorrect method':
//                 userFriendlyMessage = 'Некорректный метод'
//                 break
//             case 'Incorrect type':
//                 userFriendlyMessage = 'Некорректный тип действия'
//                 break
//             case 'Action is not defined':
//                 userFriendlyMessage = 'Указанное действие не определено'
//                 break
//             case 'Invalid API key':
//                 userFriendlyMessage = 'Ошибка сервера: неверный API ключ'
//                 break
//             default:
//                 userFriendlyMessage = errorMessage
//         }
//
//         throw createError({
//             statusCode: 401,
//             statusMessage: userFriendlyMessage
//         })
//     }
// })

import { defineEventHandler, getCookie, setCookie } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    // Получаем текущий токен из куки
    const authToken = getCookie(event, 'auth_token');

    // Логируем токен для отладки
    console.log('Токен из куки:', authToken);

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
    console.log('Тело запроса для Bitrix API:', requestBody);

    try {
        const response = await $fetch(`${apiUrl}?method=refreshtoken&act=auth`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(requestBody).toString(),
        });

        // Логируем ответ от Bitrix API
        console.log('Ответ от Bitrix API (refresh):', JSON.stringify(response, null, 2));

        if (response.TOKEN && response.EXPIRES) {
            // Сохраняем новый токен в куки (опционально, так как клиент тоже обновляет куки через authStore)
            setCookie(event, 'auth_token', response.TOKEN, {
                maxAge: 1800, // 30 минут
                secure: process.env.NODE_ENV === 'production', // В продакшене используем secure
                sameSite: 'strict',
            });

            setCookie(event, 'auth_expires', response.EXPIRES, {
                maxAge: 1800,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
            });

            console.log('Новый токен сохранён в куки:', response.TOKEN);

            return {
                TOKEN: response.TOKEN,
                EXPIRES: response.EXPIRES,
            };
        }

        if (response.ERROR) {
            throw new Error(response.ERROR);
        }

        throw new Error('Неверный формат ответа API: отсутствуют TOKEN или EXPIRES');
    } catch (error) {
        console.error('Ошибка при обновлении токена:', error);

        const errorMessage = error.message || 'Неизвестная ошибка';
        let statusCode = 401;
        let userFriendlyMessage = 'Не удалось обновить токен';

        switch (errorMessage) {
            case 'ERROR_INVALID_TOKEN':
                userFriendlyMessage = 'Неверный или истекший токен';
                statusCode = 403; // Меняем на 403, чтобы избежать бесконечного цикла в axios
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
                userFriendlyMessage = 'Ошибка сервера: неверный API ключ';
                break;
            default:
                userFriendlyMessage = errorMessage;
        }

        throw createError({
            statusCode,
            statusMessage: userFriendlyMessage,
            data: { error: errorMessage }, // Добавляем детали ошибки для отладки
        });
    }
});