<!--<template>-->
<!--    <div class="container">-->
<!--        <div class="page-main">-->
<!--            <Breadcrumbs :news-title="newsItem?.[locale]?.NAME" />-->
<!--            <div v-if="newsError" class="error-message">-->
<!--                {{ newsError?.details || 'Ошибка загрузки новости' }}-->
<!--            </div>-->
<!--            <div v-else-if="newsItem && newsItem[locale]" class="news-detail">-->
<!--                <h1 class="news-title">{{ newsItem[locale].NAME }}</h1>-->
<!--                <div class="news-wrapper">-->
<!--                    <div class="news-main">-->
<!--                        <div class="news-meta">-->
<!--                            <span class="news-meta-item">{{ formatDate(newsItem[locale].DATE_ACTIVE_FROM) }}</span>-->
<!--                            <span class="news-meta-item">Автор: {{ newsItem[locale].PROPS?.AUTHOR?.VALUE || 'Неизвестен' }}</span>-->
<!--                        </div>-->
<!--                        <div class="news-container">-->
<!--                            <div class="news-content" v-html="renderDetailText(newsItem[locale].DETAIL_TEXT)"></div>-->
<!--                        </div>-->
<!--                    </div>-->
<!--                    <div class="news-side">-->
<!--                        поделиться-->
<!--                    </div>-->
<!--                </div>-->
<!--            </div>-->
<!--            <div v-else>Loading...</div>-->
<!--        </div>-->
<!--    </div>-->
<!--</template>-->

<!--<script setup lang="ts">-->
<!--import { ref, computed } from 'vue';-->
<!--import { useRoute, useRuntimeConfig, useHead } from 'nuxt/app';-->
<!--import { useI18n } from 'vue-i18n';-->
<!--import { useLocaleStore } from '~/stores/locale';-->
<!--import Breadcrumbs from '~/components/Breadcrumbs.vue';-->

<!--const config = useRuntimeConfig();-->
<!--const imageBaseUrl = config.public.imageBaseUrl;-->
<!--const baseUrl = config.public.baseUrl;-->
<!--const route = useRoute();-->

<!--const { newsCode } = defineProps<{-->
<!--    newsCode: string;-->
<!--}>();-->

<!--const localeStore = useLocaleStore();-->
<!--const locale = computed(() => localeStore.locale);-->
<!--const { t } = useI18n();-->

<!--const newsItem = ref(null);-->
<!--const newsError = ref(null);-->

<!--const { data, error } = await useFetch(`/api/news/${newsCode}`, {-->
<!--    method: 'GET',-->
<!--});-->

<!--if (error.value) {-->
<!--    newsError.value = error.value.data;-->
<!--} else if (data.value?.item) {-->
<!--    newsItem.value = data.value.item;-->
<!--} else {-->
<!--    newsError.value = { details: 'Новость не найдена' };-->
<!--}-->

<!--// Обработка галерей-->
<!--const galleries = computed(() => {-->
<!--    if (!newsItem.value?.[locale.value]?.PROPS) return {};-->
<!--    const props = newsItem.value[locale.value].PROPS;-->
<!--    const result: Record<string, string[]> = {};-->
<!--    for (let i = 1; i <= 5; i++) {-->
<!--        const key = `GALL_${i}`;-->
<!--        if (props[key]?.VALUE_RESIZE?.length) {-->
<!--            result[key] = props[key].VALUE_RESIZE.map((path: string) => `${imageBaseUrl}${path}`);-->
<!--        } else if (props[key]?.VALUE?.length) {-->
<!--            result[key] = props[key].VALUE.map((id: string) => `${imageBaseUrl}/upload/gallery/${id}.jpg`); // Предполагаемый путь-->
<!--        }-->
<!--    }-->
<!--    return result;-->
<!--});-->

<!--// Замена {GALL_N} на разметку галерей-->
<!--const renderDetailText = (text: string) => {-->
<!--    if (!text) return '';-->
<!--    let result = text;-->
<!--    for (let i = 1; i <= 5; i++) {-->
<!--        const key = `GALL_${i}`;-->
<!--        const placeholder = `{${key}}`;-->
<!--        if (result.includes(placeholder)) {-->
<!--            if (galleries.value[key]?.length) {-->
<!--                const galleryHtml = `-->
<!--          <div class="news-gallery">-->
<!--            <div class="gallery-images">-->
<!--              ${galleries.value[key]-->
<!--                    .map((img: string, index: number) => `<div class="gallery-item"><a href="#" class="gallery-item-image"><img src="${img}" alt="Gallery ${i} image ${index + 1}" /></a></div>`)-->
<!--                    .join('')}-->
<!--            </div>-->
<!--          </div>-->
<!--        `;-->
<!--                result = result.replace(placeholder, galleryHtml);-->
<!--            } else {-->
<!--                result = result.replace(placeholder, ''); // Удаляем, если галерея пустая-->
<!--            }-->
<!--        }-->
<!--    }-->
<!--    return result;-->
<!--};-->

<!--// Устанавливаем метатеги и микроразметку-->
<!--if (newsItem.value) {-->
<!--    const meta = newsItem.value.RU?.IPROPERTY_VALUES || {};-->
<!--    const news = newsItem.value[locale.value];-->
<!--    const ogImage = news?.PREVIEW_PICTURE ? `${imageBaseUrl}${news.PREVIEW_PICTURE}` : `${baseUrl}/images/logo.svg`;-->
<!--    const galleryImages = Object.values(galleries.value).flat();-->

<!--    useHead({-->
<!--        title: meta.ELEMENT_META_TITLE || news?.NAME || 'Новость',-->
<!--        meta: [-->
<!--            { name: 'keywords', content: meta.ELEMENT_META_KEYWORDS || '' },-->
<!--            { name: 'description', content: meta.ELEMENT_META_DESCRIPTION || '' },-->
<!--            { property: 'og:title', content: meta.ELEMENT_META_TITLE || news?.NAME || 'Новость' },-->
<!--            { property: 'og:description', content: meta.ELEMENT_META_DESCRIPTION || news?.DETAIL_TEXT?.substring(0, 200) || '' },-->
<!--            { property: 'og:image', content: ogImage },-->
<!--            { property: 'og:url', content: `${baseUrl}${route.fullPath}` },-->
<!--            { property: 'og:type', content: 'article' },-->
<!--            { property: 'og:site_name', content: 'DTH Journal' },-->
<!--        ],-->
<!--        script: [-->
<!--            {-->
<!--                type: 'application/ld+json',-->
<!--                innerHTML: JSON.stringify({-->
<!--                    '@context': 'https://schema.org',-->
<!--                    '@type': 'Article',-->
<!--                    'headline': meta.ELEMENT_META_TITLE || news?.NAME || 'Новость',-->
<!--                    'description': meta.ELEMENT_META_DESCRIPTION || news?.DETAIL_TEXT?.substring(0, 200) || '',-->
<!--                    'image': galleryImages.length ? galleryImages : [ogImage],-->
<!--                    'datePublished': news?.DATE_ACTIVE_FROM || '',-->
<!--                    'author': {-->
<!--                        '@type': 'Person',-->
<!--                        'name': news?.PROPS?.AUTHOR?.VALUE || 'Неизвестен'-->
<!--                    },-->
<!--                    'publisher': {-->
<!--                        '@type': 'Organization',-->
<!--                        'name': 'DTH Journal',-->
<!--                        'logo': {-->
<!--                            '@type': 'ImageObject',-->
<!--                            'url': `${baseUrl}/images/logo.svg`-->
<!--                        }-->
<!--                    },-->
<!--                    'url': `${baseUrl}${route.fullPath}`-->
<!--                })-->
<!--            }-->
<!--        ]-->
<!--    });-->
<!--}-->

<!--const formatDate = (dateString: string, loc = 'ru-RU') => {-->
<!--    if (!dateString) return '';-->
<!--    const date = new Date(dateString);-->
<!--    const options = { day: 'numeric', month: 'long', year: 'numeric' };-->
<!--    return date.toLocaleDateString(loc, options);-->
<!--};-->

<!--</script>-->

<!--<style scoped lang="scss">-->
<!--.news {-->
<!--  &-title {-->
<!--    margin-bottom: p2r(30);-->
<!--  }-->
<!--  &-wrapper {-->
<!--    display: flex;-->
<!--    gap: p2r(24);-->
<!--  }-->
<!--  &-main {-->
<!--    flex-grow: 1;-->
<!--  }-->
<!--  &-container {-->
<!--    max-width: p2r(1090);-->
<!--    margin-left: auto;-->
<!--    margin-right: auto;-->
<!--  }-->
<!--  &-side {-->
<!--    width: p2r(280);-->
<!--    flex: 0 0 p2r(280);-->
<!--  }-->
<!--  &-meta {-->
<!--    font-size: p2r(16);-->
<!--    margin-bottom: p2r(62);-->
<!--    &-item {-->
<!--      &:not(:last-child) {-->
<!--        padding-right: p2r(30);-->
<!--        margin-right: p2r(30);-->
<!--        position: relative;-->
<!--        &::after {-->
<!--          content: '';-->
<!--          width: 1px;-->
<!--          height: 11px;-->
<!--          background-color: #E2E5EC;-->
<!--          position: absolute;-->
<!--          left: 100%;-->
<!--          top: 50%;-->
<!--          transform: translate(-50%, -50%);-->
<!--        }-->
<!--      }-->
<!--    }-->
<!--  }-->
<!--}-->

<!--.news-content {-->
<!--  line-height: 1.6;-->
<!--}-->

<!--.error-message {-->
<!--  color: red;-->
<!--  padding: 20px;-->
<!--}-->
<!--</style>-->





<template>
    <div class="container">
        <div class="page-main">
            <Breadcrumbs :news-title="newsItem?.[locale]?.NAME" />
            <div v-if="newsError" class="error-message">
                {{ newsError?.details || 'Ошибка загрузки новости' }}
            </div>
            <div v-else-if="newsItem && newsItem[locale]" class="news-detail">
                <h1 class="news-title">{{ newsItem[locale].NAME }}</h1>
                <div class="news-wrapper">
                    <div class="news-main">
                        <div class="news-meta">
                            <span class="news-meta-item">{{ formatDate(newsItem[locale].DATE_ACTIVE_FROM) }}</span>
                            <span class="news-meta-item">{{ $t('news.author') }}: {{ newsItem[locale].PROPS?.AUTHOR?.VALUE || $t('news.unknown') }}</span>
                        </div>
                        <div class="news-container">
                            <div class="news-content" v-html="renderDetailText(newsItem[locale].DETAIL_TEXT)"></div>
                        </div>
                    </div>
                    <div class="news-side">
                        <div class="news-share" ref="newsShare">
                            <div class="news-share-head">
                                <span class="news-share-head-title">{{ $t('news.share') }}</span>
                                <NuxtIcon name="share" class="news-share-head-icon" filled />
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <div v-else>Loading...</div>
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
                                <img :src="img" :alt="`Full image ${index + 1}`" />
                            </SwiperSlide>
                        </Swiper>
                        <div class="swiper-button-prev"></div>
                        <div class="swiper-button-next"></div>
                    </div>
                    <div class="gallery-popup-info">
                        <div class="gallery-popup-counter">{{ $t('news.photo') }}: {{ currentPhotoIndex + 1 }} / {{ currentGalleryFull.length }}</div>
                        <div class="gallery-popup-title">{{ newsItem?.[locale]?.NAME }}</div>
                    </div>
                </div>
            </div>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation as SwiperNavigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const config = useRuntimeConfig();
const imageBaseUrl = config.public.imageBaseUrl;
const baseUrl = config.public.baseUrl;
const route = useRoute();

const { newsCode } = defineProps<{
    newsCode: string;
}>();

const localeStore = useLocaleStore();
const locale = computed(() => localeStore.locale);
const { t } = useI18n();

const newsItem = ref(null);
const newsError = ref(null);
const newsShare = ref<HTMLElement | null>(null);

let initialTop = 0;

// Состояние попапа
const isPopupOpen = ref(false);
const currentGalleryFull = ref<string[]>([]);
const currentSlideIndex = ref(0);
const currentPhotoIndex = ref(0);

const { data, error } = await useFetch(`/api/news/${newsCode}`, {
    method: 'GET',
});

if (error.value) {
    newsError.value = error.value.data;
} else if (data.value?.item) {
    newsItem.value = data.value.item;
} else {
    newsError.value = { details: 'Новость не найдена' };
}

// Обработка галерей
const galleries = computed(() => {
    if (!newsItem.value?.[locale.value]?.PROPS) return {};
    const props = newsItem.value[locale.value].PROPS;
    const result: Record<string, { thumbs: string[]; full: string[] }> = {};
    for (let i = 1; i <= 5; i++) {
        const key = `GALL_${i}`;
        if (props[key]?.VALUE?.length) {
            result[key] = {
                thumbs: props[key].VALUE_RESIZE?.length
                    ? props[key].VALUE_RESIZE.map((path: string) => `${imageBaseUrl}${path}`)
                    : props[key].VALUE.map((id: string) => `${imageBaseUrl}/upload/gallery/${id}.jpg`),
                full: props[key].VALUE_PATH?.length
                    ? props[key].VALUE_PATH.map((path: string) => `${imageBaseUrl}${path}`)
                    : props[key].VALUE.map((id: string) => `${imageBaseUrl}/upload/gallery/full/${id}.jpg`),
            };
        }
    }
    return result;
});

// Замена {GALL_N} на разметку галерей
const renderDetailText = (text: string) => {
    if (!text) return '';
    let result = text;
    for (let i = 1; i <= 5; i++) {
        const key = `GALL_${i}`;
        const placeholder = `{${key}}`;
        if (result.includes(placeholder)) {
            if (galleries.value[key]?.thumbs?.length) {
                const galleryHtml = `
          <div class="news-gallery">
            <div class="gallery-images">
              ${galleries.value[key].thumbs
                    .map(
                        (img: string, index: number) =>
                            `<div class="gallery-item"><a href="#" class="gallery-item-image" data-gallery="${key}" data-index="${index}"><img src="${img}" alt="Gallery ${i} image ${index + 1}" /></a></div>`
                    )
                    .join('')}
            </div>
          </div>
        `;
                result = result.replace(placeholder, galleryHtml);
            } else {
                result = result.replace(placeholder, '');
            }
        }
    }
    return result;
};

// Обработчик кликов на картинки
onMounted(() => {
    document.addEventListener('click', (e) => {
        const link = (e.target as HTMLElement).closest('.gallery-item-image');
        if (link) {
            e.preventDefault();
            const galleryKey = link.getAttribute('data-gallery');
            const index = parseInt(link.getAttribute('data-index') || '0', 10);
            if (galleryKey && galleries.value[galleryKey]) {
                openPopup(galleryKey, index);
            }
        }
    });

    // Логика для "липкого" поведения .news-share
    const handleScroll = () => {
        if (!newsShare.value) return;

        const newsSide = newsShare.value.parentElement as HTMLElement;
        const newsWrapper = newsSide.parentElement as HTMLElement;
        const rect = newsSide.getBoundingClientRect();
        const wrapperRect = newsWrapper.getBoundingClientRect();
        const topOffset = 20; // Отступ от верха окна
        const scrollTop = window.scrollY;
        const shareHeight = newsShare.value.offsetHeight;

        // Сохраняем начальную позицию блока относительно верха документа
        if (!initialTop) {
            initialTop = newsShare.value.getBoundingClientRect().top + window.scrollY;
        }

        // Нижняя граница .news-side относительно верха документа
        const sideBottom = wrapperRect.top + newsSide.offsetHeight + window.scrollY;

        // Когда прокрутка доходит до точки, где блок должен "прилипнуть"
        if (scrollTop + topOffset >= initialTop) {
            // Проверяем, не достигла ли нижняя часть блока конца .news-side
            if (scrollTop + topOffset + shareHeight > sideBottom) {
                newsShare.value.style.position = 'absolute';
                newsShare.value.style.top = `${newsSide.offsetHeight - shareHeight}px`;
                newsShare.value.style.right = '0';
                newsShare.value.style.width = `${rect.width}px`;
            } else {
                newsShare.value.style.position = 'fixed';
                newsShare.value.style.top = `${topOffset}px`;
                newsShare.value.style.right = `${document.documentElement.clientWidth - wrapperRect.right}px`;
                newsShare.value.style.width = `${rect.width}px`;
            }
        } else {
            // Возвращаем в статичное положение, если прокрутка выше начальной позиции
            newsShare.value.style.position = 'static';
            newsShare.value.style.top = 'auto';
            newsShare.value.style.right = 'auto';
            newsShare.value.style.width = 'auto';
        }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    onUnmounted(() => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
    });
});

// Открытие попапа
const openPopup = (galleryKey: string, initialIndex: number) => {
    currentGalleryFull.value = galleries.value[galleryKey]?.full || [];
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

// Устанавливаем метатеги и микроразметку
if (newsItem.value) {
    const meta = newsItem.value.RU?.IPROPERTY_VALUES || {};
    const news = newsItem.value[locale.value];
    const ogImage = news?.PREVIEW_PICTURE ? `${imageBaseUrl}${news.PREVIEW_PICTURE}` : `${baseUrl}/images/logo.svg`;
    const galleryImages = Object.values(galleries.value).flatMap(g => g.full);

    useHead({
        title: meta.ELEMENT_META_TITLE || news?.NAME || 'Новость',
        meta: [
            { name: 'keywords', content: meta.ELEMENT_META_KEYWORDS || '' },
            { name: 'description', content: meta.ELEMENT_META_DESCRIPTION || '' },
            { property: 'og:title', content: meta.ELEMENT_META_TITLE || news?.NAME || 'Новость' },
            { property: 'og:description', content: meta.ELEMENT_META_DESCRIPTION || news?.DETAIL_TEXT?.substring(0, 200) || '' },
            { property: 'og:image', content: ogImage },
            { property: 'og:url', content: `${baseUrl}${route.fullPath}` },
            { property: 'og:type', content: 'article' },
            { property: 'og:site_name', content: 'DTH Journal' },
        ],
        script: [
            {
                type: 'application/ld+json',
                innerHTML: JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'Article',
                    'headline': meta.ELEMENT_META_TITLE || news?.NAME || 'Новость',
                    'description': meta.ELEMENT_META_DESCRIPTION || news?.DETAIL_TEXT?.substring(0, 200) || '',
                    'image': galleryImages.length ? galleryImages : [ogImage],
                    'datePublished': news?.DATE_ACTIVE_FROM || '',
                    'author': {
                        '@type': 'Person',
                        'name': news?.PROPS?.AUTHOR?.VALUE || 'Неизвестен'
                    },
                    'publisher': {
                        '@type': 'Organization',
                        'name': 'DTH Journal',
                        'logo': {
                            '@type': 'ImageObject',
                            'url': `${baseUrl}/images/logo.svg`
                        }
                    },
                    'url': `${baseUrl}${route.fullPath}`
                })
            }
        ]
    });
}

const formatDate = (dateString: string, loc = 'ru-RU') => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString(loc, options);
};
</script>

<style scoped lang="scss">
.news {
    &-title {
        margin-bottom: p2r(30);
    }
    &-wrapper {
        display: flex;
        gap: p2r(24);
    }
    &-main {
        flex-grow: 1;
    }
    &-container {
        max-width: p2r(1090);
        margin-left: auto;
        margin-right: auto;
    }
    &-side {
        position: relative;
        width: p2r(280);
        flex: 0 0 p2r(280);
    }
    &-meta {
        font-size: p2r(16);
        margin-bottom: p2r(62);
        &-item {
            &:not(:last-child) {
                padding-right: p2r(30);
                margin-right: p2r(30);
                position: relative;
                &::after {
                    content: '';
                    width: 1px;
                    height: 11px;
                    background-color: $font;
                    position: absolute;
                    left: 100%;
                    top: 50%;
                    transform: translate(-50%, -50%);
                }
            }
        }
    }

    &-share {
        transition: top 0.1s ease;
        &-head {
            text-align: right;
            &-title {
                border-bottom: 1px dotted $font;
                margin-right: p2r(8);
            }
            &-icon {
                font-size: p2r(24);
                color: $font-black;
            }
        }
    }
}

.news-content {
    line-height: 1.6;
}

.news-gallery {
    margin-top: 20px;
}

.gallery-images {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
}

.gallery-item {
    &-image {
        display: block;
    }
    img {
        max-width: 200px;
        height: auto;
        cursor: pointer;
    }
}

.error-message {
    color: red;
    padding: 20px;
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
