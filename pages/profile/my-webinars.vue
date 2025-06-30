<template>
    <div class="courses" ref="topRef">
        <h1 class="page-title">{{ $t('accountSidebar.myWebinars') }}</h1>
        <div v-if="coursesError" class="error-message">
            {{ coursesError?.statusMessage || $t('courses.error') }}
        </div>
        <div v-else-if="!coursesData?.courses?.length && isLoadedCourses" class="no-courses">
            {{ $t('courses.noCourses') }}
        </div>
        <div v-else>
            <div class="row">
                <div v-for="course in coursesData?.courses" :key="course.ID" class="col-lg-4 col-xs-6">
                    <WebinarsCard :event="course" />
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
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const localeStore = useLocaleStore();
import { useModalsStore } from '~/stores/modals';

const locale = computed(() => localeStore.locale);
const coursesError = ref(null);
const currentPage = computed(() => Number(route.query.page) || 1);
const topRef = ref(null);
const isLoadedCourses = ref(false);
const modalsStore = useModalsStore();

const { data: coursesData, refresh: refreshCourses } = await useAsyncData(
    'lectorCourses',
    async () => {
        try {
            if (!authStore.isAuthenticated || !authStore.token) {
                throw new Error('ERROR_INVALID_TOKEN');
            }

            coursesError.value = null;
            const response = await $fetch('/api/lector/lector-webinars', {
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

            const courses = response.courses?.[locale.value];
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

            isLoadedCourses.value = true;
            return { courses, pagination };
        } catch (error: any) {
            console.error('Ошибка в useAsyncData:', error);

            if(error.data?.error) {
                authStore.logout();
                await router.push('/');
                modalsStore.openModal('login');
            }
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

onMounted(async () => {
    if (!isLoadedCourses.value) {
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

useHead({
    title: t('accountSidebar.myWebinars'),
    meta: [
        { name: 'keywords', content: t('accountSidebar.myWebinars') },
        { name: 'description', content: t('accountSidebar.myWebinars') },
    ],
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