<template>
    <div class="courses" ref="topRef">
        <h1 class="page-title">{{ $t('webinars.title') }}</h1>
        <div v-if="eventsError" class="error-message">
            {{ eventsError?.details || 'Ошибка загрузки вебинаров' }}
        </div>
        <div v-else>
            <div class="row">
                <div v-for="event in webinarsData?.webinars" :key="event.ID" class="col-lg-4 col-xs-6">
                    <WebinarsCard :event="event" />
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

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const localeStore = useLocaleStore();

const eventsError = ref(null);
const currentPage = computed(() => Number(route.query.page) || 1);
const topRef = ref(null);
const locale = computed(() => localeStore.locale);
const isLoadedWebinars = ref(false);

const { data: webinarsData, refresh: refreshWebinars } = await useAsyncData(
    'webinars',
    async () => {
        try {
            eventsError.value = null;

            if (!authStore.isAuthenticated || !authStore.token) {
                isLoadedWebinars.value = true;
                return { webinars: [], pagination: { currentPage: 1, limit: 12, total: 0 } };
            }

            const response = await $fetch('/api/webinars/getAccessible', {
                method: 'POST',
                body: {
                    TOKEN: authStore.token,
                    select: ['NAME', 'IBLOCK_ID', 'ID', 'PREVIEW_PICTURE', 'PROPERTY_*'],
                    resize: [390, 242, true],
                    GET_ALL_FILES: 'Y',
                    pager: { start: currentPage.value, limit: 12 },
                    sort: { 'ACTIVE_FROM': 'DESC' }
                }
            });

            if (!response?.ITEMS?.[locale.value]) {
                throw new Error('Ошибка загрузки вебинаров для текущей локали');
            }

            // Обработка вебинаров
            const webinars = response.ITEMS[locale.value];

            // Обработка лекторов
            const allLectorIds = new Set<number>();
            webinars.forEach((webinar) => {
                const lectorSet = webinar.PROPS?.LECTOR_SET?.VALUE;
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
                    body: { params: { USER_IDS: [...allLectorIds] } }
                });
                if (!profiles || Object.keys(profiles).length === 0) {
                    console.warn('Нет данных о лекторах');
                }
            }

            // Добавление информации о лекторах к вебинарам
            const enrichedWebinars = webinars.map((webinar) => {
                const lectorSet = webinar.PROPS?.LECTOR_SET?.VALUE;
                if (Array.isArray(lectorSet)) {
                    webinar.lectors = lectorSet
                        .map((lector) => {
                            const id = Number(lector.SUB_VALUES?.LECTORS?.VALUE);
                            return {
                                id,
                                name: profiles[id]
                                    ? `${profiles[id].NAME} ${profiles[id].LAST_NAME || ''}`.trim()
                                    : 'Неизвестный лектор'
                            };
                        })
                        .filter((lector) => lector.id);
                } else {
                    webinar.lectors = [];
                }
                return webinar;
            });

            // Формирование объекта пагинации
            const pagination = {
                currentPage: response.PAGENAV?.PAGE || currentPage.value,
                limit: response.PAGENAV?.LIMIT || 12,
                total: Number(response.PAGENAV?.TOTAL) || enrichedWebinars.length
            };

            isLoadedWebinars.value = true;
            return { webinars: enrichedWebinars, pagination };
        } catch (error) {
            console.error('Ошибка загрузки вебинаров:', error);
            eventsError.value = { details: error.message || 'Неизвестная ошибка' };
            isLoadedWebinars.value = true;
            return { webinars: [], pagination: { currentPage: 1, limit: 12, total: 0 } };
        }
    },
    { watch: [() => route.query.page, () => authStore.token, () => locale.value] }
);

const pagination = computed(() => webinarsData.value?.pagination || { currentPage: 1, limit: 12, total: 0 });
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
    let attempts = 0;
    const maxAttempts = 50;
    const checkInterval = setInterval(() => {
        attempts++;
        if (authStore.token || attempts >= maxAttempts) {
            clearInterval(checkInterval);
            refreshWebinars();
        }
    }, 100);

    onUnmounted(() => clearInterval(checkInterval));
});

let checkInterval: NodeJS.Timeout | null = null;
</script>

<style scoped lang="scss">
.error-message {
    color: $error;
    padding: p2r(20);
}

.no-webinars {
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
}
</style>