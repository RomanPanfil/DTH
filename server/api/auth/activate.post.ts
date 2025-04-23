import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const apiKey = config.private.bitrixApiKey
    const apiUrl = config.private.bitrixApiUrl

    const body = await readBody(event)

    // Логируем входящие данные
    // console.log('Входящие данные для активации:', body)

    // Проверка на наличие обязательного поля
    if (!body.activation_code) {
        return {
            error: 'Не удалось активировать учетную запись',
            details: 'Код активации обязателен'
        }
    }

    // Формируем тело запроса для Bitrix API
    const requestBody = {
        key: apiKey,
        'params[ACTIVATION_CODE]': body.activation_code.trim()
    }

    // Логируем тело запроса
    // console.log('Тело запроса для Bitrix API:', requestBody)

    try {
        const response = await $fetch(`${apiUrl}?method=activate&act=auth`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(requestBody).toString()
        })

        // Логируем ответ от Bitrix API
        // console.log('Ответ от Bitrix API:', response)

        // Проверяем успешность ответа
        if (response.MESSAGE === 'ACCOUNT_ACTIVATED_SUCCESSFULLY') {
            return {
                MESSAGE: response.MESSAGE
            }
        }

        // Если ответ содержит ошибку, обрабатываем её
        if (response.ERROR) {
            throw new Error(response.ERROR)
        }

        throw new Error('Неверный формат ответа API')
    } catch (error) {
        console.error('Ошибка при активации:', error)

        // Обрабатываем возможные ошибки от Bitrix
        const errorMessage = error.message || 'Неизвестная ошибка'
        let userFriendlyMessage = 'Не удалось активировать учетную запись'

        switch (errorMessage) {
            case 'ERROR_ACTIVATION_ACCOUNT':
                userFriendlyMessage = 'Неверный код активации или учетная запись уже активирована'
                break
            case 'Invalid API key':
                userFriendlyMessage = 'Ошибка сервера: неверный API ключ'
                break
            default:
                userFriendlyMessage = errorMessage
        }

        return {
            error: 'Не удалось активировать учетную запись',
            details: userFriendlyMessage
        }
    }
})