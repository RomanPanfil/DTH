// @ts-ignore
import { createI18n } from 'vue-i18n';
import ru from '../locales/ru.json';
import en from '../locales/en.json';

export default defineNuxtPlugin(({ vueApp }) => {
    const i18n = createI18n({
        legacy: false,
        globalInjection: true,
        locale: 'ru', // Язык по умолчанию
        fallbackLocale: 'ru', // Запасной язык
        messages: {
            ru,
            en
        }
    });

    vueApp.use(i18n);
});