<template>
    <div class="tabs">
        <div class="tabs-header" ref="tabsHeaderRef">
            <button
                v-for="tab in filteredTabs"
                :key="tab.id"
                :class="['tabs-header-item', { active: activeTab === tab.id }]"
                @click="activeTab = tab.id"
            >
                {{ tab.text }} <span class="tab-count">{{ tab.count }}</span>
            </button>
        </div>
        <div class="tabs-content">
            <div v-if="activeTab === 'journal'">
                <div v-if="props.journal.value.items.length === 0" class="no-results">
                    Нет элементов в журнале
                </div>
                <div v-else class="row">
                    <div
                        v-for="item in props.journal.value.items"
                        :key="item.ID"
                        class="col-md-3"
                    >
                        <JournalCard :item="item" :rubrics="rubrics" />
                    </div>
                </div>
                <Pagination
                    :current-page="props.journal.value.currentPage"
                    :total-pages="Math.ceil(props.journal.value.pagination.TOTAL / props.journal.value.pagination.LIMIT)"
                    section="journal"
                    @page-change="handlePageChange('journal', $event)"
                />
            </div>
            <div v-else-if="activeTab === 'webinars'">
                <div v-if="props.webinars.value.items.length === 0" class="no-results">
                    Нет вебинаров
                </div>
                <div v-else class="row">
                    <div
                        v-for="item in props.webinars.value.items"
                        :key="item.ID"
                        class="col-md-3"
                    >
                        <div class="placeholder-card">
                            {{ item.NAME || 'Вебинар без названия' }}
                        </div>
                    </div>
                </div>
                <Pagination
                    :current-page="props.webinars.value.currentPage"
                    :total-pages="Math.ceil(props.webinars.value.pagination.TOTAL / props.webinars.value.pagination.LIMIT)"
                    section="webinars"
                    @page-change="handlePageChange('webinars', $event)"
                />
            </div>
            <div v-else-if="activeTab === 'courses'">
                <div v-if="props.courses.value.items.length === 0" class="no-results">
                    Нет курсов
                </div>
                <div v-else class="row">
                    <div
                        v-for="item in props.courses.value.items"
                        :key="item.ID"
                        class="col-md-3"
                    >
                        <CourcesCard :event="item" />
                    </div>
                </div>
                <Pagination
                    :current-page="props.courses.value.currentPage"
                    :total-pages="Math.ceil(props.courses.value.pagination.TOTAL / props.courses.value.pagination.LIMIT)"
                    section="courses"
                    @page-change="handlePageChange('courses', $event)"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRuntimeConfig } from 'nuxt/app';

const props = defineProps<{
    journal: { value: { items: any[]; pagination: any; currentPage: number } };
    courses: { value: { items: any[]; pagination: any; currentPage: number } };
    webinars: { value: { items: any[]; pagination: any; currentPage: number } };
}>();

const emit = defineEmits(['page-change']);

const config = useRuntimeConfig();
const { data: rubricsData, error: rubricsError } = await useFetch('/api/rubrics');
const rubrics = computed(() => rubricsData.value?.rubrics || []);

if (rubricsError.value) {
    console.error('Error loading rubrics:', rubricsError.value);
}

watch(rubrics, (newVal) => {
    console.log('Rubrics loaded:', newVal);
}, { immediate: true });

// Исходный массив табов
const tabs = computed(() => [
    { id: 'courses', text: 'Курсы', count: props.courses.value?.items?.length || 0 },
    { id: 'webinars', text: 'Вебинары', count: props.webinars.value?.items?.length || 0 },
    { id: 'journal', text: 'Журнал DTH', count: props.journal.value?.items?.length || 0 },
]);

// Фильтруем табы, оставляя только те, у которых count > 0
const filteredTabs = computed(() => {
    const filtered = tabs.value.filter(tab => tab.count > 0);
    return filtered.length > 0 ? filtered : tabs.value; // Если все табы пустые, показываем все
});

// Управление activeTab
watch(filteredTabs, (newTabs) => {
    if (!newTabs.some(tab => tab.id === activeTab.value) && newTabs.length > 0) {
        activeTab.value = newTabs[0].id; // Переключаемся на первый доступный таб
    }
});

const activeTab = ref('journal');

// Обработчик изменения страницы
const tabsHeaderRef = ref(null);
const handlePageChange = (category: string, page: number) => {
    emit('page-change', { category, page });
    scrollToTabsContent();
};

const scrollToTabsContent = () => {
    setTimeout(() => {
        tabsHeaderRef.value?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
};

watch(() => props.journal, (newVal) => {
    console.log('Journal prop value:', newVal.value);
}, { immediate: true });

watch(() => props.courses, (newVal) => {
    console.log('Courses prop value:', newVal.value);
}, { immediate: true });

watch(() => props.webinars, (newVal) => {
    console.log('Webinars prop value:', newVal.value);
}, { immediate: true });
</script>

<style scoped lang="scss">
.tabs {
    margin-top: p2r(40);
    padding-bottom: p2r(40);

    &-header {
        display: flex;
        flex-wrap: wrap;
        gap: p2r(40);
        margin-bottom: p2r(40);
    }

    &-header-item {
        font-size: p2r(24);
        background: none;
        border: none;
        cursor: pointer;
        transition: color 0.3s, border 0.3s;
        border-bottom: 1px solid $border;

        &.active {
            color: $font-grey;
            border-bottom: none;
            font-weight: p2r(500);
            border-bottom: 1px solid transparent;
        }

        &:hover {
            color: $primary;
            border-bottom: 1px solid $primary;
        }
    }
}

.tab-count {
    font-size: p2r(14);
    color: $font-grey;
    position: relative;
    top: p2r(-7);
}
:deep(.pagination) {
    padding-bottom: p2r(60);
}
</style>