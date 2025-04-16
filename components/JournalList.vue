<!--<template>-->
<!--    <div class="container">-->
<!--        <div class="page-main">-->
<!--            <Breadcrumbs />-->
<!--            <div class="page-head">-->
<!--                <div class="page-title-wrapper">-->
<!--                    <h1 class="page-title">{{ $t('journal.title') }}</h1>-->
<!--                    <div class="page-title-sup"><span>{{ totalItems }}</span> {{ materialsDeclension }}</div>-->
<!--                </div>-->
<!--                <div class="page-head-socials">-->
<!--                    <a href="https://vk.com/dthbelarus" target="_blank" class="socials-link" rel="noopener noreferrer">-->
<!--                        <NuxtIcon name="vk" class="socials-link-icon" filled />-->
<!--                    </a>-->
<!--                    <a href="https://t.me/+tEBLLAqlyEBmNGI6" target="_blank" class="socials-link" rel="noopener noreferrer">-->
<!--                        <NuxtIcon name="tg" class="socials-link-icon" filled />-->
<!--                    </a>-->
<!--                    <a href="https://www.facebook.com/profile.php?id=100090072254050" target="_blank" class="socials-link" rel="noopener noreferrer">-->
<!--                        <NuxtIcon name="fb" class="socials-link-icon" filled />-->
<!--                    </a>-->
<!--                    <a href="https://www.instagram.com/dental.training.house/" target="_blank" class="socials-link" rel="noopener noreferrer">-->
<!--                        <NuxtIcon name="instagram" class="socials-link-icon" filled />-->
<!--                    </a>-->
<!--                </div>-->
<!--            </div>-->
<!--            <Rubrics ref="journalCardsRef" />-->
<!--            <div v-if="newsError || rubricsError" class="error-message">-->
<!--                {{ newsError?.details || rubricsError?.details || 'Ошибка загрузки данных' }}-->
<!--            </div>-->
<!--            <div v-else class="journal-cards">-->
<!--                <div class="row">-->
<!--                    <div v-for="item in news" :key="item.ID" class="col-lg-3">-->
<!--                        <div-->
<!--                            class="journal-card"-->
<!--                            :class="{ backgrounder: isReport(item.IBLOCK_SECTION_ID) }"-->
<!--                        >-->
<!--                            <NuxtLink :to="getItemUrl(item)" class="journal-card-image">-->
<!--                                <img :src="getImageUrl(item.PREVIEW_PICTURE)" :alt="item.NAME" />-->
<!--                            </NuxtLink>-->
<!--                            <div class="journal-card-content">-->
<!--                                <div class="journal-card-badge ui-badge">-->
<!--                                    {{ getRubricName(item.IBLOCK_SECTION_ID) || 'Без категории' }}-->
<!--                                </div>-->
<!--                                <NuxtLink :to="getItemUrl(item)" class="journal-card-title">-->
<!--                                    {{ item.NAME }}-->
<!--                                </NuxtLink>-->
<!--                                <div class="journal-card-info">{{ formatDate(item.DATE_ACTIVE_FROM) || 'Без даты' }}</div>-->
<!--                            </div>-->
<!--                        </div>-->
<!--                    </div>-->
<!--                </div>-->
<!--                <Pagination-->
<!--                    :current-page="currentPage"-->
<!--                    :total-pages="totalPages"-->
<!--                    :section="sectionId"-->
<!--                    @page-change="handlePageChange"-->
<!--                />-->
<!--            </div>-->
<!--        </div>-->
<!--    </div>-->
<!--    <div class="education">-->
<!--        <div class="container">-->
<!--            <div class="education-head">-->
<!--                <div class="education-head-text">-->
<!--                    <h2 class="education-head-title">Вебинары</h2>-->
<!--                    <NuxtLink to="/" class="education-head-more">Смотреть все</NuxtLink>-->
<!--                </div>-->
<!--                <div class="slider-btns">-->
<!--                    <button class="slider-btn slider-prev" :disabled="isBeginning" @click="slidePrev">-->
<!--                        <NuxtIcon name="arrow-left" class="slider-icon" filled />-->
<!--                    </button>-->
<!--                    <button class="slider-btn slider-next" :disabled="isEnd" @click="slideNext">-->
<!--                        <NuxtIcon name="arrow-right" class="slider-icon" filled />-->
<!--                    </button>-->
<!--                </div>-->
<!--            </div>-->
<!--            <div class="education-cards">-->
<!--                <div ref="swiperContainer" class="swiper education-swiper">-->
<!--                    <div class="swiper-wrapper">-->
<!--                        <div class="swiper-slide">-->
<!--                            <div class="education-card">-->
<!--                                <NuxtLink to="/" class="education-card-image">-->
<!--                                    <img src="/images/examples/education-1.jpg" alt="card" />-->
<!--                                </NuxtLink>-->
<!--                                <div class="education-card-content">-->
<!--                                    <div class="education-card-badges">-->
<!--                                        <div class="education-card-badge ui-badge">Протезирование</div>-->
<!--                                        <div class="education-card-badge ui-badge ui-badge__dark">-->
<!--                                            <span>6 уроков</span>-->
<!--                                            <span>22 ч 45 м</span>-->
<!--                                        </div>-->
<!--                                    </div>-->
<!--                                    <NuxtLink to="/">-->
<!--                                        <h4 class="education-card-title">-->
<!--                                            DIRECT ANTERIOR. Прямые реставрации фронтальной группы зубов-->
<!--                                        </h4>-->
<!--                                    </NuxtLink>-->
<!--                                    <div class="education-card-names">Роман Карпенко, Владимир Приходько</div>-->
<!--                                </div>-->
<!--                            </div>-->
<!--                        </div>-->
<!--                        <div class="swiper-slide">-->
<!--                            <div class="education-card">-->
<!--                                <NuxtLink to="/" class="education-card-image">-->
<!--                                    <img src="/images/examples/education-1.jpg" alt="card" />-->
<!--                                </NuxtLink>-->
<!--                                <div class="education-card-content">-->
<!--                                    <div class="education-card-badges">-->
<!--                                        <div class="education-card-badge ui-badge">имплантация</div>-->
<!--                                        <div class="education-card-badge ui-badge ui-badge__dark">-->
<!--                                            <span>6 уроков</span>-->
<!--                                            <span>22 ч 45 м</span>-->
<!--                                        </div>-->
<!--                                    </div>-->
<!--                                    <NuxtLink to="/">-->
<!--                                        <h4 class="education-card-title">-->
<!--                                            Кондилография: интерпретация данных для практического использования-->
<!--                                        </h4>-->
<!--                                    </NuxtLink>-->
<!--                                    <div class="education-card-names">Владимир Приходько</div>-->
<!--                                    <div class="education-card-free">бесплатно</div>-->
<!--                                </div>-->
<!--                            </div>-->
<!--                        </div>-->
<!--                        <div class="swiper-slide">-->
<!--                            <div class="education-card">-->
<!--                                <NuxtLink to="/" class="education-card-image">-->
<!--                                    <img src="/images/examples/education-1.jpg" alt="card" />-->
<!--                                </NuxtLink>-->
<!--                                <div class="education-card-content">-->
<!--                                    <div class="education-card-badges">-->
<!--                                        <div class="education-card-badge ui-badge">ортодонтия</div>-->
<!--                                        <div class="education-card-badge ui-badge ui-badge__dark">-->
<!--                                            <span>6 уроков</span>-->
<!--                                            <span>22 ч 45 м</span>-->
<!--                                        </div>-->
<!--                                    </div>-->
<!--                                    <NuxtLink to="/">-->
<!--                                        <h4 class="education-card-title">-->
<!--                                            DIRECT ANTERIOR. Прямые реставрации фронтальной группы зубов-->
<!--                                        </h4>-->
<!--                                    </NuxtLink>-->
<!--                                    <div class="education-card-names">Дмитрий Корольчук, Евгений Мартыненко</div>-->
<!--                                </div>-->
<!--                            </div>-->
<!--                        </div>-->
<!--                        <div class="swiper-slide">-->
<!--                            <div class="education-card">-->
<!--                                <NuxtLink to="/" class="education-card-image">-->
<!--                                    <img src="/images/examples/education-1.jpg" alt="card" />-->
<!--                                </NuxtLink>-->
<!--                                <div class="education-card-content">-->
<!--                                    <div class="education-card-badges">-->
<!--                                        <div class="education-card-badge ui-badge">практический семинар</div>-->
<!--                                        <div class="education-card-badge ui-badge ui-badge__dark">-->
<!--                                            <span>6 уроков</span>-->
<!--                                            <span>22 ч 45 м</span>-->
<!--                                        </div>-->
<!--                                    </div>-->
<!--                                    <NuxtLink to="/">-->
<!--                                        <h4 class="education-card-title">-->
<!--                                            Научно-обоснованное лечение дисфункций ВНЧС-->
<!--                                        </h4>-->
<!--                                    </NuxtLink>-->
<!--                                    <div class="education-card-names">Екатерина Кулакова</div>-->
<!--                                </div>-->
<!--                            </div>-->
<!--                        </div>-->
<!--                        <div class="swiper-slide">-->
<!--                            <div class="education-card">-->
<!--                                <NuxtLink to="/" class="education-card-image">-->
<!--                                    <img src="/images/examples/education-1.jpg" alt="card" />-->
<!--                                </NuxtLink>-->
<!--                                <div class="education-card-content">-->
<!--                                    <div class="education-card-badges">-->
<!--                                        <div class="education-card-badge ui-badge">имплантация</div>-->
<!--                                        <div class="education-card-badge ui-badge ui-badge__dark">-->
<!--                                            <span>6 уроков</span>-->
<!--                                            <span>22 ч 45 м</span>-->
<!--                                        </div>-->
<!--                                    </div>-->
<!--                                    <NuxtLink to="/">-->
<!--                                        <h4 class="education-card-title">-->
<!--                                            Кондилография: интерпретация данных для практического использования-->
<!--                                        </h4>-->
<!--                                    </NuxtLink>-->
<!--                                    <div class="education-card-names">Владимир Приходько</div>-->
<!--                                </div>-->
<!--                            </div>-->
<!--                        </div>-->
<!--                    </div>-->
<!--                </div>-->
<!--            </div>-->
<!--        </div>-->
<!--    </div>-->
<!--</template>-->

<!--<script setup lang="ts">-->
<!--import { ref, computed, onMounted, watch } from 'vue';-->
<!--import { useRoute, useRouter } from 'nuxt/app';-->
<!--import { useI18n } from 'vue-i18n';-->
<!--import { useLocaleStore } from '~/stores/locale';-->
<!--import Breadcrumbs from '~/components/Breadcrumbs.vue';-->
<!--import Rubrics from '~/components/Rubrics.vue';-->
<!--import Pagination from '~/components/Pagination.vue';-->
<!--import Swiper from 'swiper';-->
<!--import 'swiper/css';-->

<!--const { sectionCode } = defineProps<{-->
<!--    sectionCode?: string;-->
<!--}>();-->

<!--const route = useRoute();-->
<!--const router = useRouter();-->
<!--const { t } = useI18n();-->
<!--const localeStore = useLocaleStore();-->
<!--const locale = computed(() => localeStore.locale);-->

<!--// Получаем конфигурацию из runtimeConfig-->
<!--const config = useRuntimeConfig();-->
<!--const imageBaseUrl = config.public.imageBaseUrl;-->
<!--const baseUrl = config.public.baseUrl;-->

<!--const currentPage = computed(() => Number(route.query.page) || 1);-->

<!--const newsData = ref(null);-->
<!--const newsError = ref(null);-->

<!--const { data: rubricsData, error: rubricsError } = await useFetch('/api/rubrics');-->
<!--const rubrics = computed(() => rubricsData.value?.rubrics || []);-->

<!--const sectionId = computed(() => {-->
<!--    if (!sectionCode) return null;-->
<!--    const rubric = rubrics.value.find(r => r.CODE === sectionCode);-->
<!--    return rubric ? rubric.ID : null;-->
<!--});-->

<!--// Устанавливаем метатеги-->
<!--const currentRubric = computed(() => {-->
<!--    return sectionCode ? rubrics.value.find(rubric => rubric.CODE === sectionCode) : null;-->
<!--});-->

<!--const currentPath = computed(() => {-->
<!--    const path = sectionCode ? `/journal/${sectionCode}` : '/journal';-->
<!--    return currentPage.value > 1 ? `${path}?page=${currentPage.value}` : path;-->
<!--});-->

<!--if (!sectionCode) {-->
<!--    // "Все материалы"-->
<!--    useHead({-->
<!--        title: 'Журнал DTH',-->
<!--        meta: [-->
<!--            { name: 'keywords', content: 'журнал dth' },-->
<!--            { name: 'description', content: 'Журнал DTH - все материалы' },-->
<!--            { property: 'og:title', content: 'Журнал DTH' },-->
<!--            { property: 'og:description', content: 'Журнал DTH - все материалы' },-->
<!--            { property: 'og:image', content: `${baseUrl}/images/logo.png` },-->
<!--            { property: 'og:url', content: `${baseUrl}${currentPath.value}` },-->
<!--            { property: 'og:type', content: 'website' },-->
<!--            { property: 'og:site_name', content: 'DTH Journal' }-->
<!--        ],-->
<!--    });-->
<!--} else if (currentRubric.value?.IPROPERTY_VALUES) {-->
<!--    // Конкретная рубрика-->
<!--    const meta = currentRubric.value.IPROPERTY_VALUES;-->
<!--    const ogImage = currentRubric.value.PICTURE ? `${imageBaseUrl}${currentRubric.value.PICTURE}` : `${baseUrl}/images/logo.png`;-->
<!--    useHead({-->
<!--        title: meta.SECTION_META_TITLE || currentRubric.value.NAME || 'Рубрика',-->
<!--        meta: [-->
<!--            { name: 'keywords', content: meta.SECTION_META_KEYWORDS || '' },-->
<!--            { name: 'description', content: meta.SECTION_META_DESCRIPTION || '' },-->
<!--            { property: 'og:title', content: meta.SECTION_META_TITLE || currentRubric.value.NAME || 'Рубрика' },-->
<!--            { property: 'og:description', content: meta.SECTION_META_DESCRIPTION || '' },-->
<!--            { property: 'og:image', content: ogImage },-->
<!--            { property: 'og:url', content: `${baseUrl}${currentPath.value}` },-->
<!--            { property: 'og:type', content: 'website' },-->
<!--            { property: 'og:site_name', content: 'DTH Journal' }-->
<!--        ],-->
<!--    });-->
<!--}-->

<!--const fetchNews = async (page, section) => {-->
<!--    const { data, error } = await useFetch('/api/news', {-->
<!--        query: { page, section },-->
<!--    });-->
<!--    newsData.value = data.value;-->
<!--    newsError.value = error.value;-->
<!--};-->

<!--watch(() => [route.query.page, sectionCode], ([newPage]) => {-->
<!--    const page = Number(newPage) || 1;-->
<!--    fetchNews(page, sectionId.value);-->
<!--}, { immediate: true });-->

<!--const news = computed(() => newsData.value?.news || []);-->
<!--const pagination = computed(() => newsData.value?.pagination || { currentPage: 1, limit: 16, total: 0 });-->
<!--const totalItems = computed(() => pagination.value.total);-->
<!--const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.limit));-->

<!--// Функция склонения для русского языка-->
<!--const materialsDeclension = computed(() => {-->
<!--    if (locale.value !== 'RU') return t('journal.materials'); // Для других языков используем перевод-->

<!--    const count = totalItems.value;-->
<!--    if (count % 10 === 1 && count % 100 !== 11) {-->
<!--        return 'материал';-->
<!--    } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {-->
<!--        return 'материала';-->
<!--    } else {-->
<!--        return 'материалов';-->
<!--    }-->
<!--});-->

<!--const prevUrl = computed(() => {-->
<!--    if (currentPage.value > 1) {-->
<!--        const prevPage = currentPage.value - 1;-->
<!--        return prevPage === 1 ? `${baseUrl}${currentPath.value}` : `${baseUrl}${currentPath.value}?page=${prevPage}`;-->
<!--    }-->
<!--    return null;-->
<!--});-->

<!--const nextUrl = computed(() => {-->
<!--    if (currentPage.value < totalPages.value) {-->
<!--        return `${baseUrl}${currentPath.value}?page=${currentPage.value + 1}`;-->
<!--    }-->
<!--    return null;-->
<!--});-->

<!--useHead({-->
<!--    link: computed(() => {-->
<!--        const links = [];-->
<!--        if (prevUrl.value) {-->
<!--            links.push({ rel: 'prev', href: prevUrl.value });-->
<!--        }-->
<!--        if (nextUrl.value) {-->
<!--            links.push({ rel: 'next', href: nextUrl.value });-->
<!--        }-->
<!--        return links;-->
<!--    }),-->
<!--    script: computed(() => {-->
<!--        if (!news.value.length) return [];-->
<!--        return [{-->
<!--            type: 'application/ld+json',-->
<!--            innerHTML: JSON.stringify({-->
<!--                '@context': 'https://schema.org',-->
<!--                '@type': 'ItemList',-->
<!--                'itemListElement': news.value.map((item, index) => ({-->
<!--                    '@type': 'ListItem',-->
<!--                    'position': index + 1,-->
<!--                    'item': {-->
<!--                        '@type': 'Article',-->
<!--                        'url': `${baseUrl}${getItemUrl(item)}`,-->
<!--                        'name': item.NAME,-->
<!--                        'image': item.PREVIEW_PICTURE ? `${imageBaseUrl}${item.PREVIEW_PICTURE}` : `${baseUrl}/images/logo.svg`,-->
<!--                        'datePublished': item.DATE_ACTIVE_FROM || ''-->
<!--                    }-->
<!--                }))-->
<!--            })-->
<!--        }];-->
<!--    })-->
<!--});-->

<!--const formatDate = (dateString) => {-->
<!--    if (!dateString) return '';-->
<!--    const date = new Date(dateString);-->
<!--    return date.toLocaleDateString(`${locale.value.toLowerCase()}-${locale.value}`, { day: 'numeric', month: 'long', year: 'numeric' });-->
<!--};-->

<!--const getImageUrl = (path) => {-->
<!--    return path ? `${imageBaseUrl}${path}` : '/images/examples/new-image.jpg';-->
<!--};-->

<!--const getRubricName = (sectionId) => {-->
<!--    if (!sectionId) return null;-->
<!--    const rubric = rubrics.value.find(r => r.ID === String(sectionId));-->
<!--    return rubric ? rubric.UF_SHORT_NAME || rubric.NAME : null;-->
<!--};-->

<!--const isReport = (sectionId) => {-->
<!--    if (!sectionId) return false;-->
<!--    const rubric = rubrics.value.find(r => r.ID === String(sectionId));-->
<!--    return rubric?.UF_SHORT_NAME === 'Отчеты';-->
<!--};-->

<!--const getItemUrl = (item) => {-->
<!--    const sectionId = item.IBLOCK_SECTION_ID;-->
<!--    const rubric = rubrics.value.find(r => r.ID === String(sectionId));-->
<!--    const itemSectionCode = rubric?.CODE || 'unknown'; // Fallback, если рубрика не найдена-->
<!--    return `/journal/${itemSectionCode}/${item.CODE}`;-->
<!--};-->

<!--const journalCardsRef = ref(null);-->

<!--const handlePageChange = (page) => {-->
<!--    if (page >= 1 && page <= totalPages.value) {-->
<!--        router.push({ path: route.path, query: { page } });-->
<!--        scrollToRubrics();-->
<!--    }-->
<!--};-->

<!--const scrollToRubrics = () => {-->
<!--    setTimeout(() => {-->
<!--        // Обращаемся к rubricsRef внутри компонента Rubrics-->
<!--        journalCardsRef.value?.rubricsRef?.scrollIntoView({ behavior: 'smooth' });-->
<!--    }, 100);-->
<!--};-->

<!--watch(() => route.query.page, () => {-->
<!--    scrollToRubrics();-->
<!--});-->

<!--const swiperContainer = ref(null);-->
<!--const swiperInstance = ref(null);-->
<!--const isBeginning = ref(true);-->
<!--const isEnd = ref(false);-->

<!--onMounted(() => {-->
<!--    if (swiperContainer.value) {-->
<!--        swiperInstance.value = new Swiper(swiperContainer.value, {-->
<!--            slidesPerView: 4,-->
<!--            spaceBetween: 30,-->
<!--        });-->
<!--        isBeginning.value = swiperInstance.value.isBeginning;-->
<!--        isEnd.value = swiperInstance.value.isEnd;-->
<!--        swiperInstance.value.on('slideChange', () => {-->
<!--            isBeginning.value = swiperInstance.value.isBeginning;-->
<!--            isEnd.value = swiperInstance.value.isEnd;-->
<!--        });-->
<!--    }-->
<!--});-->

<!--const slidePrev = () => swiperInstance.value?.slidePrev();-->
<!--const slideNext = () => swiperInstance.value?.slideNext();-->
<!--</script>-->

<!--<style scoped lang="scss">-->
<!--/* Стили остаются без изменений */-->
<!--.socials {-->
<!--    &-link {-->
<!--        position: relative;-->
<!--        display: block;-->
<!--        width: p2r(48);-->
<!--        height: p2r(48);-->
<!--        flex: 0 0 p2r(48);-->
<!--        border-radius: 50%;-->
<!--        border: 1px solid $border;-->

<!--        &-icon {-->
<!--            position: absolute;-->
<!--            left: 50%;-->
<!--            top: 50%;-->
<!--            transform: translate(-50%, -50%);-->
<!--            font-size: p2r(24);-->
<!--            line-height: p2r(22);-->
<!--        }-->
<!--    }-->
<!--}-->

<!--.journal {-->
<!--    &-card {-->
<!--        border-radius: p2r(6);-->
<!--        box-shadow: 0 p2r(4) p2r(35) rgba(114, 142, 174, 0.1);-->
<!--        background-color: $bgc;-->
<!--        overflow: hidden;-->
<!--        margin-bottom: p2r(60);-->
<!--        height: calc(100% - 3.75rem);-->
<!--        display: flex;-->
<!--        flex-direction: column;-->

<!--        &-image {-->
<!--            aspect-ratio: 2;-->
<!--            border-radius: p2r(6);-->
<!--            overflow: hidden;-->

<!--            @media (hover: hover) {-->
<!--                &:hover {-->
<!--                    img {-->
<!--                        transform: scale(1.1);-->
<!--                    }-->
<!--                }-->
<!--            }-->

<!--            img {-->
<!--                display: block;-->
<!--                width: 100%;-->
<!--                height: 100%;-->
<!--                object-fit: cover;-->
<!--                object-position: center;-->
<!--                transition: transform 0.3s;-->
<!--            }-->
<!--        }-->

<!--        &-content {-->
<!--            position: relative;-->
<!--            padding: p2r(20) p2r(20) p2r(30) p2r(20);-->
<!--            display: flex;-->
<!--            flex-direction: column;-->
<!--            flex-grow: 1;-->
<!--        }-->

<!--        &-badge {-->
<!--            position: absolute;-->
<!--            left: p2r(20);-->
<!--            top: p2r(20);-->
<!--        }-->

<!--        &-title {-->
<!--            color: $font;-->
<!--            padding-top: p2r(46);-->
<!--            font-weight: 500;-->
<!--            font-size: p2r(20);-->
<!--            line-height: p2r(26);-->
<!--            margin-bottom: p2r(20);-->
<!--        }-->

<!--        &-info {-->
<!--            font-size: p2r(14);-->
<!--            line-height: p2r(17);-->
<!--            color: $font-grey;-->
<!--            margin-top: auto;-->

<!--            span {-->
<!--                margin-right: p2r(24);-->
<!--                position: relative;-->

<!--                &:last-child {-->
<!--                    margin-right: 0;-->

<!--                    &::after {-->
<!--                        display: none;-->
<!--                    }-->
<!--                }-->

<!--                &::after {-->
<!--                    content: '';-->
<!--                    position: absolute;-->
<!--                    top: 55%;-->
<!--                    right: p2r(-12);-->
<!--                    transform: translate(50%, -50%);-->
<!--                    width: p2r(4);-->
<!--                    height: p2r(4);-->
<!--                    border-radius: 50%;-->
<!--                    background-color: $font-grey;-->
<!--                }-->
<!--            }-->
<!--        }-->

<!--        &.backgrounder {-->
<!--            position: relative;-->
<!--            color: $font-white-light;-->

<!--            .journal-card-content {-->
<!--                position: static;-->
<!--            }-->

<!--            .journal-card-image {-->
<!--                img {-->
<!--                    aspect-ratio: unset;-->
<!--                    position: absolute;-->
<!--                    top: 0;-->
<!--                    bottom: 0;-->
<!--                    right: 0;-->
<!--                    left: 0;-->
<!--                }-->
<!--            }-->
<!--            .journal-card-title {-->
<!--                position: relative;-->
<!--                color: $font-white-light;-->
<!--            }-->
<!--            .journal-card-info {-->
<!--                position: relative;-->
<!--                color: $font-white-light;-->
<!--                span {-->
<!--                    &::after {-->
<!--                        background-color: $font-white-light;-->
<!--                    }-->
<!--                }-->
<!--            }-->
<!--        }-->
<!--    }-->
<!--}-->

<!--.education {-->
<!--    background-color: $primary;-->
<!--    padding-top: p2r(104);-->
<!--    padding-bottom: p2r(100);-->

<!--    &-head {-->
<!--        display: flex;-->
<!--        justify-content: space-between;-->
<!--        align-items: center;-->
<!--        gap: p2r(24);-->
<!--        margin-bottom: p2r(30);-->

<!--        &-text {-->
<!--            display: flex;-->
<!--            align-items: baseline;-->
<!--            gap: p2r(24);-->
<!--        }-->

<!--        &-title {-->
<!--            color: $font-white;-->
<!--        }-->

<!--        &-more {-->
<!--            color: #D9F0E8;-->
<!--            border-bottom: 1px solid #D9F0E8;-->
<!--        }-->
<!--    }-->

<!--    &-card {-->
<!--        display: flex;-->
<!--        flex-direction: column;-->
<!--        height: 100%;-->
<!--        background-color: $bgc;-->
<!--        border-radius: p2r(6);-->
<!--        overflow: hidden;-->

<!--        &-image {-->
<!--            aspect-ratio: 1.61;-->
<!--            overflow: hidden;-->
<!--            display: block;-->

<!--            img {-->
<!--                width: 100%;-->
<!--                height: 100%;-->
<!--                object-fit: cover;-->
<!--                object-position: center;-->
<!--                transition: transform 0.3s;-->
<!--            }-->

<!--            @media (hover: hover) {-->
<!--                &:hover {-->
<!--                    img {-->
<!--                        transform: scale(1.1);-->
<!--                    }-->
<!--                }-->
<!--            }-->
<!--        }-->

<!--        &-content {-->
<!--            padding: p2r(20);-->
<!--        }-->

<!--        &-badges {-->
<!--            display: flex;-->
<!--            gap: p2r(4);-->
<!--            margin-bottom: p2r(20);-->
<!--        }-->

<!--        &-title {-->
<!--            font-weight: 500;-->
<!--            font-size: p2r(20);-->
<!--            line-height: 1.3;-->
<!--            color: $font;-->
<!--            margin-bottom: p2r(20);-->
<!--        }-->

<!--        &-names {-->
<!--            font-weight: 400;-->
<!--            font-size: p2r(14);-->
<!--            color: $font-grey;-->
<!--        }-->

<!--        &-free {-->
<!--            font-weight: 600;-->
<!--            font-size: p2r(20);-->
<!--            margin-top: p2r(20);-->
<!--        }-->
<!--    }-->
<!--}-->

<!--.slider {-->
<!--    &-btns {-->
<!--        display: flex;-->
<!--        gap: p2r(20);-->
<!--    }-->
<!--    &-btn {-->
<!--        width: p2r(44);-->
<!--        height: p2r(44);-->
<!--        border-radius: 50%;-->
<!--        border: 1px solid $border;-->
<!--        background: $bgc;-->
<!--        cursor: pointer;-->
<!--        display: flex;-->
<!--        align-items: center;-->
<!--        justify-content: center;-->

<!--        &:disabled {-->
<!--            opacity: 0.5;-->
<!--            cursor: not-allowed;-->
<!--        }-->

<!--        &:hover:not(:disabled) {-->
<!--            //background-color: $bgc-dark;-->
<!--        }-->
<!--    }-->

<!--    &-icon {-->
<!--        font-size: p2r(26);-->
<!--        line-height: p2r(22);-->
<!--        color: $font;-->
<!--    }-->
<!--}-->

<!--.swiper-slide {-->
<!--    height: auto;-->
<!--}-->
<!--</style>-->




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
                        <div
                            class="journal-card"
                            :class="{ backgrounder: isReport(item.IBLOCK_SECTION_ID) }"
                        >
                            <NuxtLink :to="getItemUrl(item)" class="journal-card-image">
                                <img :src="getImageUrl(item.PREVIEW_PICTURE)" :alt="item.NAME" />
                            </NuxtLink>
                            <div class="journal-card-content">
                                <div class="journal-card-badge ui-badge">
                                    {{ getRubricName(item.IBLOCK_SECTION_ID) || 'Без категории' }}
                                </div>
                                <NuxtLink :to="getItemUrl(item)" class="journal-card-title">
                                    {{ item.NAME }}
                                </NuxtLink>
                                <div class="journal-card-info">{{ formatDate(item.DATE_ACTIVE_FROM) || 'Без даты' }}</div>
                            </div>
                        </div>
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
    <div class="education">
        <div class="container">
            <div class="education-head">
                <div class="education-head-text">
                    <h2 class="education-head-title">Вебинары</h2>
                    <NuxtLink to="/" class="education-head-more">Смотреть все</NuxtLink>
                </div>
                <div class="slider-btns">
                    <button class="slider-btn slider-prev" :disabled="isBeginning" @click="slidePrev">
                        <NuxtIcon name="arrow-left" class="slider-icon" filled />
                    </button>
                    <button class="slider-btn slider-next" :disabled="isEnd" @click="slideNext">
                        <NuxtIcon name="arrow-right" class="slider-icon" filled />
                    </button>
                </div>
            </div>
            <div class="education-cards">
                <Swiper
                    :modules="[SwiperNavigation]"
                    :slides-per-view="4"
                    :space-between="30"
                    :navigation="{
                        prevEl: '.slider-prev',
                        nextEl: '.slider-next',
                    }"
                    class="education-swiper"
                    @swiper="onSwiper"
                    @slideChange="onSlideChange"
                >
                    <SwiperSlide v-for="(item, index) in webinars" :key="index">
                        <div class="education-card">
                            <NuxtLink to="/" class="education-card-image">
                                <img :src="item.image" :alt="item.title" />
                            </NuxtLink>
                            <div class="education-card-content">
                                <div class="education-card-badges">
                                    <div class="education-card-badge ui-badge">{{ item.category }}</div>
                                    <div class="education-card-badge ui-badge ui-badge__dark">
                                        <span>{{ item.lessons }}</span>
                                        <span>{{ item.duration }}</span>
                                    </div>
                                </div>
                                <NuxtLink to="/">
                                    <h4 class="education-card-title">{{ item.title }}</h4>
                                </NuxtLink>
                                <div class="education-card-names">{{ item.authors }}</div>
                                <div v-if="item.free" class="education-card-free">бесплатно</div>
                            </div>
                        </div>
                    </SwiperSlide>
                </Swiper>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'nuxt/app';
import { useI18n } from 'vue-i18n';
import { useLocaleStore } from '~/stores/locale';
import Breadcrumbs from '~/components/Breadcrumbs.vue';
import Rubrics from '~/components/Rubrics.vue';
import Pagination from '~/components/Pagination.vue';
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

const newsData = ref(null);
const newsError = ref(null);

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

if (!sectionCode) {
    useHead({
        title: 'Журнал DTH',
        meta: [
            { name: 'keywords', content: 'журнал dth' },
            { name: 'description', content: 'Журнал DTH - все материалы' },
            { property: 'og:title', content: 'Журнал DTH' },
            { property: 'og:description', content: 'Журнал DTH - все материалы' },
            { property: 'og:image', content: `${baseUrl}/images/logo.png` },
            { property: 'og:url', content: `${baseUrl}${currentPath.value}` },
            { property: 'og:type', content: 'website' },
            { property: 'og:site_name', content: 'DTH Journal' }
        ],
    });
} else if (currentRubric.value?.IPROPERTY_VALUES) {
    const meta = currentRubric.value.IPROPERTY_VALUES;
    const ogImage = currentRubric.value.PICTURE ? `${imageBaseUrl}${currentRubric.value.PICTURE}` : `${baseUrl}/images/logo.png`;
    useHead({
        title: meta.SECTION_META_TITLE || currentRubric.value.NAME || 'Рубрика',
        meta: [
            { name: 'keywords', content: meta.SECTION_META_KEYWORDS || '' },
            { name: 'description', content: meta.SECTION_META_DESCRIPTION || '' },
            { property: 'og:title', content: meta.SECTION_META_TITLE || currentRubric.value.NAME || 'Рубрика' },
            { property: 'og:description', content: meta.SECTION_META_DESCRIPTION || '' },
            { property: 'og:image', content: ogImage },
            { property: 'og:url', content: `${baseUrl}${currentPath.value}` },
            { property: 'og:type', content: 'website' },
            { property: 'og:site_name', content: 'DTH Journal' }
        ],
    });
}

const fetchNews = async (page, section) => {
    const { data, error } = await useFetch('/api/news', {
        query: { page, section },
    });
    newsData.value = data.value;
    newsError.value = error.value;
};

watch(() => [route.query.page, sectionCode], ([newPage]) => {
    const page = Number(newPage) || 1;
    fetchNews(page, sectionId.value);
}, { immediate: true });

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

useHead({
    link: computed(() => {
        const links = [];
        if (prevUrl.value) {
            links.push({ rel: 'prev', href: prevUrl.value });
        }
        if (nextUrl.value) {
            links.push({ rel: 'next', href: nextUrl.value });
        }
        return links;
    }),
    script: computed(() => {
        if (!news.value.length) return [];
        return [{
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
        }];
    })
});

const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(`${locale.value.toLowerCase()}-${locale.value}`, { day: 'numeric', month: 'long', year: 'numeric' });
};

const getImageUrl = (path) => {
    return path ? `${imageBaseUrl}${path}` : '/images/examples/new-image.jpg';
};

const getRubricName = (sectionId) => {
    if (!sectionId) return null;
    const rubric = rubrics.value.find(r => r.ID === String(sectionId));
    return rubric ? rubric.UF_SHORT_NAME || rubric.NAME : null;
};

const isReport = (sectionId) => {
    if (!sectionId) return false;
    const rubric = rubrics.value.find(r => r.ID === String(sectionId));
    return rubric?.UF_SHORT_NAME === 'Отчеты';
};

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

// Логика для слайдера
const swiperInstance = ref(null);
const isBeginning = ref(true);
const isEnd = ref(false);

const onSwiper = (swiper) => {
    swiperInstance.value = swiper;
    isBeginning.value = swiper.isBeginning;
    isEnd.value = swiper.isEnd;
};

const onSlideChange = (swiper) => {
    isBeginning.value = swiper.isBeginning;
    isEnd.value = swiper.isEnd;
};

const slidePrev = () => swiperInstance.value?.slidePrev();
const slideNext = () => swiperInstance.value?.slideNext();

// Данные для вебинаров
const webinars = ref([
    {
        image: '/images/examples/education-1.jpg',
        category: 'Протезирование',
        lessons: '6 уроков',
        duration: '22 ч 45 м',
        title: 'DIRECT ANTERIOR. Прямые реставрации фронтальной группы зубов',
        authors: 'Роман Карпенко, Владимир Приходько',
        free: false,
    },
    {
        image: '/images/examples/education-1.jpg',
        category: 'имплантация',
        lessons: '6 уроков',
        duration: '22 ч 45 м',
        title: 'Кондилография: интерпретация данных для практического использования',
        authors: 'Владимир Приходько',
        free: true,
    },
    {
        image: '/images/examples/education-1.jpg',
        category: 'ортодонтия',
        lessons: '6 уроков',
        duration: '22 ч 45 м',
        title: 'DIRECT ANTERIOR. Прямые реставрации фронтальной группы зубов',
        authors: 'Дмитрий Корольчук, Евгений Мартыненко',
        free: false,
    },
    {
        image: '/images/examples/education-1.jpg',
        category: 'практический семинар',
        lessons: '6 уроков',
        duration: '22 ч 45 м',
        title: 'Научно-обоснованное лечение дисфункций ВНЧС',
        authors: 'Екатерина Кулакова',
        free: false,
    },
    {
        image: '/images/examples/education-1.jpg',
        category: 'имплантация',
        lessons: '6 уроков',
        duration: '22 ч 45 м',
        title: 'Кондилография: интерпретация данных для практического использования',
        authors: 'Владимир Приходько',
        free: false,
    },
]);
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

.journal {
    &-card {
        border-radius: p2r(6);
        box-shadow: 0 p2r(4) p2r(35) rgba(114, 142, 174, 0.1);
        background-color: $bgc;
        overflow: hidden;
        margin-bottom: p2r(60);
        height: calc(100% - 3.75rem);
        display: flex;
        flex-direction: column;

        &-image {
            aspect-ratio: 2;
            border-radius: p2r(6);
            overflow: hidden;

            @media (hover: hover) {
                &:hover {
                    img {
                        transform: scale(1.1);
                    }
                }
            }

            img {
                display: block;
                width: 100%;
                height: 100%;
                object-fit: cover;
                object-position: center;
                transition: transform 0.3s;
            }
        }

        &-content {
            position: relative;
            padding: p2r(20) p2r(20) p2r(30) p2r(20);
            display: flex;
            flex-direction: column;
            flex-grow: 1;
        }

        &-badge {
            position: absolute;
            left: p2r(20);
            top: p2r(20);
        }

        &-title {
            color: $font;
            padding-top: p2r(46);
            font-weight: 500;
            font-size: p2r(20);
            line-height: p2r(26);
            margin-bottom: p2r(20);
        }

        &-info {
            font-size: p2r(14);
            line-height: p2r(17);
            color: $font-grey;
            margin-top: auto;

            span {
                margin-right: p2r(24);
                position: relative;

                &:last-child {
                    margin-right: 0;

                    &::after {
                        display: none;
                    }
                }

                &::after {
                    content: '';
                    position: absolute;
                    top: 55%;
                    right: p2r(-12);
                    transform: translate(50%, -50%);
                    width: p2r(4);
                    height: p2r(4);
                    border-radius: 50%;
                    background-color: $font-grey;
                }
            }
        }

        &.backgrounder {
            position: relative;
            color: $font-white-light;

            .journal-card-content {
                position: static;
            }

            .journal-card-image {
                img {
                    aspect-ratio: unset;
                    position: absolute;
                    top: 0;
                    bottom: 0;
                    right: 0;
                    left: 0;
                }
            }
            .journal-card-title {
                position: relative;
                color: $font-white-light;
            }
            .journal-card-info {
                position: relative;
                color: $font-white-light;
                span {
                    &::after {
                        background-color: $font-white-light;
                    }
                }
            }
        }
    }
}

.education {
    background-color: $primary;
    padding-top: p2r(104);
    padding-bottom: p2r(100);

    &-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: p2r(24);
        margin-bottom: p2r(30);

        &-text {
            display: flex;
            align-items: baseline;
            gap: p2r(24);
        }

        &-title {
            color: $font-white;
        }

        &-more {
            color: #D9F0E8;
            border-bottom: 1px solid #D9F0E8;
        }
    }

    &-card {
        display: flex;
        flex-direction: column;
        height: 100%;
        background-color: $bgc;
        border-radius: p2r(6);
        overflow: hidden;

        &-image {
            aspect-ratio: 1.61;
            overflow: hidden;
            display: block;

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                object-position: center;
                transition: transform 0.3s;
            }

            @media (hover: hover) {
                &:hover {
                    img {
                        transform: scale(1.1);
                    }
                }
            }
        }

        &-content {
            padding: p2r(20);
        }

        &-badges {
            display: flex;
            gap: p2r(4);
            margin-bottom: p2r(20);
        }

        &-title {
            font-weight: 500;
            font-size: p2r(20);
            line-height: 1.3;
            color: $font;
            margin-bottom: p2r(20);
        }

        &-names {
            font-weight: 400;
            font-size: p2r(14);
            color: $font-grey;
        }

        &-free {
            font-weight: 600;
            font-size: p2r(20);
            margin-top: p2r(20);
        }
    }
}

.slider {
    &-btns {
        display: flex;
        gap: p2r(20);
    }
    &-btn {
        width: p2r(44);
        height: p2r(44);
        border-radius: 50%;
        border: 1px solid $border;
        background: $bgc;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        &:hover:not(:disabled) {
            //background-color: $bgc-dark;
        }
    }

    &-icon {
        font-size: p2r(26);
        line-height: p2r(22);
        color: $font;
    }
}

.swiper-slide {
    height: auto;
}
</style>