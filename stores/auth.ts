import { defineStore } from 'pinia'
import { useCookie } from '#app'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null as { email: string, userId: number } | null,
        token: null as string | null,
        isActivated: false as boolean
    }),
    actions: {
        login(email: string, userId: number, token: string) {
            this.user = { email, userId }
            this.token = token
            if (process.client) {
                const authToken = useCookie('auth_token', {
                    maxAge: 1800
                })
                authToken.value = token
            }
        },
        setActivationStatus(status: boolean) {
            this.isActivated = status
        },
        logout() {
            this.user = null
            this.token = null
            this.isActivated = false
            if (process.client) {
                const authToken = useCookie('auth_token')
                authToken.value = null
            }
        },
        initialize() {
            if (process.client) {
                const authToken = useCookie('auth_token')
                if (authToken.value) {
                    this.token = authToken.value
                }
            }
        }
    }
})