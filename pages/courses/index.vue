<template>
    <div class="container courses" ref="topRef">
        <Breadcrumbs />
        <h1 class="page-title">{{ $t('courses.title') }}</h1>
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
                                    {{ $t('courses.allDirections') }}
                                </div>
                                <div
                                    v-for="value in getFilterValues('DIRECTION')"
                                    :key="value.CONTROL_NAME"
                                    class="direction-option"
                                    @click="selectDirection(value.CONTROL_NAME, value.HTML_VALUE)"
                                    :class="{ 'active': selectedDirection === value.CONTROL_NAME }">
                                    <div class="filter-option-text">
                                        {{ value.VALUE }} <sup>{{ value.ELEMENT_COUNT }}</sup>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                                        @input="validatePriceRange(range.CONTROL_NAME)"
                                    />
                                </label>
                            </div>
                        </div>
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
                        class="ui-btn ui-btn__primary filter-header-reset hidden-tablet"
                        @click="resetFilters"
                    >
                        {{ $t('courses.cleanFilter') }}
                        <NuxtIcon name="reset" filled class="filter-header-reset-icon" />
                    </button>
                    <div class="filter-counter">
                        {{ $t('courses.inSection') }}: {{ eventsData?.pagination?.total ?? 0 }} {{ getCourseWord(eventsData?.pagination?.total ?? 0) }}.
                    </div>
                    <div class="filter-header-sort">
                        <div class="filter-popup-trigger" @click="toggleFilterPopup">
                            <NuxtIcon name="filter-trigger" filled class="filter-popup-trigger-icon" />
                            {{ $t('courses.filter') }}
                            <span class="filter-popup-trigger-counter" v-if="activeFiltersCount > 0">{{ activeFiltersCount }}</span>
                        </div>
                        <div class="filter-header-free hidden-tablet">
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
                                {{ $t('courses.freeOnly') }}
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
                    <div v-for="event in uniqueEvents" :key="event.ID" class="col-lg-4 col-sm-6">
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
<!--    <EducationCards />-->
    <CourcesColored :courses="featuredWebinars" />

    <div class="filter-mobile" :class="{ 'show': filterPopupOpen }">
        <NuxtIcon name="cross" class="filter-popup-close hidden-desktop" @click="closeFilterPopup"></NuxtIcon>
        <div class="filter">
            <div class="filter-section">
                <label class="filter-label" @click="toggleDropdown('directions')">
                    {{ getFilterLabel('DIRECTION') }}
                    <NuxtIcon name="chevron-up" :class="dropdowns.directions ? 'up' : 'down'" class="filter-icon" filled />
                </label>
                <div v-if="dropdowns.directions" class="filter-dropdown direction-selector">
                    <div
                        class="direction-option"
                        :class="{ 'active': tempSelectedDirection === 'all' }"
                        @click="tempSelectDirection('all')"
                    >
                        {{ $t('courses.allDirections') }}
                    </div>
                    <div
                        v-for="value in getFilterValues('DIRECTION')"
                        :key="value.CONTROL_NAME"
                        class="direction-option"
                        :class="{ 'active': tempSelectedDirection === value.CONTROL_NAME }"
                        @click="tempSelectDirection(value.CONTROL_NAME, value.HTML_VALUE)"
                    >
                        <div class="filter-option-text">
                            {{ value.VALUE }} <sup>{{ value.ELEMENT_COUNT }}</sup>
                        </div>
                    </div>
                </div>
            </div>
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
                            v-model="tempSelectedFormat"
                            type="radio"
                            :value="value.CONTROL_NAME"
                            class="radio-input"
                            @change="tempSelectFormat(value.CONTROL_NAME, value.HTML_VALUE)"
                        />
                        <span class="radio-indicator"></span>
                        {{ value.VALUE }}
                    </label>
                    <label class="filter-option custom-radio">
                        <Field
                            name="format_any"
                            v-model="tempSelectedFormat"
                            type="radio"
                            value="any"
                            class="radio-input"
                            @change="tempSelectFormat('any')"
                        />
                        <span class="radio-indicator"></span>
                        {{ $t('courses.any') }}
                    </label>
                </div>
            </div>
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
                            v-model.number="tempFilterValues[range.CONTROL_NAME]"
                            :placeholder="range.LABEL === t('courses.priceFrom') ? '0' : '1000'"
                            min="0"
                            class="filter-range-input"
                            @input="tempValidatePriceRange(range.CONTROL_NAME)"
                        />
                    </label>
                </div>
            </div>
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
                            v-model="tempFilterValues[value.CONTROL_NAME]"
                            type="checkbox"
                            :value="value.HTML_VALUE"
                            :unchecked-value="false"
                            class="checkbox-input"
                        />
                        <span class="checkbox-indicator"></span>
                        <div class="filter-option-text">{{ value.VALUE }} <sup>{{ value.VALUE_SUB || '' }}</sup></div>
                    </label>
                </div>
            </div>
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
                            v-model="tempFilterValues[value.CONTROL_NAME]"
                            type="checkbox"
                            :value="value.HTML_VALUE"
                            :unchecked-value="false"
                            class="checkbox-input"
                        />
                        <span class="checkbox-indicator"></span>
                        <div class="filter-option-text">{{ value.VALUE }} <sup>{{ value.ELEMENT_COUNT }}</sup></div>
                    </label>
                </div>
            </div>
            <div class="filter-header-free">
                <label class="custom-checkbox">
                    <Field
                        name="isFree"
                        v-model="tempIsFree"
                        type="checkbox"
                        value="Y"
                        :unchecked-value="false"
                        class="checkbox-input"
                    />
                    <span class="checkbox-indicator"></span>
                    {{ $t('courses.freeOnly') }}
                </label>
            </div>
        </div>
        <div class="filter-mobile-btns">
            <button class="ui-btn ui-btn__primary filter-mobile-apply" @click="applyMobileFilters">{{ $t('courses.apply') }}</button>
            <button class="ui-btn ui-btn__primary" @click="resetMobileFilters">{{ $t('courses.cleanFilter') }}</button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'nuxt/app';
import { Field } from 'vee-validate';
import { useI18n } from 'vue-i18n';
import { useLocaleStore } from '~/stores/locale';
import {useSettingsStore} from '~/stores/settings';


const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const localeStore = useLocaleStore();
const settingsStore = useSettingsStore();
const locale = computed(() => localeStore.locale);

const coursesDescription = computed(() => {
    return settingsStore.getSetting('COURSES_DESCRIPTION', locale.value) || '';
});

// Гарантируем загрузку настроек при монтировании компонента
onMounted(async () => {
    if (!settingsStore.settings && !settingsStore.isLoading) {
        await settingsStore.fetchSettings();
    }
});

const config = useRuntimeConfig();
const baseUrl = config.public.baseUrl;

const iblockId = 13;
const currentPage = computed(() => Number(route.query.page) || 1);
const eventsError = ref(null);
const isFree = ref<boolean | string>(false);
const filterPopupOpen = ref<boolean>(false);

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
const topRef = ref<HTMLElement | null>(null);
const upcomingRef = ref<HTMLElement | null>(null);

// Временное состояние для мобильных фильтров
const tempIsFree = ref<boolean | string>(false);
const tempSelectedDirection = ref('all');
const tempSelectedFormat = ref('any');
const tempFilterValues = ref<Record<string, any>>({});

// Инициализация временного состояния
const syncTempFilters = () => {
    tempIsFree.value = isFree.value;
    tempSelectedDirection.value = selectedDirection.value;
    tempSelectedFormat.value = selectedFormat.value;
    tempFilterValues.value = { ...filterValues.value };
};

// Computed property to check if any filter is active
const hasActiveFilters = computed(() => {
    if (isFree.value) return true;
    if (selectedDirection.value !== 'all') return true;
    if (selectedFormat.value !== 'any') return true;
    const priceFilter = filters.value.find((f) => f.CODE === 'PRICE');
    if (priceFilter) {
        if (
            filterValues.value[priceFilter.VALUES.MIN.CONTROL_NAME] !== null &&
            filterValues.value[priceFilter.VALUES.MIN.CONTROL_NAME] !== undefined &&
            filterValues.value[priceFilter.VALUES.MIN.CONTROL_NAME] !== ''
        ) return true;
        if (
            filterValues.value[priceFilter.VALUES.MAX.CONTROL_NAME] !== null &&
            filterValues.value[priceFilter.VALUES.MAX.CONTROL_NAME] !== undefined &&
            filterValues.value[priceFilter.VALUES.MAX.CONTROL_NAME] !== ''
        ) return true;
    }
    for (const key in filterValues.value) {
        if (
            filterValues.value[key] === true ||
            (typeof filterValues.value[key] === 'string' && filterValues.value[key] !== '' && key !== 'fastfilter')
        ) {
            return true;
        }
    }
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

// Функции для десктопных фильтров
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

// Функции для мобильных фильтров
const tempSelectFormat = (controlName: string, value?: string) => {
    tempSelectedFormat.value = controlName;
    const formatFilter = filters.value.find((f) => f.CODE === 'FORMAT');
    if (formatFilter && formatFilter.VALUES) {
        Object.values(formatFilter.VALUES).forEach((val: any) => {
            tempFilterValues.value[val.CONTROL_NAME] = null;
        });
    }
    if (controlName !== 'any' && value) {
        tempFilterValues.value[controlName] = value;
    }
};

const tempSelectDirection = (controlName: string, value?: string) => {
    tempSelectedDirection.value = controlName;
    const directionFilter = filters.value.find((f) => f.CODE === 'DIRECTION');
    if (directionFilter && directionFilter.VALUES) {
        Object.values(directionFilter.VALUES).forEach((val: any) => {
            tempFilterValues.value[val.CONTROL_NAME] = false;
        });
    }
    if (controlName !== 'all' && value) {
        tempFilterValues.value[controlName] = value;
    }
};

const tempValidatePriceRange = (controlName: string) => {
    priceErrors.value[controlName] = false;
    const priceFilter = filters.value.find((f) => f.CODE === 'PRICE');
    if (!priceFilter) return;
    const currentValue = tempFilterValues.value[controlName];
    if (currentValue === '' || currentValue === null || isNaN(currentValue)) {
        tempFilterValues.value[controlName] = null;
        return;
    }
    if (controlName === priceFilter.VALUES.MIN.CONTROL_NAME && currentValue < 0) {
        tempFilterValues.value[controlName] = 0;
    }
};

// Функция выбора опции сортировки
const selectSortOption = (option: string) => {
    selectedSortOption.value = option;
    dropdowns.value.upcoming = false;
    applyFilters();
};

// Валидация диапазона цен для десктопа
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
    return Object.values(priceErrors.value).some((error) => error === true);
};

// Получение текста метки фильтра
const getFilterLabel = (code: string) => {
    const filter = filters.value.find((f) => f.CODE === code);
    return filter ? filter.NAME : code;
};

// Склонение слова "курс"
const getCourseWord = (count: number | undefined) => {
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
        if (response.filters) {
            filters.value = response.filters.filter((filter: any) => filter && filter.CODE && filter.CODE !== 'IS_FREE');
            filters.value.forEach((filter) => {
                if (filter.TYPE === 'RANGE') {
                    filterValues.value[filter.VALUES.MIN.CONTROL_NAME] = null;
                    filterValues.value[filter.VALUES.MAX.CONTROL_NAME] = null;
                    tempFilterValues.value[filter.VALUES.MIN.CONTROL_NAME] = null;
                    tempFilterValues.value[filter.VALUES.MAX.CONTROL_NAME] = null;
                } else {
                    Object.values(filter.VALUES).forEach((value) => {
                        filterValues.value[value.CONTROL_NAME] = filter.TYPE === 'RADIO' ? null : false;
                        tempFilterValues.value[value.CONTROL_NAME] = filter.TYPE === 'RADIO' ? null : false;
                    });
                }
            });
            applyFilters();
        } else {
            eventsError.value = { details: 'Фильтры не найдены' };
        }
    } catch (error) {
        console.error('Ошибка загрузки фильтров:', error);
        eventsError.value = { details: error.message || 'Не удалось загрузить фильтры' };
    }
};

// Применение фильтров
const applyFilters = () => {
    if (hasErrors()) return;
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

// Применение мобильных фильтров
const applyMobileFilters = () => {
    isFree.value = tempIsFree.value;
    selectedDirection.value = tempSelectedDirection.value;
    selectedFormat.value = tempSelectedFormat.value;
    filterValues.value = { ...tempFilterValues.value };
    applyFilters();
    closeFilterPopup();
};

// Сброс мобильных фильтров
const resetMobileFilters = () => {
    tempIsFree.value = false;
    tempSelectedDirection.value = 'all';
    tempSelectedFormat.value = 'any';
    tempFilterValues.value = {};
    filters.value.forEach((filter) => {
        if (filter.TYPE === 'RANGE') {
            tempFilterValues.value[filter.VALUES.MIN.CONTROL_NAME] = null;
            tempFilterValues.value[filter.VALUES.MAX.CONTROL_NAME] = null;
        } else {
            Object.values(filter.VALUES).forEach((value) => {
                tempFilterValues.value[value.CONTROL_NAME] = filter.TYPE === 'RADIO' ? null : false;
            });
        }
    });
    applyMobileFilters();
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
            const query = { page: currentPage.value, iblockId, GET_ALL_FILES: 'Y', locale: locale.value };
            if (isFree.value) {
                query.PROPERTY_IS_FREE = 1;
            }
            const response = await $fetch('/api/events', {
                query,
                method: 'POST',
                body: {
                    params: {
                        filter: { IBLOCK_ID: iblockId, ACTIVE: 'Y' },
                        select: ['NAME', 'IBLOCK_ID', 'ID', 'PROPERTY_*'],
                        pager: { start: currentPage.value, limit: 12 },
                        fastfilter,
                        sort: { 'PROPERTY_DATE_FOR_SORT': sortDirection },
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
                            return {
                                id,
                                name: profiles[id] ? `${profiles[id].NAME} ${profiles[id].LAST_NAME || ''}`.trim() : 'Неизвестный лектор',
                            };
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

const uniqueEvents = computed(() => {
    const seenIds = new Set();
    return (
        eventsData.value?.events.filter((event) => {
            if (seenIds.has(event.ID)) return false;
            seenIds.add(event.ID);
            return true;
        }) || []
    );
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

const resetFilters = () => {
    isFree.value = false;
    tempIsFree.value = false;
    selectedDirection.value = 'all';
    tempSelectedDirection.value = 'all';
    selectedFormat.value = 'any';
    tempSelectedFormat.value = 'any';
    selectedSortOption.value = 'Сначала ближайшие';
    filterValues.value = {};
    tempFilterValues.value = {};
    priceErrors.value = {};
    filters.value.forEach((filter) => {
        if (filter.TYPE === 'RANGE') {
            filterValues.value[filter.VALUES.MIN.CONTROL_NAME] = null;
            filterValues.value[filter.VALUES.MAX.CONTROL_NAME] = null;
            tempFilterValues.value[filter.VALUES.MIN.CONTROL_NAME] = null;
            tempFilterValues.value[filter.VALUES.MAX.CONTROL_NAME] = null;
        } else {
            Object.values(filter.VALUES).forEach((value) => {
                filterValues.value[value.CONTROL_NAME] = filter.TYPE === 'RADIO' ? null : false;
                tempFilterValues.value[value.CONTROL_NAME] = filter.TYPE === 'RADIO' ? null : false;
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

const toggleFilterPopup = () => {
    filterPopupOpen.value = !filterPopupOpen.value;

    if (filterPopupOpen.value) {
        syncTempFilters();
    }
};

const closeFilterPopup = () => {
    filterPopupOpen.value = false;
};

watch(filterPopupOpen, (newValue) => {
    if (newValue) {
        document.body.classList.add('non-scroll');
    } else {
        document.body.classList.remove('non-scroll');
    }
});


// computed свойство для подсчета примененных фильтров
const activeFiltersCount = computed(() => {
    let count = 0;

    // Проверяем бесплатные курсы
    if (isFree.value) count++;

    // Проверяем направление
    if (selectedDirection.value !== 'all') count++;

    // Проверяем формат
    if (selectedFormat.value !== 'any') count++;

    // Проверяем цену
    const priceFilter = filters.value.find((f) => f.CODE === 'PRICE');
    if (priceFilter) {
        if (
            filterValues.value[priceFilter.VALUES.MIN.CONTROL_NAME] !== null &&
            filterValues.value[priceFilter.VALUES.MIN.CONTROL_NAME] !== undefined &&
            filterValues.value[priceFilter.VALUES.MIN.CONTROL_NAME] !== ''
        ) count++;
        if (
            filterValues.value[priceFilter.VALUES.MAX.CONTROL_NAME] !== null &&
            filterValues.value[priceFilter.VALUES.MAX.CONTROL_NAME] !== undefined &&
            filterValues.value[priceFilter.VALUES.MAX.CONTROL_NAME] !== ''
        ) count++;
    }

    // Проверяем остальные фильтры (город, дата)
    for (const key in filterValues.value) {
        if (key === 'fastfilter') continue;

        // Пропускаем уже подсчитанные фильтры
        const isPriceFilter = priceFilter &&
            (key === priceFilter.VALUES.MIN.CONTROL_NAME || key === priceFilter.VALUES.MAX.CONTROL_NAME);
        if (isPriceFilter) continue;

        // Пропускаем направление и формат (они уже подсчитаны выше)
        const directionFilter = filters.value.find((f) => f.CODE === 'DIRECTION');
        const formatFilter = filters.value.find((f) => f.CODE === 'FORMAT');

        const isDirectionFilter = directionFilter &&
            Object.values(directionFilter.VALUES).some((val: any) => val.CONTROL_NAME === key);
        const isFormatFilter = formatFilter &&
            Object.values(formatFilter.VALUES).some((val: any) => val.CONTROL_NAME === key);

        if (isDirectionFilter || isFormatFilter) continue;

        // Подсчитываем активные фильтры
        if (filterValues.value[key] === true ||
            (typeof filterValues.value[key] === 'string' && filterValues.value[key] !== '')) {
            count++;
        }
    }

    // Проверяем сортировку
    if (selectedSortOption.value !== 'Сначала ближайшие') count++;

    return count;
});

// слайдер курсов внизу
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

const { data: webinarsData, error: webinarsError } = await useAsyncData('featuredWebinars', async () => {
    try {
        const { data } = await useFetch('/api/events', {
            query: {
                iblockId: '13',
                GET_ALL_FILES: 'Y',
                isFeatured: '1',
            },
            method: 'POST',
            body: {
                params: {
                    select: ['NAME', 'IBLOCK_ID', 'ID', 'PROPERTY_*'],
                },
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

        return processedEvents;
    } catch (err) {
        console.error('Ошибка при загрузке избранных курсов:', err);
        return [];
    }
});

const featuredWebinars = ref(webinarsData.value || []);

if (webinarsError.value) {
    console.error('Ошибка useAsyncData для событий:', WebinarsError.value);
}
</script>

<style scoped lang="scss">
.error-message {
    padding: p2r(20);
}

.filter {
    &-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: p2r(10);
        margin-bottom: p2r(34);
        @media (max-width: 1366px) {
            font-size: p2r(14);
            margin-bottom: p2r(24);
        }
        @media (max-width: 599px) {
            flex-direction: column-reverse;
            align-items: flex-start;
            row-gap: p2r(12);
        }
        &-sort {
            display: flex;
            gap: p2r(30);
            margin-left: auto;

            @media (max-width: 599px) {
                margin-left: 0;
                gap: p2r(12);
            }
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
            border-radius: p2r(4);
            display: flex;
            align-items: center;
            cursor: pointer;
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
        box-shadow: 0 p2r(4) p2r(35) rgba(114, 142, 174, 0.1);
        border-radius: p2r(6);
        @media (max-width: 1366px) {
            padding: p2r(40);
        }
        @media (max-width: 1280px) {
            padding: p2r(32);
        }
        @media (max-width: 1140px) {
            padding: p2r(24);
        }
        @media (max-width: 1023px) {
            display: none;
        }
    }
    &-popup {
        &-trigger {
            display: none;
            cursor: pointer;
            align-items: center;
            gap: p2r(10);

            @media (max-width: 1023px) {
                display: flex;
            }

            @media (max-width: 599px) {
                gap: p2r(4);
            }


            &-icon {
                font-size: p2r(16);
                line-height: p2r(12);
            }

            &-counter {
                font-size: p2r(12);
                line-height: p2r(12);
                min-width: p2r(16);
                padding: p2r(2);
                height: p2r(16);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background-color: $primary;
                color: $font-white;
            }
        }
        &-close {
            font-size: p2r(24);
            line-height: p2r(24);
            margin-left: auto;
            margin-bottom: p2r(20);
            cursor: pointer;
        }
    }
    &-mobile {
        display: none;
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: $bgc;
        overflow-y: auto;
        z-index: 1001;
        padding: p2r(24);
        flex-direction: column;

        &.show {
            display: flex;
        }

        &-btns {
            display: flex;
            gap: p2r(24);
            padding-top: p2r(40);
            padding-bottom: p2r(24);

            @media(max-width: 420px) {
                flex-direction: column;
            }
        }
    }
}
.filter {
    &-section {
        margin-bottom: p2r(30);
        padding-bottom: p2r(30);
        border-bottom: 1px solid $border;
        @media (max-width: 1366px) {
            margin-bottom: p2r(24);
            padding-bottom: p2r(24);
        }
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
            @media (max-width: 1366px) {
                font-size: p2r(16);
                margin-bottom: p2r(12);
            }
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
                @media (max-width: 1366px) {
                    padding: p2r(12) p2r(8);
                }
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

        @media(max-width: 1024px) {
            margin-bottom: 0;
        }
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
.courses {
    padding-bottom: p2r(80);
    @media (max-width: 1366px) {
        padding-bottom: p2r(70);
    }
    @media (max-width: 768px) {
        padding-bottom: p2r(60);
    }
    @media (max-width: 599px) {
        padding-bottom: p2r(24);
    }
    @media (max-width: 420px) {
        margin-top: p2r(12);
    }
    &-description {
        margin-top: p2r(90);
        @media (max-width: 1366px) {
            margin-top: p2r(80);
        }
        @media (max-width: 768px) {
            margin-top: p2r(70);
        }
        @media (max-width: 599px) {
            margin-top: p2r(60);
        }
        @media (max-width: 420px) {
            margin-top: p2r(40);
        }
    }
    .page-title {
        margin-bottom: p2r(64);
        @media (max-width: 1366px) {
            margin-bottom: p2r(50);
        }
        @media (max-width: 1024px) {
            margin-bottom: p2r(40);
        }
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

        @media (max-width: 599px) {
            gap: p2r(4);
            min-width: p2r(190);
        }
    }
    &-dropdown {
        position: absolute;
        top: 100%;
        right: 0;
        background: $bgc;
        box-shadow: 0 p2r(4) p2r(35) rgba(114, 142, 174, 0.1);
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