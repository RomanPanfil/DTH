import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    const query = getQuery(event);
    const searchQuery = query.query ? String(query.query) : '';
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 12;

    // Validate search query
    if (!searchQuery) {
        return {
            error: 'Search query is required',
        };
    }

    const requestBody = {
        key: apiKey,
        'params[query]': searchQuery,
        'params[sort][ACTIVE_FROM]': 'DESC',
        'params[resize][0]': 320,
        'params[resize][1]': 240,
        'params[resize][2]': true,
        'params[resize_WHEN_GALL][0]': 640,
        'params[resize_WHEN_GALL][1]': 480,
        'params[resize_WHEN_GALL][2]': true,
        'params[pager][start]': page,
        'params[pager][limit]': limit,
        'params[select][0]': 'NAME',
        'params[select][1]': 'IBLOCK_ID',
        'params[select][2]': 'ID',
        'params[select][3]': 'CODE',
        'params[select][4]': 'PREVIEW_TEXT',
        'params[select][5]': 'DETAIL_TEXT',
        'params[select][6]': 'DETAIL_PAGE_URL',
        'params[select][7]': 'PREVIEW_PICTURE',
        'params[select][8]': 'ACTIVE_FROM',
        'params[select][9]': 'IBLOCK_SECTION_ID',
        'params[select][10]': 'PROPERTY_*',
        'params[GET_ALL_FILES]': 'Y',
    };

    try {
        const response = await $fetch(`${apiUrl}?method=items&act=search`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(requestBody).toString(),
        });

        // console.log('Search API Response:', JSON.stringify(response, null, 2));

        if (!response.JOURNAL && !response.COURSES && !response.WEBINARS) {
            throw new Error('Invalid API response structure');
        }

        return {
            journal: {
                items: response.JOURNAL?.ITEMS || [],
                pagination: response.JOURNAL?.PAGENAV || { PAGE: 1, LIMIT: limit, TOTAL: 0 },
            },
            courses: {
                items: response.COURSES?.ITEMS || [],
                pagination: response.COURSES?.PAGENAV || { PAGE: 1, LIMIT: limit, TOTAL: 0 },
            },
            webinars: {
                items: response.WEBINARS?.ITEMS || [],
                pagination: response.WEBINARS?.PAGENAV || { PAGE: 1, LIMIT: limit, TOTAL: 0 },
            },
        };
    } catch (error) {
        console.error('Error fetching search results:', {
            message: error.message,
            stack: error.stack,
            requestBody,
            url: `${apiUrl}?method=items&act=search`,
        });
        return {
            error: 'Failed to load search results',
            details: error.message,
        };
    }
});