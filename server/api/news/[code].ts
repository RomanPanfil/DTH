// import { defineEventHandler } from 'h3';
//
// export default defineEventHandler(async (event) => {
//     const config = useRuntimeConfig(event);
//     const apiKey = config.private.bitrixApiKey;
//     const apiUrl = config.private.bitrixApiUrl;
//
//     const newsId = event.context.params.id; // Получаем ID из маршрута
//
//     const requestBody = {
//         key: apiKey,
//         'params[filter][IBLOCK_ID]': 2, // IBLOCK_ID для новостей
//         'params[filter][ID]': newsId,   // Фильтр по конкретному ID
//         'params[select][0]': 'NAME',
//         'params[select][1]': 'IBLOCK_ID',
//         'params[select][2]': 'ID',
//         'params[select][3]': 'DATE_ACTIVE_FROM',
//         'params[select][4]': 'PREVIEW_PICTURE',
//         'params[select][5]': 'IBLOCK_SECTION_ID',
//         'params[select][6]': 'DETAIL_TEXT',
//         'params[select][7]': 'CODE',
//         // Добавляем полный текст новости
//         'params[select][8]': 'PROPERTY_*',      // Все свойства
//         // 'params[resize][0]': 1090,               // Размер изображения побольше для детальной страницы
//         // 'params[resize][1]': 520,
//         // 'params[resize][2]': 'true',            // Обрезаем изображение
//     };
//
//     try {
//         const response = await $fetch(`${apiUrl}?method=item&act=get`, {
//             method: 'POST',
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
//                 'Content-Type': 'application/x-www-form-urlencoded',
//             },
//             body: new URLSearchParams(requestBody).toString(),
//         });
//
//         console.log(response.RESULT)
//
//         if (!response.RESULT || !response.RESULT.ITEM) {
//             throw new Error('Новость не найдена или неверная структура ответа API');
//         }
//
//         return {
//             item: response.RESULT.ITEM,
//         };
//     } catch (error) {
//         console.error('Ошибка при запросе новости:', error);
//         return {
//             error: 'Не удалось загрузить новость',
//             details: error.message,
//         };
//     }
// });




// import { defineEventHandler } from 'h3';
//
// export default defineEventHandler(async (event) => {
//     const config = useRuntimeConfig(event);
//     const apiKey = config.private.bitrixApiKey;
//     const apiUrl = config.private.bitrixApiUrl;
//
//     const newsCode = event.context.params.code; // Используем code вместо id
//
//     const requestBody = {
//         key: apiKey,
//         'params[filter][IBLOCK_ID]': 2,
//         'params[filter][CODE]': newsCode, // Фильтр по CODE вместо ID
//         'params[select][0]': 'NAME',
//         'params[select][1]': 'IBLOCK_ID',
//         'params[select][2]': 'ID',
//         'params[select][3]': 'DATE_ACTIVE_FROM',
//         'params[select][4]': 'PREVIEW_PICTURE',
//         'params[select][5]': 'IBLOCK_SECTION_ID',
//         'params[select][6]': 'DETAIL_TEXT',
//         'params[select][7]': 'CODE',
//         'params[select][8]': 'PROPERTY_*',
//     };
//
//     try {
//         const response = await $fetch(`${apiUrl}?method=item&act=get`, {
//             method: 'POST',
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
//                 'Content-Type': 'application/x-www-form-urlencoded',
//             },
//             body: new URLSearchParams(requestBody).toString(),
//         });
//
//         console.log('API Response:', response.RESULT);
//
//         if (!response.RESULT || !response.RESULT.ITEM) {
//             throw new Error('Новость не найдена или неверная структура ответа API');
//         }
//
//         return {
//             item: response.RESULT.ITEM,
//         };
//     } catch (error) {
//         console.error('Ошибка при запросе новости:', error);
//         return {
//             error: 'Не удалось загрузить новость',
//             details: error.message,
//         };
//     }
// });



import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    const newsCode = event.context.params.code;

    const requestBody = {
        key: apiKey,
        'params[filter][IBLOCK_ID]': 2,
        'params[filter][CODE]': newsCode,
        'params[select][0]': 'NAME',
        'params[select][1]': 'IBLOCK_ID',
        'params[select][2]': 'ID',
        'params[select][3]': 'DATE_ACTIVE_FROM',
        'params[select][4]': 'PREVIEW_PICTURE',
        'params[select][5]': 'IBLOCK_SECTION_ID',
        'params[select][6]': 'DETAIL_TEXT',
        'params[select][7]': 'CODE',
        'params[select][8]': 'PROPERTY_*',
        // Добавляем resize для миниатюр галерей
        'params[resize][0]': 265, // ширина
        'params[resize][1]': 200, // высота
        'params[resize][2]': 'true' // обрезка
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

        // console.log('API Response for', newsCode, ':', JSON.stringify(response, null, 2));
        // console.log('API Response:', response.RESULT);

        if (!response || !response.RESULT) {
            throw new Error('Нет результата от API');
        }

        const item = response.RESULT.ITEM || response.RESULT.ITEMS?.RU?.[0];
        if (!item) {
            throw new Error('Новость не найдена в ответе API');
        }

        return {
            item: response.RESULT.ITEM,
        };
    } catch (error) {
        console.error('Ошибка при запросе новости:', error.message, error.stack);
        return {
            error: 'Не удалось загрузить новость',
            details: error.message,
            status: 500
        };
    }
});