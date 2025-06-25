// import { defineEventHandler, readBody, createError, getQuery } from 'h3';
//
// export default defineEventHandler(async (event) => {
//     const config = useRuntimeConfig(event);
//     const apiKey = config.private.bitrixApiKey;
//     const apiUrl = config.private.bitrixApiUrl;
//
//     const query = getQuery(event);
//     const body = await readBody(event);
//
//     // Валидация токена
//     const token = body?.params?.TOKEN;
//     if (!token || typeof token !== 'string' || !token.trim()) {
//         throw createError({
//             statusCode: 400,
//             statusMessage: 'Токен обязателен и должен быть строкой',
//         });
//     }
//
//     // Валидация пагинации
//     const validatedPager = {
//         start: Number(query.page) || 1,
//         limit: Number(body?.params?.pager?.limit) || Number(query.limit) || 5,
//     };
//     if (!Number.isInteger(validatedPager.start) || validatedPager.start < 1) {
//         validatedPager.start = 1;
//     }
//     if (!Number.isInteger(validatedPager.limit) || validatedPager.limit < 1) {
//         validatedPager.limit = 5;
//     }
//
//     // Формирование requestBody
//     const requestBody = {
//         key: apiKey,
//         'params[TOKEN]': token.trim(),
//         'params[pager][start]': validatedPager.start.toString(),
//         'params[pager][limit]': validatedPager.limit.toString(),
//         'params[GET_ALL_FILES]': query.GET_ALL_FILES || 'Y',
//     };
//
//     // Обработка select
//     const defaultSelect = ['NAME', 'IBLOCK_ID', 'ID', 'PREVIEW_PICTURE', 'PROPERTY_*'];
//     if (body?.params?.select && Array.isArray(body.params.select)) {
//         if (body.params.select.includes('PROPERTY_*') && !body.params.select.includes('IBLOCK_ID')) {
//             body.params.select.push('IBLOCK_ID');
//         }
//         body.params.select.forEach((item, index) => {
//             requestBody[`params[select][${index}]`] = item;
//         });
//     } else {
//         defaultSelect.forEach((item, index) => {
//             requestBody[`params[select][${index}]`] = item;
//         });
//     }
//
//     // Обработка сортировки
//     if (body?.params?.sort && typeof body.params.sort === 'object') {
//         Object.entries(body.params.sort).forEach(([key, value]) => {
//             requestBody[`params[sort][${key}]`] = value;
//         });
//     } else {
//         requestBody['params[sort][ACTIVE_FROM]'] = 'DESC';
//     }
//
//     // Обработка resize
//     const defaultResize = [320, 240, true];
//     if (body?.params?.resize && Array.isArray(body.params.resize)) {
//         body.params.resize.forEach((item, index) => {
//             requestBody[`params[resize][${index}]`] = item.toString();
//         });
//     } else {
//         defaultResize.forEach((item, index) => {
//             requestBody[`params[resize][${index}]`] = item.toString();
//         });
//     }
//
//     // Обработка resize_WHEN_GALL
//     const defaultResizeWhenGall = [640, 480, true];
//     if (body?.params?.resize_WHEN_GALL && Array.isArray(body.params.resize_WHEN_GALL)) {
//         body.params.resize_WHEN_GALL.forEach((item, index) => {
//             requestBody[`params[resize_WHEN_GALL][${index}]`] = item.toString();
//         });
//     } else {
//         defaultResizeWhenGall.forEach((item, index) => {
//             requestBody[`params[resize_WHEN_GALL][${index}]`] = item.toString();
//         });
//     }
//
//     try {
//         console.log('Request body:', JSON.stringify(requestBody, null, 2));
//         const response = await $fetch(`${apiUrl}?method=GetLectorCoursesList&act=auth`, {
//             method: 'POST',
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
//                 'Content-Type': 'application/x-www-form-urlencoded',
//             },
//             body: new URLSearchParams(requestBody).toString(),
//         });
//
//         if (!response.RESULT || !response.RESULT.ITEMS) {
//             throw new Error('Неверная структура ответа API');
//         }
//
//         return {
//             courses: response.RESULT.ITEMS || [],
//             pagination: {
//                 currentPage: response.RESULT.PAGENAV?.PAGE || 1,
//                 limit: response.RESULT.PAGENAV?.LIMIT || validatedPager.limit,
//                 total: response.RESULT.PAGENAV?.TOTAL || 0,
//             },
//         };
//     } catch (error) {
//         console.error('Ошибка при запросе курсов лектора:', error);
//         const errorMessage = error.message || 'Неизвестная ошибка';
//         let userFriendlyMessage = 'Ошибка при получении курсов лектора';
//         let statusCode = 400;
//
//         switch (errorMessage) {
//             case 'ERROR_INVALID_TOKEN':
//                 userFriendlyMessage = 'Неверный или истекший токен';
//                 statusCode = 401;
//                 break;
//             case 'ERROR_INVALID_PARAMS':
//                 userFriendlyMessage = 'Неверный формат параметров';
//                 break;
//             case 'Incorrect method':
//                 userFriendlyMessage = 'Некорректный метод';
//                 break;
//             case 'Incorrect type':
//                 userFriendlyMessage = 'Некорректный тип действия';
//                 break;
//             case 'Action is not defined':
//                 userFriendlyMessage = 'Указанное действие не определено';
//                 break;
//             case 'Invalid API key':
//                 userFriendlyMessage = 'Неверный ключ API';
//                 statusCode = 401;
//                 break;
//             default:
//                 userFriendlyMessage = errorMessage;
//         }
//
//         throw createError({
//             statusCode,
//             statusMessage: userFriendlyMessage,
//             data: { error: errorMessage, requestBody },
//         });
//     }
// });

import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    const { TOKEN, sort, select, resize, resize_WHEN_GALL, pager, GET_ALL_FILES, filter } = await readBody(event);

    // Валидация токена
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

    // Валидация фильтра
    const validatedFilter = {};
    if (filter && typeof filter === 'object') {
        Object.entries(filter).forEach(([key, value]) => {
            // Проверяем, что ключ начинается с >PROPERTY_ или <PROPERTY_
            if (
                (key.startsWith('>PROPERTY_') || key.startsWith('<PROPERTY_')) &&
                typeof value === 'string' &&
                value.trim()
            ) {
                // Проверяем формат даты для PROPERTY_DATE_FOR_SORT (YYYY-MM-DD)
                if (key.includes('PROPERTY_DATE_FOR_SORT')) {
                    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
                    if (!dateRegex.test(value)) {
                        throw createError({
                            statusCode: 400,
                            statusMessage: `Неверный формат даты в фильтре: ${key} = ${value}. Ожидается YYYY-MM-DD`,
                        });
                    }
                }
                validatedFilter[key] = value.trim();
            }
        });
    }

    // Формирование тела запроса
    const requestBody = new URLSearchParams({
        key: apiKey,
        'params[TOKEN]': TOKEN.trim(),
        'params[pager][start]': validatedPager.start.toString(),
        'params[pager][limit]': validatedPager.limit.toString(),
    });

    // Добавление сортировки
    if (sort && typeof sort === 'object') {
        Object.entries(sort).forEach(([key, value]) => {
            requestBody.append(`params[sort][${key}]`, String(value));
        });
    }

    // Добавление выборки полей
    if (select && Array.isArray(select) && select.length > 0) {
        select.forEach((field, index) => {
            requestBody.append(`params[select][${index}]`, field);
        });
    }

    // Добавление параметров ресайза
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

    // Добавление флага GET_ALL_FILES
    if (GET_ALL_FILES && GET_ALL_FILES === 'Y') {
        requestBody.append('params[GET_ALL_FILES]', 'Y');
    }

    // Добавление фильтра
    if (Object.keys(validatedFilter).length > 0) {
        Object.entries(validatedFilter).forEach(([key, value]) => {
            requestBody.append(`params[filter][${key}]`, String(value));
        });
    }

    try {
        // console.log('Отправляемый requestBody:', requestBody.toString());

        const response = await $fetch(`${apiUrl}?method=GetLectorCoursesList&act=auth`, {
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
        console.error('Ошибка при получении доступных курсов:', error);
        const errorMessage = error.message || 'Неизвестная ошибка';
        let userFriendlyMessage = 'Ошибка при получении доступных курсов';
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