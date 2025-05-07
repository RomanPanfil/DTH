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
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'nuxt/app';

const route = useRoute();
const router = useRouter();

const config = useRuntimeConfig();
const baseUrl = config.public.baseUrl;

const iblockId = 13;
const currentPage = computed(() => Number(route.query.page) || 1);
const eventsError = ref(null);

// Выполняем запрос мероприятий через useAsyncData для SSR
const { data: eventsData } = await useAsyncData('events', async () => {
    try {
        const response = await $fetch('/api/items', {
            query: {
                page: currentPage.value,
                iblockId,
                GET_ALL_FILES: 'Y',
            },
        });

        if (!response?.events) {
            throw new Error('Ошибка загрузки мероприятий');
        }

        const allLectorIds = new Set<number>();
        response.events.forEach(event => {
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
            const requestBody = {
                params: {
                    USER_IDS: [...allLectorIds],
                },
            };
            profiles = await $fetch('/api/getprofilesbyids', {
                method: 'POST',
                body: requestBody,
            });

            if (!profiles || Object.keys(profiles).length === 0) {
                throw new Error('Нет данных о лекторах');
            }
        }

        response.events = response.events.map(event => {
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

        return response;
    } catch (error) {
        eventsError.value = { details: error.message || 'Неизвестная ошибка' };
        return null;
    }
}, {
    watch: [() => route.query.page], // Реактивно обновляем данные при изменении страницы
});

const events = computed(() => eventsData.value?.events || []);
const pagination = computed(() => eventsData.value?.pagination || { currentPage: 1, limit: 12, total: 0 });
const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.limit));

const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        router.push({ path: route.path, query: { page } });
    }
};

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