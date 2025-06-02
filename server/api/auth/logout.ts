import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const apiKey = config.private.bitrixApiKey
    const apiUrl = config.private.bitrixApiUrl

    const { token } = await readBody(event)
    // console.log('Logout request, token:', token)

    if (!token) {
        throw createError({
            statusCode: 401,
            statusMessage: 'Токен отсутствует'
        })
    }

    const requestBody = {
        key: apiKey,
        'params[TOKEN]': token
    }

    try {
        const response = await $fetch(`${apiUrl}?method=logout&act=auth`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(requestBody).toString()
        })

        // console.log('Bitrix API response (logout):', JSON.stringify(response, null, 2))

        if (response.MESSAGE === 'LOGGED_OUT_SUCCESSFULLY') {
            return { MESSAGE: response.MESSAGE }
        }

        if (response.ERROR) {
            throw new Error(response.ERROR)
        }

        throw new Error('Неверный формат ответа API')
    } catch (error) {
        console.error('Ошибка при выходе:', error)
        const errorMessage = error.message || 'Неизвестная ошибка'
        let userFriendlyMessage = 'Не удалось выйти'

        switch (errorMessage) {
            case 'ERROR_INVALID_TOKEN':
                userFriendlyMessage = 'Неверный или истекший токен'
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