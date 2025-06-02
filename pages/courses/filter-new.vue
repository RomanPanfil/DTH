<template>
    <div class="container courses">
        <Breadcrumbs />
        <h2>Курсы</h2>
        <div class="row">
            <div class="col-md-3">
                <aside class="filter-aside">
                    <div class="filter">
                        <!-- Фильтр Направления (изменен с чекбоксов на текстовый селектор) -->
                        <div class="filter-section">
                            <label class="filter-label" @click="toggleDropdown('directions')">
                                Направления
                                <NuxtIcon name="chevron-up" :class="dropdowns.directions ? 'up' : 'down'" class="filter-icon" filled />
                            </label>
                            <div v-if="dropdowns.directions" class="filter-dropdown direction-selector">
                                <!-- Добавлен элемент "Все направления" -->
                                <div
                                    class="direction-option"
                                    :class="{ 'active': selectedDirection === 'all' }"
                                    @click="selectDirection('all')"
                                >
                                    Все направления
                                </div>
                                <div
                                    v-for="value in getFilterValues('DIRECTION')"
                                    :key="value.CONTROL_NAME"
                                    class="direction-option"
                                    :class="{ 'active': selectedDirection === value.CONTROL_NAME }"
                                    @click="selectDirection(value.CONTROL_NAME, value.HTML_VALUE)"
                                >
                                    {{ value.VALUE }} ({{ value.ELEMENT_COUNT }})
                                </div>
                            </div>
                        </div>

                        <!-- Фильтр Формат -->
                        <div class="filter-section">
                            <label class="filter-label" @click="toggleDropdown('format')">
                                Формат
                                <NuxtIcon name="chevron-up" :class="dropdowns.format ? 'up' : 'down'" class="filter-icon" filled />
                            </label>
                            <div v-if="dropdowns.format" class="filter-dropdown format">
                                <!-- Добавлен пункт "Любой" -->
                                <label class="filter-option custom-radio">
                                    <Field
                                        name="format_any"
                                        v-model="selectedFormat"
                                        type="radio"
                                        value="any"
                                        class="radio-input"
                                        @change="selectFormat('any')"
                                    />
                                    <span class="radio-indicator"></span>
                                    Любой
                                </label>
                                <label
                                    v-for="value in getFilterValues('FORMAT')"
                                    :key="value.CONTROL_NAME"
                                    class="filter-option custom-radio"
                                >
                                    <Field
                                        :name="value.CONTROL_NAME"
                                        v-model="selectedFormat"
                                        type="radio"
                                        :value="value.CONTROL_NAME"
                                        class="radio-input"
                                        @change="selectFormat(value.CONTROL_NAME, value.HTML_VALUE)"
                                    />
                                    <span class="radio-indicator"></span>
                                    {{ value.VALUE }} ({{ value.ELEMENT_COUNT }})
                                </label>
                            </div>
                        </div>

                        <!-- Фильтр Стоимость -->
                        <div class="filter-section">
                            <label class="filter-label">Стоимость</label>
                            <div class="filter-range">
                                <label
                                    v-for="range in getFilterRange('PRICE')"
                                    :key="range.CONTROL_NAME"
                                    class="filter-range-label"
                                >
                                    {{ range.NAME }}, {{ range.LABEL }}
                                    <input
                                        type="number"
                                        :name="range.CONTROL_NAME"
                                        v-model.number="filterValues[range.CONTROL_NAME]"
                                        :placeholder="range.VALUE || (range.LABEL === 'от' ? '0' : '1000')"
                                        min="0"
                                        class="filter-range-input"
                                        @input="applyFilters"
                                    />
                                </label>
                            </div>
                        </div>

                        <!-- Фильтр Место проведения -->
                        <div class="filter-section">
                            <label class="filter-label" @click="toggleDropdown('location')">
                                Место проведения
                                <NuxtIcon name="chevron-up" :class="dropdowns.location ? 'up' : 'down'" class="filter-icon" filled />
                            </label>
                            <div v-if="dropdowns.location" class="filter-dropdown">
                                <label
                                    v-for="value in getFilterValues('CITY')"
                                    :key="value.CONTROL_NAME"
                                    class="filter-option custom-checkbox"
                                >
                                    <Field
                                        :name="value.CONTROL_NAME"
                                        v-model="filterValues[value.CONTROL_NAME]"
                                        type="checkbox"
                                        :value="value.HTML_VALUE"
                                        :unchecked-value="false"
                                        class="checkbox-input"
                                        @change="applyFilters"
                                    />
                                    <span class="checkbox-indicator"></span>
                                    {{ value.VALUE }} ({{ value.VALUE_SUB || 'Неизвестная страна' }})
                                </label>
                            </div>
                        </div>

                        <!-- Фильтр Месяц проведения -->
                        <div class="filter-section">
                            <label class="filter-label" @click="toggleDropdown('month')">
                                Месяц проведения
                                <NuxtIcon name="chevron-up" :class="dropdowns.month ? 'up' : 'down'" class="filter-icon" filled />
                            </label>
                            <div v-if="dropdowns.month" class="filter-dropdown">
                                <label
                                    v-for="value in getFilterValues('MONTH')"
                                    :key="value.CONTROL_NAME"
                                    class="filter-option custom-checkbox"
                                >
                                    <Field
                                        :name="value.CONTROL_NAME"
                                        v-model="filterValues[value.CONTROL_NAME]"
                                        type="checkbox"
                                        :value="value.HTML_VALUE"
                                        :unchecked-value="false"
                                        class="checkbox-input"
                                        @change="applyFilters"
                                    />
                                    <span class="checkbox-indicator"></span>
                                    {{ value.VALUE }} ({{ value.ELEMENT_COUNT }})
                                </label>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
            <div class="col-md-9">
                <div class="filter-header">
                    <div class="filter-counter">
                        В разделе: {{ eventsData?.pagination?.total }} курсов.
                    </div>
                    <button class="ui-btn ui-btn__primary filter-header-reset" @click="resetFilters">
                        Очистить всё
                    </button>
                    <div class="filter-header-sort">
                        <div class="filter-header-free">
                            <label class="custom-checkbox">
                                <Field
                                    name="isFree"
                                    v-model="isFree"
                                    type="checkbox"
                                    value="Y"
                                    :unchecked-value="false"
                                    class="checkbox-input"
                                    @change="applyFilters"
                                />
                                <span class="checkbox-indicator"></span>
                                Только бесплатные
                            </label>
                        </div>
                        <div class="filter-header-upcoming">
                            <NuxtIcon name="filter-line" filled class="filter-header-upcoming-icon" />
                            Сначала ближайшие
                        </div>
                    </div>
                </div>
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
                <div class="courses-description" v-html="coursesDescription"></div>
            </div>
        </div>
        <EducationCards />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'nuxt/app';
import { Field } from 'vee-validate';
import { useLocaleStore } from '~/stores/locale';

const route = useRoute();
const router = useRouter();

const localeStore = useLocaleStore();
const locale = computed(() => localeStore.locale);

const coursesDescription = computed(() => {
    const localeSuffix = locale.value.toUpperCase();
    return settings.value?.COURSES_DESCRIPTION?.[`VALUE_${localeSuffix}`] || '';
});

const config = useRuntimeConfig();
const baseUrl = config.public.baseUrl;

const iblockId = 13;
const currentPage = computed(() => Number(route.query.page) || 1);
const eventsError = ref(null);
const isFree = ref<boolean | string>(false);

// Новая переменная для отслеживания выбранного направления
const selectedDirection = ref('all');
// Новая переменная для отслеживания выбранного формата
const selectedFormat = ref('any');

// Фильтры
const filters = ref<any[]>([]);
const dropdowns = ref<Record<string, boolean>>({
    directions: true,
    format: true,
    location: true,
    month: true,
});
const filterValues = ref<Record<string, any>>({});

// Получение значений фильтра по коду
const getFilterValues = (code: string) => {
    const filter = filters.value.find((f) => f.CODE === code);
    return filter?.VALUES ? Object.values(filter.VALUES) : [];
};

// Получение диапазона для фильтра (например, PRICE)
const getFilterRange = (code: string) => {
    const filter = filters.value.find((f) => f.CODE === code);
    return filter?.TYPE === 'RANGE' ? [
        { CONTROL_NAME: filter.VALUES.MIN.CONTROL_NAME, NAME: filter.NAME, LABEL: 'от', VALUE: filter.VALUES.MIN.VALUE },
        { CONTROL_NAME: filter.VALUES.MAX.CONTROL_NAME, NAME: filter.NAME, LABEL: 'до', VALUE: filter.VALUES.MAX.VALUE },
    ] : [];
};

// Функция выбора формата
const selectFormat = (controlName: string, value?: string) => {
    // Установка выбранного формата
    selectedFormat.value = controlName;

    // Сбрасываем все предыдущие фильтры формата
    const formatFilter = filters.value.find((f) => f.CODE === 'FORMAT');
    if (formatFilter && formatFilter.VALUES) {
        Object.values(formatFilter.VALUES).forEach((val: any) => {
            filterValues.value[val.CONTROL_NAME] = null;
        });
    }

    // Если выбран конкретный формат - устанавливаем его значение
    if (controlName !== 'any' && value) {
        filterValues.value[controlName] = value;
    }

    // Применяем фильтры
    applyFilters();
};

// Функция выбора направления
const selectDirection = (controlName: string, value?: string) => {
    // Установка выбранного направления
    selectedDirection.value = controlName;

    // Сбрасываем все предыдущие фильтры направлений
    const directionFilter = filters.value.find((f) => f.CODE === 'DIRECTION');
    if (directionFilter && directionFilter.VALUES) {
        Object.values(directionFilter.VALUES).forEach((val: any) => {
            filterValues.value[val.CONTROL_NAME] = false;
        });
    }

    // Если выбрано конкретное направление - устанавливаем его значение
    if (controlName !== 'all' && value) {
        filterValues.value[controlName] = value;
    }

    // Применяем фильтры
    applyFilters();
};

// Загрузка данных фильтра
const loadFilters = async () => {
    try {
        const response = await $fetch('/api/filter', {
            query: { iblockId, locale: locale.value },
        });
        console.log('Filters response:', response);
        if (response.filters) {
            filters.value = response.filters.filter((filter: any) => filter && filter.CODE && filter.CODE !== 'IS_FREE');
            filters.value.forEach((filter) => {
                if (filter.TYPE === 'RANGE') {
                    filterValues.value[filter.VALUES.MIN.CONTROL_NAME] = null;
                    filterValues.value[filter.VALUES.MAX.CONTROL_NAME] = null;
                } else {
                    Object.values(filter.VALUES).forEach((value) => {
                        filterValues.value[value.CONTROL_NAME] = filter.TYPE === 'RADIO' ? null : false;
                    });
                }
            });
            applyFilters();
        } else {
            eventsError.value = { details: 'Фильтры не найдены' };
        }
    } catch (error) {
        console.error('Ошибка загрузки фильтров:', error);
        eventsError.value = { details: 'Не удалось загрузить фильтры' };
    }
};

// Применение фильтров
const applyFilters = () => {
    const fastfilter: Record<string, any> = {};
    Object.keys(filterValues.value).forEach((key) => {
        if (filterValues.value[key] && filterValues.value[key] !== false) {
            fastfilter[key] = filterValues.value[key];
        }
    });
    if (isFree.value) {
        fastfilter['arrFilter_111_841265288'] = 'Y';
    } else {
        delete fastfilter['arrFilter_111_841265288'];
    }
    filterValues.value = { ...filterValues.value, fastfilter };
    refreshEvents();
};

// Загрузка фильтров при монтировании
onMounted(loadFilters);

const { data: eventsData, refresh: refreshEvents } = await useAsyncData(
    'events',
    async () => {
        try {
            const fastfilter = filterValues.value.fastfilter || {};
            const response = await $fetch('/api/events', {
                query: { page: currentPage.value, iblockId, GET_ALL_FILES: 'Y', locale: locale.value },
                method: 'POST',
                body: { params: { filter: { IBLOCK_ID: iblockId, ACTIVE: 'Y' }, select: ['NAME', 'IBLOCK_ID', 'ID', 'PROPERTY_*'], pager: { start: currentPage.value, limit: 12 }, fastfilter } },
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
            return null;
        }
    },
    { watch: [() => route.query.page, filterValues, isFree] }
);

const events = computed(() => eventsData.value?.events || []);
const pagination = computed(() => eventsData.value?.pagination || { currentPage: 1, limit: 12, total: 0 });
const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.limit));

const toggleDropdown = (key: string) => {
    dropdowns.value[key] = !dropdowns.value[key];
};

const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages.value) router.push({ path: route.path, query: { page } });
};

const { data: settings, error: settingsError } = await useFetch('/api/settings', { method: 'POST', body: {} });
if (settingsError.value) console.error('Failed to fetch settings:', settingsError.value);

// Обновлена функция сброса фильтров
const resetFilters = () => {
    isFree.value = false;
    selectedDirection.value = 'all'; // Сбрасываем выбранное направление
    selectedFormat.value = 'any'; // Сбрасываем выбранный формат
    filterValues.value = {};
    filters.value.forEach((filter) => {
        if (filter.TYPE === 'RANGE') {
            filterValues.value[filter.VALUES.MIN.CONTROL_NAME] = null;
            filterValues.value[filter.VALUES.MAX.CONTROL_NAME] = null;
        } else {
            Object.values(filter.VALUES).forEach((value) => {
                filterValues.value[value.CONTROL_NAME] = filter.TYPE === 'RADIO' ? null : false;
            });
        }
    });
    applyFilters();
};

useHead({
    title: 'Мероприятия DTH',
    meta: [
        { name: 'keywords', content: 'мероприятия dth, события, курсы' },
        { name: 'description', content: 'Мероприятия и курсы от Dental Training House' },
        { property: 'og:title', content: 'Мероприятия DTH' },
        { property: 'og:description', content: 'Мероприятия и курсы от Dental Training House' },
        { property: 'og:image', content: `${baseUrl}/images/logo.png` },
        { property: 'og:url', content: `${baseUrl}/courses` },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'DTH Events' },
    ],
});
</script>

<style scoped lang="scss">
.error-message { color: $error; padding: p2r(20); }

.filter {
    &-header { display: flex; justify-content: space-between; margin-bottom: p2r(34);
        &-sort { display: flex; gap: p2r(30); margin-left: auto; }
        &-free { display: flex; align-items: center; }
        &-upcoming { display: flex; align-items: center; gap: p2r(10);
            &-icon { font-size: p2r(24); line-height: p2r(20); }
        }
    }

    &-aside { padding: p2r(60); background: $bgc; box-shadow: 0 4px 35px rgba(114, 142, 174, 0.1); border-radius: p2r(6);
        .filter {
            &-section { margin-bottom: p2r(30); padding-bottom: p2r(30); border-bottom: 1px solid $border;
                &:last-child { margin-bottom: 0; border-bottom: none; }
                .filter-label { display: flex; align-items: center; justify-content: space-between; font-size: p2r(18); font-weight: 500; margin-bottom: p2r(20); color: $bgc-dark; cursor: pointer;
                    .filter-icon { font-size: p2r(14); line-height: p2r(12); color: #8a8a8a; transition: transform 0.3s; transform: translateX(p2r(3));
                        &.down { transform: rotate(180deg); }
                    }
                }
                .filter-dropdown { max-height: p2r(160); overflow-y: auto;
                    &::-webkit-scrollbar { width: p2r(6); }
                    &::-webkit-scrollbar-track { background: #eef1f8; border-radius: p2r(3); }
                    &::-webkit-scrollbar-thumb { background: $primary; border-radius: p2r(3); }
                    &.format { display: flex; flex-wrap: wrap; column-gap: p2r(40); }

                    /* Стили для текстового селектора направлений */
                    &.direction-selector {
                        .direction-option {
                            padding: p2r(5) p2r(10);
                            margin-bottom: p2r(10);
                            cursor: pointer;
                            border-radius: p2r(4);
                            transition: all 0.3s ease;

                            &:hover {
                                background-color: rgba(40, 167, 69, 0.1);
                            }

                            &.active {
                                color: $primary;
                                font-weight: 500;
                            }

                            &:last-child {
                                margin-bottom: 0;
                            }
                        }
                    }

                    .filter-option { display: flex; align-items: center; padding: p2r(5) 0; font-size: p2r(16); margin-bottom: p2r(10);
                        &:last-child { margin-bottom: 0; padding-bottom: 0; }
                        .checkbox-input, .radio-input { margin-right: p2r(10); width: p2r(16); height: p2r(16); display: none;
                            &:checked + .checkbox-indicator, &:checked + .radio-indicator { background-color: #28a745; border-color: #28a745;
                                &::after { content: ''; position: absolute; width: p2r(6); height: p2r(6); background: white; border-radius: 50%; top: 50%; left: 50%; transform: translate(-50%, -50%); }
                            }
                        }
                        .checkbox-indicator, .radio-indicator { display: inline-block; width: p2r(16); height: p2r(16); border: 2px solid #28a745; border-radius: p2r(4); position: relative; margin-right: p2r(10); transition: background-color 0.3s; }
                        .radio-indicator { border-radius: 50%; }
                    }
                }
                .filter-range { display: flex; align-items: center; gap: p2r(10);
                    &-label { font-size: p2r(12); width: calc(50% - 5px); }
                    &-input { width: 100%; padding: p2r(16) p2r(11); border: 1px solid $border; border-radius: p2r(4); font-size: p2r(16); text-align: center; margin-top: p2r(12); outline: none;
                        &[type='number'] { -moz-appearance: textfield;
                            &::-webkit-outer-spin-button, &::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
                        }
                    }
                }
            }
        }
    }
}

.courses { padding-bottom: p2r(80);
    &-description { margin-top: p2r(90); }
}
</style>