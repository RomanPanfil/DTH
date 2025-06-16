// Список полученных сертификатов
import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const apiKey = config.private.bitrixApiKey
    const apiUrl = config.private.bitrixApiUrl

    const body = await readBody(event)

    // Проверка обязательного параметра TOKEN
    if (!body || typeof body !== 'object' || !body.params || !body.params.TOKEN || typeof body.params.TOKEN !== 'string' || !body.params.TOKEN.trim()) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Токен обязателен и должен быть непустой строкой'
        })
    }

    const { TOKEN, sort, resize, select, pager } = body.params

    // Валидация и настройка параметров
    const validatedSort = sort && typeof sort === 'object' ? sort : { ACTIVE_FROM: 'DESC' }
    const validatedResize = resize && Array.isArray(resize) && resize.length >= 2 ? resize : null
    const validatedSelect = select && Array.isArray(select) ? select : ['NAME', 'IBLOCK_ID', 'ID', 'PROPERTY_*']
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

    // Формирование тела запроса
    const requestBody = {
        key: apiKey,
        'params[TOKEN]': TOKEN.trim()
    }

    // Добавление сортировки
    if (validatedSort) {
        Object.entries(validatedSort).forEach(([field, order], index) => {
            requestBody[`params[sort][${field}]`] = order
        })
    }

    // Добавление ресайза для общих картинок
    if (validatedResize) {
        requestBody['params[resize][0]'] = validatedResize[0].toString()
        requestBody['params[resize][1]'] = validatedResize[1].toString()
        requestBody['params[resize][2]'] = validatedResize[2] ? '1' : '0'
    }

    // Добавление специфичных ресайзов (resize_<PROPERTY_CODE>)
    if (body.params && typeof body.params === 'object') {
        Object.keys(body.params).forEach(key => {
            if (key.startsWith('resize_') && Array.isArray(body.params[key]) && body.params[key].length >= 2) {
                const propertyCode = key.replace('resize_', '')
                body.params[key].forEach((value, index) => {
                    requestBody[`params[${key}][${index}]`] = value.toString()
                })
            }
        })
    }

    // Добавление выборки полей
    if (validatedSelect) {
        validatedSelect.forEach((field, index) => {
            requestBody[`params[select][${index}]`] = field
        })
    }

    // Добавление пагинации
    if (validatedPager) {
        requestBody['params[pager][start]'] = validatedPager.start.toString()
        requestBody['params[pager][limit]'] = validatedPager.limit.toString()
    }

    try {
        const response = await $fetch(`${apiUrl}?method=getusersertificates&act=auth`, {
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
                PAGENAV: response.RESULT.PAGENAV || null
            }
        }

        if (response.ERROR) {
            throw new Error(response.ERROR)
        }

        throw new Error('Неверный формат ответа API')
    } catch (error) {
        console.error('Ошибка при получении сертификатов:', error)
        const errorMessage = error.message || 'Неизвестная ошибка'
        let userFriendlyMessage = 'Ошибка при получении сертификатов'
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