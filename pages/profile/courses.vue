<template>
    <div class="courses" ref="topRef">
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
                    {{ $t('coursesTabs.all') }}
                </div>
                <div
                    class="sort-tabs-item"
                    :class="{ active: activeTab === 'future' }"
                    @click="setActiveTab('future')"
                >
                    {{ $t('coursesTabs.future') }}
                </div>
                <div
                    class="sort-tabs-item"
                    :class="{ active: activeTab === 'past' }"
                    @click="setActiveTab('past')"
                >
                    {{ $t('coursesTabs.past') }}
                </div>
            </div>
            <div class="row">
                <div v-for="event in filteredEvents" :key="event.ID" class="col-lg-4 col-xs-6">
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

    @media(max-width: 1366px) {
        padding-bottom: p2r(70);
    }

    @media(max-width: 1280px) {
        padding-bottom: p2r(60);
    }

    @media(max-width: 1024px) {
        padding-bottom: p2r(50);
    }

    @media(max-width: 768px) {
        padding-bottom: p2r(40);
    }

    @media(max-width: 599px) {
        padding-bottom: p2r(32);
    }

    .page-title {
        margin-bottom: p2r(64);

        @media(max-width: 1366px) {
            margin-bottom: p2r(52);
        }

        @media(max-width: 1024px) {
            margin-bottom: p2r(40);
        }
    }
}
</style>