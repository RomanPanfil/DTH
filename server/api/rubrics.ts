// import { defineEventHandler } from 'h3';
//
// export default defineEventHandler(async (event) => {
//     const config = useRuntimeConfig(event);
//     const apiKey = config.private.bitrixApiKey;
//     const apiUrl = config.private.bitrixApiUrl;
//
//     const requestBody = {
//         key: apiKey,
//         'params[filter][IBLOCK_ID]': 2, // Фильтр по инфоблоку 2
//         'params[select][0]': 'ID',
//         'params[select][1]': 'NAME',
//         'params[filter][SECTION_ID]': 0, // Получаем корневые разделы (или убрать, если нужны все)
//     };
//
//     try {
//         // Предполагаем, что это кастомный метод для разделов
//         const response = await $fetch(`${apiUrl}?method=sections&act=get`, {
//             method: 'POST',
//             headers: {
//                 'User-Agent':
//                     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
//                 'Content-Type': 'application/x-www-form-urlencoded',
//             },
//             body: new URLSearchParams(requestBody).toString(),
//         });
//
//         console.log('Rubrics API Response:', JSON.stringify(response, null, 2));
//
//         if (!response.RESULT || !response.RESULT.ITEMS || !response.RESULT.ITEMS.RU) {
//             throw new Error('Неверная структура ответа API для рубрик');
//         }
//
//         return {
//             rubrics: response.RESULT.ITEMS.RU || [],
//         };
//     } catch (error) {
//         console.error('Ошибка при запросе рубрик:', error);
//         return {
//             error: 'Не удалось загрузить рубрики',
//             details: error.message,
//         };
//     }
// });

import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    // Логируем все входящие заголовки
    const headers = event.node.req.headers;
    console.log('Входящие заголовки:', headers);

    // Извлекаем Authorization
    const authHeader = getHeader(event, 'Authorization');
    console.log('Заголовок Authorization:', authHeader);

    const requestBody = {
        key: apiKey,
        'params[filter][IBLOCK_ID]': 2, // Фильтр по инфоблоку 2
        'params[filter][ACTIVE]': 'Y',  // Только активные категории
        'params[sort][NAME]': 'ASC',    // Сортировка по имени по возрастанию
        'params[select][]': 'ID',       // Выбираем стандартные поля
        'params[select][]': 'NAME',
        'params[select][]': 'UF_*',     // Выбираем все пользовательские поля (UF_*)
        'params[resize][0]': 320,       // Параметры ресайза картинок
        'params[resize][1]': 240,
        'params[resize][2]': 'false',   // Пропорциональное уменьшение
    };

    try {
        const response = await $fetch(`${apiUrl}?method=sections&act=get`, {
            method: 'POST',
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(requestBody).toString(),
        });

        // console.log('Rubrics API Response:', JSON.stringify(response, null, 2));

        if (!response.RESULT || !response.RESULT.ITEMS || !response.RESULT.ITEMS.RU) {
            throw new Error('Неверная структура ответа API для рубрик');
        }

        return {
            rubrics: response.RESULT.ITEMS.RU || [],
        };
    } catch (error) {
        console.error('Ошибка при запросе рубрик:', error);
        return {
            error: 'Не удалось загрузить рубрики',
            details: error.message,
        };
    }
});