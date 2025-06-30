import { defineStore } from 'pinia'
import { useCookie } from '#app'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as { email: string, userId: number } | null,
        token: null as string | null,
        expires: null as string | null,
        isActivated: false as boolean,
        userProfile: null as any | null,
        favorites: [] as number[] // Поле для списка избранного
    }),
    getters: {
        isAuthenticated: (state) => !!state.token
    },
    actions: {
        login(email: string, userId: number, token: string, expires: string) {
            // console.log('Login called with:', { email, userId, token, expires })
            try {
                const expiresDate = new Date(expires)
                if (isNaN(expiresDate.getTime())) {
                    console.error('Login: Invalid expires format:', expires)
                    return
                }

                this.user = { email, userId }
                this.token = token
                this.expires = expires
                this.fetchProfile() // Загружаем профиль и избранное при входе

                if (process.client) {
                    const authToken = useCookie('auth_token', {
                        maxAge: 3600,
                        // secure: process.env.NODE_ENV === 'production', // Раскомментировать на проде
                        secure: false, // Закомментировать на проде
                        sameSite: 'strict'
                    })
                    authToken.value = token

                    const tokenExpires = useCookie('token_expires', {
                        maxAge: 3600,
                        // secure: process.env.NODE_ENV === 'production', // Раскомментировать на проде
                        secure: false, // Закомментировать на проде
                        sameSite: 'strict'
                    })
                    tokenExpires.value = expires
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
                    await $fetch('/api/auth/logout', {
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
            this.userProfile = null
            this.favorites = [] // Очищаем избранное при выходе

            if (process.client) {
                const authToken = useCookie('auth_token')
                const tokenExpires = useCookie('token_expires')
                authToken.value = null
                tokenExpires.value = null
            }
        },
        initialize() {
            if (process.client) {
                const tryInitialize = (attempt = 1, maxAttempts = 5, delay = 200) => {
                    const authToken = useCookie('auth_token')
                    const tokenExpires = useCookie('token_expires')

                    if (authToken.value && tokenExpires.value) {
                        try {
                            const expiresDate = new Date(tokenExpires.value)
                            const now = new Date()
                            if (!isNaN(expiresDate.getTime()) && expiresDate > now) {
                                this.token = authToken.value
                                this.expires = tokenExpires.value
                                this.fetchProfile() // Загружаем профиль и избранное при инициализации
                            } else {
                                authToken.value = null
                                tokenExpires.value = null
                            }
                        } catch (error) {
                            console.error('Client: Error parsing token_expires:', error)
                            authToken.value = null
                            tokenExpires.value = null
                        }
                    } else if (attempt < maxAttempts) {
                        setTimeout(() => tryInitialize(attempt + 1, maxAttempts, delay), delay)
                    }
                }
                tryInitialize()
            }
        },
        async refreshToken() {
            if (!this.token) {
                this.logout()
                if (process.client) {
                    const modalsStore = useModalsStore()
                    modalsStore.openModal('login')
                }
                return
            }

            try {
                const response = await $fetch('/api/auth/refresh', {
                    method: 'POST',
                    body: { token: this.token }
                })

                if (response && response.TOKEN && response.EXPIRES) {
                    const expiresDate = new Date(response.EXPIRES)
                    if (isNaN(expiresDate.getTime())) {
                        throw new Error('Invalid EXPIRES format')
                    }

                    const isoExpires = expiresDate.toISOString()
                    this.token = response.TOKEN
                    this.expires = isoExpires

                    if (process.client) {
                        const authToken = useCookie('auth_token', {
                            maxAge: 3600,
                            // secure: process.env.NODE_ENV === 'production', // Раскомментировать на проде
                            secure: false, // Закомментировать на проде
                            sameSite: 'strict'
                        })
                        authToken.value = response.TOKEN

                        const tokenExpires = useCookie('token_expires', {
                            maxAge: 3600,
                            // secure: process.env.NODE_ENV === 'production', // Раскомментировать на проде
                            secure: false, // Закомментировать на проде
                            sameSite: 'strict'
                        })
                        tokenExpires.value = isoExpires
                    }
                    this.fetchProfile() // Обновляем профиль и избранное после обновления токена
                } else {
                    throw new Error('Invalid response format: missing TOKEN or EXPIRES')
                }
            } catch (error) {
                console.error('refreshToken: Request failed:', error)
                this.logout()
                if (process.client) {
                    const modalsStore = useModalsStore()
                    modalsStore.openModal('login')
                }
            }
        },
        async fetchProfile() {
            if (!this.token) {
                console.error('fetchProfile: No token available')
                return
            }

            try {
                const response = await $fetch('/api/auth/profile', {
                    method: 'POST',
                    body: { token: this.token }
                })
                this.userProfile = response
                this.favorites = response.FAVORITES ? response.FAVORITES.map(Number) : [] // Преобразуем в числа
            } catch (error) {
                console.error('fetchProfile: Request failed:', error)
                if (error.data?.data?.error === 'Неверный или истекший токен') {
                    this.logout()
                }
                if (error.data?.error === 'ERROR_INVALID_TOKEN') {
                    this.logout()
                }
                this.favorites = [] // Очищаем избранное при ошибке
            }
        },
        updateProfile(profileData: any) {
            this.userProfile = { ...this.userProfile, ...profileData }
        },
        addFavorite(id: number) {
            if (!this.favorites.includes(id)) {
                this.favorites.push(id)
            }
        },
        removeFavorite(id: number) {
            this.favorites = this.favorites.filter(favId => favId !== id)
        }
    }
})