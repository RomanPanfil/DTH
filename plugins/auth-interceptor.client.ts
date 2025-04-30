export default defineNuxtPlugin((nuxtApp) => {
    const authStore = useAuthStore()

    const apiFetch = $fetch.create({
        async onResponseError({ response, request }) {
            console.log('onResponseError triggered:', {
                url: request.url || request,
                status: response.status,
                statusText: response.statusText,
                responseData: response._data
            })

            if (request.url.includes('/api/auth/refresh')) {
                console.log('onResponseError: Skipping /api/auth/refresh')
                return
            }

            if (response.status === 401 && authStore.token) {
                try {
                    console.log('Interceptor: Attempting token refresh')
                    const refreshResponse = await $fetch('/api/auth/refresh', {
                        method: 'POST',
                        body: { token: authStore.token }
                    })
                    console.log('Interceptor: Refresh response:', refreshResponse)

                    if (refreshResponse.TOKEN && refreshResponse.EXPIRES) {
                        authStore.token = refreshResponse.TOKEN
                        authStore.expires = refreshResponse.EXPIRES

                        const requiresAuthHeader = [
                            'updateprofile',
                            'changepassword'
                        ].some(method => request.url?.includes(method))

                        if (requiresAuthHeader) {
                            return await $fetch(request, {
                                headers: {
                                    ...request.headers,
                                    Authorization: `Bearer ${refreshResponse.TOKEN}`
                                }
                            })
                        } else {
                            return await $fetch(request, {
                                body: {
                                    ...request.body,
                                    token: refreshResponse.TOKEN
                                }
                            })
                        }
                    }
                } catch (error) {
                    console.error('Interceptor: Error refreshing token:', {
                        message: error.message || 'No message',
                        status: error.status || 'N/A',
                        data: error.data || 'N/A'
                    })
                    authStore.logout()
                    if (process.client) {
                        const modalsStore = useModalsStore()
                        modalsStore.openModal('login')
                    }
                }
            }
        }
    })

    nuxtApp.provide('apiFetch', apiFetch)
})