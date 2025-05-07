import { defineStore } from 'pinia'
import { useCookie } from '#app'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as { email: string, userId: number } | null,
        token: null as string | null,
        expires: null as string | null,
        isActivated: false as boolean,
        userProfile: null as any | null // Добавляем поле для профиля
    }),
    getters: {
        isAuthenticated: (state) => !!state.token
    },
    actions: {
        login(email: string, userId: number, token: string, expires: string) {
            console.log('Login called with:', { email, userId, token, expires })
            try {
                const expiresDate = new Date(expires)
                console.log('Login: Parsed expires:', { expires, expiresDate, isValid: !isNaN(expiresDate.getTime()) })
                if (isNaN(expiresDate.getTime())) {
                    console.error('Login: Invalid expires format:', expires)
                    return
                }

                this.user = { email, userId }
                this.token = token
                this.expires = expires

                if (process.client) {
                    const authToken = useCookie('auth_token', {
                        maxAge: 3600,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict'
                    })
                    authToken.value = token
                    console.log('Set auth_token cookie:', authToken.value)

                    const tokenExpires = useCookie('token_expires', {
                        maxAge: 3600,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict'
                    })
                    tokenExpires.value = expires
                    console.log('Set token_expires cookie:', tokenExpires.value)
                }
            } catch (error) {
                console.error('Login: Error setting cookies:', error)
            }
        },
        setActivationStatus(status: boolean) {
            this.isActivated = status
        },
        async logout() {
            try {
                if (this.token) {
                    await $apiFetch('/api/auth/logout', {
                        method: 'POST',
                        body: { token: this.token }
                    })
                }
            } catch (error) {
                console.error('Ошибка при выходе:', error)
            }

            this.user = null
            this.token = null
            this.expires = null
            this.isActivated = false
            this.userProfile = null // Очищаем профиль при выходе

            if (process.client) {
                const authToken = useCookie('auth_token')
                const tokenExpires = useCookie('token_expires')
                authToken.value = null
                tokenExpires.value = null
                console.log('Cookies cleared on client')
            }
        },
        initialize() {
            console.log('Initialize called, process.client:', process.client, 'Date.now:', Date.now())

            if (process.client) {
                const tryInitialize = (attempt = 1, maxAttempts = 5, delay = 200) => {
                    const authToken = useCookie('auth_token')
                    const tokenExpires = useCookie('token_expires')
                    console.log(`Attempt ${attempt}: useCookie values:`, {
                        authToken: authToken.value,
                        tokenExpires: tokenExpires.value
                    })

                    if (authToken.value && tokenExpires.value) {
                        try {
                            const expiresDate = new Date(tokenExpires.value)
                            const now = new Date()
                            console.log('Client: Expires check:', {
                                expiresDate,
                                now,
                                isValidDate: !isNaN(expiresDate.getTime()),
                                isValid: expiresDate > now
                            })

                            if (!isNaN(expiresDate.getTime()) && expiresDate > now) {
                                this.token = authToken.value
                                this.expires = tokenExpires.value
                                this.fetchProfile() // Загружаем профиль при инициализации
                                console.log('Client: Token loaded into store:', this.token, 'Expires:', this.expires)
                            } else {
                                console.log('Client: Token expired or invalid date, clearing cookies')
                                authToken.value = null
                                tokenExpires.value = null
                            }
                        } catch (error) {
                            console.error('Client: Error parsing token_expires:', error, 'token_expires value:', tokenExpires.value)
                            authToken.value = null
                            tokenExpires.value = null
                        }
                    } else {
                        console.log(`Attempt ${attempt}: No auth_token or token_expires in cookies`)
                        if (attempt < maxAttempts) {
                            console.log(`Scheduling retry in ${delay}ms`)
                            setTimeout(() => tryInitialize(attempt + 1, maxAttempts, delay), delay)
                        } else {
                            console.log('Max attempts reached, no valid cookies found')
                        }
                    }
                }

                tryInitialize()
            } else {
                console.log('Initialize skipped: not client context')
            }
        },
        async refreshToken() {
            console.log('refreshToken: Starting with token:', this.token)
            if (!this.token) {
                console.error('refreshToken: No token provided, aborting')
                this.logout()
                if (process.client) {
                    const modalsStore = useModalsStore()
                    modalsStore.openModal('login')
                }
                return
            }

            try {
                console.log('refreshToken: Sending request to /api/auth/refresh with token:', this.token)
                const response = await $fetch('/api/auth/refresh', {
                    method: 'POST',
                    body: { token: this.token }
                })
                console.log('refreshToken: Received response:', JSON.stringify(response, null, 2))

                if (response && response.TOKEN && response.EXPIRES) {
                    try {
                        const expiresDate = new Date(response.EXPIRES)
                        console.log('refreshToken: Parsed EXPIRES:', {
                            raw: response.EXPIRES,
                            parsed: expiresDate,
                            isValid: !isNaN(expiresDate.getTime())
                        })
                        if (isNaN(expiresDate.getTime())) {
                            throw new Error('Invalid EXPIRES format')
                        }

                        const isoExpires = expiresDate.toISOString()
                        this.token = response.TOKEN
                        this.expires = isoExpires

                        if (process.client) {
                            const authToken = useCookie('auth_token', {
                                maxAge: 3600,
                                secure: process.env.NODE_ENV === 'production',
                                sameSite: 'strict'
                            })
                            authToken.value = response.TOKEN
                            console.log('refreshToken: Updated auth_token cookie:', authToken.value)

                            const tokenExpires = useCookie('token_expires', {
                                maxAge: 3600,
                                secure: process.env.NODE_ENV === 'production',
                                sameSite: 'strict'
                            })
                            tokenExpires.value = isoExpires
                            console.log('refreshToken: Updated token_expires cookie:', isoExpires)
                        }
                    } catch (error) {
                        console.error('refreshToken: Error processing response:', {
                            message: error.message,
                            response
                        })
                        throw error
                    }
                } else {
                    console.error('refreshToken: Invalid response format:', response)
                    throw new Error('Invalid response format: missing TOKEN or EXPIRES')
                }
            } catch (error) {
                console.error('refreshToken: Request failed:', {
                    message: error.message || 'No message',
                    status: error.status || 'N/A',
                    data: error.data || 'N/A',
                    cause: error.cause || 'N/A',
                    stack: error.stack || 'N/A'
                })
                this.logout()
                if (process.client) {
                    const modalsStore = useModalsStore()
                    modalsStore.openModal('login')
                }
            } finally {
                console.log('refreshToken: Completed, current store state:', {
                    token: this.token,
                    expires: this.expires
                })
            }
        },
        async fetchProfile() {
            if (!this.token) {
                console.error('fetchProfile: No token available')
                return
            }

            try {
                console.log('fetchProfile: Sending request to /api/auth/profile with token:', this.token)
                const response = await $fetch('/api/auth/profile', {
                    method: 'POST',
                    body: { token: this.token }
                })
                console.log('fetchProfile: Received response:', JSON.stringify(response, null, 2))
                this.userProfile = response
            } catch (error) {
                console.error('fetchProfile: Request failed:', {
                    message: error.message,
                    status: error.status,
                    data: error.data
                })
                if (error.data?.error === 'ERROR_INVALID_TOKEN') {
                    this.logout()
                }
            }
        },
        updateProfile(profileData: any) {
            this.userProfile = { ...this.userProfile, ...profileData }
        }
    }
})