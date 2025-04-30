import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const apiKey = config.private.bitrixApiKey
    const apiUrl = config.private.bitrixApiUrl

    const { email, password } = await readBody(event)
    console.log('Login request:', { email })

    if (!email || !password) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Email и пароль обязательны'
        })
    }

    const requestBody = {
        key: apiKey,
        'params[EMAIL]': email.trim(),
        'params[PASSWORD]': password.trim()
    }

    try {
        const response = await $fetch(`${apiUrl}?method=login&act=auth`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(requestBody).toString()
        })

        console.log('Bitrix API response (login):', JSON.stringify(response, null, 2))

        if (response.USER_ID && response.TOKEN && response.EXPIRES) {
            const expiresDate = new Date(response.EXPIRES)
            if (isNaN(expiresDate.getTime())) {
                console.error('Login: Invalid EXPIRES format:', response.EXPIRES)
                throw new Error('Invalid EXPIRES format')
            }
            const formattedResponse = {
                USER_ID: response.USER_ID,
                TOKEN: response.TOKEN,
                EXPIRES: expiresDate.toISOString()
            }
            console.log('Login: Formatted response:', formattedResponse)
            return formattedResponse
        }

        if (response.ERROR) {
            throw new Error(response.ERROR)
        }

        throw new Error('Неверный формат ответа API')
    } catch (error) {
        console.error('Ошибка при авторизации:', error)
        const errorMessage = error.message || 'Неизвестная ошибка'
        let userFriendlyMessage = 'Ошибка авторизации'

        switch (errorMessage) {
            case 'ERROR_INVALID_CREDENTIALS':
                userFriendlyMessage = 'Неверный email или пароль'
                break
            case 'ERROR_USER_NOT_ACTIVATED':
                userFriendlyMessage = 'Учетная запись не активирована'
                break
            case 'Invalid API key':
                userFriendlyMessage = 'Ошибка сервера: неверный API ключ'
                break
            default:
                userFriendlyMessage = errorMessage
        }

        throw createError({
            statusCode: 401,
            statusMessage: userFriendlyMessage,
            data: { error: errorMessage }
        })
    }
})