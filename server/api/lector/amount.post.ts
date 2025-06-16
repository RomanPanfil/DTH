// Получение общего дохода лектора
import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const apiKey = config.private.bitrixApiKey
    const apiUrl = config.private.bitrixApiUrl

    const { TOKEN } = await readBody(event)

    // Валидация токена
    if (!TOKEN || typeof TOKEN !== 'string' || !TOKEN.trim()) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid token',
            message: 'Токен обязателен и должен быть строкой'
        })
    }

    // Формирование тела запроса
    const requestBody = {
        key: apiKey,
        'params[TOKEN]': TOKEN.trim()
    }

    try {
        const response = await $fetch(`${apiUrl}?method=getLectorAmount&act=auth`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(requestBody).toString()
        })

        // console.log('API response for getLectorAmount:', response);

        // Успешный ответ
        if (response && typeof response.AMOUNT !== 'undefined') {
            const amount = Number(response.AMOUNT);
            if (isNaN(amount)) {
                throw new Error('AMOUNT is not a valid number');
            }
            return { amount }
        }

        // Обработка ошибок API
        if (response?.ERROR) {
            throw new Error(response.ERROR)
        }

        throw new Error('Invalid API response format')
    } catch (error) {
        console.error('Ошибка при получении дохода лектора:', error)
        const errorMessage = error.message || 'Неизвестная ошибка'
        let userFriendlyMessage = 'Ошибка при получении дохода лектора'
        let statusCode = 400

        switch (errorMessage) {
            case 'ERROR_INVALID_TOKEN':
                userFriendlyMessage = 'Неверный или истекший токен'
                statusCode = 401
                break
            case 'ERROR_INVALID_PARAMS':
                userFriendlyMessage = 'Неверный формат параметров'
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
                userFriendlyMessage = 'Неверный ключ API'
                statusCode = 401
                break
            case 'AMOUNT is not a valid number':
                userFriendlyMessage = 'Неверный формат суммы'
                break
            case 'Invalid API response format':
                userFriendlyMessage = 'Неверный формат ответа API'
                break
            default:
                userFriendlyMessage = 'Неизвестная ошибка'
        }

        throw createError({
            statusCode,
            statusMessage: userFriendlyMessage,
            message: errorMessage
        })
    }
})