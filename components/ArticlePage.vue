<template>
    <div class="article-page">
        <div class="container">
            <div class="page-main">
                <Breadcrumbs />
                <h1 class="h1 article-title">{{ page?.[locale].NAME || 'О нас' }}</h1>
                <div class="article-wrapper">
                    <article class="article">
                        <div class="article-content">
                            <component
                                    v-for="(block, index) in pageBlocks"
                                    :key="index + '-' + block.type"
                                    :is="componentsMap[block.type]"
                                    v-bind="block"
                                    @open-popup="openPopup"
                            />
                            <p v-if="pageError">Ошибка загрузки страницы: {{ pageError.details }}</p>
                            <p v-else-if="!page">Страница не найдена</p>
                        </div>
                    </article>
                </div>
            </div>
        </div>

        <GalleryPopup
                v-if="isPopupOpen"
                :images="currentGalleryFull"
                :initial-index="currentSlideIndex"
                @close="closePopup"
        />
    </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useRuntimeConfig } from 'nuxt/app';
import { useLocaleStore } from '~/stores/locale';
import TextBlock from '~/components/TextBlock.vue';
import Advantages from '~/components/Advantages.vue';
import Video from '~/components/Video.vue';
import Report from '~/components/Report.vue';
import GalleryPopup from '~/components/GalleryPopup.vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
    pageId: {
        type: String,
        default: '99'
    }
});

const config = useRuntimeConfig();
const imageBaseUrl = config.public.imageBaseUrl;
const { t } = useI18n();

// Загружаем данные страницы
const { data, error } = await useFetch('/api/page', {
    method: 'GET',
    query: { id: props.pageId },
    key: `page-${props.pageId}`,
});

const page = computed(() => data.value?.page || null);
const pageError = computed(() => error.value?.data || null);

const localeStore = useLocaleStore();
const locale = computed(() => localeStore.locale);

// Карта компонентов для динамического рендеринга
const componentsMap = {
    text: TextBlock,
    advantages: Advantages,
    video: Video,
    report: Report,
};

// Формирование блоков контента
const pageBlocks = computed(() => {
    const rawText = page.value?.[locale.value]?.DETAIL_TEXT || '';
    const props = page.value?.[locale.value]?.PROPS || {};
    const blocks = [];

    const parts = rawText.split(/({ADVANTAGES}|{VIDEO}|{REPORT})/).filter(part => part.trim().length > 0);

    let i = 0;
    while (i < parts.length) {
        const part = parts[i];
        if (part === '{ADVANTAGES}') {
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
                    title: props.ADV_TITLE?.VALUE || 'Почему мы?',
                    items,
                });
            }
        } else if (part === '{VIDEO}') {
            const videoBlock = {
                type: 'video',
                preview: props.VIDEO_PREVIEW?.VALUE_PATH ? `${imageBaseUrl}${props.VIDEO_PREVIEW.VALUE_PATH}` : '',
                file: props.VIDEO_FILE?.VALUE_PATH ? `${imageBaseUrl}${props.VIDEO_FILE.VALUE_PATH}` : '',
                code: props.VIDEO_CODE?.VALUE || '',
            };
            blocks.push(videoBlock);
        } else if (part === '{REPORT}') {
            const reportBlock = {
                type: 'report',
                title: props.REPORT_TITLE?.VALUE || 'Отчеты',
                linkName: props.REPORT_LINK_NAME?.VALUE || 'Смотреть все',
                linkUrl: props.REPORT_LINK_URL?.VALUE || '#',
                photos: props.REPORT_FOTOS?.VALUE_PATH?.map(photo => `${imageBaseUrl}${photo}`) || [],
            };
            blocks.push(reportBlock);
        } else {
            blocks.push({
                type: 'text',
                content: part,
            });
        }
        i++;
    }

    return blocks;
});

// Состояние попапа
const isPopupOpen = ref(false);
const currentGalleryFull = ref([]);
const currentSlideIndex = ref(0);

const openPopup = (initialIndex) => {
    currentGalleryFull.value = page.value?.[locale.value]?.PROPS?.REPORT_FOTOS?.VALUE_PATH?.map(photo => `${imageBaseUrl}${photo}`) || [];
    currentSlideIndex.value = initialIndex;
    isPopupOpen.value = true;
};

const closePopup = () => {
    isPopupOpen.value = false;
};

// Метатеги
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
.content {
  line-height: 1.6;
}
</style>