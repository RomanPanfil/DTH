// Создание заказа
import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const apiKey = config.private.bitrixApiKey
    const apiUrl = config.private.bitrixApiUrl

    const { token, courseId, paymentMethodId } = await readBody(event)

    if (!token || !courseId || !paymentMethodId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Токен, ID курса и ID способа оплаты обязательны'
        })
    }

    if (!Number.isInteger(Number(courseId)) || !Number.isInteger(Number(paymentMethodId))) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID курса и ID способа оплаты должны быть целыми числами'
        })
    }

    const requestBody = {
        key: apiKey,
        'params[TOKEN]': token.trim(),
        'params[COURSE_ID]': courseId,
        'params[PAYMENT_METHOD_ID]': paymentMethodId
    }

    try {
        const response = await $fetch(`${apiUrl}?method=CreateOrder&act=auth`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(requestBody).toString()
        })

        // Успешный ответ
        if (response.ORDER_ID) {
            return {
                orderId: response.ORDER_ID,
                amount: response.AMOUNT,
                paymentMethod: response.PAYMENT_METHOD,
                form: response.FORM || null
            }
        }

        // Обработка ошибок
        if (response.ERROR) {
            throw new Error(response.ERROR)
        }

        throw new Error('Неверный формат ответа API')
    } catch (error) {
        console.error('Ошибка при создании заказа:', error)
        const errorMessage = error.message || 'Неизвестная ошибка'
        let userFriendlyMessage = 'Ошибка при создании заказа'
        let statusCode = 400

        switch (errorMessage) {
            case 'ERROR_INVALID_TOKEN':
                userFriendlyMessage = 'Неверный или истекший токен'
                statusCode = 401
                break
            case 'ERROR_INVALID_COURSE_ID':
                userFriendlyMessage = 'Неверный идентификатор курса'
                break
            case 'ERROR_INVALID_PAYMENT_METHOD':
                userFriendlyMessage = 'Неверный идентификатор способа оплаты'
                break
            case 'ERROR_COURSE_NOT_FOUND':
                userFriendlyMessage = 'Курс не найден'
                break
            case 'ERROR_NO_AVAILABLE_SEATS':
                userFriendlyMessage = 'Нет доступных мест'
                break
            case 'ERROR_REGISTRATION_CLOSED':
                userFriendlyMessage = 'Регистрация закрыта'
                break
            case 'ERROR_ORDER_ALREADY_EXISTS':
                userFriendlyMessage = 'Заказ с такими данными уже существует'
                break
            case 'ERROR_INVALID_BOOKING_PERIOD':
                userFriendlyMessage = 'Некорректный период бронирования'
                break
            case 'ERROR_ORDER_CREATION_FAILED':
                userFriendlyMessage = 'Не удалось создать заказ'
                break
            case 'ERROR_INVALID_PARAMS':
                userFriendlyMessage = 'Неверный формат параметров'
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