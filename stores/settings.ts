import { defineStore } from 'pinia';
import { ref } from 'vue';

export const useSettingsStore = defineStore('settings', () => {
    // State
    const settings = ref<Record<string, any> | null>(null);
    const error = ref<string | null>(null);
    const isLoading = ref(false);

    // Actions
    async function fetchSettings() {
        if (settings.value) return; // Skip if settings already loaded

        isLoading.value = true;
        try {
            const response = await $fetch('/api/settings', {
                method: 'POST',
                body: {},
            });
            settings.value = response as Record<string, any>;
            error.value = null;
        } catch (err) {
            console.error('Failed to fetch settings:', err);
            error.value = err.message || 'Failed to load settings';
        } finally {
            isLoading.value = false;
        }
    }

    // Getters
    function getSetting(key: string, locale: string = 'RU') {
        if (!settings.value) return '';
        const localeSuffix = locale.toUpperCase();
        return settings.value[key]?.[`VALUE_${localeSuffix}`] || settings.value[key]?.VALUE || '';
    }

    return {
        settings,
        error,
        isLoading,
        fetchSettings,
        getSetting,
    };
});