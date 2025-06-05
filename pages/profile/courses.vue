<!--<template>-->
<!--    <div class="container courses" ref="topRef">-->
<!--        <h1 class="page-title">{{ $t('courses.title') }}</h1>-->
<!--        <div v-if="eventsError" class="error-message">-->
<!--            {{ eventsError?.details || 'Ошибка загрузки мероприятий' }}-->
<!--        </div>-->
<!--        <div v-else>-->
<!--            <div class="sort-tabs">-->
<!--                <div-->
<!--                    class="sort-tabs-item"-->
<!--                    :class="{ active: activeTab === 'all' }"-->
<!--                    @click="setActiveTab('all')"-->
<!--                >-->
<!--                    Все мероприятия-->
<!--                </div>-->
<!--                <div-->
<!--                    class="sort-tabs-item"-->
<!--                    :class="{ active: activeTab === 'future' }"-->
<!--                    @click="setActiveTab('future')"-->
<!--                >-->
<!--                    Будущие-->
<!--                </div>-->
<!--                <div-->
<!--                    class="sort-tabs-item"-->
<!--                    :class="{ active: activeTab === 'past' }"-->
<!--                    @click="setActiveTab('past')"-->
<!--                >-->
<!--                    Прошедшие-->
<!--                </div>-->
<!--            </div>-->
<!--            <div class="row">-->
<!--                <div v-for="event in filteredEvents" :key="event.ID" class="col-md-4">-->
<!--                    <CourcesCard :event="event" />-->
<!--                </div>-->
<!--            </div>-->
<!--        </div>-->
<!--        <Pagination-->
<!--            v-if="totalPages > 1"-->
<!--            :current-page="currentPage"-->
<!--            :total-pages="totalPages"-->
<!--            @page-change="handlePageChange"-->
<!--        />-->
<!--    </div>-->
<!--</template>-->

<!--<script setup lang="ts">-->
<!--import { ref, computed, onMounted, onUnmounted } from 'vue';-->
<!--import { useRoute, useRouter } from 'nuxt/app';-->
<!--import { useAuthStore } from '~/stores/auth';-->

<!--// Текущая дата: 11:29 AM CDT, 03 июня 2025 года-->
<!--const now = new Date('2025-06-03T11:29:00-05:00'); // CDT - UTC-5-->

<!--const route = useRoute();-->
<!--const router = useRouter();-->
<!--const authStore = useAuthStore();-->

<!--const eventsError = ref(null);-->
<!--const currentPage = computed(() => Number(route.query.page) || 1);-->
<!--const topRef = ref(null);-->
<!--const activeTab = ref('all');-->
<!--const allEvents = ref<any[]>([]);-->

<!--const fetchCourseIds = async () => {-->
<!--    if (!authStore.isAuthenticated || !authStore.token) return [];-->
<!--    const { data, error } = await useFetch('/api/courses/getAccessible', {-->
<!--        method: 'POST',-->
<!--        body: {-->
<!--            TOKEN: authStore.token,-->
<!--            pager: { start: 1, limit: 1000 },-->
<!--        },-->
<!--    });-->
<!--    if (error.value) throw new Error(error.value.data?.error || 'Ошибка при загрузке ID курсов');-->
<!--    return data.value?.COURSES || [];-->
<!--};-->

<!--const { data: eventsData, refresh: refreshEvents } = await useAsyncData(-->
<!--    'events',-->
<!--    async () => {-->
<!--        try {-->
<!--            eventsError.value = null;-->
<!--            const courseIds = await fetchCourseIds();-->
<!--            if (courseIds.length === 0) {-->
<!--                return { events: [], pagination: { currentPage: 1, limit: 12, total: 0 } };-->
<!--            }-->

<!--            const response = await $fetch('/api/events', {-->
<!--                query: { page: 1, iblockId: 13, GET_ALL_FILES: 'Y' },-->
<!--                method: 'POST',-->
<!--                body: {-->
<!--                    params: {-->
<!--                        filter: { IBLOCK_ID: 13, ACTIVE: 'Y', ID: courseIds },-->
<!--                        select: ['NAME', 'IBLOCK_ID', 'ID', 'PROPERTY_*', 'DATE_FOR_SORT'],-->
<!--                        pager: { start: 1, limit: 1000 },-->
<!--                    },-->
<!--                },-->
<!--            });-->

<!--            if (!response?.events) throw new Error('Ошибка загрузки мероприятий');-->

<!--            const allLectorIds = new Set<number>();-->
<!--            response.events.forEach((event) => {-->
<!--                const lectorSet = event.PROPS?.LECTOR_SET?.VALUE;-->
<!--                if (Array.isArray(lectorSet)) {-->
<!--                    lectorSet.forEach((lector) => {-->
<!--                        const id = Number(lector.SUB_VALUES?.LECTORS?.VALUE);-->
<!--                        if (id) allLectorIds.add(id);-->
<!--                    });-->
<!--                }-->
<!--            });-->

<!--            let profiles = {};-->
<!--            if (allLectorIds.size > 0) {-->
<!--                profiles = await $fetch('/api/getprofilesbyids', { method: 'POST', body: { params: { USER_IDS: [...allLectorIds] } } });-->
<!--                if (!profiles || Object.keys(profiles).length === 0) throw new Error('Нет данных о лекторах');-->
<!--            }-->

<!--            const events = response.events.map((event) => {-->
<!--                const lectorSet = event.PROPS?.LECTOR_SET?.VALUE;-->
<!--                if (Array.isArray(lectorSet)) {-->
<!--                    event.lectors = lectorSet-->
<!--                        .map((lector) => {-->
<!--                            const id = Number(lector.SUB_VALUES?.LECTORS?.VALUE);-->
<!--                            return { id, name: profiles[id] ? `${profiles[id].NAME} ${profiles[id].LAST_NAME || ''}`.trim() : 'Неизвестный лектор' };-->
<!--                        })-->
<!--                        .filter((lector) => lector.id);-->
<!--                } else {-->
<!--                    event.lectors = [];-->
<!--                }-->
<!--                return event;-->
<!--            });-->

<!--            allEvents.value = events;-->
<!--            return {-->
<!--                events: events,-->
<!--                pagination: { currentPage: 1, limit: 12, total: events.length },-->
<!--            };-->
<!--        } catch (error) {-->
<!--            eventsError.value = { details: error.message || 'Неизвестная ошибка' };-->
<!--            return { events: [], pagination: { currentPage: 1, limit: 12, total: 0 } };-->
<!--        }-->
<!--    },-->
<!--    { watch: [] }-->
<!--);-->

<!--const uniqueEvents = computed(() => {-->
<!--    const seenIds = new Set();-->
<!--    return allEvents.value.filter((event) => {-->
<!--        if (seenIds.has(event.ID)) return false;-->
<!--        seenIds.add(event.ID);-->
<!--        return true;-->
<!--    }) || [];-->
<!--});-->

<!--const preFilteredEvents = computed(() => {-->
<!--    return uniqueEvents.value.filter((event) => {-->
<!--        const dateForSortValue = event.PROPS?.DATE_FOR_SORT?.VALUE;-->
<!--        if (!dateForSortValue) return false;-->

<!--        const dateForSort = new Date(dateForSortValue);-->
<!--        if (isNaN(dateForSort.getTime())) return false;-->

<!--        switch (activeTab.value) {-->
<!--            case 'future':-->
<!--                return dateForSort >= now;-->
<!--            case 'past':-->
<!--                return dateForSort < now;-->
<!--            case 'all':-->
<!--            default:-->
<!--                return true;-->
<!--        }-->
<!--    });-->
<!--});-->

<!--const filteredEvents = computed(() => {-->
<!--    const startIndex = (currentPage.value - 1) * 12;-->
<!--    const endIndex = startIndex + 12;-->
<!--    return preFilteredEvents.value.slice(startIndex, endIndex);-->
<!--});-->

<!--const pagination = computed(() => {-->
<!--    const total = preFilteredEvents.value.length;-->
<!--    return { currentPage: currentPage.value, limit: 12, total };-->
<!--});-->

<!--const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.limit));-->

<!--const handlePageChange = (page: number) => {-->
<!--    if (page >= 1 && page <= totalPages.value) {-->
<!--        router.push({ path: route.path, query: { page } });-->
<!--        scrollToTop();-->
<!--    }-->
<!--};-->

<!--const scrollToTop = () => {-->
<!--    setTimeout(() => topRef.value?.scrollIntoView({ behavior: 'smooth' }), 100);-->
<!--};-->

<!--const setActiveTab = (tab: string) => {-->
<!--    activeTab.value = tab;-->
<!--    router.push({ path: route.path, query: { page: 1 } }); // Сброс на первую страницу-->
<!--};-->

<!--onMounted(async () => {-->
<!--    let attempts = 0;-->
<!--    const maxAttempts = 50;-->
<!--    const checkInterval = setInterval(() => {-->
<!--        attempts++;-->
<!--        if (authStore.token || attempts >= maxAttempts) {-->
<!--            clearInterval(checkInterval);-->
<!--            refreshEvents();-->
<!--        }-->
<!--    }, 100);-->

<!--    onUnmounted(() => clearInterval(checkInterval));-->
<!--});-->
<!--</script>-->

<!--<style scoped lang="scss">-->
<!--.error-message {-->
<!--    color: $error;-->
<!--    padding: p2r(20);-->
<!--}-->

<!--.courses {-->
<!--    padding-bottom: p2r(80);-->

<!--    .page-title {-->
<!--        margin-bottom: p2r(64);-->
<!--    }-->
<!--}-->
<!--</style>-->



<template>
    <div class="container courses" ref="topRef">
        <h1 class="page-title">{{ $t('courses.title') }}</h1>
        <div v-if="eventsError" class="error-message">
            {{ eventsError?.details || 'Ошибка загрузки мероприятий' }}
        </div>
        <div v-else>
            <div class="sort-tabs">
                <div
                    class="sort-tabs-item"
                    :class="{ active: activeTab === 'all' }"
                    @click="setActiveTab('all')"
                >
                    Все мероприятия
                </div>
                <div
                    class="sort-tabs-item"
                    :class="{ active: activeTab === 'future' }"
                    @click="setActiveTab('future')"
                >
                    Будущие
                </div>
                <div
                    class="sort-tabs-item"
                    :class="{ active: activeTab === 'past' }"
                    @click="setActiveTab('past')"
                >
                    Прошедшие
                </div>
            </div>
            <div class="row">
                <div v-for="event in filteredEvents" :key="event.ID" class="col-md-4">
                    <CourcesCard :event="event" />
                </div>
            </div>
        </div>
        <Pagination
            v-if="totalPages > 1"
            :current-page="currentPage"
            :total-pages="totalPages"
            @page-change="handlePageChange"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'nuxt/app';
import { useAuthStore } from '~/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const eventsError = ref(null);
const currentPage = computed(() => Number(route.query.page) || 1);
const topRef = ref(null);
const activeTab = ref('all');

const fetchCourseIds = async () => {
    if (!authStore.isAuthenticated || !authStore.token) return [];
    const { data, error } = await useFetch('/api/courses/getAccessible', {
        method: 'POST',
        body: {
            TOKEN: authStore.token,
            pager: { start: 1, limit: 10 },
        },
    });
    if (error.value) throw new Error(error.value.data?.error || 'Ошибка при загрузке ID курсов');
    return data.value?.COURSES || [];
};

const { data: eventsData, refresh: refreshEvents } = await useAsyncData(
    'events',
    async () => {
        try {
            eventsError.value = null;
            const courseIds = await fetchCourseIds();
            if (courseIds.length === 0) {
                return { events: [], pagination: { currentPage: 1, limit: 12, total: 0 } };
            }

            const response = await $fetch('/api/events', {
                query: { page: currentPage.value, iblockId: 13, GET_ALL_FILES: 'Y' },
                method: 'POST',
                body: {
                    params: {
                        filter: { IBLOCK_ID: 13, ACTIVE: 'Y', ID: courseIds },
                        select: ['NAME', 'IBLOCK_ID', 'ID', 'PROPERTY_*'],
                        pager: { start: currentPage.value, limit: 12 },
                    },
                },
            });

            if (!response?.events) throw new Error('Ошибка загрузки мероприятий');

            const allLectorIds = new Set<number>();
            response.events.forEach((event) => {
                const lectorSet = event.PROPS?.LECTOR_SET?.VALUE;
                if (Array.isArray(lectorSet)) {
                    lectorSet.forEach((lector) => {
                        const id = Number(lector.SUB_VALUES?.LECTORS?.VALUE);
                        if (id) allLectorIds.add(id);
                    });
                }
            });

            let profiles = {};
            if (allLectorIds.size > 0) {
                profiles = await $fetch('/api/getprofilesbyids', { method: 'POST', body: { params: { USER_IDS: [...allLectorIds] } } });
                if (!profiles || Object.keys(profiles).length === 0) throw new Error('Нет данных о лекторах');
            }

            response.events = response.events.map((event) => {
                const lectorSet = event.PROPS?.LECTOR_SET?.VALUE;
                if (Array.isArray(lectorSet)) {
                    event.lectors = lectorSet
                        .map((lector) => {
                            const id = Number(lector.SUB_VALUES?.LECTORS?.VALUE);
                            return { id, name: profiles[id] ? `${profiles[id].NAME} ${profiles[id].LAST_NAME || ''}`.trim() : 'Неизвестный лектор' };
                        })
                        .filter((lector) => lector.id);
                } else {
                    event.lectors = [];
                }
                return event;
            });

            return response;
        } catch (error) {
            eventsError.value = { details: error.message || 'Неизвестная ошибка' };
            return { events: [], pagination: { currentPage: 1, limit: 12, total: 0 } };
        }
    },
    { watch: [() => route.query.page] }
);

const uniqueEvents = computed(() => {
    const seenIds = new Set();
    return eventsData.value?.events.filter((event) => {
        if (seenIds.has(event.ID)) return false;
        seenIds.add(event.ID);
        return true;
    }) || [];
});

const filteredEvents = computed(() => {
    if (activeTab.value === 'all') {
        return uniqueEvents.value;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return uniqueEvents.value.filter((event) => {
        const dateForSort = event.PROPS?.DATE_FOR_SORT?.VALUE;

        if (!dateForSort) {
            return activeTab.value === 'past';
        }

        const eventDate = new Date(dateForSort);
        eventDate.setHours(0, 0, 0, 0);

        if (activeTab.value === 'future') {
            return eventDate >= today;
        } else if (activeTab.value === 'past') {
            return eventDate < today;
        }

        return true;
    });
});

const pagination = computed(() => eventsData.value?.pagination || { currentPage: 1, limit: 12, total: 0 });
const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.limit));

const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages.value) router.push({ path: route.path, query: { page } });
    scrollToTop();
};

const scrollToTop = () => {
    setTimeout(() => topRef.value?.scrollIntoView({ behavior: 'smooth' }), 100);
};

const setActiveTab = (tab: string) => {
    activeTab.value = tab;
};

onMounted(async () => {
    let attempts = 0;
    const maxAttempts = 50;
    const checkInterval = setInterval(() => {
        attempts++;
        if (authStore.token || attempts >= maxAttempts) {
            clearInterval(checkInterval);
            refreshEvents();
        }
    }, 100);

    onUnmounted(() => clearInterval(checkInterval));
});
</script>

<style scoped lang="scss">
.error-message {
    color: $error;
    padding: p2r(20);
}

.courses {
    padding-bottom: p2r(80);

    .page-title {
        margin-bottom: p2r(64);
    }
}
</style>