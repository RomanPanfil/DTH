export default defineNuxtPlugin((nuxtApp) => {
    const authStore = useAuthStore()
    // console.log('Auth plugin initialized')
    authStore.initialize()
    // console.log('Auth store after initialize:', authStore.token)
})