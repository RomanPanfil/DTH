import { defineEventHandler, readBody, createError } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    const body = await readBody(event);
    const { token, name, last_name, second_name, phone, link_inst, link_fb, link_vk, name_en, last_name_en, second_name_en, personal_birthday, country, city } = body;

    // console.log('Update profile request:', { token, name, last_name, phone, country, city });

    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Токен отсутствует'
        });
    }

    if (!name || !last_name || !phone) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Обязательные поля NAME, LAST_NAME, PHONE не заполнены'
        });
    }

    const requestBody = {
        key: apiKey,
        'params[TOKEN]': token,
        'params[NAME]': name,
        'params[LAST_NAME]': last_name,
        'params[SECOND_NAME]': second_name || '',
        'params[PHONE]': phone,
        'params[LINK_INST]': link_inst || '',
        'params[LINK_FB]': link_fb || '',
        'params[LINK_VK]': link_vk || '',
        'params[NAME_EN]': name_en || '',
        'params[LAST_NAME_EN]': last_name_en || '',
        'params[SECOND_NAME_EN]': second_name_en || '',
        'params[PERSONAL_BIRTHDAY]': personal_birthday || '',
        'params[COUNTRY]': country || '',
        'params[CITY]': city || ''
    };

    try {
        const response = await $fetch(`${apiUrl}?method=updateprofile&act=auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(requestBody).toString()
        });

        // console.log('Bitrix API response (updateprofile):', JSON.stringify(response, null, 2));

        if (response.MESSAGE === 'PROFILE_UPDATED_SUCCESSFULLY') {
            return { message: response.MESSAGE };
        }

        throw new Error(response.ERROR || 'Неверный формат ответа API');
    } catch (error) {
        console.error('Ошибка при обновлении профиля:', error);
        const errorMessage = error.message || 'Неизвестная ошибка';
        let userFriendlyMessage = 'Не удалось обновить профиль';

        switch (errorMessage) {
            case 'ERROR_INVALID_TOKEN':
                userFriendlyMessage = 'Неверный или истекший токен';
                break;
            case 'ERROR_NO_FIELDS_TO_UPDATE':
                userFriendlyMessage = 'Не указаны поля для обновления';
                break;
            case 'ERROR_FIELD_NAME_REQUIRED':
                userFriendlyMessage = 'Поле "Имя" обязательно';
                break;
            case 'ERROR_FIELD_LAST_NAME_REQUIRED':
                userFriendlyMessage = 'Поле "Фамилия" обязательно';
                break;
            case 'ERROR_FIELD_PHONE_REQUIRED':
                userFriendlyMessage = 'Поле "Телефон" обязательно';
                break;
            case 'ERROR_INVALID_PARAMS':
                userFriendlyMessage = 'Неверный формат данных';
                break;
            case 'Invalid API key':
                userFriendlyMessage = 'Ошибка сервера: неверный API ключ';
                break;
            default:
                userFriendlyMessage = errorMessage;
        }

        throw createError({
            statusCode: 400,
            statusMessage: userFriendlyMessage,
            data: { error: errorMessage }
        });
    }
});