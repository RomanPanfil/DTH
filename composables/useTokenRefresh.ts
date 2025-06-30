// import { useAuthStore } from '~/stores/auth'
//
// export function useTokenRefresh() {
//     const authStore = useAuthStore()
//     let timeout: NodeJS.Timeout | null = null
//
//     const scheduleTokenRefresh = () => {
//         if (timeout) clearTimeout(timeout)
//
//         console.log('scheduleTokenRefresh: Checking token and expires:', {
//             token: authStore.token,
//             expires: authStore.expires
//         })
//
//         if (authStore.expires && authStore.token) {
//             try {
//                 const expiresDate = new Date(authStore.expires)
//                 const now = new Date()
//                 console.log('scheduleTokenRefresh: Parsed expires:', {
//                     raw: authStore.expires,
//                     parsed: expiresDate,
//                     isValid: !isNaN(expiresDate.getTime())
//                 })
//
//                 if (isNaN(expiresDate.getTime())) {
//                     console.error('scheduleTokenRefresh: Invalid expires format, aborting')
//                     return
//                 }
//
//                 const timeLeft = expiresDate.getTime() - now.getTime()
//                 const refreshTime = timeLeft - 30 * 60 * 1000 // Обновление за 30 минут
//                 console.log('Scheduling token refresh:', { timeLeft, refreshTime, expiresDate, now })
//
//                 if (refreshTime > 0) {
//                     timeout = setTimeout(async () => {
//                         console.log('Refreshing token...')
//                         await authStore.refreshToken()
//                         scheduleTokenRefresh()
//                     }, refreshTime)
//                 } else {
//                     console.log('Token nearly expired, refreshing immediately')
//                     authStore.refreshToken().then(() => scheduleTokenRefresh())
//                 }
//             } catch (error) {
//                 console.error('scheduleTokenRefresh: Error parsing expires:', {
//                     message: error.message,
//                     expires: authStore.expires
//                 })
//             }
//         } else {
//             console.log('No token or expires, skipping refresh')
//         }
//     }
//
//     onMounted(() => {
//         console.log('useTokenRefresh mounted, checking authStore:', {
//             token: authStore.token,
//             expires: authStore.expires
//         })
//         if (authStore.token && authStore.expires) {
//             console.log('useTokenRefresh mounted, starting refresh')
//             scheduleTokenRefresh()
//         }
//     })
//
//     onUnmounted(() => {
//         if (timeout) {
//             clearTimeout(timeout)
//             console.log('useTokenRefresh unmounted, cleared timeout')
//         }
//     })
//
//     watch([() => authStore.token, () => authStore.expires], () => {
//         console.log('Token or expires changed:', {
//             token: authStore.token,
//             expires: authStore.expires
//         })
//         if (authStore.token && authStore.expires) {
//             console.log('Token or expires changed, rescheduling refresh')
//             scheduleTokenRefresh()
//         }
//     })
// }


import { useAuthStore } from '~/stores/auth'

export function useTokenRefresh(options?: {
    customInterval?: number // интервал в минутах
    forceInterval?: boolean // принудительно использовать интервал вместо логики за 30 минут до истечения
}) {
    const authStore = useAuthStore()
    let timeout: NodeJS.Timeout | null = null

    // Дефолтные значения
    const defaultRefreshBeforeExpiry = 30 * 60 * 1000 // 30 минут до истечения
    const customIntervalMs = options?.customInterval ? options.customInterval * 60 * 1000 : null

    const scheduleTokenRefresh = () => {
        if (timeout) clearTimeout(timeout)

        // console.log('scheduleTokenRefresh: Checking token and expires:', {
        //     token: authStore.token,
        //     expires: authStore.expires,
        //     customInterval: options?.customInterval,
        //     forceInterval: options?.forceInterval
        // })

        if (authStore.expires && authStore.token) {
            try {
                const expiresDate = new Date(authStore.expires)
                const now = new Date()

                // console.log('scheduleTokenRefresh: Parsed expires:', {
                //     raw: authStore.expires,
                //     parsed: expiresDate,
                //     isValid: !isNaN(expiresDate.getTime())
                // })

                if (isNaN(expiresDate.getTime())) {
                    console.error('scheduleTokenRefresh: Invalid expires format, aborting')
                    return
                }

                let refreshTime: number

                if (options?.forceInterval && customIntervalMs) {
                    // Принудительно использовать кастомный интервал
                    refreshTime = customIntervalMs
                    // console.log('Using forced custom interval:', { intervalMinutes: options.customInterval })
                } else {
                    // Стандартная логика: обновление за 30 минут до истечения
                    const timeLeft = expiresDate.getTime() - now.getTime()
                    refreshTime = timeLeft - defaultRefreshBeforeExpiry

                    // Если есть кастомный интервал и он меньше стандартного времени до обновления
                    if (customIntervalMs && customIntervalMs < refreshTime) {
                        refreshTime = customIntervalMs
                        // console.log('Using custom interval (shorter than default):', { intervalMinutes: options.customInterval })
                    }
                }

                // console.log('Scheduling token refresh:', {
                //     refreshTime,
                //     refreshTimeMinutes: refreshTime / (60 * 1000),
                //     expiresDate,
                //     now
                // })

                if (refreshTime > 0) {
                    timeout = setTimeout(async () => {
                        // console.log('Refreshing token...')
                        await authStore.refreshToken()
                        scheduleTokenRefresh()
                    }, refreshTime)
                } else {
                    // console.log('Token nearly expired, refreshing immediately')
                    authStore.refreshToken().then(() => scheduleTokenRefresh())
                }
            } catch (error) {
                console.error('scheduleTokenRefresh: Error parsing expires:', {
                    message: error.message,
                    expires: authStore.expires
                })
            }
        } else {
            // console.log('No token or expires, skipping refresh')
        }
    }

    onMounted(() => {
        // console.log('useTokenRefresh mounted, checking authStore:', {
        //     token: authStore.token,
        //     expires: authStore.expires,
        //     options
        // })

        if (authStore.token && authStore.expires) {
            // console.log('useTokenRefresh mounted, starting refresh')
            scheduleTokenRefresh()
        }
    })

    onUnmounted(() => {
        if (timeout) {
            clearTimeout(timeout)
            console.log('useTokenRefresh unmounted, cleared timeout')
        }
    })

    watch([() => authStore.token, () => authStore.expires], () => {
        // console.log('Token or expires changed:', {
        //     token: authStore.token,
        //     expires: authStore.expires
        // })

        if (authStore.token && authStore.expires) {
            // console.log('Token or expires changed, rescheduling refresh')
            scheduleTokenRefresh()
        }
    })
}