import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event)
    const apiKey = config.private.bitrixApiKey
    const apiUrl = config.private.bitrixApiUrl

    const { token } = await readBody(event)
    // console.log('Refresh: Request received, token:', token)

    if (!token) {
        console.error('Refresh: Token missing')
        throw createError({
            statusCode: 401,
            statusMessage: 'Токен отсутствует'
        })
    }

    const requestBody = {
        key: apiKey,
        'params[TOKEN]': token
    }

    try {
        // console.log('Refresh: Sending request to Bitrix API:', apiUrl)
        const response = await $fetch(`${apiUrl}?method=refreshtoken&act=auth`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams(requestBody).toString()
        })

        // console.log('Refresh: Bitrix API response:', JSON.stringify(response, null, 2))

        if (response.TOKEN && response.EXPIRES) {
            const expiresDate = new Date(response.EXPIRES)
            if (isNaN(expiresDate.getTime())) {
                console.error('Refresh: Invalid EXPIRES format:', response.EXPIRES)
                throw new Error('Invalid EXPIRES format')
            }
            const formattedResponse = {
                TOKEN: response.TOKEN,
                EXPIRES: expiresDate.toISOString()
            }
            // console.log('Refresh: Formatted response:', formattedResponse)
            return formattedResponse
        }

        if (response.ERROR) {
            console.error('Refresh: Bitrix API error:', response.ERROR)
            throw new Error(response.ERROR)
        }

        console.error('Refresh: Invalid response format:', response)
        throw new Error('Неверный формат ответа API')
    } catch (error) {
        console.error('Refresh: Request failed:', {
            status: error.status || 'N/A',
            message: error.message || 'No message',
            data: error.data || 'N/A'
        })
        throw createError({
            statusCode: error.status || 401,
            statusMessage: error.message || 'Не удалось обновить токен',
            data: { error: error.message }
        })
    }
})