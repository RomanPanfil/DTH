<template>
    <div class="courses" ref="topRef">
        <h1 class="page-title">{{ $t('accountSidebar.myCourses') }}</h1>
        <div v-if="eventsError" class="error-message">
            {{ eventsError?.details || $t('courses.error') }}
        </div>
        <div v-else-if="!eventsData?.courses?.length && isLoadedCourses" class="no-courses">
            {{ $t('courses.noCourses') }}
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
                <div v-for="event in eventsData?.courses" :key="event.ID" class="col-lg-4 col-xs-6">
                    <CourcesCard :event="event"/>
                </div>
            </div>
            <Pagination
                v-if="totalPages > 0"
                :current-page="currentPage"
                :total-pages="totalPages"
                @page-change="handlePageChange"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'nuxt/app';
import { useAuthStore } from '~/stores/auth';
import { useLocaleStore } from '~/stores/locale';
import { useModalsStore } from '~/stores/modals';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const localeStore = useLocaleStore();
const modalsStore = useModalsStore();
const { t } = useI18n();

const eventsError = ref(null);
const currentPage = computed(() => Number(route.query.page) || 1);
const topRef = ref(null);
const activeTab = ref('all');
const locale = computed(() => localeStore.locale);
const isLoadedCourses = ref(false);

const today = new Date().toISOString().split('T')[0];

const getFilter = () => {
    if (activeTab.value === 'all') {
        return undefined;
    }
    if (activeTab.value === 'future') {
        return { '>PROPERTY_DATE_FOR_SORT': today };
    }
    if (activeTab.value === 'past') {
        return { '<PROPERTY_DATE_FOR_SORT': today };
    }
    return undefined;
};

const { data: eventsData, refresh: refreshEvents } = await useAsyncData(
    'events',
    async () => {
        try {
            eventsError.value = null;

            if (!authStore.isAuthenticated || !authStore.token) {
                isLoadedCourses.value = true;
                return { courses: [], pagination: { currentPage: 1, limit: 12, total: 0 } };
            }

            const response = await $fetch('/api/lector/lector-courses', {
                method: 'POST',
                body: {
                    TOKEN: authStore.token,
                    select: ['NAME', 'IBLOCK_ID', 'ID', 'PREVIEW_PICTURE', 'CODE', 'PROPERTY_*'],
                    resize: [390, 242, true],
                    GET_ALL_FILES: 'Y',
                    pager: { start: currentPage.value, limit: 12 },
                    sort: { 'ACTIVE_FROM': 'DESC' },
                    filter: getFilter(),
                },
            });

            if (!response?.ITEMS?.[locale.value]) {
                throw new Error('Ошибка загрузки курсов для текущей локали');
            }

            const courses = response.ITEMS[locale.value];

            const allLectorIds = new Set<number>();
            courses.forEach((course) => {
                const lectorSet = course.PROPS?.LECTOR_SET?.VALUE;
                if (Array.isArray(lectorSet)) {
                    lectorSet.forEach((lector) => {
                        const id = Number(lector.SUB_VALUES?.LECTORS?.VALUE);
                        if (id) allLectorIds.add(id);
                    });
                }
            });

            let profiles = {};
            if (allLectorIds.size > 0) {
                profiles = await $fetch('/api/getprofilesbyids', {
                    method: 'POST',
                    body: { params: { USER_IDS: [...allLectorIds] } },
                });
                if (!profiles || Object.keys(profiles).length === 0) {
                    console.warn('Нет данных о лекторах');
                }
            }

            const enrichedCourses = courses.map((course) => {
                const lectorSet = course.PROPS?.LECTOR_SET?.VALUE;
                if (Array.isArray(lectorSet)) {
                    course.lectors = lectorSet
                        .map((lector) => {
                            const id = Number(lector.SUB_VALUES?.LECTORS?.VALUE);
                            return {
                                id,
                                name: profiles[id]
                                    ? `${profiles[id].NAME} ${profiles[id].LAST_NAME || ''}`.trim()
                                    : 'Неизвестный лектор',
                            };
                        })
                        .filter((lector) => lector.id);
                } else {
                    course.lectors = [];
                }
                return course;
            });

            const pagination = {
                currentPage: response.PAGENAV?.PAGE || currentPage.value,
                limit: response.PAGENAV?.LIMIT || 12,
                total: Number(response.PAGENAV?.TOTAL) || enrichedCourses.length,
            };

            isLoadedCourses.value = true;
            return { courses: enrichedCourses, pagination };
        } catch (error) {
            console.error('Ошибка загрузки курсов:', error);
            if(error.data?.data?.error === 'ERROR_INVALID_TOKEN') {
                authStore.logout();
                await router.push('/');
                modalsStore.openModal('login');
            }
            eventsError.value = { details: error.message || 'Неизвестная ошибка' };
            isLoadedCourses.value = true;
            return { courses: [], pagination: { currentPage: 1, limit: 12, total: 0 } };
        }
    },
    { watch: [() => route.query.page, () => authStore.token, () => locale.value, activeTab] }
);

const pagination = computed(() => eventsData.value?.pagination || { currentPage: 1, limit: 12, total: 0 });
const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.limit));

const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        router.push({ path: route.path, query: { page } });
        scrollToTop();
    }
};

const scrollToTop = () => {
    setTimeout(() => topRef.value?.scrollIntoView({ behavior: 'smooth' }), 100);
};

const setActiveTab = (tab: string) => {
    activeTab.value = tab;
    router.push({ path: route.path, query: { page: 1 } }); // Сбрасываем на первую страницу при смене вкладки
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

let checkInterval: NodeJS.Timeout | null = null;

useHead({
    title: t('accountSidebar.myCourses'),
    meta: [
        { name: 'keywords', content: t('accountSidebar.myCourses') },
        { name: 'description', content: t('accountSidebar.myCourses') },
    ],
});
</script>

<style scoped lang="scss">
.error-message {
    color: $error;
    padding: p2r(20);
}

.no-courses {
    padding: p2r(20);
    text-align: center;
    color: $error;
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

    .sort-tabs {
        display: flex;
        gap: p2r(16);
        margin-bottom: p2r(32);
    }

    .sort-tabs-item {
        padding: p2r(8) p2r(16);
        cursor: pointer;
        border-bottom: p2r(2) solid transparent;
        &.active {
            border-bottom-color: $primary;
        }
    }
}
</style>