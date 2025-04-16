// stores/locale.ts
import { defineStore } from 'pinia';

export const useLocaleStore = defineStore('locale', {
    state: () => ({
        currentLocale: 'RU', // По умолчанию RU
        availableLocales: ['RU', 'EN'], // Доступные языки (можно расширять)
    }),
    actions: {
        setLocale(locale: string) {
            if (this.availableLocales.includes(locale)) {
                this.currentLocale = locale;
            } else {
                console.warn(`Язык ${locale} не поддерживается`);
            }
        },
    },
    getters: {
        locale: (state) => state.currentLocale,
    },
});