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
                        <picture>
                            <source
                                :srcset="imageBaseUrl + webinar.imageMobile"
                                media="(max-width: 599px)"
                                v-if="webinar.imageMobile"
                            />
                            <source
                                :srcset="imageBaseUrl + webinar.imageTablet"
                                media="(min-width: 600px) and (max-width: 1023px)"
                                v-if="webinar.imageTablet"
                            />
                            <source
                                :srcset="imageBaseUrl + webinar.imagePC"
                                media="(min-width: 1024px)"
                                v-if="webinar.imagePC"
                            />
                            <img
                                :src="imageBaseUrl + webinar.imagePC || '/images/placeholder.jpg'"
                                :alt="webinar.title"
                                class="slider-card-image"
                            />
                        </picture>
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

const modules = [Autoplay, Pagination];

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

const webinars = ref(data.value?.map(slide => {
    const htmlCode = slide.PROPS.HTML_CODE?.VALUE?.TEXT;
    return {
        ID: slide.ID,
        title: slide.NAME || 'Без названия',
        imagePC: slide.PROPS.IMG_PC?.VALUE_PATH || '/images/placeholder.jpg',
        imageTablet: slide.PROPS.IMG_TABLET?.VALUE_PATH || slide.PROPS.IMG_PC?.VALUE_PATH || '/images/placeholder.jpg',
        imageMobile: slide.PROPS.IMG_MOBILE?.VALUE_PATH || slide.PROPS.IMG_TABLET?.VALUE_PATH || slide.PROPS.IMG_PC?.VALUE_PATH || '/images/placeholder.jpg',
        link: slide.PROPS.LINK?.VALUE || '/',
        hasHtmlCode: !!htmlCode,
        htmlContent: htmlCode || '',
    };
}) || []);

if (error.value) {
    console.error('MainSlider: Ошибка useAsyncData:', error.value);
}

function decodeHTML(text) {
    if (!text) return '';

    const entities = {
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&amp;': '&',
        '&nbsp;': ' '
    };

    let decodedText = text.replace(/&lt;|&gt;|&quot;|&amp;|&nbsp;/g, match => entities[match]);

    decodedText = decodedText.replace(/\r\n/g, ' ');

    decodedText = decodedText.replace(/<img\s+[^>]*src="([^"]+)"[^>]*>/gi, (match, src) => {
        if (src.startsWith('/upload')) {
            return match.replace(src, `${baseUrl}${src}`);
        }
        return match;
    });

    return decodedText;
}

const getDecodedHTML = (text) => {
    return decodeHTML(text);
};
</script>

<style scoped lang="scss">
.slider {
    position: relative;

    @media(max-width: 599px) {
        margin-left: p2r(-30);
        margin-right: p2r(-30);
    }
    @media(max-width: 420px) {
        margin-left: p2r(-20);
        margin-right: p2r(-20);
    }

    &-cards {
        position: relative;
    }

    &-card {
        position: relative;
        display: flex;
        align-items: center;
        //justify-content: space-between;
        overflow: hidden;
        aspect-ratio: 1229/440;
        border-radius: p2r(8);
        background-color: $primary;

        @media(max-width: 599px) {
            aspect-ratio: 360/440;
        }

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

            @media(max-width: 599px) {
                padding: p2r(20);
                width: 100%;
            }

            h2 {
                text-transform: uppercase;

                @media(max-width: 599px) {
                    font-size: p2r(24);
                    line-height: p2r(29);
                }
            }
            h3 {
                @media(max-width: 599px) {
                    font-size: 16px;
                    line-height: 1.3;
                }
            }

            h2, h3, h4, h5, h6 {
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
:deep(.swiper-pagination-bullets.swiper-pagination-horizontal) {
    width: auto;
}
:deep(.swiper-pagination) {
    bottom: p2r(50);
    left: 50%;
    transform: translateX(-50%);
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