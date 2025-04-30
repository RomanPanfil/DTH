// import { defineNuxtPlugin } from '#app'
// import { configure, defineRule } from 'vee-validate'
// import { localize } from '@vee-validate/i18n'
// import { required, email, min, regex, confirmed } from '@vee-validate/rules'
//
// export default defineNuxtPlugin((nuxtApp) => {
//     // Регистрация встроенных правил
//     defineRule('required', required)
//     defineRule('email', email)
//     defineRule('min', min)
//     defineRule('regex', regex)
//     defineRule('confirmed', confirmed)
//
//     // Кастомное правило для проверки только букв и пробелов
//     defineRule('onlyLetters', (value: string) => {
//         if (!/^[a-zA-Zа-яА-Я\s]+$/.test(value)) {
//             return nuxtApp.vueApp.config.globalProperties.$t('errors.onlyLetters')
//         }
//         return true
//     })
//
//     // Кастомное правило для проверки пароля (буквы и цифры)
//     // defineRule('passwordRequirements', (value: string) => {
//     //     if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
//     //         return nuxtApp.vueApp.config.globalProperties.$t('errors.passwordRequirements')
//     //     }
//     //     return true
//     // })
//
//     // Настройка локализации
//     configure({
//         generateMessage: localize({
//             en: {
//                 messages: {
//                     required: 'This field is required',
//                     email: 'Invalid email format',
//                     min: 'Must be at least {length} characters',
//                     onlyLetters: 'Only letters and spaces are allowed',
//                     passwordRequirements: 'Password must contain letters and numbers',
//                     confirmed: 'Passwords do not match'
//                 }
//             },
//             ru: {
//                 messages: {
//                     required: 'Поле обязательно для заполнения',
//                     email: 'Неверный формат email',
//                     min: 'Минимальная длина: {length} символов',
//                     onlyLetters: 'Допустимы только буквы и пробелы',
//                     passwordRequirements: 'Пароль должен содержать буквы и цифры',
//                     confirmed: 'Пароли не совпадают'
//                 }
//             }
//         })
//     })
//
//     // Установка языка по умолчанию
//     configure({
//         generateMessage: (ctx) => {
//             console.log('VeeValidate Rule:', ctx.rule.name, 'Params:', ctx.rule.params)
//             const messages = {
//                 en: {
//                     required: 'This field is required',
//                     email: 'Invalid email format',
//                     min: `Must be at least ${ctx.rule.params.length || ctx.rule.params} characters`,
//                     onlyLetters: 'Only letters and spaces are allowed',
//                     confirmed: 'Passwords do not match'
//                 },
//                 ru: {
//                     required: 'Поле обязательно для заполнения',
//                     email: 'Неверный формат email',
//                     min: `Минимальная длина: ${ctx.rule.params.length || ctx.rule.params} символов`,
//                     onlyLetters: 'Допустимы только буквы и пробелы',
//                     confirmed: 'Пароли не совпадают'
//                 }
//             }
//             const lang = 'ru' // Можно синхронизировать с i18n: nuxtApp.$i18n.locale
//             return messages[lang][ctx.rule.name] || 'Invalid field'
//         }
//     })
// })


import { defineNuxtPlugin } from '#app'
import { configure, defineRule } from 'vee-validate'
import { localize } from '@vee-validate/i18n'
import { required, email, min, regex, confirmed } from '@vee-validate/rules'

export default defineNuxtPlugin((nuxtApp) => {
    // Регистрация встроенных правил
    defineRule('required', required)
    defineRule('email', email)
    defineRule('min', min)
    defineRule('regex', regex)
    defineRule('confirmed', confirmed)

    // Кастомное правило для проверки только букв и пробелов
    defineRule('onlyLetters', (value: string) => {
        if (!/^[a-zA-Zа-яА-Я\s]+$/.test(value)) {
            return nuxtApp.vueApp.config.globalProperties.$t('errors.onlyLetters')
        }
        return true
    })

        // Кастомное правило для проверки пароля (буквы и цифры)
    // defineRule('passwordRequirements', (value: string) => {
    //     if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
    //         return nuxtApp.vueApp.config.globalProperties.$t('errors.passwordRequirements')
    //     }
    //     return true
    // })

    // Настройка локализации
    configure({
        generateMessage: localize({
            en: {
                messages: {
                    required: 'This field is required',
                    email: 'Invalid email format',
                    min: 'Must be at least {length} characters',
                    onlyLetters: 'Only letters and spaces are allowed',
                    confirmed: 'Passwords do not match'
                }
            },
            ru: {
                messages: {
                    required: 'Поле обязательно для заполнения',
                    email: 'Неверный формат email',
                    min: 'Минимальная длина: {length} символов',
                    onlyLetters: 'Допустимы только буквы и пробелы',
                    confirmed: 'Пароли не совпадают'
                }
            }
        })
    })

    // Кастомная обработка сообщений для корректной подстановки length
    configure({
        generateMessage: (ctx) => {
            // Извлекаем length из params
            let length
            if (Array.isArray(ctx.rule.params)) {
                length = parseInt(ctx.rule.params[0], 10) // Для ['6'] берём первый элемент
            } else if (typeof ctx.rule.params === 'object' && ctx.rule.params.length) {
                length = ctx.rule.params.length
            } else {
                length = ctx.rule.params
            }

            const messages = {
                en: {
                    required: 'This field is required',
                    email: 'Invalid email format',
                    min: `Must be at least ${length} characters`,
                    onlyLetters: 'Only letters and spaces are allowed',
                    confirmed: 'Passwords do not match'
                },
                ru: {
                    required: 'Поле обязательно для заполнения',
                    email: 'Неверный формат email',
                    min: `Минимальная длина: ${length} символов`,
                    onlyLetters: 'Допустимы только буквы и пробелы',
                    confirmed: 'Пароли не совпадают'
                }
            }
            const lang = 'ru' // Можно синхронизировать с i18n: nuxtApp.$i18n.locale
            return messages[lang][ctx.rule.name] || 'Invalid field'
        }
    })
})