<template>
    <div class="container">
        <Breadcrumbs />
        <h1 class="page-title">Результаты поиска по запросу <span class="color-primary text-italic">{{ searchQuery }}</span></h1>
        <Tabs
            :journal="filteredData('journal')"
            :courses="filteredData('courses')"
            :webinars="filteredData('webinars')"
            @page-change="handlePageChange"
        />
    </div>
    <EducationCards />
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed, ref, watch } from 'vue';
import { useLocaleStore } from '~/stores/locale';

const localeStore = useLocaleStore();
const locale = computed(() => localeStore.locale.toUpperCase());

const route = useRoute();
const searchQuery = computed(() => route.query.query?.toString() || '');

// Состояние страницы для каждой категории
const journalPage = ref(1);
const coursesPage = ref(1);
const webinarsPage = ref(1);

// Функция для получения данных по категории
const fetchCategoryData = (category: string, page: number) => {
    return useFetch('/api/search', {
        method: 'GET',
        query: {
            query: searchQuery,
            page,
            limit: 12,
            category, // Добавляем параметр категории в запрос
        },
        immediate: true,
        watch: [searchQuery, page],
    });
};

// Выполняем запросы для каждой категории отдельно
const journalFetch = fetchCategoryData('journal', journalPage);
const coursesFetch = fetchCategoryData('courses', coursesPage);
const webinarsFetch = fetchCategoryData('webinars', webinarsPage);

// Обработка ошибок и отладка
watch(journalFetch.data, (newVal) => {
    console.log('Journal searchResults:', newVal);
});
watch(coursesFetch.data, (newVal) => {
    console.log('Courses searchResults:', newVal);
});
watch(webinarsFetch.data, (newVal) => {
    console.log('Webinars searchResults:', newVal);
});

if (journalFetch.error.value) console.error('Ошибка (journal):', journalFetch.error.value);
if (coursesFetch.error.value) console.error('Ошибка (courses):', coursesFetch.error.value);
if (webinarsFetch.error.value) console.error('Ошибка (webinars):', webinarsFetch.error.value);

const filteredData = (category: string) => {
    const page = category === 'journal' ? journalPage : category === 'courses' ? coursesPage : webinarsPage;
    const fetchResult = category === 'journal' ? journalFetch : category === 'courses' ? coursesFetch : webinarsFetch;

    const result = computed(() => {
        const data = fetchResult.data.value?.[category] || { items: {}, pagination: {} };
        const items = data.items || {};
        return {
            items: locale.value in items ? items[locale.value] : Object.values(items)[0] || [],
            pagination: data.pagination || { PAGE: 1, LIMIT: 12, TOTAL: 0 },
            currentPage: page.value,
        };
    });

    watch(result, (newVal) => {
        console.log(`filteredData(${category}):`, newVal);
    }, { immediate: true });

    return result;
};

// Обработчик изменения страницы
const handlePageChange = ({ category, page }: { category: string; page: number }) => {
    if (category === 'journal') journalPage.value = page;
    if (category === 'courses') coursesPage.value = page;
    if (category === 'webinars') webinarsPage.value = page;
};

// Сброс страниц при изменении запроса
watch(searchQuery, (newQuery) => {
    journalPage.value = 1;
    coursesPage.value = 1;
    webinarsPage.value = 1;
    console.log('Search query changed:', newQuery);
});
</script>