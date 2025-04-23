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
                            <div class="news-content">
                                <component
                                    v-for="(block, index) in newsBlocks"
                                    :key="index + '-' + block.type"
                                    :is="componentsMap[block.type]"
                                    v-bind="block"
                                    @open-popup="openPopup"
                                />
                                <div v-if="!newsBlocks.length" v-html="renderDetailText(newsItem[locale].DETAIL_TEXT)"></div>
                            </div>
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

        <GalleryPopup
            v-if="isPopupOpen"
            :images="currentGalleryFull"
            :initial-index="currentSlideIndex"
            @close="closePopup"
        />
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation as SwiperNavigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import TextBlock from '~/components/TextBlock.vue';
import Advantages from '~/components/Advantages.vue';
import Video from '~/components/Video.vue';
import Report from '~/components/Report.vue';
import GalleryPopup from '~/components/GalleryPopup.vue';

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

// Карта компонентов для динамического рендеринга
const componentsMap = {
    text: TextBlock,
    advantages: Advantages,
    video: Video,
    report: Report,
};

// Состояние попапа
const isPopupOpen = ref(false);
const currentGalleryFull = ref<string[]>([]);
const currentSlideIndex = ref(0);

const { data, error } = await useFetch(`/api/news/${newsCode}`, {
    method: 'GET',
});

if (error.value) {
    newsError.value = error.value.data;
} else if (data.value?.item) {
    newsItem.value = data.value.item;
    console.log('News item PROPS:', newsItem.value?.[locale.value]?.PROPS);
} else {
    newsError.value = { details: 'Новость не найдена' };
}

// Формирование галерей GALL_N
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
    console.log('Galleries:', result);
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

// Формирование блоков контента
const newsBlocks = computed(() => {
    if (!newsItem.value?.[locale.value]?.DETAIL_TEXT) return [];

    const rawText = newsItem.value[locale.value].DETAIL_TEXT;
    const props = newsItem.value[locale.value].PROPS || {};
    const blocks = [];

    const parts = rawText.split(/({ADVANTAGES}|{VIDEO}|{REPORT})/).filter(part => part.trim().length > 0);

    let i = 0;
    while (i < parts.length) {
        const part = parts[i];

        // Обработка REPORT
        if (part === '{REPORT}') {
            const reportBlock = {
                type: 'report',
                title: props.REPORT_TITLE?.VALUE || 'Отчеты',
                linkName: props.REPORT_LINK_NAME?.VALUE || 'Смотреть все',
                linkUrl: props.REPORT_LINK_URL?.VALUE || '#',
                photos: props.REPORT_FOTOS?.VALUE_PATH?.map((photo: string) => `${imageBaseUrl}${photo}`) || [],
                galleryType: 'report',
            };
            console.log('REPORT block:', reportBlock);
            blocks.push(reportBlock);
        }
        // Обработка advantages
        else if (part === '{ADVANTAGES}') {
            const items = [];
            for (let j = 1; j <= 8; j++) {
                const icon = props[`ADV_ICON_${j}`]?.VALUE_PATH;
                const text = props[`ADV_TEXT_${j}`]?.VALUE;
                if (text) {
                    items.push({ icon: icon ? `${imageBaseUrl}${icon}` : '', text });
                }
            }
            if (items.length > 0) {
                blocks.push({
                    type: 'advantages',
                    title: props.ADV_TITLE?.VALUE || 'Преимущества',
                    items,
                });
            }
        }
        // Обработка video
        else if (part === '{VIDEO}') {
            const videoBlock = {
                type: 'video',
                preview: props.VIDEO_PREVIEW?.VALUE_PATH ? `${imageBaseUrl}${props.VIDEO_PREVIEW.VALUE_PATH}` : '',
                file: props.VIDEO_FILE?.VALUE_PATH ? `${imageBaseUrl}${props.VIDEO_FILE.VALUE_PATH}` : '',
                code: props.VIDEO_CODE?.VALUE || '',
            };
            blocks.push(videoBlock);
        }
        // Обычный текст
        else if (part.trim().length > 0) {
            blocks.push({
                type: 'text',
                content: renderDetailText(part),
            });
        }

        i++;
    }
    console.log('News blocks:', blocks);
    return blocks;
});

// Обработчик кликов на картинки для GALL_N
onMounted(() => {
    const handleGalleryClick = (e: Event) => {
        console.log('Gallery click detected:', e.target);
        const link = (e.target as HTMLElement).closest('.gallery-item-image');
        if (link) {
            console.log('Found gallery-item-image:', link);
            e.preventDefault();
            const galleryKey = link.getAttribute('data-gallery');
            const index = parseInt(link.getAttribute('data-index') || '0', 10);
            console.log('Gallery data:', { galleryKey, index });
            if (galleryKey && galleries.value[galleryKey]) {
                openPopup({ images: [], initialIndex: index, galleryType: 'gall', galleryKey });
            } else {
                console.warn('No gallery found for key:', galleryKey);
            }
        } else {
            console.warn('No gallery-item-image found');
        }
    };

    document.addEventListener('click', handleGalleryClick);

    // Логика для "липкого" поведения .news-share
    const handleScroll = () => {
        if (!newsShare.value) return;

        const newsSide = newsShare.value.parentElement as HTMLElement;
        const newsWrapper = newsSide.parentElement as HTMLElement;
        const rect = newsSide.getBoundingClientRect();
        const wrapperRect = newsWrapper.getBoundingClientRect();
        const topOffset = 20;
        const scrollTop = window.scrollY;
        const shareHeight = newsShare.value.offsetHeight;
        const initialTop = newsShare.value.getBoundingClientRect().top + window.scrollY;
        const sideBottom = wrapperRect.top + newsSide.offsetHeight + window.scrollY;

        if (scrollTop + topOffset >= initialTop) {
            if (scrollTop + topOffset + shareHeight > sideBottom) {
                newsShare.value.style.position = 'absolute';
                newsShare.value.style.top = `${newsSide.offsetHeight - shareHeight}px`;
            } else {
                newsShare.value.style.position = 'fixed';
                newsShare.value.style.top = `${topOffset}px`;
                newsShare.value.style.right = `${document.documentElement.clientWidth - wrapperRect.right}px`;
            }
            newsShare.value.style.width = `${rect.width}px`;
        } else {
            newsShare.value.style.position = 'static';
        }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);

    onUnmounted(() => {
        document.removeEventListener('click', handleGalleryClick);
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleScroll);
    });
});

// Открытие попапа
const openPopup = (payload: { images: string[]; initialIndex: number; galleryType?: 'report' | 'gall'; galleryKey?: string } | number) => {
    let initialIndex = 0;
    let galleryType: 'report' | 'gall' = 'report';
    let galleryKey: string | undefined;
    let images: string[] = [];

    // Проверяем, является ли payload числом (для REPORT) или объектом (для GALL_N)
    if (typeof payload === 'number') {
        initialIndex = payload;
        galleryType = 'report';
        console.log('REPORT popup triggered with index:', initialIndex);
        images = newsItem.value?.[locale.value]?.PROPS?.REPORT_FOTOS?.VALUE_PATH?.map(
            (photo: string) => `${imageBaseUrl}${photo}`
        ) || [];
    } else {
        ({ images = [], initialIndex = 0, galleryType = 'report', galleryKey } = payload);
        console.log('openPopup called:', { images, initialIndex, galleryType, galleryKey });
    }

    // Устанавливаем изображения для галереи
    if (galleryType === 'report') {
        currentGalleryFull.value = newsItem.value?.[locale.value]?.PROPS?.REPORT_FOTOS?.VALUE_PATH?.map(
            (photo: string) => `${imageBaseUrl}${photo}`
        ) || images;
    } else if (galleryType === 'gall' && galleryKey) {
        currentGalleryFull.value = galleries.value[galleryKey]?.full || images;
    } else {
        currentGalleryFull.value = images;
    }

    console.log('currentGalleryFull:', currentGalleryFull.value);
    console.log('Setting currentSlideIndex:', initialIndex);

    if (!currentGalleryFull.value.length) {
        console.warn('No images to display in popup');
        isPopupOpen.value = false;
        return;
    }

    currentSlideIndex.value = initialIndex;
    isPopupOpen.value = true;
};

// Закрытие попапа
const closePopup = () => {
    isPopupOpen.value = false;
};

// Устанавливаем метатеги и микроразметку
if (newsItem.value) {
    const meta = newsItem.value.RU?.IPROPERTY_VALUES || {};
    const news = newsItem.value[locale.value];
    const ogImage = news?.PREVIEW_PICTURE ? `${imageBaseUrl}${news.PREVIEW_PICTURE}` : `${baseUrl}/images/logo.svg`;
    const galleryImages = newsBlocks.value
        .filter(block => block.type === 'report')
        .flatMap(block => block.photos)
        .concat(Object.values(galleries.value).flatMap(g => g.full));

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

    &-gallery {
        margin: p2r(20) 0;
    }
}

.gallery-images {
    display: flex;
    flex-wrap: wrap;
    gap: p2r(10);
}

.gallery-item {
    flex: 0 0 auto;
}

.gallery-item-image {
    display: block;
}

.gallery-item img {
    max-width: 100%;
    height: auto;
}

.news-content {
    line-height: 1.6;
}

.error-message {
    color: red;
    padding: 20px;
}
</style>