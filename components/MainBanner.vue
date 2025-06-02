<template>
    <div class="banner">
        <img
                v-if="banner"
                :src="imageBaseUrl + banner.image || '/images/placeholder.jpg'"
                :alt="banner.title"
                class="banner-image"
        />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const config = useRuntimeConfig();
const imageBaseUrl = config.public.imageBaseUrl;

// Загрузка данных баннера
const { data, error } = await useAsyncData('banners', async () => {
    try {
        const response = await $fetch('/api/banner', {
            query: {
                iblockId: 16,
                GET_ALL_FILES: 'Y',
            },
        });
        if (response.error) {
            throw new Error(response.details);
        }
        return response.banners || [];
    } catch (err) {
        console.error('Ошибка загрузки баннеров:', err);
        return [];
    }
});

// Извлечение первого баннера (так как роут возвращает только один баннер)
const banner = ref(data.value?.[0] ? {
    title: data.value[0].NAME || 'Без названия',
    image: data.value[0].PROPS.IMG_PC?.VALUE_PATH || '/images/placeholder.jpg',
} : null);

if (error.value) {
    console.error('MainBanner: Ошибка useAsyncData:', error.value);
}
</script>

<style scoped lang="scss">
.banner {
  border-radius: p2r(8);
  overflow: hidden;
  max-height: p2r(440);
    aspect-ratio: 390/440;

  &-image {
    width: 100%;
    height: auto;
    object-fit: cover;
  }
}
</style>