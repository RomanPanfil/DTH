// Получение заказов пользователя
import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const apiKey = config.private.bitrixApiKey
    const apiUrl = config.private.bitrixApiUrl

    const { token, pager } = await readBody(event)

    if (!token || typeof token !== 'string' || !token.trim()) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Токен обязателен и должен быть строкой'
        })
    }

    const validatedPager = {
        start: 1,
        limit: 20
    }

    if (pager && typeof pager === 'object') {
        if (pager.start && Number.isInteger(Number(pager.start)) && Number(pager.start) > 0) {
            validatedPager.start = Number(pager.start)
        }
        if (pager.limit && Number.isInteger(Number(pager.limit)) && Number(pager.limit) > 0) {
            validatedPager.limit = Number(pager.limit)
        }
    }

    const requestBody = {
        key: apiKey,
        'params[TOKEN]': token.trim(),
        'params[pager][start]': validatedPager.start.toString(),
        'params[pager][limit]': validatedPager.limit.toString()
    }

    try {
        const response = await $fetch(`${apiUrl}?method=GetUserOrders&act=auth`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(requestBody).toString()
        })

        // Успешный ответ
        if (response.ORDERS && response.PAGENAV) {
            return {
                orders: response.ORDERS,
                pagenav: response.PAGENAV
            }
        }

        // Обработка ошибок API
        if (response.ERROR) {
            throw new Error(response.ERROR)
        }

        throw new Error('Неверный формат ответа API')
    } catch (error) {
        console.error('Ошибка при получении списка заказов:', error)
        const errorMessage = error.message || 'Неизвестная ошибка'
        let userFriendlyMessage = 'Ошибка при получении списка заказов'
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