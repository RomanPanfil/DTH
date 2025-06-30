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
    <WebinarsShort :webinars="featuredWebinars" />
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
});

const fetchLectors = async (lectorIds) => {
    if (!lectorIds || lectorIds.length === 0) return {};
    try {
        const requestBody = {
            params: {
                USER_IDS: lectorIds,
            },
        };
        const response = await $fetch('/api/getprofilesbyids', {
            method: 'POST',
            body: requestBody,
        });
        if (!response || Object.keys(response).length === 0) {
            throw new Error('Нет данных о лекторах');
        }
        return response;
    } catch (error) {
        console.error('Ошибка получения лекторов:', error);
        throw new Error(`Не удалось загрузить лекторов: ${error.message || 'Неизвестная ошибка'}`);
    }
};

const { data: webinarsData, error: webinarsError } = await useAsyncData('featuredWebinars', async () => {
    try {
        const { data } = await useFetch('/api/events', {
            query: {
                iblockId: '19',
                GET_ALL_FILES: 'Y',
                isFeatured: '1',
                PROPERTY_MAIN_LESSON: 1
            },
            method: 'POST',
            body: {
                params: {
                    select: ['NAME', 'IBLOCK_ID', 'ID', 'PROPERTY_*'],
                },
            },
        });

        if (!data.value || !data.value.events || !Array.isArray(data.value.events)) {
            console.error('Неверная структура ответа:', data.value);
            return [];
        }

        const allLectorIds = new Set<number>();
        data.value.events.forEach(event => {
            const lectorSet = event.PROPS?.LECTOR_SET?.VALUE;
            if (Array.isArray(lectorSet)) {
                lectorSet.forEach(lector => {
                    const id = Number(lector.SUB_VALUES?.LECTORS?.VALUE);
                    if (id) allLectorIds.add(id);
                });
            }
        });

        let profiles = {};
        if (allLectorIds.size > 0) {
            profiles = await fetchLectors([...allLectorIds]);
        }

        const processedEvents = data.value.events.map(event => {
            const processedEvent = { ...event };
            const lectorSet = processedEvent.PROPS?.LECTOR_SET?.VALUE;
            if (Array.isArray(lectorSet)) {
                processedEvent.lectors = lectorSet
                    .map(lector => {
                        const id = Number(lector.SUB_VALUES?.LECTORS?.VALUE);
                        return {
                            id,
                            name: profiles[id]
                                ? `${profiles[id].NAME} ${profiles[id].LAST_NAME || ''}`.trim()
                                : 'Неизвестный лектор',
                        };
                    })
                    .filter(lector => lector.id);
            } else {
                processedEvent.lectors = [];
            }
            return processedEvent;
        });

        return processedEvents;
    } catch (err) {
        console.error('Ошибка при загрузке избранных курсов:', err);
        return [];
    }
});

const featuredWebinars = ref(webinarsData.value || []);

if (webinarsError.value) {
    console.error('Ошибка useAsyncData для событий:', eventsError.value);
}
</script>