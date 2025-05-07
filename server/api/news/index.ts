// import { defineEventHandler } from 'h3';
//
// export default defineEventHandler(async (event) => {
//     const config = useRuntimeConfig(event);
//     const apiKey = config.private.bitrixApiKey;
//     const apiUrl = config.private.bitrixApiUrl;
//
//     const query = getQuery(event);
//     const page = Number(query.page) || 1;
//     const sectionId = query.section || null;
//     const limit = 16;
//
//     const requestBody = {
//         key: apiKey,
//         'params[filter][IBLOCK_ID]': 2,
//         'params[filter][ACTIVE]': 'Y',
//         'params[include_sections]': 'Y',
//     };
//
//     if (sectionId) {
//         requestBody['params[filter][IBLOCK_SECTION_ID]'] = sectionId;
//     }
//
//     Object.assign(requestBody, {
//         'params[select][0]': 'NAME',
//         'params[select][1]': 'IBLOCK_ID',
//         'params[select][2]': 'ID',
//         'params[select][3]': 'DATE_ACTIVE_FROM',
//         'params[select][4]': 'PREVIEW_PICTURE',
//         'params[select][5]': 'IBLOCK_SECTION_ID',
//         'params[select][6]': 'PROPERTY_*',
//         'params[resize][0]': 320,
//         'params[resize][1]': 240,
//         'params[resize][2]': 'false',
//         'params[pager][start]': page,
//         'params[pager][limit]': limit,
//     });
//
//     try {
//         const response = await $fetch(`${apiUrl}?method=items&act=get`, {
//             method: 'POST',
//             headers: {
//                 'User-Agent':
//                     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
//                 'Content-Type': 'application/x-www-form-urlencoded',
//             },
//             body: new URLSearchParams(requestBody).toString(),
//         });
//
//         // console.log('News API Response:', JSON.stringify(response, null, 2));
//
//         if (!response.RESULT || !response.RESULT.ITEMS || !response.RESULT.ITEMS.RU) {
//             throw new Error('Неверная структура ответа API');
//         }
//
//         return {
//             news: response.RESULT.ITEMS.RU || [],
//             pagination: {
//                 currentPage: response.RESULT.PAGENAV?.PAGE || 1,
//                 limit: response.RESULT.PAGENAV?.LIMIT || limit,
//                 total: response.RESULT.PAGENAV?.TOTAL || 0,
//             },
//         };
//     } catch (error) {
//         console.error('Ошибка при запросе новостей:', error);
//         return {
//             error: 'Не удалось загрузить новости',
//             details: error.message,
//         };
//     }
// });

import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    const query = getQuery(event);
    const page = Number(query.page) || 1;
    const sectionId = query.section || null; // Оставляем как ID рубрики
    const limit = Number(query.limit) || 16;

    const requestBody = {
        key: apiKey,
        'params[filter][IBLOCK_ID]': 2,
        'params[filter][ACTIVE]': 'Y',
        'params[include_sections]': 'Y',
    };

    if (sectionId) {
        requestBody['params[filter][IBLOCK_SECTION_ID]'] = sectionId;
    }

    Object.assign(requestBody, {
        'params[select][0]': 'NAME',
        'params[select][1]': 'IBLOCK_ID',
        'params[select][2]': 'ID',
        'params[select][3]': 'DATE_ACTIVE_FROM',
        'params[select][4]': 'PREVIEW_PICTURE',
        'params[select][5]': 'IBLOCK_SECTION_ID',
        'params[select][6]': 'DETAIL_TEXT', // Добавляем для детальной страницы
        'params[select][7]': 'CODE',
        'params[select][8]': 'PROPERTY_*',
        'params[resize][0]': 390,
        'params[resize][1]': 404,
        'params[resize][2]': 'false',
        'params[pager][start]': page,
        'params[pager][limit]': limit,
    });

    try {
        const response = await $fetch(`${apiUrl}?method=items&act=get`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(requestBody).toString(),
        });

        // console.log('News API Response:', JSON.stringify(response, null, 2));

        if (!response.RESULT || !response.RESULT.ITEMS || !response.RESULT.ITEMS.RU) {
            throw new Error('Неверная структура ответа API');
        }

        return {
            news: response.RESULT.ITEMS.RU || [],
            pagination: {
                currentPage: response.RESULT.PAGENAV?.PAGE || 1,
                limit: response.RESULT.PAGENAV?.LIMIT || limit,
                total: response.RESULT.PAGENAV?.TOTAL || 0,
            },
        };
    } catch (error) {
        console.error('Ошибка при запросе новостей:', error);
        return {
            error: 'Не удалось загрузить новости',
            details: error.message,
        };
    }
});