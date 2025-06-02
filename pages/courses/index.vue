<template>
    <div class="container courses" ref="topRef">
        <Breadcrumbs />
        <h1 class="page-title">{{ $t('courses.title')}}</h1>
        <div class="row">
            <div class="col-md-3">
                <aside class="filter-aside">
                    <div class="filter">
                        <div class="filter-section">
                            <label class="filter-label" @click="toggleDropdown('directions')">
                                {{ getFilterLabel('DIRECTION') }}
                                <NuxtIcon name="chevron-up" :class="dropdowns.directions ? 'up' : 'down'" class="filter-icon" filled />
                            </label>
                            <div v-if="dropdowns.directions" class="filter-dropdown direction-selector">
                                <div
                                    class="direction-option"
                                    :class="{ 'active': selectedDirection === 'all' }"
                                    @click="selectDirection('all')"
                                >
                                    {{ $t('courses.allDirections')}}
                                </div>
                                <div
                                    v-for="value in getFilterValues('DIRECTION')"
                                    :key="value.CONTROL_NAME"
                                    class="direction-option"
                                    :class="{ 'active': selectedDirection === value.CONTROL_NAME }"
                                    @click="selectDirection(value.CONTROL_NAME, value.HTML_VALUE)"
                                >
                                    <div class="filter-option-text">
                                        {{ value.VALUE }} <sup>{{ value.ELEMENT_COUNT }}</sup>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Фильтр Формат -->
                        <div class="filter-section">
                            <label class="filter-label" @click="toggleDropdown('format')">
                                {{ getFilterLabel('FORMAT') }}
                                <NuxtIcon name="chevron-up" :class="dropdowns.format ? 'up' : 'down'" class="filter-icon" filled />
                            </label>
                            <div v-if="dropdowns.format" class="filter-dropdown format">
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
                                    {{ value.VALUE }}
                                </label>
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
                                    {{ $t('courses.any') }}
                                </label>
                            </div>
                        </div>

                        <!-- Фильтр Стоимость -->
                        <div class="filter-section">
                            <label class="filter-label">
                                {{ getFilterLabel('PRICE') }}
                            </label>
                            <div class="filter-range">
                                <label
                                    v-for="range in getFilterRange('PRICE')"
                                    :key="range.CONTROL_NAME"
                                    class="filter-range-label"
                                >
                                    {{ range.LABEL }}
                                    <input
                                        type="number"
                                        :name="range.CONTROL_NAME"
                                        v-model.number="filterValues[range.CONTROL_NAME]"
                                        :placeholder="range.LABEL === t('courses.priceFrom') ? '0' : '1000'"
                                        min="0"
                                        class="filter-range-input"
                                        @input="validatePriceRange(range.CONTROL_NAME, label)"
                                    />
                                </label>
                            </div>
                        </div>

                        <!-- Фильтр Место проведения -->
                        <div class="filter-section">
                            <label class="filter-label" @click="toggleDropdown('location')">
                                {{ getFilterLabel('CITY') }}
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
                                    <div class="filter-option-text">{{ value.VALUE }} <sup>{{ value.VALUE_SUB || '' }}</sup></div>
                                </label>
                            </div>
                        </div>

                        <!-- Фильтр Месяц проведения -->
                        <div class="filter-section">
                            <label class="filter-label" @click="toggleDropdown('month')">
                                {{ getFilterLabel('WHEN_DATE_FILTER') }}
                                <NuxtIcon name="chevron-up" :class="dropdowns.month ? 'up' : 'down'" class="filter-icon" filled />
                            </label>
                            <div v-if="dropdowns.month" class="filter-dropdown">
                                <label
                                    v-for="value in getFilterValues('WHEN_DATE_FILTER')"
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
                                    <div class="filter-option-text">{{ value.VALUE }} <sup>{{ value.ELEMENT_COUNT }}</sup></div>
                                </label>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
            <div class="col-md-9">
                <div class="filter-header">
                    <button
                        v-if="hasActiveFilters"
                        class="ui-btn ui-btn__primary filter-header-reset"
                        @click="resetFilters"
                    >
                        {{ $t('courses.cleanFilter') }}
                        <NuxtIcon name="reset" filled class="filter-header-reset-icon" />
                    </button>
                    <div class="filter-counter">
                        {{ $t('courses.inSection') }}: {{ eventsData?.pagination?.total ?? 0 }} {{ getCourseWord(eventsData?.pagination?.total ?? 0) }}.
                    </div>
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
                                {{  $t('courses.freeOnly') }}
                            </label>
                        </div>
                        <div class="filter-header-upcoming" ref="upcomingRef">
                            <div class="upcoming-label" @click="toggleDropdown('upcoming')">
                                <NuxtIcon name="filter-line" filled class="filter-header-upcoming-icon" />
                                {{ selectedSortOption }}
                            </div>
                            <div v-if="dropdowns.upcoming" class="upcoming-dropdown">
                                <div
                                    class="upcoming-option"
                                    :class="{ 'active': selectedSortOption === 'Сначала ближайшие' }"
                                    @click="selectSortOption($t('courses.nearestFirst'))"
                                >
                                    {{ $t('courses.nearestFirst') }}
                                </div>
                                <div
                                    class="upcoming-option"
                                    :class="{ 'active': selectedSortOption === 'Сначала поздние' }"
                                    @click="selectSortOption($t('courses.nearestLast'))"
                                >
                                    {{ $t('courses.nearestLast') }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-if="eventsError" class="error-message">
                    {{ eventsError?.details || 'Ошибка загрузки мероприятий' }}
                </div>
                <div v-else class="row">
                    <div v-for="event in uniqueEvents" :key="event.ID" class="col-md-4">
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
    </div>
    <EducationCards />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'nuxt/app';
import { Field } from 'vee-validate';
import { useI18n } from 'vue-i18n';
import { useLocaleStore } from '~/stores/locale';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

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

const selectedDirection = ref('all');
const selectedFormat = ref('any');
const selectedSortOption = ref('Сначала ближайшие');

const filters = ref<any[]>([]);
const dropdowns = ref<Record<string, boolean>>({
    directions: true,
    format: true,
    location: true,
    month: true,
    upcoming: false,
});
const filterValues = ref<Record<string, any>>({});
const priceErrors = ref<Record<string, boolean>>({});
const topRef = ref(null);
const upcomingRef = ref(null);

// Computed property to check if any filter is active
const hasActiveFilters = computed(() => {
    // Check if "Free only" checkbox is active
    if (isFree.value) return true;

    // Check if direction filter is not on default "all"
    if (selectedDirection.value !== 'all') return true;

    // Check if format filter is not on default "any"
    if (selectedFormat.value !== 'any') return true;

    // Check if any price range is filled
    const priceFilter = filters.value.find((f) => f.CODE === 'PRICE');
    if (priceFilter) {
        if (filterValues.value[priceFilter.VALUES.MIN.CONTROL_NAME] !== null &&
            filterValues.value[priceFilter.VALUES.MIN.CONTROL_NAME] !== undefined &&
            filterValues.value[priceFilter.VALUES.MIN.CONTROL_NAME] !== '') return true;

        if (filterValues.value[priceFilter.VALUES.MAX.CONTROL_NAME] !== null &&
            filterValues.value[priceFilter.VALUES.MAX.CONTROL_NAME] !== undefined &&
            filterValues.value[priceFilter.VALUES.MAX.CONTROL_NAME] !== '') return true;
    }

    // Check if any checkbox filter is active
    for (const key in filterValues.value) {
        if (filterValues.value[key] === true ||
            (typeof filterValues.value[key] === 'string' &&
                filterValues.value[key] !== '' &&
                key !== 'fastfilter')) {
            return true;
        }
    }

    // Check if sort option is not the default
    if (selectedSortOption.value !== 'Сначала ближайшие') return true;

    return false;
});

// Закрытие выпадашки при клике вне области
const handleClickOutside = (event: MouseEvent) => {
    if (dropdowns.value.upcoming && upcomingRef.value && !upcomingRef.value.contains(event.target as Node)) {
        dropdowns.value.upcoming = false;
    }
};

// Добавляем и убираем обработчик событий
onMounted(() => {
    document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
});

// Получение значений фильтра по коду
const getFilterValues = (code: string) => {
    const filter = filters.value.find((f) => f.CODE === code);
    return filter?.VALUES ? Object.values(filter.VALUES) : [];
};

// Получение диапазона для фильтра (например, PRICE)
const getFilterRange = (code: string) => {
    const filter = filters.value.find((f) => f.CODE === code);
    return filter?.TYPE === 'RANGE'
        ? [
            { CONTROL_NAME: filter.VALUES.MIN.CONTROL_NAME, NAME: filter.NAME, LABEL: t('courses.priceFrom'), VALUE: filter.VALUES.MIN.VALUE },
            { CONTROL_NAME: filter.VALUES.MAX.CONTROL_NAME, NAME: filter.NAME, LABEL: t('courses.priceTo'), VALUE: filter.VALUES.MAX.VALUE },
        ]
        : [];
};

// Функция выбора формата
const selectFormat = (controlName: string, value?: string) => {
    selectedFormat.value = controlName;

    const formatFilter = filters.value.find((f) => f.CODE === 'FORMAT');
    if (formatFilter && formatFilter.VALUES) {
        Object.values(formatFilter.VALUES).forEach((val: any) => {
            filterValues.value[val.CONTROL_NAME] = null;
        });
    }

    if (controlName !== 'any' && value) {
        filterValues.value[controlName] = value;
    }

    applyFilters();
};

// Функция выбора направления
const selectDirection = (controlName: string, value?: string) => {
    selectedDirection.value = controlName;

    const directionFilter = filters.value.find((f) => f.CODE === 'DIRECTION');
    if (directionFilter && directionFilter.VALUES) {
        Object.values(directionFilter.VALUES).forEach((val: any) => {
            filterValues.value[val.CONTROL_NAME] = false;
        });
    }

    if (controlName !== 'all' && value) {
        filterValues.value[controlName] = value;
    }

    applyFilters();
};

// Функция выбора опции сортировки
const selectSortOption = (option: string) => {
    selectedSortOption.value = option;
    dropdowns.value.upcoming = false;
    applyFilters();
};

// Валидация диапазона цен - без отображения ошибок
const validatePriceRange = (controlName: string) => {
    priceErrors.value[controlName] = false;

    const priceFilter = filters.value.find((f) => f.CODE === 'PRICE');
    if (!priceFilter) return;

    const currentValue = filterValues.value[controlName];

    if (currentValue === '' || currentValue === null || isNaN(currentValue)) {
        filterValues.value[controlName] = null;
        applyFilters();
        return;
    }

    if (controlName === priceFilter.VALUES.MIN.CONTROL_NAME && currentValue < 0) {
        filterValues.value[controlName] = 0;
        applyFilters();
    }

    if (!hasErrors()) {
        applyFilters();
    }
};

// Проверка наличия ошибок валидации
const hasErrors = () => {
    return Object.values(priceErrors.value).some(error => error === true);
};

// Получение текста метки фильтра из поля NAME
const getFilterLabel = (code: string) => {
    const filter = filters.value.find((f) => f.CODE === code);
    return filter ? filter.NAME : code;
};

// Склонение слова "курс"
const getCourseWord = (count: number | undefined) => {
    // Явно обрабатываем случай когда count равен undefined или null
    if (count === undefined || count === null) return 'курсов';

    const absCount = Math.abs(count);
    const lastTwoDigits = absCount % 100;
    const lastDigit = absCount % 10;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return 'курсов';
    if (lastDigit === 1) return 'курс';
    if (lastDigit >= 2 && lastDigit <= 4) return 'курса';
    return 'курсов';
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
    if (hasErrors()) {
        return;
    }

    eventsError.value = null;

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
    scrollToTop();
};

// Загрузка фильтров при монтировании
onMounted(loadFilters);

const { data: eventsData, refresh: refreshEvents } = await useAsyncData(
    'events',
    async () => {
        try {
            eventsError.value = null;

            const fastfilter = filterValues.value.fastfilter || {};
            const sortDirection = selectedSortOption.value === 'Сначала ближайшие' ? 'ASC' : 'DESC';
            const response = await $fetch('/api/events', {
                query: { page: currentPage.value, iblockId, GET_ALL_FILES: 'Y', locale: locale.value },
                method: 'POST',
                body: {
                    params: {
                        filter: { IBLOCK_ID: iblockId, ACTIVE: 'Y' },
                        select: ['NAME', 'IBLOCK_ID', 'ID', 'PROPERTY_*'],
                        pager: { start: currentPage.value, limit: 12 },
                        fastfilter,
                        sort: { 'PROPERTY_DATE_FOR_SORT': sortDirection }, // Сортировка по PROPERTY_DATE_FOR_SORT
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
            return null;
        }
    },
    { watch: [() => route.query.page, filterValues, isFree, selectedSortOption] }
);

// Уникальные события по ID
const uniqueEvents = computed(() => {
    const seenIds = new Set();
    return eventsData.value?.events.filter((event) => {
        if (seenIds.has(event.ID)) {
            return false;
        }
        seenIds.add(event.ID);
        return true;
    }) || [];
});

const pagination = computed(() => eventsData.value?.pagination || { currentPage: 1, limit: 12, total: 0 });
const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.limit));

const toggleDropdown = (key: string) => {
    dropdowns.value[key] = !dropdowns.value[key];
};

const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages.value) router.push({ path: route.path, query: { page } });
    scrollToTop();
};

const scrollToTop = () => {
    setTimeout(() => {
        topRef.value?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
};

const { data: settings, error: settingsError } = await useFetch('/api/settings', { method: 'POST', body: {} });
if (settingsError.value) console.error('Failed to fetch settings:', settingsError.value);

const resetFilters = () => {
    isFree.value = false;
    selectedDirection.value = 'all';
    selectedFormat.value = 'any';
    selectedSortOption.value = 'Сначала ближайшие';
    filterValues.value = {};
    priceErrors.value = {};

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
.error-message {
    color: $error;
    padding: p2r(20);
}

.filter {
    &-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: p2r(10);
        margin-bottom: p2r(34);

        &-sort {
            display: flex;
            gap: p2r(30);
            margin-left: auto;
        }

        &-free {
            display: flex;
            align-items: center;
        }

        &-upcoming {
            position: relative;
            display: flex;
            align-items: center;
            gap: p2r(10);

            &-icon {
                font-size: p2r(24);
                line-height: p2r(20);
            }
        }

        &-reset {
            font-size: p2r(12);
            text-transform: uppercase;
            margin-right: p2r(24);
            height: p2r(36);
            line-height: p2r(34);
            padding-left: p2r(10);
            padding-right: p2r(10);
            border-radius: p2r(2);
            display: flex;
            align-items: center;

            &-icon {
                font-size: p2r(10);
                line-height: p2r(8);
                margin-left: p2r(10);
                font-weight: 700;
            }
        }
    }

    &-aside {
        padding: p2r(60);
        background: $bgc;
        box-shadow: 0 4px 35px rgba(114, 142, 174, 0.1);
        border-radius: p2r(6);

        .filter {
            &-section {
                margin-bottom: p2r(30);
                padding-bottom: p2r(30);
                border-bottom: 1px solid $border;

                &:last-child {
                    margin-bottom: 0;
                    border-bottom: none;
                }

                .filter-label {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    font-size: p2r(18);
                    font-weight: 500;
                    margin-bottom: p2r(14);
                    color: $bgc-dark;
                    cursor: pointer;

                    .filter-icon {
                        font-size: p2r(14);
                        line-height: p2r(12);
                        color: #8a8a8a;
                        transition: transform 0.3s;
                        transform: translateX(p2r(4));

                        &.down {
                            transform: rotate(180deg);
                        }
                    }
                }

                .filter-dropdown {
                    max-height: p2r(170);
                    overflow-y: auto;

                    &::-webkit-scrollbar {
                        width: p2r(6);
                    }

                    &::-webkit-scrollbar-track {
                        background: #eef1f8;
                        border-radius: p2r(3);
                    }

                    &::-webkit-scrollbar-thumb {
                        background: $primary;
                        border-radius: p2r(3);
                    }

                    &.format {
                        display: flex;
                        flex-wrap: wrap;
                        column-gap: p2r(40);
                    }

                    &.direction-selector {
                        .direction-option {
                            margin-bottom: p2r(14);
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
                }

                .filter-range {
                    display: flex;
                    align-items: center;
                    gap: p2r(10);

                    &-label {
                        position: relative;
                        font-size: p2r(12);
                        width: calc(50% - 5px);
                    }

                    &-input {
                        width: 100%;
                        padding: p2r(16) p2r(11);
                        border: 1px solid $border;
                        border-radius: p2r(4);
                        font-size: p2r(16);
                        text-align: center;
                        margin-top: p2r(12);
                        outline: none;

                        &[type='number'] {
                            -moz-appearance: textfield;

                            &::-webkit-outer-spin-button,
                            &::-webkit-inner-spin-button {
                                -webkit-appearance: none;
                                margin: 0;
                            }
                        }
                    }
                }
            }

            &-option {
                display: flex;
                align-items: center;
                padding: p2r(2) 0;
                font-size: p2r(16);
                margin-bottom: p2r(10);

                &:last-child {
                    margin-bottom: 0;
                    padding-bottom: 0;
                }

                .checkbox-input {
                    margin-right: p2r(10);
                    width: p2r(16);
                    height: p2r(16);
                }

                &-text {
                    sup {
                        color: $placeholder;
                    }
                }
            }
        }
    }
}

.courses {
    padding-bottom: p2r(80);

    &-description {
        margin-top: p2r(90);
    }

    .page-title {
        margin-bottom: p2r(64);
    }
}

.upcoming {
    &-label {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: p2r(10);
        cursor: pointer;
        min-width: p2r(204);
    }
    &-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: $bgc;
        box-shadow: 0 4px 35px rgba(114, 142, 174, 0.1);
        border-radius: p2r(6);
        padding: p2r(10);
        z-index: 10;
        min-width: p2r(204);
    }
    &-option {
        padding: p2r(5) p2r(10);
        margin-bottom: p2r(5);
        cursor: pointer;
        border-radius: p2r(4);
        transition: all 0.3s ease;

        &:hover {
            color: $primary;
        }

        &.active {
            color: $placeholder;
        }

        &:last-child {
            margin-bottom: 0;
        }
    }
}
</style>