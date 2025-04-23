import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const apiKey = config.private.bitrixApiKey
    const apiUrl = config.private.bitrixApiUrl

    const body = await readBody(event)

    // Логируем входящие данные для отладки
    console.log('Входящие данные для регистрации:', body)

    // Проверка на наличие всех обязательных полей
    if (!body.name || !body.last_name || !body.phone || !body.email || !body.password || !body.confirm_password) {
        return {
            error: 'Не удалось зарегистрироваться',
            details: 'Все поля обязательны для заполнения'
        }
    }

    // Формируем тело запроса для Bitrix API
    const requestBody = {
        key: apiKey,
        params: {
            NAME: body.name,
            LAST_NAME: body.last_name,
            PHONE: body.phone,
            EMAIL: body.email,
            PASSWORD: body.password,
            CONFIRM_PASSWORD: body.confirm_password
        }
    }

    // Логируем тело запроса, чтобы убедиться, что данные передаются
    console.log('Тело запроса для Bitrix API:', requestBody)

    try {
        const response = await $fetch(`${apiUrl}?method=register&act=auth`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                key: apiKey,
                'params[NAME]': body.name.trim(),
                'params[LAST_NAME]': body.last_name.trim(),
                'params[PHONE]': body.phone.trim(),
                'params[EMAIL]': body.email.trim(),
                'params[PASSWORD]': body.password.trim(),
                'params[CONFIRM_PASSWORD]': body.confirm_password.trim()
            }).toString()
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
        console.error('Ошибка при регистрации:', error)

        // Обрабатываем возможные ошибки от Bitrix
        const errorMessage = error.message || 'Неизвестная ошибка'
        let userFriendlyMessage = 'Не удалось зарегистрироваться'

        // Переводим ошибки Bitrix в пользовательский вид
        switch (errorMessage) {
            case 'ERROR_FIELD_NAME_REQUIRED':
            case 'ERROR_FIELD_LAST_NAME_REQUIRED':
            case 'ERROR_FIELD_PHONE_REQUIRED':
            case 'ERROR_FIELD_EMAIL_REQUIRED':
            case 'ERROR_FIELD_PASSWORD_REQUIRED':
            case 'ERROR_FIELD_CONFIRM_PASSWORD_REQUIRED':
                userFriendlyMessage = 'Все поля обязательны для заполнения'
                break
            case 'ERROR_UNIQUE_EMAIL':
                userFriendlyMessage = 'Пользователь с таким email уже существует'
                break
            case 'ERROR_CONFIRM_PASSWORD':
                userFriendlyMessage = 'Пароли не совпадают'
                break
            case 'Invalid API key':
                userFriendlyMessage = 'Ошибка сервера: неверный API ключ'
                break
            default:
                userFriendlyMessage = errorMessage
        }

        return {
            error: 'Не удалось зарегистрироваться',
            details: userFriendlyMessage
        }
    }
})