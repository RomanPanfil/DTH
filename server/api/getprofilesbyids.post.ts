import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    try {
        const body = await readBody(event);

        const { params } = body;

        if (!params || !Array.isArray(params.USER_IDS) || params.USER_IDS.length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'ERROR_INVALID_USER_IDS',
                data: 'Пустой массив USER_IDS',
            });
        }

        const invalidIds = params.USER_IDS.filter(id => !Number.isInteger(id) || id <= 0);
        if (invalidIds.length > 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'ERROR_INVALID_USER_IDS',
                data: 'Неверные ID (строки, отрицательные числа)',
            });
        }

        const requestBody = new URLSearchParams();
        requestBody.append('key', apiKey);
        // Передаем каждый ID как отдельный параметр params[USER_IDS][]
        params.USER_IDS.forEach(id => {
            requestBody.append('params[USER_IDS][]', id.toString());
        });

        const response = await $fetch(`${apiUrl}?method=getprofilesbyids&act=auth`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: requestBody.toString(),
        });

        if (typeof response === 'string' && response.includes('<html>')) {
            throw createError({
                statusCode: 502,
                statusMessage: 'Bad Gateway',
                data: 'Внешний API вернул HTML-ошибку: ' + response.substring(0, 100) + '...',
            });
        }

        if (response.error) {
            if (response.error === 'ERROR_USERS_NOT_FOUND') {
                throw createError({
                    statusCode: 404,
                    statusMessage: 'ERROR_USERS_NOT_FOUND',
                    data: 'Никто не найден',
                });
            }
            throw createError({
                statusCode: 500,
                statusMessage: response.error,
            });
        }

        const profiles = response.PROFILES || response.result?.PROFILES || response.result || {};
        // console.log('Возвращаемые профили:', JSON.stringify(profiles, null, 2));
        return profiles;

    } catch (error) {
        console.error('Ошибка при запросе профилей:', error);
        throw createError({
            statusCode: error.statusCode || 500,
            statusMessage: error.statusMessage || 'Internal Server Error',
            data: error.data || 'Произошла ошибка при запросе профилей',
        });
    }
});