import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const apiKey = config.private.bitrixApiKey
    const apiUrl = config.private.bitrixApiUrl

    const { token } = await readBody(event)
    console.log('Profile: Request received, token:', token)

    // Проверка наличия токена
    if (!token) {
        console.error('Profile: Token missing')
        throw createError({
            statusCode: 400,
            statusMessage: 'Токен отсутствует',
            data: { error: 'ERROR_FIELD_REQUIRED' }
        })
    }

    // Формирование тела запроса
    const requestBody = {
        key: apiKey,
        'params[TOKEN]': token
    }

    try {
        console.log('Profile: Sending request to Bitrix API:', apiUrl)
        const response = await $fetch(`${apiUrl}?method=getprofile&act=auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(requestBody).toString()
        })

        console.log('Profile: Bitrix API response:', JSON.stringify(response, null, 2))

        // Проверка успешного ответа
        if (response.ID && response.EMAIL) {
            const formattedResponse = {
                ID: response.ID,
                NAME: response.NAME,
                LAST_NAME: response.LAST_NAME,
                SECOND_NAME: response.SECOND_NAME,
                NAME_EN: response.NAME_EN,
                LAST_NAME_EN: response.LAST_NAME_EN,
                SECOND_NAME_EN: response.SECOND_NAME_EN,
                BIRTHDAY: response.BIRTHDAY,
                EMAIL: response.EMAIL,
                PHONE: response.PHONE,
                LOGIN: response.LOGIN,
                PHOTO: response.PHOTO,
                LINK_INST: response.LINK_INST,
                LINK_FB: response.LINK_FB,
                LINK_VK: response.LINK_VK,
                ACTIVE: response.ACTIVE,
                IS_LECTOR: response.IS_LECTOR,
                DATE_REGISTER: response.DATE_REGISTER,
                DATE_LAST_LOGIN: response.DATE_LAST_LOGIN
            }
            console.log('Profile: Formatted response:', formattedResponse)
            return formattedResponse
        }

        // Обработка ошибок API
        if (response.ERROR) {
            console.error('Profile: Bitrix API error:', response.ERROR)
            let statusCode = 401
            let userFriendlyMessage = 'Ошибка получения данных профиля'

            switch (response.ERROR) {
                case 'ERROR_INVALID_TOKEN':
                    userFriendlyMessage = 'Неверный или истекший токен'
                    statusCode = 403
                    break
                case 'ERROR_USER_NOT_FOUND':
                    userFriendlyMessage = 'Пользователь не найден'
                    statusCode = 404
                    break
                case 'ERROR_FIELD_REQUIRED':
                    userFriendlyMessage = 'Токен отсутствует'
                    statusCode = 400
                    break
                default:
                    userFriendlyMessage = response.ERROR
            }

            throw createError({
                statusCode,
                statusMessage: userFriendlyMessage,
                data: { error: response.ERROR }
            })
        }

        console.error('Profile: Invalid response format:', response)
        throw createError({
            statusCode: 500,
            statusMessage: 'Неверный формат ответа API',
            data: { error: 'INVALID_RESPONSE' }
        })
    } catch (error) {
        console.error('Profile: Request failed:', {
            status: error.status || 'N/A',
            message: error.message || 'No message',
            data: error.data || 'N/A'
        })
        throw createError({
            statusCode: error.status || 500,
            statusMessage: error.message || 'Не удалось получить данные профиля',
            data: { error: error.message || 'UNKNOWN_ERROR' }
        })
    }
})