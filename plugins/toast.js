import { defineNuxtPlugin } from '#app'
import Toast from '~/components/Toast.vue'

export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.vueApp.component('Toast', Toast)

    let toastInstance = null

    const setToastInstance = (instance) => {
        toastInstance = instance
    }

    // Функции для вызова уведомлений
    const toast = {
        success: (message, options = {}) => {
            toastInstance?.addToast(message, 'success', options.duration ?? 3000, options.showClose ?? true)
        },
        error: (message, options = {}) => {
            toastInstance?.addToast(message, 'error', options.duration ?? 3000, options.showClose ?? true)
        },
        warning: (message, options = {}) => {
            toastInstance?.addToast(message, 'warning', options.duration ?? 3000, options.showClose ?? true)
        },
        info: (message, options = {}) => {
            toastInstance?.addToast(message, 'info', options.duration ?? 3000, options.showClose ?? true)
        }
    }

    nuxtApp.provide('toast', toast)

    nuxtApp.provide('setToastInstance', setToastInstance)
})

// ----------------- примеры использования начало -----------------
// const showSuccess = () => {
//     $toast.success('Успешное действие!')
// }
//
// const showError = () => {
//     $toast.error('Произошла ошибка!', { duration: 4000 })
// }
//
// const showWarning = () => {
//     $toast.warning('Осторожно, предупреждение!', { duration: 3000, showClose: false })
// }
//
// const showInfo = () => {
//     $toast.info('Это информационное сообщение', { duration: 5000 })
// }
// ---------------- примеры использования конец ----------------