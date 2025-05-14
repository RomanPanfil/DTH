<template>
    <div class="container courses">
        <Breadcrumbs />
        <h2>Курсы</h2>
        <div class="row">
            <div class="col-md-3">
                <div class="filter-counter">
                    В разделе: {{ eventsData?.pagination?.total }} курсов.
                </div>
            </div>
            <div class="col-md-9">
                <div class="filter-header">
                    <div class="filter-header-sort">
                        <div class="filter-header-free">
                            <label class="custom-checkbox">
                                <Field
                                    name="isFree"
                                    v-model="isFree"
                                    type="checkbox"
                                    value="isFree"
                                    :unchecked-value="false"
                                    class="checkbox-input"
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
            </div>
        </div>
        <div class="row">
            <div class="col-md-3">
                <aside class="filter-aside">
                    <div class="filter">
                        <!-- Фильтр Направления (обновленный с выпадающим списком) -->
                        <div class="filter-section">
                            <label class="filter-label" @click="toggleDropdown('directions')">
                                Направления
                                <NuxtIcon name="chevron-up" :class="dropdowns.directions ? 'up' : 'down'" class="filter-icon" filled />
                            </label>
                            <div v-if="dropdowns.directions" class="filter-dropdown">
                                <div class="direction-list">
                                    <div
                                        v-for="direction in directions"
                                        :key="direction"
                                        class="direction-item"
                                        :class="{ selected: selectedDirection === direction }"
                                        @click="selectedDirection = direction"
                                    >
                                        {{ direction }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Фильтр Формат (исправленный) -->
                        <div class="filter-section">
                            <label class="filter-label" @click="toggleDropdown('format')">
                                Формат
                                <NuxtIcon name="chevron-up" :class="dropdowns.format ? 'up' : 'down'" class="filter-icon" filled />
                            </label>
                            <div v-if="dropdowns.format" class="filter-dropdown format">

                                <label class="filter-option custom-radio">
                                    <Field
                                        name="formatOffline"
                                        v-model="selectedFormat"
                                        type="radio"
                                        value="offline"
                                        :unchecked-value="null"
                                        class="radio-input"
                                    />
                                    <span class="radio-indicator"></span>
                                    Оффлайн
                                </label>
                                <label class="filter-option custom-radio">
                                    <Field
                                        name="formatOnline"
                                        v-model="selectedFormat"
                                        type="radio"
                                        value="online"
                                        :unchecked-value="null"
                                        class="radio-input"
                                    />
                                    <span class="radio-indicator"></span>
                                    Онлайн
                                </label>
                                <label class="filter-option custom-radio">
                                    <Field
                                        name="formatAny"
                                        v-model="selectedFormat"
                                        type="radio"
                                        value="any"
                                        :unchecked-value="null"
                                        class="radio-input"
                                    />
                                    <span class="radio-indicator"></span>
                                    Любой
                                </label>
                            </div>
                        </div>

                        <!-- Фильтр Стоимость -->
                        <div class="filter-section">
                            <label class="filter-label">Стоимость</label>
                            <div class="filter-range">
                                <label class="filter-range-label">
                                    Цена, от
                                    <input
                                        type="number"
                                        class="filter-range-input"
                                        placeholder="0"
                                        min="0"
                                        v-model.number="costRange.min"
                                    />
                                </label>
                                <label class="filter-range-label">
                                    Цена, до
                                    <input
                                        type="number"
                                        class="filter-range-input"
                                        placeholder="680"
                                        v-model.number="costRange.max"
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
                                <label class="filter-option custom-checkbox">
                                    <Field
                                        name="allLocations"
                                        v-model="selectedLocations"
                                        type="checkbox"
                                        value="allLocations"
                                        :unchecked-value="false"
                                        class="checkbox-input"
                                    />
                                    <span class="checkbox-indicator"></span>
                                    Все места
                                </label>
                                <label class="filter-option custom-checkbox">
                                    <Field
                                        name="moscow"
                                        v-model="selectedLocations"
                                        type="checkbox"
                                        value="moscow"
                                        :unchecked-value="false"
                                        class="checkbox-input"
                                    />
                                    <span class="checkbox-indicator"></span>
                                    Москва
                                </label>
                                <label class="filter-option custom-checkbox">
                                    <Field
                                        name="spb"
                                        v-model="selectedLocations"
                                        type="checkbox"
                                        value="spb"
                                        :unchecked-value="false"
                                        class="checkbox-input"
                                    />
                                    <span class="checkbox-indicator"></span>
                                    Санкт-Петербург
                                </label>
                                <label class="filter-option custom-checkbox">
                                    <Field
                                        name="online"
                                        v-model="selectedLocations"
                                        type="checkbox"
                                        value="online"
                                        :unchecked-value="false"
                                        class="checkbox-input"
                                    />
                                    <span class="checkbox-indicator"></span>
                                    Онлайн
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
                                <label class="filter-option custom-checkbox">
                                    <Field
                                        name="allMonths"
                                        v-model="selectedMonths"
                                        type="checkbox"
                                        value="allMonths"
                                        :unchecked-value="false"
                                        class="checkbox-input"
                                    />
                                    <span class="checkbox-indicator"></span>
                                    Все месяцы
                                </label>
                                <label class="filter-option custom-checkbox">
                                    <Field
                                        name="2025-05"
                                        v-model="selectedMonths"
                                        type="checkbox"
                                        value="2025-05"
                                        :unchecked-value="false"
                                        class="checkbox-input"
                                    />
                                    <span class="checkbox-indicator"></span>
                                    Май 2025
                                </label>
                                <label class="filter-option custom-checkbox">
                                    <Field
                                        name="2025-06"
                                        v-model="selectedMonths"
                                        type="checkbox"
                                        value="2025-06"
                                        :unchecked-value="false"
                                        class="checkbox-input"
                                    />
                                    <span class="checkbox-indicator"></span>
                                    Июнь 2025
                                </label>
                                <label class="filter-option custom-checkbox">
                                    <Field
                                        name="2025-07"
                                        v-model="selectedMonths"
                                        type="checkbox"
                                        value="2025-07"
                                        :unchecked-value="false"
                                        class="checkbox-input"
                                    />
                                    <span class="checkbox-indicator"></span>
                                    Июль 2025
                                </label>
                                <label class="filter-option custom-checkbox">
                                    <Field
                                        name="2025-08"
                                        v-model="selectedMonths"
                                        type="checkbox"
                                        value="2025-08"
                                        :unchecked-value="false"
                                        class="checkbox-input"
                                    />
                                    <span class="checkbox-indicator"></span>
                                    Август 2025
                                </label>
                            </div>
                        </div>


                    </div>
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
                <div class="courses-description" v-html="coursesDescription">
                </div>
            </div>
        </div>
    </div>
    <EducationCards />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'nuxt/app';
import {Field} from "vee-validate";

const route = useRoute();
const router = useRouter();
import { useLocaleStore } from '~/stores/locale';


const localeStore = useLocaleStore();
const locale = computed(() => localeStore.locale);

const coursesDescription = computed(() => {
    const localeSuffix = locale.value.toUpperCase(); // e.g., 'RU', 'EN'
    return settings.value?.COURSES_DESCRIPTION?.[`VALUE_${localeSuffix}`] || '';
});

const config = useRuntimeConfig();
const baseUrl = config.public.baseUrl;

const iblockId = 13;
const currentPage = computed(() => Number(route.query.page) || 1);
const eventsError = ref(null);

// Фильтры
const selectedDirection = ref<string | null>('Все направления'); // Для единственного выбора направления
const selectedLocations = ref<string[]>([]);
const selectedMonths = ref<string[]>([]);
const selectedFormat = ref<string | null>(null);
const costRange = ref({ min: 0, max: 680 });

const directions = ['Все направления', 'Терапия', 'Эндодонтия', 'Хирургия и имплантология', 'Пародонтология', 'Ортодонтия', 'Протезирование'];

const dropdowns = ref({
    directions: true,
    location: true,
    month: true,
    format: true,
});

const toggleDropdown = (key: string) => {
    dropdowns.value[key] = !dropdowns.value[key];
};

const { data: eventsData } = await useAsyncData('events', async () => {
    try {
        const response = await $fetch('/api/events', {
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
    watch: [() => route.query.page],
});

const events = computed(() => eventsData.value?.events || []);
const pagination = computed(() => eventsData.value?.pagination || { currentPage: 1, limit: 12, total: 0 });
const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.limit));

const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        router.push({ path: route.path, query: { page } });
    }
};

const isFree = ref<boolean>(false)

const { data: settings, error: settingsError } = await useFetch('/api/settings', {
    method: 'POST',
    body: {},
});

if (settingsError.value) {
    console.error('Failed to fetch settings:', settingsError.value);
}

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
        margin-bottom: p2r(34);

        &-sort {
            display: flex;
            gap: p2r(30);
            margin-left: auto;
        }

        &-free {
            display: flex;
        }

        &-upcoming {
            display: flex;
            align-items: center;
            gap: p2r(10);

            &-icon {
                font-size: p2r(24);
                line-height: p2r(20);
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
                    margin-bottom: p2r(20);
                    color: $bgc-dark;
                    cursor: pointer;

                    .filter-icon {
                        font-size: p2r(14);
                        line-height: p2r(12);
                        color: #8A8A8A;
                        transition: transform 0.3s;
                        transform: translateX(p2r(3));

                        &.down {
                            transform: rotate(180deg);
                        }
                    }
                }

                .direction-list {
                    .direction-item {
                        font-size: p2r(16);
                        padding: p2r(5) 0;
                        cursor: pointer;
                        color: $bgc-dark;

                        &:hover {
                            color: $primary;
                        }

                        &.selected {
                            color: $primary;
                        }
                    }
                }

                .filter-dropdown {
                    max-height: p2r(160);
                    overflow-y: auto;

                    &::-webkit-scrollbar {
                        width: p2r(6);
                    }

                    &::-webkit-scrollbar-track {
                        background: #EEF1F8;
                        border-radius: p2r(3);
                    }

                    &::-webkit-scrollbar-thumb {
                        background: $primary;
                        border-radius: p2r(3);
                    }

                    .filter-option {
                        display: flex;
                        align-items: center;
                        padding: p2r(5) 0;
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
                    }

                    &.format {
                        display: flex;
                        flex-wrap: wrap;
                        column-gap: p2r(40);
                    }
                }

                .filter-checkboxes {
                    .custom-checkbox {
                        display: flex;
                        align-items: center;
                        margin-bottom: p2r(10);

                        &:last-child {
                            margin-bottom: 0;
                        }

                        .checkbox-input {
                            display: none;

                            &:checked + .checkbox-indicator {
                                background-color: #28a745;
                                border-color: #28a745;
                                &::after {
                                    content: '';
                                    position: absolute;
                                    width: p2r(6);
                                    height: p2r(6);
                                    background: white;
                                    border-radius: 50%;
                                    top: 50%;
                                    left: 50%;
                                    transform: translate(-50%, -50%);
                                }
                            }
                        }

                        .checkbox-indicator {
                            display: inline-block;
                            width: p2r(16);
                            height: p2r(16);
                            border: 2px solid #28a745;
                            border-radius: p2r(4);
                            position: relative;
                            margin-right: p2r(10);
                            transition: background-color 0.3s;
                        }
                    }
                }

                .filter-range {
                    display: flex;
                    align-items: center;
                    gap: p2r(10);

                    &-label {
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

                        &[type="number"] {
                            -moz-appearance: textfield;
                            &::-webkit-outer-spin-button,
                            &::-webkit-inner-spin-button {
                                -webkit-appearance: none;
                                margin: 0;
                            }
                        }
                    }

                    span {
                        font-size: p2r(14);
                        color: #333;
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
}
</style>