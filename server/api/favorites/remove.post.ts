// удаление из избранного

import { defineEventHandler, readBody, createError } from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const apiKey = config.private.bitrixApiKey
    const apiUrl = config.private.bitrixApiUrl

    const { token, itemId } = await readBody(event)
    // console.log('Remove from favorites request:', { itemId })

    if (!token || !itemId) {
        throw createError({
            statusCode: 400,
            statusMessage: 'Токен и ID элемента обязательны'
        })
    }

    if (!Number.isInteger(Number(itemId))) {
        throw createError({
            statusCode: 400,
            statusMessage: 'ID элемента должен быть целым числом'
        })
    }

    const requestBody = {
        key: apiKey,
        'params[TOKEN]': token.trim(),
        'params[ID]': itemId
    }

    try {
        const response = await $fetch(`${apiUrl}?method=removefavorite&act=auth`, {
            method: 'POST',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(requestBody).toString()
        })

        // console.log('Bitrix API response (remove favorite):', JSON.stringify(response, null, 2))

        if (response.MESSAGE === 'FAVORITE_REMOVED_SUCCESSFULLY') {
            return {
                message: 'Элемент успешно удален из избранного'
            }
        }

        if (response.ERROR) {
            throw new Error(response.ERROR)
        }

        throw new Error('Неверный формат ответа API')
    } catch (error) {
        console.error('Ошибка при удалении из избранного:', error)
        const errorMessage = error.message || 'Неизвестная ошибка'
        let userFriendlyMessage = 'Ошибка при удалении из избранного'

        switch (errorMessage) {
            case 'ERROR_INVALID_TOKEN':
                userFriendlyMessage = 'Неверный или истекший токен'
                break
            case 'ERROR_INVALID_ITEM_ID':
                userFriendlyMessage = 'Неверный идентификатор элемента'
                break
            case 'ERROR_ITEM_NOT_FAVORITE':
                userFriendlyMessage = 'Элемент не находится в избранном'
                break
            case 'ERROR_USER_NOT_FOUND':
                userFriendlyMessage = 'Пользователь не найден'
                break
            case 'ERROR_INVALID_PARAMS':
                userFriendlyMessage = 'Неверный формат параметров'
                break
            default:
                userFriendlyMessage = errorMessage
        }

        throw createError({
            statusCode: errorMessage === 'ERROR_INVALID_ITEM_ID' || errorMessage === 'ERROR_INVALID_PARAMS' ? 400 : 401,
            statusMessage: userFriendlyMessage,
            data: { error: errorMessage }
        })
    }
})