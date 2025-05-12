// API-роут для запроса данных элемента (отчета) из инфоблока и получения поля DETAIL_PAGE_URL
// server/api/report/[id].ts
import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    const reportId = event.context.params.id; // Получаем ID отчета из маршрута

    const requestBody = {
        key: apiKey,
        'params[filter][IBLOCK_ID]': 2, // IBLOCK_ID для отчетов
        'params[filter][ID]': reportId,
        'params[filter][ACTIVE]': 'Y',
        'params[select][0]': 'NAME',
        'params[select][1]': 'IBLOCK_ID',
        'params[select][2]': 'ID',
        'params[select][3]': 'CODE',
        'params[select][4]': 'DETAIL_PAGE_URL',
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

        if (!response?.RESULT?.ITEM) {
            throw new Error('Отчет не найден или неверная структура ответа API');
        }

        // Возвращаем весь объект ITEM, содержащий данные для всех языков
        return {
            item: response.RESULT.ITEM,
        };
    } catch (error) {
        console.error('Ошибка при запросе отчета:', error.message);
        return {
            error: 'Не удалось загрузить данные отчета',
            details: error.message,
            status: 500,
        };
    }
});