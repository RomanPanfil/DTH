<template>
    <div class="container">
        <div class="page-main">
            <Breadcrumbs />
            <div class="page-head">
                <div class="page-title-wrapper">
                    <h1 class="page-title">{{ $t('journal.title') }}</h1>
                    <div class="page-title-sup"><span>{{ totalItems }}</span> {{ materialsDeclension }}</div>
                </div>
                <div class="page-head-socials">
                    <a href="https://vk.com/dthbelarus" target="_blank" class="socials-link" rel="noopener noreferrer">
                        <NuxtIcon name="vk" class="socials-link-icon" filled />
                    </a>
                    <a href="https://t.me/+tEBLLAqlyEBmNGI6" target="_blank" class="socials-link" rel="noopener noreferrer">
                        <NuxtIcon name="tg" class="socials-link-icon" filled />
                    </a>
                    <a href="https://www.facebook.com/profile.php?id=100090072254050" target="_blank" class="socials-link" rel="noopener noreferrer">
                        <NuxtIcon name="fb" class="socials-link-icon" filled />
                    </a>
                    <a href="https://www.instagram.com/dental.training.house/" target="_blank" class="socials-link" rel="noopener noreferrer">
                        <NuxtIcon name="instagram" class="socials-link-icon" filled />
                    </a>
                </div>
            </div>
            <Rubrics ref="journalCardsRef" />
            <div v-if="newsError || rubricsError" class="error-message">
                {{ newsError?.details || rubricsError?.details || 'Ошибка загрузки данных' }}
            </div>
            <div v-else class="journal-cards">
                <div class="row">
                    <div v-for="item in news" :key="item.ID" class="col-lg-3">
                        <JournalCard
                            :item="item"
                            :rubrics="rubrics"
                        />
                    </div>
                </div>
                <Pagination
                    :current-page="currentPage"
                    :total-pages="totalPages"
                    :section="sectionId"
                    @page-change="handlePageChange"
                />
            </div>
        </div>
    </div>
    <EducationCards />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'nuxt/app';
import { useI18n } from 'vue-i18n';
import { useLocaleStore } from '~/stores/locale';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation as SwiperNavigation } from 'swiper/modules';
import 'swiper/css';

const { sectionCode } = defineProps<{
    sectionCode?: string;
}>();

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const localeStore = useLocaleStore();
const locale = computed(() => localeStore.locale);

const config = useRuntimeConfig();
const imageBaseUrl = config.public.imageBaseUrl;
const baseUrl = config.public.baseUrl;

const currentPage = computed(() => Number(route.query.page) || 1);

const { data: rubricsData, error: rubricsError } = await useFetch('/api/rubrics');
const rubrics = computed(() => rubricsData.value?.rubrics || []);

const sectionId = computed(() => {
    if (!sectionCode) return null;
    const rubric = rubrics.value.find(r => r.CODE === sectionCode);
    return rubric ? rubric.ID : null;
});

const currentRubric = computed(() => {
    return sectionCode ? rubrics.value.find(rubric => rubric.CODE === sectionCode) : null;
});

const currentPath = computed(() => {
    const path = sectionCode ? `/journal/${sectionCode}` : '/journal';
    return currentPage.value > 1 ? `${path}?page=${currentPage.value}` : path;
});

const { data: newsData, error: newsError } = await useAsyncData('news', async () => {
    try {
        const { data, error } = await useFetch('/api/news', {
            query: { page: currentPage.value, section: sectionId.value },
        });
        if (error.value) throw error.value;
        return data.value;
    } catch (err) {
        console.error('Error fetching news:', err);
        return null;
    }
}, {
    watch: [() => route.query.page, () => sectionCode],
});

const news = computed(() => newsData.value?.news || []);
const pagination = computed(() => newsData.value?.pagination || { currentPage: 1, limit: 16, total: 0 });
const totalItems = computed(() => pagination.value.total);
const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.limit));

const materialsDeclension = computed(() => {
    if (locale.value !== 'RU') return t('journal.materials');
    const count = totalItems.value;
    if (count % 10 === 1 && count % 100 !== 11) {
        return 'материал';
    } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
        return 'материала';
    } else {
        return 'материалов';
    }
});

const prevUrl = computed(() => {
    if (currentPage.value > 1) {
        const prevPage = currentPage.value - 1;
        return prevPage === 1 ? `${baseUrl}${currentPath.value}` : `${baseUrl}${currentPath.value}?page=${prevPage}`;
    }
    return null;
});

const nextUrl = computed(() => {
    if (currentPage.value < totalPages.value) {
        return `${baseUrl}${currentPath.value}?page=${currentPage.value + 1}`;
    }
    return null;
});

onMounted(() => {
    if (rubricsData.value && newsData.value) {
        useHead(computed(() => {
            const meta = [];
            const links = [];
            const scripts = [];

            // Общие метаданные
            if (!sectionCode) {
                meta.push(
                    { name: 'keywords', content: 'журнал dth' },
                    { name: 'description', content: 'Журнал DTH - все материалы' },
                    { property: 'og:title', content: 'Журнал DTH' },
                    { property: 'og:description', content: 'Журнал DTH - все материалы' },
                    { property: 'og:image', content: `${baseUrl}/images/logo.png` },
                    { property: 'og:url', content: `${baseUrl}${currentPath.value}` },
                    { property: 'og:type', content: 'website' },
                    { property: 'og:site_name', content: 'DTH Journal' }
                );
            } else if (currentRubric.value?.IPROPERTY_VALUES) {
                const rubricMeta = currentRubric.value.IPROPERTY_VALUES;
                const ogImage = currentRubric.value.PICTURE ? `${imageBaseUrl}${currentRubric.value.PICTURE}` : `${baseUrl}/images/logo.png`;
                meta.push(
                    { name: 'keywords', content: rubricMeta.SECTION_META_KEYWORDS || '' },
                    { name: 'description', content: rubricMeta.SECTION_META_DESCRIPTION || '' },
                    { property: 'og:title', content: rubricMeta.SECTION_META_TITLE || currentRubric.value.NAME || 'Рубрика' },
                    { property: 'og:description', content: rubricMeta.SECTION_META_DESCRIPTION || '' },
                    { property: 'og:image', content: ogImage },
                    { property: 'og:url', content: `${baseUrl}${currentPath.value}` },
                    { property: 'og:type', content: 'website' },
                    { property: 'og:site_name', content: 'DTH Journal' }
                );
            }

            // Ссылки prev/next
            if (prevUrl.value) {
                links.push({ rel: 'prev', href: prevUrl.value });
            }
            if (nextUrl.value) {
                links.push({ rel: 'next', href: nextUrl.value });
            }

            // JSON-LD
            if (news.value.length) {
                scripts.push({
                    type: 'application/ld+json',
                    innerHTML: JSON.stringify({
                        '@context': 'https://schema.org',
                        '@type': 'ItemList',
                        'itemListElement': news.value.map((item, index) => ({
                            '@type': 'ListItem',
                            'position': index + 1,
                            'item': {
                                '@type': 'Article',
                                'url': `${baseUrl}${getItemUrl(item)}`,
                                'name': item.NAME,
                                'image': item.PREVIEW_PICTURE ? `${imageBaseUrl}${item.PREVIEW_PICTURE}` : `${baseUrl}/images/logo.svg`,
                                'datePublished': item.DATE_ACTIVE_FROM || ''
                            }
                        }))
                    })
                });
            }

            return {
                title: !sectionCode ? 'Журнал DTH' : currentRubric.value?.IPROPERTY_VALUES?.SECTION_META_TITLE || currentRubric.value?.NAME || 'Рубрика',
                meta,
                link: links,
                script: scripts
            };
        }));
    }
});

// onBeforeUnmount(() => {
//     console.log('beforeUnmount triggered');
//     console.log('rubricsData:', rubricsData.value);
//     console.log('newsData:', newsData.value);
//     console.log('currentRubric:', currentRubric.value);
// });

const getItemUrl = (item) => {
    const sectionId = item.IBLOCK_SECTION_ID;
    const rubric = rubrics.value.find(r => r.ID === String(sectionId));
    const itemSectionCode = rubric?.CODE || 'unknown';
    return `/journal/${itemSectionCode}/${item.CODE}`;
};

const journalCardsRef = ref(null);

const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        router.push({ path: route.path, query: { page } });
        scrollToRubrics();
    }
};

const scrollToRubrics = () => {
    setTimeout(() => {
        journalCardsRef.value?.rubricsRef?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
};

watch(() => route.query.page, () => {
    scrollToRubrics();
});
</script>

<style scoped lang="scss">
.socials {
    &-link {
        position: relative;
        display: block;
        width: p2r(48);
        height: p2r(48);
        flex: 0 0 p2r(48);
        border-radius: 50%;
        border: 1px solid $border;

        &-icon {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            font-size: p2r(24);
            line-height: p2r(22);
        }
    }
}
</style>