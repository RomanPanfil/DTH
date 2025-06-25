import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const apiKey = config.private.bitrixApiKey
    const apiUrl = config.private.bitrixApiUrl

    const body = await readBody(event)

    // Проверка обязательных полей
    if (!body.token || !body.current_password || !body.new_password || !body.confirm_password) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Одно из обязательных полей (TOKEN, CURRENT_PASSWORD, NEW_PASSWORD, CONFIRM_PASSWORD) не заполнено',
            data: { error: 'ERROR_FIELD_REQUIRED' }
        })
    }

    // Проверка совпадения паролей
    if (body.new_password !== body.confirm_password) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Новый пароль и подтверждение не совпадают',
            data: { error: 'ERROR_CONFIRM_PASSWORD' }
        })
    }

    const requestBody = {
        key: apiKey,
        'params[TOKEN]': body.token.trim(),
        'params[CURRENT_PASSWORD]': body.current_password.trim(),
        'params[NEW_PASSWORD]': body.new_password.trim(),
        'params[CONFIRM_PASSWORD]': body.confirm_password.trim()
    }

    try {
        const response = await $fetch(`${apiUrl}?method=changepassword&act=auth`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(requestBody).toString()
        })

        // Проверка успешного ответа
        if (response.MESSAGE === 'PASSWORD_CHANGED_SUCCESSFULLY') {
            return {
                message: 'PASSWORD_CHANGED_SUCCESSFULLY',
                status: 'success'
            }
        }

        // Если API вернул ошибку
        if (response.ERROR) {
            throw new Error(response.ERROR)
        }

        throw new Error('Неверный формат ответа API')
    } catch (error) {
        console.error('Ошибка при смене пароля:', error)
        const errorMessage = error.message || 'Неизвестная ошибка'
        let userFriendlyMessage = 'Ошибка при смене пароля'

        // Обработка возможных ошибок из документации
        switch (errorMessage) {
            case 'ERROR_FIELD_REQUIRED':
                userFriendlyMessage = 'Одно из обязательных полей (TOKEN, CURRENT_PASSWORD, NEW_PASSWORD, CONFIRM_PASSWORD) не заполнено'
                break
            case 'ERROR_INVALID_TOKEN':
                userFriendlyMessage = 'Неверный или истекший токен'
                break
            case 'ERROR_CURRENT_PASSWORD':
                userFriendlyMessage = 'Текущий пароль указан неверно'
                break
            case 'ERROR_CONFIRM_PASSWORD':
                userFriendlyMessage = 'Новый пароль и подтверждение не совпадают'
                break
            case 'Incorrect method':
                userFriendlyMessage = 'Некорректный метод'
                break
            case 'Incorrect type':
                userFriendlyMessage = 'Некорректный тип действия'
                break
            case 'Action is not defined':
                userFriendlyMessage = 'Указанное действие не определено'
                break
            case 'Invalid API key':
                userFriendlyMessage = 'Ошибка сервера: неверный API ключ'
                break
            default:
                userFriendlyMessage = errorMessage
        }

        throw createError({
            statusCode: errorMessage === 'ERROR_FIELD_REQUIRED' || errorMessage === 'ERROR_CONFIRM_PASSWORD' ? 400 : 401,
            statusMessage: userFriendlyMessage,
            data: { error: errorMessage }
        })
    }
})