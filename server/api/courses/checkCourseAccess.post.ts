// Проверка доступа к курсу или вебинару

import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const apiKey = config.private.bitrixApiKey
    const apiUrl = config.private.bitrixApiUrl

    const body = await readBody(event)

    // Проверка обязательных параметров
    if (!body || typeof body !== 'object' || !body.params) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Параметры запроса отсутствуют или имеют неверный формат'
        })
    }

    const { TOKEN, COURSE_ID } = body.params

    if (!TOKEN || typeof TOKEN !== 'string' || !TOKEN.trim()) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Токен обязателен и должен быть строкой'
        })
    }

    if (!COURSE_ID || !Number.isInteger(Number(COURSE_ID)) || Number(COURSE_ID) <= 0) {
        throw createError({
            statusCode: 400,
            statusMessage: 'COURSE_ID обязателен и должен быть положительным целым числом'
        })
    }

    const requestBody = {
        key: apiKey,
        'params[TOKEN]': TOKEN.trim(),
        'params[COURSE_ID]': COURSE_ID.toString()
    }

    try {
        const response = await $fetch(`${apiUrl}?method=checkCourseAccess&act=auth`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(requestBody).toString()
        })

        if ('ACCESS' in response && typeof response.ACCESS === 'number') {
            return {
                ACCESS: response.ACCESS
            }
        }

        if (response.ERROR) {
            throw new Error(response.ERROR)
        }

        throw new Error('Неверный формат ответа API')
    } catch (error) {
        console.error('Ошибка при проверке доступа к курсу:', error)
        const errorMessage = error.message || 'Неизвестная ошибка'
        let userFriendlyMessage = 'Ошибка при проверке доступа к курсу'
        let statusCode = 400

        switch (errorMessage) {
            case 'ERROR_INVALID_COURSE_ID':
                userFriendlyMessage = 'Неверный идентификатор курса'
                break
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
            default:
                userFriendlyMessage = errorMessage
        }

        throw createError({
            statusCode,
            statusMessage: userFriendlyMessage,
            data: { error: errorMessage }
        })
    }
})