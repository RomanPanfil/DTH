import { defineEventHandler } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    const query = getQuery(event);
    const menuType = query.type; // Получаем тип меню из query-параметра (MENU_TOP, MENU_BOTTOM, MENU_TEH)

    if (!menuType) {
        return {
            error: 'Не указан тип меню',
            details: 'Параметр type обязателен (MENU_TOP, MENU_BOTTOM, MENU_TEH)',
        };
    }

    const requestBody = {
        key: apiKey,
        params: menuType, // Передаём тип меню напрямую
    };

    try {
        const response = await $fetch(`${apiUrl}?method=menu&act=get`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams(requestBody).toString(),
        });

        // Логируем полный ответ для отладки
        // console.log(`Ответ от Bitrix для ${menuType}:`, response);

        // Проверяем, есть ли данные
        if (!response || typeof response !== 'object') {
            throw new Error('Меню не найдено или неверная структура ответа API');
        }

        return {
            menu: response, // Возвращаем весь объект (например, { RU: [...] })
        };
    } catch (error) {
        console.error(`Ошибка при запросе меню (${menuType}):`, error);
        return {
            error: 'Не удалось загрузить меню',
            details: error.message,
        };
    }
});