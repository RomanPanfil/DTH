import { defineEventHandler, createError } from 'h3';
import { readMultipartFormData } from 'h3';

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const apiKey = config.private.bitrixApiKey;
    const apiUrl = config.private.bitrixApiUrl;

    const formData = await readMultipartFormData(event);
    console.log('Update photo request:', formData);

    if (!formData) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Данные формы отсутствуют'
        });
    }

    const token = formData.find(f => f.name === 'token')?.data.toString();
    const photoDel = formData.find(f => f.name === 'photo_del')?.data.toString();
    const photo = formData.find(f => f.name === 'photo');

    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Токен отсутствует'
        });
    }

    if (!photoDel && !photo) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Не указан файл для загрузки или параметр PHOTO_DEL'
        });
    }

    const requestFormData = new FormData();
    requestFormData.append('key', apiKey);
    requestFormData.append('TOKEN', token);

    if (photoDel === 'Y') {
        requestFormData.append('PHOTO_DEL', 'Y');
    } else if (photo) {
        requestFormData.append('photo', new Blob([photo.data], { type: photo.type }), photo.filename);
    }

    try {
        const response = await $fetch(`${apiUrl}?method=updatephoto&act=auth`, {
            method: 'POST',
            body: requestFormData
        });

        console.log('Bitrix API response (updatephoto):', JSON.stringify(response, null, 2));

        if (response.MESSAGE === 'PHOTO_UPDATED_SUCCESSFULLY') {
            return { message: response.MESSAGE };
        }

        throw new Error(response.ERROR || 'Неверный формат ответа API');
    } catch (error) {
        console.error('Ошибка при обновлении фото:', error);
        const errorMessage = error.message || 'Неизвестная ошибка';
        let userFriendlyMessage = 'Не удалось обновить фото';

        switch (errorMessage) {
            case 'ERROR_INVALID_TOKEN':
                userFriendlyMessage = 'Неверный или истекший токен';
                break;
            case 'ERROR_NO_PHOTO_ACTION':
                userFriendlyMessage = 'Не указан файл или параметр удаления';
                break;
            case 'ERROR_INVALID_PHOTO_TYPE':
                userFriendlyMessage = 'Недопустимый тип файла (только JPEG, PNG, GIF)';
                break;
            case 'ERROR_PHOTO_TOO_LARGE':
                userFriendlyMessage = 'Файл превышает 5 МБ';
                break;
            case 'ERROR_PHOTO_UPLOAD_FAILED':
                userFriendlyMessage = 'Ошибка загрузки файла';
                break;
            case 'ERROR_PHOTO_SAVE_FAILED':
                userFriendlyMessage = 'Ошибка сохранения файла';
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