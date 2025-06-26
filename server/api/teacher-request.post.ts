import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const apiKey = config.private.bitrixApiKey
    const apiUrl = config.private.bitrixApiUrl

    const body = await readBody(event)

    // Проверка на наличие всех обязательных полей
    if (!body.name || !body.email || !body.phone) {
        return {
            error: 'Не удалось отправить заявку',
            details: 'Все поля обязательны для заполнения'
        }
    }

    // Формируем тело запроса для Bitrix API
    const requestBody = {
        key: apiKey,
        params: {
            NAME: body.name,
            EMAIL: body.email,
            PHONE: body.phone
        }
    }

    try {
        const response = await $fetch(`${apiUrl}?method=TeacherRequest&act=add`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                key: apiKey,
                'params[NAME]': body.name.trim(),
                'params[EMAIL]': body.email.trim(),
                'params[PHONE]': body.phone.trim()
            }).toString()
        })

        // Проверяем успешность ответа
        if (response.RESULT === 'OK' && response.ID) {
            return {
                result: 'OK',
                id: response.ID
            }
        }

        // Если ответ содержит ошибку, обрабатываем её
        if (response.ERROR) {
            throw new Error(response.ERROR)
        }

        throw new Error('Неверный формат ответа API')
    } catch (error) {
        console.error('Ошибка при отправке заявки:', error)

        // Обрабатываем возможные ошибки от Bitrix
        const errorMessage = error.message || 'Неизвестная ошибка'
        let userFriendlyMessage = 'Не удалось отправить заявку'

        // Переводим ошибки Bitrix в пользовательский вид
        switch (errorMessage) {
            case 'NAME_REQUIRED':
                userFriendlyMessage = 'Обязательное поле Имя'
                break
            case 'EMAIL_REQUIRED':
                userFriendlyMessage = 'Обязательное поле Email'
                break
            case 'PHONE_REQUIRED':
                userFriendlyMessage = 'Обязательное поле Телефон'
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
            error: 'Не удалось отправить заявку',
            details: userFriendlyMessage
        }
    }
})