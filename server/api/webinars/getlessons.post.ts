import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const apiKey = config.private.bitrixApiKey
    const apiUrl = config.private.bitrixApiUrl

    const { TOKEN, COURSE_ID } = await readBody(event)

    // Валидация параметров
    if (!COURSE_ID || typeof COURSE_ID !== 'number' || !Number.isInteger(COURSE_ID) || COURSE_ID <= 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid course ID',
            message: 'COURSE_ID обязателен и должен быть целым положительным числом'
        })
    }

    // Валидация токена (если передан)
    if (TOKEN && (typeof TOKEN !== 'string' || !TOKEN.trim())) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Invalid token',
            message: 'Токен должен быть непустой строкой'
        })
    }

    // Формирование тела запроса
    const requestBody: { key: string; 'params[COURSE_ID]': string; 'params[TOKEN]'?: string } = {
        key: apiKey,
        'params[COURSE_ID]': COURSE_ID.toString(),
    }

    // Добавляем TOKEN, только если он передан и валиден
    if (TOKEN && typeof TOKEN === 'string' && TOKEN.trim()) {
        requestBody['params[TOKEN]'] = TOKEN.trim()
    }

    try {
        const response = await $fetch(`${apiUrl}?method=lessons&act=get`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(requestBody).toString()
        })

        if (response.RESULT && response.RESULT.ITEMS) {
            return {
                ITEMS: response.RESULT.ITEMS,
            }
        }

        // Обработка ошибок API
        if (response?.ERROR) {
            throw new Error(response.ERROR)
        }

        throw new Error('Invalid API response format')
    } catch (error) {
        console.error('Ошибка при получении дочерних вебинаров:', error)
        const errorMessage = error.message || 'Неизвестная ошибка'
        let userFriendlyMessage = 'Ошибка при получении дочерних вебинаров'
        let statusCode = 400

        switch (errorMessage) {
            case 'ERROR_INVALID_TOKEN':
                userFriendlyMessage = 'Неверный или истекший токен'
                statusCode = 401
                break
            case 'ERROR_INVALID_PARAMS':
                userFriendlyMessage = 'Неверный формат параметров'
                break
            case 'ERROR_INVALID_COURSE_ID':
                userFriendlyMessage = 'Неверный идентификатор курса'
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