// Запрос на сброс пароля
import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const apiKey = config.private.bitrixApiKey
    const apiUrl = config.private.bitrixApiUrl

    const { email } = await readBody(event)
    // console.log('Recover request:', { email })

    if (!email) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Поле EMAIL обязательно для заполнения',
            data: { error: 'ERROR_FIELD_EMAIL_REQUIRED' }
        })
    }

    const requestBody = {
        key: apiKey,
        'params[EMAIL]': email.trim()
    }

    try {
        const response = await $fetch(`${apiUrl}?method=recover&act=auth`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(requestBody).toString()
        })

        // console.log('Bitrix API response (recover):', JSON.stringify(response, null, 2))

        if (response.MESSAGE === 'RESET_CODE_SEND') {
            return {
                message: 'RESET_CODE_SEND',
                status: 'success'
            }
        }

        if (response.ERROR) {
            throw new Error(response.ERROR)
        }

        throw new Error('Неверный формат ответа API')
    } catch (error) {
        console.error('Ошибка при запросе на восстановление пароля:', error)
        const errorMessage = error.message || 'Неизвестная ошибка'
        let userFriendlyMessage = 'Ошибка при запросе на восстановление пароля'

        switch (errorMessage) {
            case 'ERROR_FIELD_EMAIL_REQUIRED':
                userFriendlyMessage = 'Поле EMAIL обязательно для заполнения'
                break
            case 'ERROR_LOGIN':
                userFriendlyMessage = 'Пользователь с таким EMAIL не найден'
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
            statusCode: errorMessage === 'ERROR_FIELD_EMAIL_REQUIRED' ? 400 : 401,
            statusMessage: userFriendlyMessage,
            data: { error: errorMessage }
        })
    }
})