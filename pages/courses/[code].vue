<template>
    <div v-if="eventError" class="container">
        <div class="error-message">
            {{ eventError?.details || 'Ошибка загрузки мероприятия' }}
        </div>
    </div>
    <div v-else-if="event" class="event-detail">
        <div class="event-header">
            <img v-if="event?.PROPS?.BG_IMG?.VALUE_PATH" :src="`${imageBaseUrl}${event?.PROPS?.BG_IMG?.VALUE_PATH}`" :alt="event?.PROPS?.BG_IMG?.NAME" class="event-header-bg">
            <div class="container">
                <div class="event-wrapper">
                    <div class="event-main">
                        <Breadcrumbs :event-title="event?.NAME" />
                        <h1 v-if="event?.NAME" class="page-title">{{ event?.NAME }}</h1>
                        <div v-if="event?.PREVIEW_TEXT" class="event-preview-text">{{ event?.PREVIEW_TEXT }}</div>
                        <div v-if="event?.PROPS?.LECTOR_SET?.VALUE?.length" class="lectors-previews">
                            <div v-for="(lector, index) in lectorsData" :key="index" class="lectors-preview">
                                <div class="lectors-preview-avatar">
                                    <img v-if="lector.PHOTO" :src="lector.PHOTO ? `${imageBaseUrl}${lector.PHOTO}` : '/images/placeholder-avatar.jpg'" :alt="`${lector.NAME} ${lector.LAST_NAME || ''}`" />
                                </div>
                                <div class="lector-name">
                                    {{ lector.NAME }} {{ lector.LAST_NAME || '' }}
                                </div>
                            </div>
                        </div>
                        <div class="event-props">
                            <div class="event-props-list">
                                <div v-if="event.PROPS?.LANG?.VALUE" class="event-props-item">
                                    <NuxtIcon name="planet" class="event-props-item-icon" filled />
                                    {{ event.PROPS.LANG.VALUE }}
                                </div>
                                <div v-if="event.PROPS?.SERTIFICATE?.VALUE === 'Да'" class="event-props-item">
                                    <NuxtIcon name="award" class="event-props-item-icon" filled />
                                    {{ event?.PROPS?.SERTIFICATE?.NAME}}
                                </div>
                                <div v-if="event.PROPS?.RECORDING_AVAILABLE?.VALUE" class="event-props-item">
                                    <NuxtIcon name="play-circle" class="event-props-item-icon" filled />
                                    {{ event.PROPS.RECORDING_AVAILABLE.VALUE }}
                                </div>
                            </div>
                            <div class="event-props-share">
                                {{ $t('news.share')}}
                                <NuxtIcon name="share" class="event-props-share-icon" filled />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="event-content">
            <div class="container">
                <div class="event-wrapper">
                    <div class="event-main">
                        <!-- Блок Видео -->
                        <div v-if="event?.PROPS?.AFISHA_VIDEO_FILE?.VALUE_PATH || event?.PROPS?.AFISHA_VIDEO_LINK?.VALUE" class="video-section">
                            <Video
                                :preview="event.PROPS.AFISHA_IMG?.VALUE_RESIZE ? `${baseUrl}${event.PROPS.AFISHA_IMG.VALUE_RESIZE}` : ''"
                                :file="event.PROPS.AFISHA_VIDEO_FILE?.VALUE_PATH ? `${baseUrl}${event.PROPS.AFISHA_VIDEO_FILE.VALUE_PATH}` : ''"
                                :code="event.PROPS.AFISHA_VIDEO_LINK?.VALUE || ''"
                            />
                        </div>
                        <!-- Блок Лекторы -->
                        <div class="ui-section lectors-section">
                            <h2 class="ui-block-title">{{ event.PROPS?.LECTOR_TITLE?.VALUE || 'Лекторы' }}</h2>
                            <div v-if="event.PROPS?.LECTOR_SET?.VALUE?.length" class="lectors-list">
                                <div v-for="(lector, index) in lectorsData" :key="index" class="lector-item">
                                    <div class="lector-header">
                                        <div class="lector-avatar">
                                            <img v-if="lector.PHOTO" :src="lector.PHOTO ? `${imageBaseUrl}${lector.PHOTO}` : '/images/placeholder-avatar.jpg'" :alt="`${lector.NAME} ${lector.LAST_NAME || ''}`" />
                                        </div>
                                        <div class="lector-info">
                                            <div class="lector-info-text">
                                                <h3 class="lector-name">
                                                    {{ lector.NAME }} {{ lector.LAST_NAME || '' }}
                                                </h3>
                                                <p class="lector-location">
                                                    {{ lector.CITY }}<span v-if="lector.COUNTRY">, {{ lector.COUNTRY }}</span>
                                                </p>
                                            </div>
                                            <a v-if="lector.LINK_INST" :href="lector.LINK_INST" target="_blank" class="lector-social-link">
                                                <NuxtIcon name="instagram-primary" class="lector-social-icon" filled />
                                            </a>
                                        </div>
                                    </div>
                                    <p v-if="lector.description?.TEXT" class="lector-description" v-html="getDecodedHTML(lector.description.TEXT)"></p>
                                </div>
                            </div>
                        </div>
                        <!-- Блок О курсе -->
                        <div v-if="event?.PROPS?.ABOUT_DESCRIPTION?.VALUE" class="ui-section course-section article">
                            <h2 class="ui-block-title">{{ event.PROPS.ABOUT_TITLE.VALUE || 'О курсе' }}</h2>
                            <div class="course-content" v-html="decodedAboutDescription"></div>
                        </div>
                        <!-- Блок Почему стоит посетить курс -->
                        <div v-if="event?.PROPS?.WHY_ICONS?.VALUE" class="ui-section why-attend-section article">
                            <h2 class="ui-block-title">{{ event.PROPS.WHY_TITLE.VALUE || 'Почему стоит посетить курс?' }}</h2>
                            <div class="why-attend-items row">
                                <div v-for="(item, index) in event.PROPS.WHY_ICONS.VALUE" :key="index" class="col-md-6">
                                    <div class="why-attend-item">
                                        <div class="why-attend-icon">
                                            <img :src="item.ICON ? `${baseUrl}${item.ICON}` : ''" alt="Icon" />
                                        </div>

                                        <div class="why-attend-text">
                                            <div class="why-attend-text-title">{{ item.TITLE }}</div>
                                            <div class="why-attend-text-description">{{ item.DESCRIPTION }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="why-attend-footer">
                                <div class="why-attend-subtitle" v-html="getDecodedHTML(event.PROPS.WHY_DESCRIPTION.VALUE?.TEXT || '')"></div>
                            </div>
                        </div>
                        <!--   Блок Программа  -->
                        <div v-if="event?.PROPS?.PROGRAM_DESCRIPTION?.VALUE?.TEXT" class="ui-section program-section article">
                            <h2 class="ui-block-title">{{ event.PROPS.PROGRAM_DESCRIPTION.NAME || 'Почему стоит посетить курс?' }}</h2>
                            <div class="why-attend-subtitle" v-html="getDecodedHTML(event.PROPS.PROGRAM_DESCRIPTION.VALUE?.TEXT || '')"></div>
                        </div>
                        <!-- Блок Где и когда -->
                        <div
                            v-if="event?.PROPS?.WHEN_ADDR?.VALUE || event?.PROPS?.WHEN_DATE?.VALUE || event?.PROPS?.WHEN_PHONE?.VALUE || event?.PROPS?.WHEN_EMAIL?.VALUE || event?.PROPS?.WHEN_GALL?.VALUE_PATH"
                            class="ui-section when-section article"
                        >
                            <h2 class="ui-block-title">Где и когда</h2>
                            <div class="when-info">
                                <div class="row">
                                    <div v-if="event?.PROPS?.WHEN_ADDR?.VALUE" class="col-md-4">
                                        <div class="when-info-item">
                                            <NuxtIcon name="pin" class="when-info-icon" filled />
                                            <div class="when-info-text">
                                                <div class="when-info-label">
                                                    Адрес проведения:
                                                </div>
                                                <div class="when-info-value">
                                                    <div>{{ event.PROPS?.WHEN_ADDR?.VALUE }}</div>
                                                </div>
                                                <a href="#" class="when-map-link">Посмотреть на карте</a>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="event?.PROPS?.WHEN_DATE?.VALUE" class="col-md-4">
                                        <div class="when-info-item">
                                            <NuxtIcon name="calendar" class="when-info-icon" filled />
                                            <div class="when-info-text">
                                                <div class="when-info-label">
                                                    Время проведения:
                                                </div>
                                                <div class="when-info-value">
                                                    <div v-for="(date, index) in event.PROPS?.WHEN_DATE?.VALUE" :key="index">
                                                        {{ date }}
                                                    </div>
                                                </div>
                                                <div class="when-timezone">Местное время {{ event.PROPS?.WHEN_UTC?.VALUE }}</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="event?.PROPS?.WHEN_PHONE?.VALUE || event.PROPS?.WHEN_EMAIL?.VALUE" class="col-md-4">
                                        <div class="when-info-item">
                                            <NuxtIcon name="engagement" class="when-info-icon" filled />
                                            <div>
                                                <div class="when-info-label">
                                                    Наши контакты:
                                                </div>
                                                <div class="when-info-value">
                                                    <div v-for="(phone, index) in event.PROPS?.WHEN_PHONE?.VALUE" :key="index">
                                                        <a :href="`tel:${phone}`" class="when-contact-phone">{{ phone }}</a>
                                                    </div>
                                                    <div>
                                                        <a :href="`mailto:${event.PROPS?.WHEN_EMAIL?.VALUE}`" class="when-contact-link">
                                                            {{ event.PROPS?.WHEN_EMAIL?.VALUE }}
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div v-if="event?.PROPS?.WHEN_GALL?.VALUE_PATH" class="when-gallery">
                                <div class="when-gallery-arrows">
                                    <div class="when-gallery-arrow when-gallery-arrow__prev">
                                        <NuxtIcon name="arrow-left" class="icon" filled />
                                    </div>
                                    <div class="when-gallery-arrow when-gallery-arrow__next">
                                        <NuxtIcon name="arrow-right" class="icon" filled />
                                    </div>
                                </div>
                                <div>
                                    <Swiper
                                        :modules="[SwiperNavigation]"
                                        :slides-per-view="3"
                                        :space-between="20"
                                        :breakpoints="{
                                        0: { slidesPerView: 1, spaceBetween: 10 },
                                        768: { slidesPerView: 2, spaceBetween: 15 },
                                        1024: { slidesPerView: 3, spaceBetween: 20 }
                                    }"
                                        :navigation="{
                                        prevEl: '.when-gallery-arrow__prev',
                                        nextEl: '.when-gallery-arrow__next'
                                    }"
                                        :loop="event.PROPS?.WHEN_GALL?.VALUE_PATH?.length > 3"
                                        class="when-gallery-swiper"
                                    >
                                        <SwiperSlide v-for="(image, index) in event.PROPS?.WHEN_GALL?.VALUE_PATH" :key="index">
                                            <img :src="image ? `${baseUrl}${image}` : ''" alt="Gallery image" class="when-gallery-image" />
                                        </SwiperSlide>
                                    </Swiper>
                                </div>

                            </div>
                            <div class="when-description" v-html="getDecodedHTML(event.PROPS?.WHEN_DESCRIPTION?.VALUE?.TEXT || '')"></div>
                        </div>

                        <div v-if="event?.PROPS?.PLAYER_DATE_VIDEO_ACCESS?.VALUE" class="broadcast">
                            <NuxtIcon name="device-monitor" class="broadcast-icon" filled />
                            <div class="broadcast-title">
                                онлайн-трансляция начнется<br>
                                <span>{{ formatDate(event.PROPS.PLAYER_DATE_VIDEO_ACCESS.VALUE) }}</span>
                            </div>
                        </div>

                        <!-- Блок Стоимость участия -->
                        <div v-if="event?.PROPS?.COST_GR?.VALUE" class="ui-section cost-section article">
                            <h2 class="ui-block-title cost-section-title">Стоимость участия</h2>
                            <div v-if="event?.PROPS?.COST_DESCRIPTION?.VALUE?.TEXT" class="cost-description" v-html="getDecodedHTML(event.PROPS?.COST_DESCRIPTION?.VALUE?.TEXT)">
                            </div>
                            <div class="cost-content">
                                <div class="row">
                                    <div v-for="(costGroup, index) in event.PROPS?.COST_GR?.VALUE" :key="index" class="col-md-4">
                                        <div class="cost-group">
                                            <div class="cost-group-header">
                                                <div class="cost-group-title">{{ costGroup.SUB_VALUES.COST_GR_TITLE.VALUE }}</div>
                                                <div v-if="costGroup.SUB_VALUES.COST_GR_SUBTITLE?.VALUE" class="cost-group-subtitle">
                                                    {{ costGroup.SUB_VALUES.COST_GR_SUBTITLE.VALUE }}
                                                </div>
                                            </div>
                                            <div class="cost-group-details">
                                                <div class="cost-group-type">{{ costGroup.SUB_VALUES.COST_GR_TYPE.VALUE }}:</div>
                                                <div class="cost-group-price">{{ costGroup.SUB_VALUES.COST_GR_PRICE.VALUE }}</div>
                                                <button class="cost-group-btn">Подробнее об оплате</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <!--   Блок Теги  -->
                        <div v-if="event?.value?.TAGS" class="ui-section tags-section">
                            <h2 class="ui-block-title">Теги мероприятия</h2>
                            <div class="tags-list">
                                <div v-for="(tag, index) in eventTags" :key="index" class="tag-item">
                                    {{ tag }}
                                </div>
                            </div>
                        </div>

                        <!-- Блок Отчет -->
                        <div v-if="event.PROPS?.REPORT_GALL?.VALUE_PATH?.length" class="ui-section report-section">
                            <Report
                                :title="'Отчет с мероприятия'"
                                :link-name="'Смотреть все фото'"
                                :link-url="reportUrl"
                                :photos="reportGalleryThumbs"
                                @open-popup="openPopup"
                            />
                            <GalleryPopup
                                v-if="isPopupOpen"
                                :images="reportGalleryFull"
                                :initial-index="currentSlideIndex"
                                :captions="reportGalleryCaptions"
                                @close="closePopup"
                            />
                        </div>
                    </div>
                    <div class="event-right">
                        <div class="event-aside-wrapper">
                            <div class="event-aside" ref="eventAside">
                                <div class="event-card-image">
                                    <img :src="getImageUrl(event.DETAIL_PICTURE)" :alt="event.NAME" />
                                </div>
                                <div class="event-card-info">
                                    <div v-if="event.PROPS.WHEN_DATE?.VALUE" class="event-card-info-item">
                                        {{ formatEventDates(event.PROPS.WHEN_DATE?.VALUE) }}
                                    </div>
                                    <div v-if="event.PROPS.WHEN_ADDR?.VALUE" class="event-card-info-item">
                                        {{ event.PROPS.CITY.VALUE}}
                                    </div>
                                    <div v-if="event.PROPS.FORMAT?.VALUE && event.PROPS.FORMAT?.VALUE==='Online'" class="event-card-info-item">
                                        {{ event.PROPS.FORMAT?.VALUE }}
                                    </div>
                                </div>
                                <div v-if="event.PROPS.TYPE?.VALUE" class="event-card-badge ui-badge">
                                    {{ event.PROPS.TYPE?.VALUE || 'Без категории' }}
                                </div>
                                <div v-if="event?.PROPS?.PRICE?.VALUE || event?.PROPS?.SEATS?.VALUE" class="event-card-price">
                                    <div v-if="event?.PROPS?.PRICE?.VALUE" class="event-card-price-value">
                                        <span>{{ event.PROPS.PRICE?.VALUE }}</span> бел.руб.
                                    </div>
                                    <div v-if="event?.PROPS?.SEATS?.VALUE" class="event-card-seats">
                                        <div class="event-card-seats-title">Осталось мест:</div>
                                        {{ Math.max(0, event.PROPS.SEATS?.VALUE - (event.PROPS.REGISTERED?.VALUE || 0)) }}
                                        из {{ event.PROPS.SEATS?.VALUE }}
                                    </div>
                                </div>
                                <div class="event-card-pay">
                                    <button class="ui-btn ui-btn__primary event-card-pay-btn">Оплатить участие</button>
                                    <button class="event-card-fav-btn">
                                        <NuxtIcon name="heart-filled" class="icon" filled />
                                    </button>
                                </div>
                                <button class="event-card-more cost-group-btn">Подробнее об оплате</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-else class="container">
        <div>Loading...</div>
    </div>
    <!--    хардкод-->
    <EducationCards />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'nuxt/app';
import { useI18n } from 'vue-i18n';
import Breadcrumbs from '~/components/Breadcrumbs.vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation as SwiperNavigation } from 'swiper/modules';
import { useLocaleStore } from '~/stores/locale';
import 'swiper/css';
import 'swiper/css/navigation';

const route = useRoute();
const { t } = useI18n();

const localeStore = useLocaleStore();
const locale = computed(() => localeStore.locale);

const config = useRuntimeConfig();
const imageBaseUrl = config.public.imageBaseUrl;
const baseUrl = config.public.baseUrl;

const eventCode = route.params.code;

const event = ref(null);
const eventError = ref(null);
const lectorsData = ref([]);
const reportData = ref(null); // Для хранения данных отчета

const getImageUrl = (path) => {
    return path ? `${imageBaseUrl}${path}` : '/images/examples/new-image.jpg';
};

// Форматирование дат мероприятия (без изменений)
const formatEventDates = (dateStrings: string[]) => {
    if (!dateStrings || !Array.isArray(dateStrings) || dateStrings.length === 0)
        return 'Дата не указана';
    const sortedDates = [...dateStrings].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const dates = sortedDates.map(dateString => {
        const date = new Date(dateString);
        const fullMonth = date.toLocaleDateString('ru-RU', { month: 'long' });
        const shortMonth = fullMonth.substring(0, 3);
        return {
            date: date,
            day: date.getDate(),
            month: date.getMonth(),
            monthFormatted: shortMonth,
        };
    });

    const groupedByMonth: { [key: string]: number[] } = {};
    dates.forEach(dateObj => {
        const monthKey = dateObj.monthFormatted;
        if (!groupedByMonth[monthKey]) {
            groupedByMonth[monthKey] = [];
        }
        groupedByMonth[monthKey].push(dateObj.day);
    });

    const formattedGroups: string[] = [];
    for (const [month, days] of Object.entries(groupedByMonth)) {
        days.sort((a, b) => a - b);
        const ranges: Array<[number, number]> = [];
        let rangeStart = days[0];
        let rangeEnd = days[0];

        for (let i = 1; i < days.length; i++) {
            if (days[i] === rangeEnd + 1) {
                rangeEnd = days[i];
            } else {
                ranges.push([rangeStart, rangeEnd]);
                rangeStart = days[i];
                rangeEnd = days[i];
            }
        }
        ranges.push([rangeStart, rangeEnd]);

        const formattedDays = ranges.map(([start, end]) => {
            if (start === end) {
                return `${start}`;
            } else {
                return `${start}-${end}`;
            }
        }).join(', ');
        formattedGroups.push(`${formattedDays} ${month}`);
    }
    return formattedGroups.join(', ');
};

const isPopupOpen = ref(false);
const currentSlideIndex = ref(0);

const reportGalleryThumbs = computed(() => {
    if (!event.value?.PROPS?.REPORT_GALL?.VALUE_RESIZE) return [];
    return event.value.PROPS.REPORT_GALL.VALUE_RESIZE.map(path => `${baseUrl}${path}`);
});

const reportGalleryFull = computed(() => {
    if (!event.value?.PROPS?.REPORT_GALL?.VALUE_PATH) return [];
    return event.value.PROPS.REPORT_GALL.VALUE_PATH.map(path => `${baseUrl}${path}`);
});

const reportGalleryCaptions = computed(() => {
    if (!event.value?.PROPS?.REPORT_GALL?.DESCRIPTION) return [];
    return event.value.PROPS.REPORT_GALL.DESCRIPTION.map(desc => desc || '');
});

const openPopup = (index) => {
    currentSlideIndex.value = index;
    isPopupOpen.value = true;
};

const closePopup = () => {
    isPopupOpen.value = false;
    currentSlideIndex.value = 0;
};

const eventTags = computed(() => {
    if (!event.value?.TAGS) return [];
    return event.value.TAGS.split(',').map(tag => tag.trim());
});

function decodeHTML(text) {
    if (!text) return '';
    const entities = {
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&amp;': '&',
        '&nbsp;': ' '
    };

    // Заменяем экранированные HTML-сущности
    let decodedText = text.replace(/&lt;|&gt;|&quot;|&amp;|&nbsp;/g, match => entities[match]);

    // Заменяем управляющие символы \r\n на пробелы
    decodedText = decodedText.replace(/\r\n/g, ' ');
    decodedText = decodedText.replace(/<img\s+[^>]*src="([^"]+)"[^>]*>/gi, (match, src) => {
        if (src.startsWith('/upload')) {
            return match.replace(src, `${baseUrl}${src}`);
        }
        return match;
    });
    return decodedText;
}

const getDecodedHTML = (text) => {
    return decodeHTML(text);
};

const decodedAboutDescription = computed(() => {
    if (!event.value?.PROPS?.ABOUT_DESCRIPTION?.VALUE?.TEXT) return '';
    return decodeHTML(event.value.PROPS.ABOUT_DESCRIPTION.VALUE.TEXT);
});

function formatDate(dateStr) {
    if (!dateStr) return t('date.notSpecified');
    const date = new Date(dateStr);
    const days = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31'];
    const months = {
        RU: ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'],
        EN: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    };
    const month = months[locale.value][date.getMonth()];
    const day = days[date.getDate() - 1];
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${day} ${month} в ${hours}:${minutes}`;
}

// Функция для получения DETAIL_PAGE_URL отчета
const fetchReportData = async (reportId) => {
    if (!reportId) return null;
    try {
        const response = await $fetch(`/api/report/${reportId}`);
        if (response.error) {
            console.error('Ошибка загрузки отчета:', response.details);
            return null;
        }
        return response.item; // Возвращаем весь объект item (содержит RU, EN, etc.)
    } catch (error) {
        console.error('Ошибка при запросе отчета:', error);
        return null;
    }
};

const reportUrl = computed(() => {
    if (!reportData.value || !reportData.value[locale.value]?.DETAIL_PAGE_URL) {
        return '/journal/reports';
    }
    // Удаляем .html и возвращаем DETAIL_PAGE_URL для текущего языка
    return reportData.value[locale.value].DETAIL_PAGE_URL.replace(/\.html$/, '');
});

// Загрузка данных мероприятия и отчета
const fetchEventData = async () => {
    try {
        const { data, error } = await useFetch(`/api/item/${eventCode}`, {
            method: 'GET',
            query: {
                iblockId: 13,
            },
        });

        if (error.value) {
            eventError.value = error.value.data;
            return;
        }

        if (!data.value?.event) {
            eventError.value = { details: 'Мероприятие не найдено' };
            return;
        }

        event.value = data.value.event;

        // Загружаем данные отчета
        if (event.value?.PROPS?.REPORT_ID?.VALUE) {
            reportData.value = await fetchReportData(event.value.PROPS.REPORT_ID.VALUE);
        }

        const lectorSet = event.value?.PROPS?.LECTOR_SET?.VALUE || [];
        const lectorIds = lectorSet
            .map(lector => Number(lector.SUB_VALUES?.LECTORS?.VALUE))
            .filter(id => id);

        let profiles = {};
        if (lectorIds.length > 0) {
            profiles = await fetchLectors(lectorIds);
        }

        lectorsData.value = lectorSet.map(lector => {
            const id = Number(lector.SUB_VALUES?.LECTORS?.VALUE);
            const profile = profiles[id.toString()] || {};
            return {
                ...profile,
                description: lector.SUB_VALUES?.LECTORS_DESC?.VALUE || null,
            };
        });

        eventError.value = null;
    } catch (error) {
        eventError.value = { details: error.message || 'Ошибка загрузки мероприятия' };
    }
};

const fetchLectors = async (lectorIds) => {
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

fetchEventData();

// Логика для "липкого" поведения event-aside (без изменений)
const eventAside = ref<HTMLElement | null>(null);
onMounted(() => {
    const handleStickyAside = () => {
        if (!eventAside.value) return;
        const asideWrapper = eventAside.value.parentElement;
        const asideContainer = asideWrapper.parentElement;
        const contentContainer = asideContainer.parentElement.parentElement;
        if (!asideWrapper || !asideContainer || !contentContainer) return;
        const topOffset = 20;
        const scrollTop = window.scrollY;
        const asideHeight = eventAside.value.offsetHeight;
        const computedStyle = window.getComputedStyle(eventAside.value);
        const negativeMarginTop = parseFloat(computedStyle.marginTop) || 0;
        const containerWidth = asideWrapper.clientWidth;
        const initialTop = contentContainer.getBoundingClientRect().top + window.scrollY + negativeMarginTop - topOffset;
        const containerBottom = initialTop + contentContainer.offsetHeight - negativeMarginTop;
        const maxScrollDistance = containerBottom - initialTop - asideHeight - topOffset;
        const containerRect = asideContainer.getBoundingClientRect();
        const rightOffset = document.documentElement.clientWidth - containerRect.right;
        if (scrollTop > initialTop) {
            if (scrollTop - initialTop - topOffset > maxScrollDistance) {
                eventAside.value.style.position = 'absolute';
                eventAside.value.style.top = `${contentContainer.offsetHeight - asideHeight - negativeMarginTop}px`;
                eventAside.value.style.right = '0';
                eventAside.value.style.width = `${containerWidth}px`;
            } else {
                eventAside.value.style.position = 'fixed';
                eventAside.value.style.top = `${topOffset - negativeMarginTop}px`;
                eventAside.value.style.right = `${rightOffset}px`;
                eventAside.value.style.width = `${containerWidth}px`;
            }
        } else {
            eventAside.value.style.position = 'static';
            eventAside.value.style.top = '';
            eventAside.value.style.right = '';
            eventAside.value.style.width = '';
        }
    };
    window.addEventListener('scroll', handleStickyAside);
    window.addEventListener('resize', handleStickyAside);
    nextTick(() => {
        handleStickyAside();
    });
    onUnmounted(() => {
        window.removeEventListener('scroll', handleStickyAside);
        window.removeEventListener('resize', handleStickyAside);
    });
});

// Устанавливаем метатеги (без изменений)
useHead({
    title: event.value?.NAME || 'Мероприятие DTH',
    meta: [
        { name: 'description', content: event.value?.DETAIL_TEXT?.substring(0, 200) || 'Детали мероприятия от Dental Training House' },
        { property: 'og:title', content: event.value?.NAME || 'Мероприятие DTH' },
        { property: 'og:description', content: event.value?.DETAIL_TEXT?.substring(0, 200) || 'Детали мероприятия от Dental Training House' },
        { property: 'og:image', content: event.value?.PREVIEW_PICTURE ? `${imageBaseUrl}${event.value.PREVIEW_PICTURE}` : `${baseUrl}/images/logo.png` },
        { property: 'og:url', content: `${baseUrl}${route.fullPath}` },
        { property: 'og:type', content: 'article' },
        { property: 'og:site_name', content: 'DTH Events' },
    ],
});
</script>

<style scoped lang="scss">
:deep(.breadcrumbs) {
    margin-bottom: p2r(32);
}
:deep(.ui-badge) {
    font-weight: 600;
    font-size: p2r(14);
    padding-top: p2r(6);
    padding-bottom: p2r(6);
}
.container {
    padding-left: p2r(180);
}
.event {
    &-wrapper {
        display: flex;
        gap: p2r(30);
    }

    &-main {
        width: calc(100% - 26.25rem);
        flex: 0 0 calc(100% - 26.25rem);
    }
    &-right {
        width: p2r(390);
        flex: 0 0 p2r(390);
    }
    &-detail {
        margin-top: p2r(-30);
    }
    &-header {
        position: relative;
        overflow: hidden;
        padding-top: p2r(60);

        &-bg {
            position: absolute;
            top: 0;
            right: 0;
        }
    }
    &-preview {
        &-text {
            margin-bottom: p2r(60);
        }
    }

    &-content {
        background-color: #F5F5F5;
        padding-top: p2r(20);
        padding-bottom: p2r(98);
    }

    &-props {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: p2r(54);

        &-list {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: p2r(16);
        }

        &-item {
            position: relative;
            display: flex;
            align-items: center;
            gap: p2r(4);
            padding-right: p2r(16);
            margin-right: p2r(16);

            &-icon {
                font-size: p2r(24);
                line-height: p2r(22);
                color: $font;
            }

            &::after {
                position: absolute;
                right: 0;
                top: 50%;
                transform: translate(50%, -50%);
                content: '';
                width: 1px;
                height: p2r(12);
                background-color: $border;
            }

            &:last-child::after {
                display: none;
            }
        }

        &-share {
            display: flex;
            align-items: center;
            gap: p2r(4);
            margin-right: p2r(10);

            &-icon {
                font-size: p2r(20);
                color: $font;
            }
        }
    }

    &-aside {
        margin-top: p2r(-454);
        padding: p2r(20);
        background-color: $bgc;
        box-shadow: 0px 4px 35px rgba(114, 142, 174, 0.1);
        border-radius: p2r(8);

        &-wrapper {
            position: relative;
        }
    }

    &-card {
        &-image {
            position: relative;
            aspect-ratio: 1.8;
            border-radius: p2r(6);
            overflow: hidden;
            margin-bottom: p2r(20);

            @media (hover: hover) {
                &:hover {
                    img {
                        transform: scale(1.1);
                    }
                }
            }

            img {
                display: block;
                width: 100%;
                height: 100%;
                object-fit: cover;
                object-position: center;
                transition: transform 0.3s;
            }
        }

        &-info {
            display: flex;
            flex-wrap: wrap;
            gap: p2r(4);
            margin-bottom: p2r(10);

            &-item {
                font-weight: 600;
                font-size: p2r(12);
                line-height: 1.3;
                text-transform: uppercase;
                color: $font-white;
                background: $primary;
                border-radius: p2r(2);
                padding: p2r(8) p2r(10) p2r(7) p2r(10);
            }
        }

        &-price {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: p2r(40);
            margin-bottom: p2r(20);

            &-value {
                font-size: p2r(18);

                span {
                    font-weight: 600;
                    font-size: p2r(32);
                }
            }
        }

        &-seats {
            font-size: p2r(18);

            &-title {
                font-size: p2r(10);
            }
        }

        &-pay {
            display: flex;
            gap: p2r(10);
            margin-bottom: p2r(20);

            &-btn {
                flex-grow: 1;
            }
        }

        &-fav {
            &-btn {
                border: 1px solid $primary;
                border-radius: p2r(4);
                background-color: transparent;
                width: p2r(52);
                flex: 0 0 p2r(52);
                cursor: pointer;

                .icon {
                    font-size: p2r(28);
                    line-height: p2r(26);
                }
            }
        }

        &-more {
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
    }
}

.lectors {
    &-previews {
        display: flex;
        flex-wrap: wrap;
        gap: p2r(4);
        margin-bottom: p2r(36);
    }

    &-preview {
        display: flex;
        align-items: center;
        gap: p2r(8);
        border: 1px solid $border;
        border-radius: p2r(4);
        padding: p2r(9);

        &-avatar {
            width: p2r(40);
            height: p2r(40);
            border-radius: 50%;
            overflow: hidden;
            background-color: $border;
            background-size: p2r(24);
            background-repeat: no-repeat;
            background-position: center;
            background-image: url('data:image/svg+xml,<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.9983 16.4C11.3879 16.4 7.50618 19.52 6.34946 23.7639C5.96217 25.1848 7.19226 26.4 8.66502 26.4H23.3316C24.8044 26.4 26.0346 25.1848 25.6472 23.7639C24.4906 19.52 20.6088 16.4 15.9983 16.4Z" fill="%234D5452" stroke="%234D5452" stroke-width="1.25" stroke-linecap="round"/><path d="M20.6653 7.73332C20.6653 10.3107 18.576 12.4 15.9986 12.4C13.4213 12.4 11.332 10.3107 11.332 7.73332C11.332 5.15598 13.4213 3.06665 15.9986 3.06665C18.576 3.06665 20.6653 5.15598 20.6653 7.73332Z" fill="%234D5452" stroke="%234D5452" stroke-width="1.25" stroke-linecap="round"/></svg>');

            img {
                object-fit: cover;
                width: 100%;
                height: 100%;
                object-position: top center;
            }
        }
    }
}

.lectors-section {

    .lectors-list {
        display: flex;
        flex-direction: column;
        gap: p2r(40);
    }

    .lector-item {
        display: flex;
        flex-direction: column;
        gap: p2r(20);
        border-bottom: 1px solid $border;
        padding-bottom: p2r(20);

        &:last-child {
            border: none;
        }

        .lector-header {
            display: flex;
            align-items: center;
            gap: p2r(20);
        }

        .lector-avatar {
            width: p2r(100);
            height: p2r(100);
            border-radius: 50%;
            overflow: hidden;
            background-color: $border;
            background-size: p2r(60);
            background-repeat: no-repeat;
            background-position: center;
            background-image: url('data:image/svg+xml,<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.9983 16.4C11.3879 16.4 7.50618 19.52 6.34946 23.7639C5.96217 25.1848 7.19226 26.4 8.66502 26.4H23.3316C24.8044 26.4 26.0346 25.1848 25.6472 23.7639C24.4906 19.52 20.6088 16.4 15.9983 16.4Z" fill="%234D5452" stroke="%234D5452" stroke-width="1.25" stroke-linecap="round"/><path d="M20.6653 7.73332C20.6653 10.3107 18.576 12.4 15.9986 12.4C13.4213 12.4 11.332 10.3107 11.332 7.73332C11.332 5.15598 13.4213 3.06665 15.9986 3.06665C18.576 3.06665 20.6653 5.15598 20.6653 7.73332Z" fill="%234D5452" stroke="%234D5452" stroke-width="1.25" stroke-linecap="round"/></svg>');

            img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                object-position: center;
                display: block;
            }
        }

        .lector-info {
            display: flex;
            align-items: baseline;
            gap: p2r(16);
        }

        .lector-name {
            font-size: p2r(20);
            font-weight: 500;
            margin-bottom: p2r(4);
        }

        .lector-location {
            font-size: p2r(16);
            color: $font-grey;
            margin: 0;
        }

        .lector-social-link {
            display: flex;
            align-items: center;
            justify-content: center;
            width: p2r(36);
            height: p2r(36);
            border-radius: 50%;
            background-color: #F5F5F5;
        }

        .lector-social-icon {
            font-size: p2r(20);
            line-height: p2r(18);
            color: $primary;
        }

        .lector-description {
            font-size: p2r(16);
            line-height: 1.4;
            color: $font;
            margin-bottom: 0;
        }
    }
}

.error-message {
    color: red;
    padding: 20px;
}

.course-content:deep() {
    img {
        margin-left: p2r(-40);
        margin-right: p2r(-40);
        max-width: calc(100% + 80px);
    }
}

.why-attend {
    &-section {
        padding-top: p2r(60);
        padding-bottom: p2r(60);
    }

    &-items {
        border-top: 1px solid $border;
        border-bottom: 1px solid $border;
        margin-bottom: p2r(40);
        padding-top: p2r(40);
        padding-bottom: p2r(10);
    }
    &-item {
        display: flex;
        gap: p2r(20);
        margin-bottom: p2r(30);
    }

    &-icon {
        position: relative;
        width: p2r(66);
        height: p2r(66);
        flex: 0 0 p2r(66);

        img {
            position: absolute;
            display: block;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }

    &-text {
        &-title {
            font-weight: 600;
            font-size: p2r(18);
            margin-bottom: p2r(12);
        }
    }
}

.when-info {
    border-bottom: 1px solid $border;
    padding-bottom: p2r(40);
    margin-bottom: p2r(40);

    &-item {
        display: flex;
        gap: p2r(10);
    }
    &-label {
        font-weight: 600;
        font-size: p2r(18);
        line-height: 1.3;
        margin-top: p2r(6);
        margin-bottom: p2r(10);
    }

    &-value {
        margin-bottom: p2r(12);
    }
    &-icon {
        font-size: p2r(32);
        line-height: p2r(32);
        flex: 0 0 p2r(32);
    }
}

.when-map-link {
    border-bottom: 1px dotted $primary;
}

.when-timezone {
    font-size: p2r(14);
    display: inline-block;
    background-color: #F8FAFF;
    border-radius: p2r(16);
    padding: p2r(6) p2r(10);
}

.when-contact-phone {
    color: $font;
}

.when-gallery {
    display: flex;
    flex-direction: column;
    margin-bottom: p2r(20);

  &-arrows {
      display: flex;
      gap: p2r(20);
      margin-left: auto;
      margin-bottom: p2r(40);
  }

    &-arrow {
        position: relative;
        width: p2r(50);
        height: p2r(50);
        flex: 0 0 p2r(50);
        border-radius: 50%;
        border: 1px solid $border;
        cursor: pointer;

        .icon {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: p2r(28);
            line-height: p2r(24);
        }
    }

    &-image {
        aspect-ratio: 1.5;
        object-fit: cover;
        object-position: center top;
    }
}

.broadcast {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: p2r(56);
    border: p2r(2) dashed $border;
    border-radius: p2r(8);
    background-color: $bgc;
    margin-bottom: p2r(40);

    &-icon {
        font-size: p2r(40);
        line-height: p2r(40);
        color: $primary;
        margin-bottom: p2r(6);
    }

    &-title {
        font-weight: 600;
        font-size: p2r(20);
        text-align: center;
        text-transform: uppercase;

        span {
            color: $primary;
        }
    }
}

.cost {
    &-section {
        padding-top: p2r(60);
        padding-bottom: p2r(60);
        background-color: $primary;

        &-title {
            color: $font-white;
        }
    }

    &-description {
        color: $font-white;
        margin-bottom: p2r(40);
    }

    &-group {
        background-color: #F8FAFF;
        border-radius: p2r(8);
        height: 100%;

        &-header {
            display: flex;
            flex-direction: column;
            justify-content: center;
            padding: p2r(20) p2r(30);
            border-bottom: 1px solid $border;
            min-height: p2r(90);
        }

        &-title {
            font-weight: 600;
            font-size: p2r(20);
        }

        &-details {
            padding: p2r(30);
        }
        &-type {
            font-size: p2r(10);
        }
        &-price {
            font-weight: 600;
            font-size: p2r(20);
            margin-bottom: p2r(30);
        }
        &-btn {
            border: none;
            background-color: transparent;
            outline: none;
            color: $primary;
            border-bottom: 1px dotted $primary;
        }
    }
}

.tags-list {
    display: flex;
    flex-wrap: wrap;
    gap: p2r(10);
}

.tag-item {
    border: 1px solid $border;
    border-radius: p2r(4);
    padding:  p2r(18) p2r(16);
}

.video-section {
    margin-bottom: p2r(40);
}

.report {
    &-section {
        margin-bottom: 0;
        padding-top: p2r(20);
        padding-bottom: p2r(10);
    }
}

:deep(.report-head) {
    margin-bottom: p2r(18);
}
</style>