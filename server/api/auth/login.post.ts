import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const apiKey = config.private.bitrixApiKey
    const apiUrl = config.private.bitrixApiUrl

    const body = await readBody(event)

    // Логируем входящие данные для отладки
    console.log('Входящие данные для авторизации:', body)

    // Проверка на наличие обязательных полей
    if (!body.email || !body.password) {
        return {
            error: 'Не удалось войти',
            details: 'Email и пароль обязательны'
        }
    }

    // Формируем тело запроса для Bitrix API
    const requestBody = {
        key: apiKey,
        'params[EMAIL]': body.email.trim(),
        'params[PASSWORD]': body.password.trim()
    }

    // Логируем тело запроса
    console.log('Тело запроса для Bitrix API:', requestBody)

    try {
        const response = await $fetch(`${apiUrl}?method=login&act=auth`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(requestBody).toString()
        })

        // Логируем ответ от Bitrix API
        console.log('Ответ от Bitrix API:', response)

        // Проверяем успешность ответа
        if (response.USER_ID && response.TOKEN && response.EXPIRES) {
            return {
                USER_ID: response.USER_ID,
                TOKEN: response.TOKEN,
                EXPIRES: response.EXPIRES
            }
        }

        // Если ответ содержит ошибку, обрабатываем её
        if (response.ERROR) {
            throw new Error(response.ERROR)
        }

        throw new Error('Неверный формат ответа API')
    } catch (error) {
        console.error('Ошибка при авторизации:', error)

        // Обрабатываем возможные ошибки от Bitrix
        const errorMessage = error.message || 'Неизвестная ошибка'
        let userFriendlyMessage = 'Не удалось войти'

        switch (errorMessage) {
            case 'ERROR_LOGIN':
                userFriendlyMessage = 'Указанный email не найден'
                break
            case 'ERROR_NOT_ACTIVATION':
                userFriendlyMessage = 'Учетная запись не активирована'
                break
            case 'ERROR_AUTH':
                userFriendlyMessage = 'Неверный пароль'
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

        return {
            error: 'Не удалось войти',
            details: userFriendlyMessage
        }
    }
})