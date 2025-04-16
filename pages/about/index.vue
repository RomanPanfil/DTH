<template>
    <div class="about-page">
        <div class="container">
            <div class="page-main">
                <Breadcrumbs />
                <h1 class="h1 article-title">{{ page?.[locale].NAME || 'О нас' }}</h1>
                <div class="article-wrapper">
                    <article class="article">
                        <div class="article-content">
                            <div class="content" v-html="renderDetailText(page?.[locale]?.DETAIL_TEXT)"></div>
                            <p v-if="pageError">Ошибка загрузки страницы: {{ pageError.details }}</p>
                            <p v-else-if="!page">Страница не найдена</p>
                        </div>
                    </article>
                </div>
            </div>
        </div>

        <!-- Попап со слайдером -->
        <Teleport to="body">
            <div v-if="isPopupOpen" class="gallery-popup" @click.self="closePopup">
                <button class="gallery-popup-close" @click="closePopup">✕</button>
                <div class="gallery-popup-inner">
                    <div class="gallery-swiper-wrapper">
                        <Swiper
                            :modules="[SwiperNavigation]"
                            :slides-per-view="1"
                            :space-between="10"
                            :initial-slide="currentSlideIndex"
                            :navigation="{
                prevEl: '.swiper-button-prev',
                nextEl: '.swiper-button-next',
              }"
                            :loop="currentGalleryFull.length > 1"
                            class="gallery-swiper"
                            @slideChange="onSlideChange"
                        >
                            <SwiperSlide v-for="(img, index) in currentGalleryFull" :key="index">
                                <img :src="img" :alt="`Report photo ${index + 1}`" />
                            </SwiperSlide>
                        </Swiper>
                        <div class="swiper-button-prev"></div>
                        <div class="swiper-button-next"></div>
                    </div>
                    <div class="gallery-popup-info">
                        <div class="gallery-popup-counter">{{ $t('news.photo') }}: {{ currentPhotoIndex + 1 }} / {{ currentGalleryFull.length }}</div>
                        <div class="gallery-popup-title">{{ $t('advantages.title') }}</div>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRuntimeConfig } from 'nuxt/app';
import { useLocaleStore } from '~/stores/locale';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation as SwiperNavigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import { useI18n } from 'vue-i18n';

// Конфигурация
const config = useRuntimeConfig();
const imageBaseUrl = config.public.imageBaseUrl;
const { t } = useI18n();

// Получаем PAGE_ID из query-параметров маршрута
const route = useRoute();
const pageId = computed(() => route.query.id || '99');

// Загружаем данные страницы
const { data, error } = await useFetch('/api/page', {
    method: 'GET',
    query: { id: pageId.value },
    key: `page-${pageId.value}`,
});

const page = computed(() => data.value?.page || null);
const pageError = computed(() => error.value?.data || null);

const localeStore = useLocaleStore();
const locale = computed(() => localeStore.locale);

// Логируем ошибку, если она есть
if (pageError.value) {
    console.error('Ошибка загрузки страницы:', pageError.value);
}

// Извлекаем преимущества из PROPS
const advantages = computed(() => {
    if (!page.value?.[locale.value]?.PROPS) return { title: '', items: [] };
    const props = page.value[locale.value].PROPS;
    const items = [];
    for (let i = 1; i <= 8; i++) {
        const icon = props[`ADV_ICON_${i}`]?.VALUE_PATH || (props[`ADV_ICON_${i}`]?.VALUE ? `${imageBaseUrl}/upload/iblock/${props[`ADV_ICON_${i}`].VALUE}.svg` : '');
        const text = props[`ADV_TEXT_${i}`]?.VALUE || '';
        if (text) {
            items.push({ icon, text });
        }
    }
    return {
        title: props.ADV_TITLE?.VALUE || 'Почему мы?',
        items
    };
});

// Извлекаем видео из PROPS
const video = computed(() => {
    if (!page.value?.[locale.value]?.PROPS) return null;
    const props = page.value[locale.value].PROPS;
    return {
        preview: props.VIDEO_PREVIEW?.VALUE_PATH || (props.VIDEO_PREVIEW?.VALUE ? `${imageBaseUrl}/upload/iblock/${props.VIDEO_PREVIEW.VALUE}.jpg` : ''),
        file: props.VIDEO_FILE?.VALUE_PATH || (props.VIDEO_FILE?.VALUE ? `${imageBaseUrl}/upload/iblock/${props.VIDEO_FILE.VALUE}.mp4` : ''),
        code: props.VIDEO_CODE?.VALUE || ''
    };
});

// Извлекаем отчеты из PROPS
const report = computed(() => {
    if (!page.value?.[locale.value]?.PROPS) return null;
    const props = page.value[locale.value].PROPS;
    return {
        title: props.REPORT_TITLE?.VALUE || 'Отчеты',
        linkName: props.REPORT_LINK_NAME?.VALUE || 'Смотреть все',
        linkUrl: props.REPORT_LINK_URL?.VALUE || '#',
        photos: props.REPORT_FOTOS?.VALUE_PATH || []
    };
});

// Состояние попапа
const isPopupOpen = ref(false);
const currentGalleryFull = ref<string[]>([]);
const currentSlideIndex = ref(0);
const currentPhotoIndex = ref(0);

// Замена плейсхолдеров на HTML
const renderDetailText = (text: string) => {
    if (!text) return '';

    let result = text;

    // Замена {ADVANTAGES}
    if (result.includes('{ADVANTAGES}') && advantages.value.items.length) {
        const advantagesHtml = `
      <div class="advantages">
        <h2 class="advantages-title">${advantages.value.title}</h2>
        <div class="advantages-list">
          ${advantages.value.items
            .map(
                item => `
                <div class="advantage-item">
                  ${item.icon ? `<img src="${imageBaseUrl}${item.icon}" alt="Advantage icon" class="advantage-icon" />` : ''}
                  <p>${item.text}</p>
                </div>
              `
            )
            .join('')}
        </div>
      </div>
    `;
        result = result.replace('{ADVANTAGES}', advantagesHtml);
    } else {
        result = result.replace('{ADVANTAGES}', '');
    }

    // Замена {VIDEO}
    if (result.includes('{VIDEO}') && video.value) {
        let videoHtml = '';
        if (video.value.code) {
            const videoId = video.value.code.match(/(?:v=)([^&]+)/)?.[1] || video.value.code.split('/').pop();
            const embedUrl = `https://www.youtube.com/embed/${videoId}`;
            videoHtml = `<div class="video"><iframe src="${embedUrl}" frameborder="0" allowfullscreen></iframe></div>`;
        } else if (video.value.file) {
            videoHtml = `
        <div class="video">
          <video controls poster="${video.value.preview || ''}">
            <source src="${video.value.file}" type="video/mp4">
          </video>
        </div>
      `;
        }
        result = result.replace('{VIDEO}', videoHtml);
    } else {
        result = result.replace('{VIDEO}', '');
    }

    // Замена {REPORT}
    if (result.includes('{REPORT}') && report.value) {
        const reportHtml = `
      <div class="report">
        <div class="report-head">
          <h2 class="h2 report-head-title">${report.value.title}</h2>
          <a href="${report.value.linkUrl}" class="report-head-more">${report.value.linkName}</a>
        </div>
        <div class="gallery-images">
          ${report.value.photos
            .map(
                (photo, index) => `
                <div class="gallery-item">
                  <a href="#" class="gallery-item-image" data-index="${index}">
                    <img src="${imageBaseUrl}${photo}" alt="Report photo" />
                  </a>
                </div>
              `
            )
            .join('')}
        </div>
      </div>
    `;
        result = result.replace('{REPORT}', reportHtml);
    } else {
        result = result.replace('{REPORT}', '');
    }

    return result;
};

// Обработчик кликов на картинки в REPORT
onMounted(() => {
    document.addEventListener('click', (e) => {
        const link = (e.target as HTMLElement).closest('.gallery-item-image');
        if (link) {
            e.preventDefault();
            const index = parseInt(link.getAttribute('data-index') || '0', 10);
            openPopup(index);
        }
    });
});

onUnmounted(() => {
    document.removeEventListener('click', (e) => {
        const link = (e.target as HTMLElement).closest('.gallery-item-image');
        if (link) {
            e.preventDefault();
            const index = parseInt(link.getAttribute('data-index') || '0', 10);
            openPopup(index);
        }
    });
});

// Открытие попапа
const openPopup = (initialIndex: number) => {
    currentGalleryFull.value = report.value.photos.map(photo => `${imageBaseUrl}${photo}`);
    currentSlideIndex.value = initialIndex;
    currentPhotoIndex.value = initialIndex;
    isPopupOpen.value = true;
};

// Закрытие попапа
const closePopup = () => {
    isPopupOpen.value = false;
    currentGalleryFull.value = [];
    currentSlideIndex.value = 0;
    currentPhotoIndex.value = 0;
};

// Обновление индекса текущей фотографии
const onSlideChange = (swiper) => {
    currentPhotoIndex.value = swiper.realIndex;
};

// Устанавливаем метатеги
if (page.value) {
    useHead({
        title: page.value[locale.value]?.NAME || 'О нас',
        meta: [
            { name: 'description', content: page.value[locale.value]?.DETAIL_TEXT?.substring(0, 200) || '' },
            { property: 'og:title', content: page.value[locale.value]?.NAME || 'О нас' },
            { property: 'og:description', content: page.value[locale.value]?.DETAIL_TEXT?.substring(0, 200) || '' },
        ],
    });
}
</script>


<style scoped lang="scss">
//@import 'plyr/css/plyr.css';
.content {
    line-height: 1.6;
}

:deep(.advantages) {
    margin: p2r(40) 0;
    display: flex;

    .advantages-title {
        max-width: p2r(250);
        flex: 0 0 p2r(250);
        font-weight: 500;
        font-size: p2r(32);
        line-height: 1.35;
    }

    .advantages-list {
        display: flex;
        flex-wrap: wrap;
        column-gap: p2r(70);
        row-gap: p2r(58);
    }

    .advantage-item {
        display: flex;
        align-items: center;
        width: calc(50% - 70px);
    }

    .advantage-icon {
        width: p2r(68);
        height: p2r(68);
        display: block;
        margin-right: p2r(20);
        object-fit: contain;
    }

    p {
        margin: 0;
        font-weight: 500;
        line-height: 1.3;
    }
}

:deep(.video) {
    margin: 20px 0;
    iframe,
    video {
        width: 100%;
        //max-width: 600px;
        //height: 340px;
        aspect-ratio: 1.78;
        border-radius: p2r(6);
    }
}

:deep(.report) {
    margin: p2r(20) 0;
    .report-head {
        display: flex;
        align-items: baseline;
        margin-bottom: p2r(40);
    }
    .report-head-title {
        margin-right: p2r(24);
    }
    .report-head-more {
        font-weight: 500;
        font-size: p2r(18);
        line-height: p2r(18);
        color: $font;
        border-bottom: 1px solid $border_grey;
    }
    .report-photos {
        display: flex;
        flex-wrap: wrap;
    }
}

/* Стили попапа */
.gallery-popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.gallery-popup-close {
    position: fixed;
    top: p2r(60);
    right: p2r(60);
    font-size: p2r(30);
    color: $font-black;
    border: none;
    background: none;
    width: p2r(52);
    height: p2r(52);
    border-radius: 50%;
    background-color: $bgc;
    cursor: pointer;
    z-index: 1001;
    transition: background-color 0.3s;

    &:hover {
        background-color: rgba(255, 255, 255, 0.3);
    }
}

.gallery-popup-inner {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 90%;
    max-height: 90vh;
}

.gallery-swiper-wrapper {
    position: relative;
    width: 100%;
    max-width: p2r(1024);
}

.gallery-swiper {
    width: 100%;
    height: auto;
}

:deep(.swiper-wrapper) {
    align-items: center;
}

:deep(.swiper-slide) {
    display: flex;
    justify-content: center;
    align-items: center;
    img {
        width: 100%;
        height: auto;
        max-height: 80vh;
        object-fit: contain;
    }
}

:deep(.swiper-button-prev),
:deep(.swiper-button-next) {
    width: p2r(64);
    height: p2r(64);
    background: $bgc;
    color: $font-black;
    border-radius: 50%;
    cursor: pointer;
    top: 50%;
    transform: translateY(-50%);
    margin-top: 0;
    z-index: 10;
    transition: background-color 0.3s;

    &:after {
        font-size: p2r(22);
        font-weight: 600;
    }

    &:hover {
        background-color: rgba(255, 255, 255, 0.3);
    }
}

:deep(.swiper-button-prev) {
    left: p2r(-110);
}

:deep(.swiper-button-next) {
    right: p2r(-110);
}

.gallery {
    &-popup {
        &-info {
            font-size: p2r(14);
            font-weight: 500;
            align-self: flex-start;
            display: flex;
            margin-top: p2r(20);
            color: #fff;
        }
        &-counter {
            margin-right: p2r(30);
        }
        &-title {
            position: relative;
            padding-left: p2r(30);

            &::before {
                content: '';
                position: absolute;
                left: 0;
                top: 50%;
                transform: translate(0%, -50%);
                width: 1px;
                height: p2r(11);
                background-color: $bgc;
            }
        }
    }
}
</style>

