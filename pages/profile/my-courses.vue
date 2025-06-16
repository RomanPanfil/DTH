<template>
    <div class="courses" ref="topRef">
        <h1 class="page-title">{{ $t('accountSidebar.myCourses') }}</h1>
        <div v-if="filteredCourses.length">
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
                <div v-for="course in filteredCourses" :key="course.ID" class="col-lg-4 col-xs-6">
                    <CourcesCard :event="course" />
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
import { useLocaleStore } from '~/stores/locale';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const localeStore = useLocaleStore();

const locale = computed(() => localeStore.locale);
const coursesError = ref(null);
const currentPage = computed(() => Number(route.query.page) || 1);
const topRef = ref(null);
const activeTab = ref('all');

const isLoadedCourses = ref(false)

const { data: coursesData, refresh: refreshCourses } = await useAsyncData(
    'lectorCourses',
    async () => {
        try {
            if (!authStore.isAuthenticated || !authStore.token) {
                throw new Error('ERROR_INVALID_TOKEN');
            }

            coursesError.value = null;
            const response = await $fetch('/api/lector/lector-courses', {
                method: 'POST',
                body: {
                    params: {
                        TOKEN: authStore.token,
                        pager: { start: currentPage.value, limit: 12 },
                        sort: { ACTIVE_FROM: 'DESC' },
                        select: ['NAME', 'IBLOCK_ID', 'ID', 'PREVIEW_PICTURE', 'CODE', 'PROPERTY_*'],
                        resize: [390, 242, true],
                        resize_WHEN_GALL: [640, 480, true],
                        GET_ALL_FILES: 'Y',
                    },
                },
            });

            if (response.error) {
                throw new Error(response.error);
            }

            const courses = response.courses?.[locale.value] || [];
            const pagination = response.pagination || { currentPage: 1, limit: 12, total: 0 };

            // Обработка лекторов
            const allLectorIds = new Set<number>();
            courses.forEach((course: any) => {
                const lectorSet = course.PROPS?.LECTOR_SET?.VALUE;
                if (Array.isArray(lectorSet)) {
                    lectorSet.forEach((lector: any) => {
                        const id = Number(lector.SUB_VALUES?.LECTORS?.VALUE);
                        if (id) allLectorIds.add(id);
                    });
                }
            });

            let profiles = {};
            if (allLectorIds.size > 0) {
                try {
                    profiles = await $fetch('/api/getprofilesbyids', {
                        method: 'POST',
                        body: { params: { USER_IDS: [...allLectorIds] } },
                    });
                } catch (error) {
                    console.error('Ошибка загрузки профилей лекторов:', error);
                }
            }

            courses.forEach((course: any) => {
                const lectorSet = course.PROPS?.LECTOR_SET?.VALUE;
                course.lectors = Array.isArray(lectorSet)
                    ? lectorSet
                        .map((lector: any) => {
                            const id = Number(lector.SUB_VALUES?.LECTORS?.VALUE);
                            return {
                                id,
                                name: profiles[id]
                                    ? `${profiles[id].NAME} ${profiles[id].LAST_NAME || ''}`.trim()
                                    : t('courses.unknownLector'),
                            };
                        })
                        .filter((lector: any) => lector.id)
                    : [];
            });

            console.log('Courses loaded for locale', locale.value, ':', courses); // Для отладки
            isLoadedCourses.value = true;
            return { courses, pagination };
        } catch (error: any) {
            console.error('Ошибка в useAsyncData:', error);
            coursesError.value = {
                statusMessage: error.message || t('courses.error'),
                statusCode: error.statusCode || 400,
                data: error.data || { error: error.message },
            };
            return { courses: [], pagination: { currentPage: 1, limit: 12, total: 0 } };
        }
    },
    { watch: [currentPage, locale] }
);

const uniqueCourses = computed(() => {
    const seenIds = new Set();
    return (
        coursesData.value?.courses.filter((course: any) => {
            if (seenIds.has(course.ID)) return false;
            seenIds.add(course.ID);
            return true;
        }) || []
    );
});

const filteredCourses = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return uniqueCourses.value.filter((course: any) => {
        if (activeTab.value === 'all') return true;

        const dateForSort = course.PROPS?.DATE_FOR_SORT?.VALUE;
        const courseDate = dateForSort ? new Date(dateForSort) : null;

        if (!courseDate) {
            return activeTab.value === 'past';
        }

        courseDate.setHours(0, 0, 0, 0);
        return activeTab.value === 'future' ? courseDate >= today : courseDate < today;
    });
});

const pagination = computed(() => coursesData.value?.pagination || { currentPage: 1, limit: 12, total: 0 });
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
    router.push({ path: route.path, query: { ...route.query, page: 1 } });
};

onMounted(async () => {
    if(!isLoadedCourses.value) {
        let attempts = 0;
        const maxAttempts = 50;
        const checkInterval = setInterval(() => {
            attempts++;
            if (authStore.token || attempts >= maxAttempts) {
                clearInterval(checkInterval);
                refreshCourses();
            }
        }, 100);

        onUnmounted(() => clearInterval(checkInterval));
    }
});
</script>

<style scoped lang="scss">
.error-message {
    color: $error;
    padding: p2r(20);
    text-align: center;
}

.no-courses {
    padding: p2r(20);
    text-align: center;
    color: $error;
}

.courses {
    padding-bottom: p2r(80);

    @media (max-width: 1366px) {
        padding-bottom: p2r(70);
    }

    @media (max-width: 1280px) {
        padding-bottom: p2r(60);
    }

    @media (max-width: 1024px) {
        padding-bottom: p2r(50);
    }

    @media (max-width: 768px) {
        padding-bottom: p2r(40);
        .page-title {
            font-size: p2r(28);
            line-height: p2r(34);
        }
    }

    @media (max-width: 599px) {
        padding-bottom: p2r(32);
    }

    .page-title {
        margin-bottom: p2r(64);

        @media (max-width: 1366px) {
            margin-bottom: p2r(52);
        }

        @media (max-width: 1024px) {
            margin-bottom: p2r(40);
        }
    }
}
</style>