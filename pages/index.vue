<template>
    <div class="container">
        <div class="slider">
            <div class="row">
                <div class="col-md-9">
                    <MainSlider />
                </div>
                <div class="col-md-3">
                    <MainBanner />
                </div>
            </div>
        </div>
        <MainAdvantages />
        <CourcesShort :events="featuredEvents" />
    </div>
    <EducationCards />
    <div class="container">
        <JournalShort :news="news" :rubrics="rubrics" />
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const iblockId = 13;

const news = ref([]);
const rubrics = ref([]);

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

const { data: eventsData, error: eventsError } = await useAsyncData('featuredEvents', async () => {
    try {
        const { data } = await useFetch('/api/items', {
            query: {
                iblockId,
                GET_ALL_FILES: 'Y',
                isFeatured: '1',
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

        return processedEvents.slice(0, 4);
    } catch (err) {
        console.error('Ошибка при загрузке избранных курсов:', err);
        return [];
    }
});

const featuredEvents = ref(eventsData.value || []);

if (eventsError.value) {
    console.error('Ошибка useAsyncData для событий:', eventsError.value);
}

const { data: newsData, error: newsError } = await useAsyncData('news', async () => {
    try {
        const { data } = await useFetch('/api/news', {
            query: { page: 1, limit: 12 },
        });
        return data.value?.news || [];
    } catch (err) {
        console.error('Ошибка при загрузке новостей:', err);
        return [];
    }
});

const { data: rubricsData, error: rubricsError } = await useAsyncData('rubrics', async () => {
    try {
        const { data } = await useFetch('/api/rubrics');
        return data.value?.rubrics || [];
    } catch (err) {
        console.error('Ошибка при загрузке рубрик:', err);
        return [];
    }
});

news.value = newsData.value || [];
rubrics.value = rubricsData.value || [];

if (newsError.value) {
    console.error('Ошибка useAsyncData для новостей:', newsError.value);
}
if (rubricsError.value) {
    console.error('Ошибка useAsyncData для рубрик:', rubricsError.value);
}
</script>

<style scoped lang="scss">
.slider {
    margin-bottom: p2r(70);
}
</style>