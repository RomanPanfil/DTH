// Получение новостей для слайдера с исключением текущей новости
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    const query = getQuery(event);
    const page = Number(query.page) || 1;
    const sectionId = query.section || null;
    const limit = Number(query.limit) || 12;
    const excludeCode = query.excludeCode || null;

    const requestBody = {
        key: apiKey,
        'params[filter][IBLOCK_ID]': 2,
        'params[filter][ACTIVE]': 'Y',
        'params[include_sections]': 'Y',
    };

    // Добавляем фильтр по рубрике, если указан sectionId
    if (sectionId) {
        requestBody['params[filter][IBLOCK_SECTION_ID]'] = sectionId;
    }

    // Добавляем фильтр для исключения новости по CODE
    if (excludeCode) {
        requestBody['params[filter][!CODE]'] = excludeCode;
    }

    Object.assign(requestBody, {
        'params[select][0]': 'NAME',
        'params[select][1]': 'IBLOCK_ID',
        'params[select][2]': 'ID',
        'params[select][3]': 'DATE_ACTIVE_FROM',
        'params[select][4]': 'PREVIEW_PICTURE',
        'params[select][5]': 'IBLOCK_SECTION_ID',
        'params[select][6]': 'CODE',
        'params[select][7]': 'PROPERTY_*',
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
        console.error('Ошибка при запросе новостей для JournalShort:', error);
        return {
            error: 'Не удалось загрузить новости',
            details: error.message,
        };
    }
});