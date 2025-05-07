<template>
    <div class="slider">
        <div class="slider-cards">
            <Swiper
                :modules="modules"
                :slides-per-view="1"
                :space-between="0"
                :loop="true"
                :autoplay="{ delay: 5000, disableOnInteraction: false }"
                :pagination="{ clickable: true, el: '.swiper-pagination' }"
                class="slider-swiper"
            >
                <SwiperSlide v-for="webinar in webinars" :key="webinar.ID">
                    <div class="slider-card">
                        <!-- Фоновое изображение -->
                        <img
                            :src="imageBaseUrl + webinar.image || '/images/placeholder.jpg'"
                            :alt="webinar.title"
                            class="slider-card-image"
                        />
                        <!-- Вставка HTML-кода, если он есть -->
                        <div v-if="webinar.hasHtmlCode" class="slider-card-content" v-html="getDecodedHTML(webinar.htmlContent)"></div>
                    </div>
                </SwiperSlide>
                <div class="swiper-pagination"></div>
            </Swiper>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const config = useRuntimeConfig();
const imageBaseUrl = config.public.imageBaseUrl;

// Регистрация модулей Swiper
const modules = [Autoplay, Pagination];

// Загрузка данных слайдов
const { data, error } = await useAsyncData('mainSlider', async () => {
    try {
        const response = await $fetch('/api/slider', {
            query: {
                iblockId: 14,
                GET_ALL_FILES: 'Y',
            },
        });
        if (response.error) {
            throw new Error(response.details);
        }
        return response.slides || [];
    } catch (err) {
        console.error('Ошибка загрузки слайдов:', err);
        return [];
    }
});

// Преобразование данных в формат вебинаров
const webinars = ref(data.value?.map(slide => {
    const htmlCode = slide.PROPS.HTML_CODE?.VALUE?.TEXT;
    return {
        ID: slide.ID,
        title: slide.NAME || 'Без названия',
        image: slide.PROPS.IMG_PC?.VALUE_PATH || '/images/placeholder.jpg',
        link: slide.PROPS.LINK?.VALUE || '/',
        hasHtmlCode: !!htmlCode,
        htmlContent: htmlCode || '',
    };
}) || []);

if (error.value) {
    console.error('MainSlider: Ошибка useAsyncData:', error.value);
}

// Универсальная функция для декодирования HTML-сущностей
function decodeHTML(text) {
    if (!text) return '';

    const entities = {
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&amp;': '&',
        '&nbsp;': ' '
    };

    // Заменяем экранированные HTML-сущности
    let decodedText = text.replace(/&lt;|&gt;|&quot;|&amp;|&nbsp;/g, match => entities[match]);

    // Заменяем управляющие символы \r\n на пробелы
    decodedText = decodedText.replace(/\r\n/g, ' ');

    // Корректируем пути к изображениям, добавляя baseUrl
    decodedText = decodedText.replace(/<img\s+[^>]*src="([^"]+)"[^>]*>/gi, (match, src) => {
        if (src.startsWith('/upload')) {
            return match.replace(src, `${baseUrl}${src}`);
        }
        return match;
    });

    return decodedText;
}

// Вспомогательная функция для использования в шаблоне
const getDecodedHTML = (text) => {
    return decodeHTML(text);
};
</script>

<style scoped lang="scss">
.slider {
    position: relative;

    &-cards {
        position: relative;
    }

    &-card {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        overflow: hidden;
        min-height: p2r(440);
        border-radius: p2r(8);
        background-color: $primary;

        &-image {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            z-index: 1;
            width: 100%;
            height: 100%;
            object-fit: cover;
            object-position: center;
        }

        &-content:deep() {
            position: relative;
            z-index: 2;
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding-left: p2r(115);
            color: $font-white;
            width: 60%;

            h2 {
                text-transform: uppercase;
            }

            h2, h3,h4,h5, h6 {
                color: $font-white;
            }
        }
    }
}

.slider-swiper {
    width: 100%;
    height: 100%;
}

.swiper-slide {
    height: auto;
}

/* Стили для пагинации с использованием :deep() */
:deep(.swiper-pagination) {
    //position: absolute;
    bottom: p2r(50);
    left: 50%;
    z-index: 2;
    display: flex;
    gap: p2r(2);
}

:deep(.swiper-pagination-bullet) {
    width: p2r(8);
    height: p2r(8);
    background: #D9F0E8;
    border-radius: p2r(8);
    cursor: pointer;
    opacity: 1;
    transition: opacity 0.3s ease;
}

:deep(.swiper-pagination-bullet-active) {
    background-color: $primary;
    width: p2r(48);
}
</style>