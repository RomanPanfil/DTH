// import { defineEventHandler } from 'h3';
//
// export default defineEventHandler(async (event) => {
//     const config = useRuntimeConfig(event);
//     const apiKey = config.private.bitrixApiKey;
//     const apiUrl = config.private.bitrixApiUrl;
//
//     const query = getQuery(event);
//     const body = await readBody(event);
//     const page = Number(query.page) || 1;
//     const iblockId = Number(query.iblockId) || 13;
//     // const limit = Number(query.limit) || 12;
//     const limit = Number(body?.params?.pager?.limit) || Number(query.limit) || 12; // Предпочитаем body.params.pager.limit
//     const getAllFiles = query.GET_ALL_FILES || 'Y';
//
//     const requestBody = {
//         key: apiKey,
//         'params[filter][IBLOCK_ID]': iblockId,
//         'params[filter][ACTIVE]': 'Y',
//         'params[select][0]': 'PROPERTY_*',
//         'params[resize][0]': 390,
//         'params[resize][1]': 242,
//         'params[resize][2]': '1',
//         'params[resize_WHEN_GALL][0]': 640,
//         'params[resize_WHEN_GALL][1]': 480,
//         'params[resize_WHEN_GALL][2]': '1',
//         'params[pager][start]': page,
//         'params[pager][limit]': limit,
//     };
//
//     // Добавляем GET_ALL_FILES, если указано
//     if (getAllFiles === 'Y') {
//         Object.assign(requestBody, {
//             'params[GET_ALL_FILES]': 'Y',
//         });
//     }
//
//     // Добавляем фильтр по ID, если указан
//     if (body?.params?.filter?.ID) {
//         const ids = Array.isArray(body.params.filter.ID)
//             ? body.params.filter.ID
//             : [body.params.filter.ID];
//         ids.forEach((id, index) => {
//             requestBody[`params[filter][ID][${index}]`] = Number(id);
//         });
//     }
//
//     // Добавляем fastfilter, если он есть
//     if (body?.params?.fastfilter && Object.keys(body.params.fastfilter).length > 0) {
//         Object.entries(body.params.fastfilter).forEach(([key, value]) => {
//             requestBody[`params[fastfilter][${key}]`] = value;
//         });
//     }
//
//     // Добавляем сортировку по свойству DATE_FOR_SORT, если она указана
//     if (body?.params?.sort && body.params.sort.PROPERTY_DATE_FOR_SORT) {
//         requestBody['params[sort][PROPERTY_DATE_FOR_SORT]'] = body.params.sort.PROPERTY_DATE_FOR_SORT;
//     }
//
//     try {
//         console.log(requestBody)
//         const response = await $fetch(`${apiUrl}?method=items&act=get`, {
//             method: 'POST',
//             headers: {
//                 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
//                 'Content-Type': 'application/x-www-form-urlencoded',
//             },
//             body: new URLSearchParams(requestBody).toString(),
//         });
//
//         if (!response.RESULT || !response.RESULT.ITEMS || !response.RESULT.ITEMS.RU) {
//             throw new Error('Неверная структура ответа API');
//         }
//
//         return {
//             events: response.RESULT.ITEMS.RU || [],
//             pagination: {
//                 currentPage: response.RESULT.PAGENAV?.PAGE || 1,
//                 limit: response.RESULT.PAGENAV?.LIMIT || limit,
//                 total: response.RESULT.PAGENAV?.TOTAL || 0,
//             },
//         };
//     } catch (error) {
//         console.error('Ошибка при запросе мероприятий:', error);
//         return {
//             error: 'Не удалось загрузить мероприятия',
//             details: error.message,
//         };
//     }
// });
//
//

import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    const query = getQuery(event);
    const body = await readBody(event);
    const page = Number(query.page) || 1;
    const iblockId = Number(query.iblockId) || 13;
    const limit = Number(body?.params?.pager?.limit) || Number(query.limit) || 12;
    const getAllFiles = query.GET_ALL_FILES || 'Y';

    const requestBody = {
        key: apiKey,
        'params[filter][IBLOCK_ID]': iblockId,
        'params[filter][ACTIVE]': 'Y',
        'params[select][0]': 'PROPERTY_*',
        'params[resize][0]': 390,
        'params[resize][1]': 242,
        'params[resize][2]': '1',
        'params[resize_WHEN_GALL][0]': 640,
        'params[resize_WHEN_GALL][1]': 480,
        'params[resize_WHEN_GALL][2]': '1',
        'params[pager][start]': page,
        'params[pager][limit]': limit,
    };

    if (getAllFiles === 'Y') {
        Object.assign(requestBody, {
            'params[GET_ALL_FILES]': 'Y',
        });
    }

    // Добавляем фильтр по ID, если указан в body.params.filter.ID
    let courseIds = [];
    if (body?.params?.filter?.ID) {
        courseIds = Array.isArray(body.params.filter.ID)
            ? body.params.filter.ID.map(id => Number(id))
            : [Number(body.params.filter.ID)];
    }

    // Логируем courseIds для отладки
    console.log('Course IDs for filtering:', courseIds);

    if (courseIds.length > 0) {
        courseIds.forEach((id, index) => {
            requestBody[`params[filter][ID][${index}]`] = id;
        });
    }

    if (body?.params?.fastfilter && Object.keys(body.params.fastfilter).length > 0) {
        Object.entries(body.params.fastfilter).forEach(([key, value]) => {
            requestBody[`params[fastfilter][${key}]`] = value;
        });
    }

    if (body?.params?.sort && body.params.sort.PROPERTY_DATE_FOR_SORT) {
        requestBody['params[sort][PROPERTY_DATE_FOR_SORT]'] = body.params.sort.PROPERTY_DATE_FOR_SORT;
    }

    try {
        console.log('Request body:', requestBody);
        const response = await $fetch(`${apiUrl}?method=items&act=get`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(requestBody).toString(),
        });

        if (!response.RESULT || !response.RESULT.ITEMS || !response.RESULT.ITEMS.RU) {
            throw new Error('Неверная структура ответа API');
        }

        return {
            events: response.RESULT.ITEMS.RU || [],
            pagination: {
                currentPage: response.RESULT.PAGENAV?.PAGE || 1,
                limit: response.RESULT.PAGENAV?.LIMIT || limit,
                total: response.RESULT.PAGENAV?.TOTAL || 0,
            },
        };
    } catch (error) {
        console.error('Ошибка при запросе мероприятий:', error);
        return {
            error: 'Не удалось загрузить мероприятия',
            details: error.message,
        };
    }
});
