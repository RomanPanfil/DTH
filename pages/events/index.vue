<template>
    <div class="container">
        <Breadcrumbs />
        <h2>Мероприятия</h2>
        <div class="row">
            <div class="col-md-3">
                <aside>
                    sidebar
                </aside>
            </div>
            <div class="col-md-9">
                <div v-if="eventsError" class="error-message">
                    {{ eventsError?.details || 'Ошибка загрузки мероприятий' }}
                </div>
                <div v-else class="row">
                    <div v-for="event in events" :key="event.ID" class="col-md-4">
                        <CourcesCard :event="event" />
                    </div>
                </div>
                <Pagination
                    v-if="totalPages > 1"
                    :current-page="currentPage"
                    :total-pages="totalPages"
                    @page-change="handlePageChange"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'nuxt/app';

const route = useRoute();
const router = useRouter();

// Получаем конфигурацию из runtimeConfig
const config = useRuntimeConfig();
const baseUrl = config.public.baseUrl;

const iblockId = 13; // ID инфоблока для мероприятий
const currentPage = computed(() => Number(route.query.page) || 1);
const eventsData = ref(null);
const eventsError = ref(null);

// Функция для получения профилей лекторов
const fetchLectors = async (lectorIds: number[]) => {
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

// Функция для получения списка мероприятий
const fetchEvents = async (page) => {
    try {
        const { data, error } = await useFetch('/api/items', {
            query: {
                page,
                iblockId,
                GET_ALL_FILES: 'Y',
            },
        });

        if (error.value) {
            throw new Error(error.value.message || 'Ошибка загрузки мероприятий');
        }

        if (data.value?.events) {
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

            data.value.events = data.value.events.map(event => {
                const lectorSet = event.PROPS?.LECTOR_SET?.VALUE;
                if (Array.isArray(lectorSet)) {
                    event.lectors = lectorSet
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
                    event.lectors = [];
                }
                return event;
            });
        }

        eventsData.value = data.value;
        eventsError.value = null;
    } catch (error) {
        eventsError.value = { details: error.message };
    }
};

// Отслеживаем изменение страницы
watch(() => route.query.page, (newPage) => {
    const page = Number(newPage) || 1;
    fetchEvents(page);
}, { immediate: true });

// Вычисляемые свойства для списка мероприятий и пагинации
const events = computed(() => eventsData.value?.events || []);
const pagination = computed(() => eventsData.value?.pagination || { currentPage: 1, limit: 12, total: 0 });
const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.limit));

// Обработка смены страницы
const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        router.push({ path: route.path, query: { page } });
    }
};

// Устанавливаем метатеги
useHead({
    title: 'Мероприятия DTH',
    meta: [
        { name: 'keywords', content: 'мероприятия dth, события, курсы' },
        { name: 'description', content: 'Мероприятия и курсы от Dental Training House' },
        { property: 'og:title', content: 'Мероприятия DTH' },
        { property: 'og:description', content: 'Мероприятия и курсы от Dental Training House' },
        { property: 'og:image', content: `${baseUrl}/images/logo.png` },
        { property: 'og:url', content: `${baseUrl}/events` },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'DTH Events' },
    ],
});
</script>

<style scoped lang="scss">
.error-message {
    color: red;
    padding: p2r(20);
}
</style>