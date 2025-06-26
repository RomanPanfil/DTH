<template>
    <div v-if="eventError" class="container">
        <div class="error-message">
            {{ eventError?.details || 'Ошибка загрузки мероприятия' }}
        </div>
    </div>
    <div v-else-if="event" class="event-detail">
        <div
            class="event-header"
            :style="{
                '--header-bg': event?.PROPS?.HEADER_BG?.VALUE || '#ffffff',
                '--header-color': event?.PROPS?.HEADER_COLOR?.VALUE || '#f000000'
            }"
        >
            <img v-if="event?.PROPS?.BG_IMG?.VALUE_PATH" :src="`${imageBaseUrl}${event?.PROPS?.BG_IMG?.VALUE_PATH}`" :alt="event?.PROPS?.BG_IMG?.NAME" class="event-header-bg">
            <div class="container">
                <div class="event-wrapper">
                    <div class="event-main">
                        <Breadcrumbs :event-title="event?.NAME" />
                        <h1 v-if="event?.NAME" class="event-main-title page-title">{{ event?.NAME }}</h1>
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
                                <div class="event-share-head" @click="isShareLinksShow = !isShareLinksShow">
                                    <span class="event-share-head-title">{{ $t('news.share')}}</span>
                                    <NuxtIcon name="share" class="event-props-share-icon" filled />
                                </div>
                                <div v-show="isShareLinksShow" class="event-share-links">
                                    <a href="#" class="event-share-link">
                                        <NuxtIcon name="vk-color" class="event-share-link-icon" filled />
                                    </a>
                                    <a href="#" class="event-share-link">
                                        <NuxtIcon name="tg-color" class="event-share-link-icon" filled />
                                    </a>
                                    <a href="#" class="event-share-link">
                                        <NuxtIcon name="fb-color" class="event-share-link-icon" filled />
                                    </a>
                                    <a href="#" class="event-share-link">
                                        <NuxtIcon name="ok-color" class="event-share-link-icon" filled />
                                    </a>
                                    <a href="#" class="event-share-link">
                                        <NuxtIcon name="twitter-color" class="event-share-link-icon" filled />
                                    </a>
                                    <a href="#" class="event-share-link">
                                        <NuxtIcon name="link-color" class="event-share-link-icon" filled />
                                    </a>
                                </div>
                                <EventsShareLinks
                                    :is-show="isShareLinksShow"
                                    :url="currentUrl"
                                    :title="shareTitle"
                                    :description="shareDescription"
                                    :image="shareImage"
                                />
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
                        <div class="video-section">
                            <div class="video-section-main">
                                <Video
                                    v-if="isCourseAccessStatus && isAuth"
                                    :preview="event?.PROPS?.VIDEO_PREVIEW?.VALUE_RESIZE ? `${baseUrl}${event?.PROPS?.VIDEO_PREVIEW.VALUE_RESIZE}` : ''"
                                    :file="event?.PROPS?.PLAYER_VIDEO?.VALUE_PATH ? `${baseUrl}${event?.PROPS?.PLAYER_VIDEO.VALUE_PATH}` : (childLessons.length > 0 && childLessons[0]?.PROPS?.PLAYER_VIDEO?.VALUE_PATH ? `${baseUrl}${childLessons[0].PROPS.PLAYER_VIDEO.VALUE_PATH}` : '')"
                                    :code="event?.PROPS?.PLAYER_CODE?.VALUE ? event?.PROPS?.PLAYER_CODE?.VALUE : (childLessons.length > 0 && childLessons[0]?.PROPS?.PLAYER_CODE?.VALUE ? childLessons[0].PROPS.PLAYER_CODE.VALUE : '')"
                                />
                                <div v-else class="video-section-image">
                                    <img
                                        :src="event?.PROPS?.VIDEO_PREVIEW.VALUE_RESIZE ? `${baseUrl}${event?.PROPS?.VIDEO_PREVIEW.VALUE_RESIZE}` : (childLessons.length > 0 && childLessons[0]?.PROPS?.VIDEO_PREVIEW?.VALUE_PATH ? `${baseUrl}${childLessons[0].PROPS.VIDEO_PREVIEW.VALUE_PATH}` : `${baseUrl}/images/placeholder.jpg`)"
                                        alt="alt"
                                    >
                                    <div class="video-section-access">
                                        <div class="video-section-lock">
                                            <NuxtIcon name="lock-keyhole" filled class="video-section-lock-icon" />
                                        </div>
                                        <button
                                            class="ui-btn ui-btn__primary event-card-pay-btn"
                                            :disabled="!hasAvailableSeats || isCoursePaidComputed || isCourseAccessStatus"
                                            @click="takePart"
                                        >
                                            {{ $t('webinars.payAccess') }}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div class="video-previews">
                                <div
                                    v-for="(lesson, index) in isSpoilerOpen ? childLessons : childLessons.slice(0, 4)"
                                    :key="lesson.ID"
                                    class="video-preview"
                                >
                                    <NuxtLink :to="`/webinars/${lesson?.CODE}`">
                                        <div class="video-preview-image" :class="{ active: lesson?.CODE === eventCode }">
                                            <div class="video-preview-badge">
                                                <div class="video-preview-badge-item">
                                                    урок {{ index + 1}}
                                                </div>
                                                <div v-if="lesson?.PROPS?.VIDEO_LONG?.VALUE" class="video-preview-badge-item">
                                                    {{ lesson.PROPS.VIDEO_LONG.VALUE}}
                                                </div>
                                            </div>
                                            <img v-if="lesson?.PROPS?.VIDEO_PREVIEW?.VALUE_PATH"
                                                 :src="`${baseUrl}${lesson.PROPS.VIDEO_PREVIEW.VALUE_PATH}`"
                                                 :alt="lesson.NAME"
                                            >
                                            <div v-if="lesson?.LESSON_ACCESS !== 0 && isAuth" class="video-preview-lock">
                                                <NuxtIcon name="play-small" filled class="video-preview-lock-icon" />
                                            </div>
                                            <div v-else class="video-preview-lock">
                                                <NuxtIcon name="lock-small" filled class="video-preview-lock-icon" />
                                            </div>

                                        </div>
                                        <div class="video-preview-title">
                                            {{ lesson?.NAME }}
                                        </div>
                                    </NuxtLink>
                                </div>
                            </div>
                            <button
                                v-if="childLessons.length > 4"
                                class="video-more ui-btn ui-btn__transparent ui-btn__block"
                                @click="toggleSpoiler"
                            >
                                <template v-if="isSpoilerOpen">
                                    {{ $t('webinars.hide') }}
                                </template>
                                <template v-else>
                                    {{ $t('webinars.showAll') }} ({{ childLessons.length - 4 }})
                                </template>
                            </button>
                        </div>
                        <!-- Блок Лекторы -->
                        <div v-if="event.PROPS?.LECTOR_SET?.VALUE?.length" class="ui-section lectors-section">
                            <h2 class="ui-block-title">{{ event.PROPS?.LECTOR_TITLE?.VALUE || 'Лекторы' }}</h2>
                            <div class="lectors-list">
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
                            <h2 class="ui-block-title">{{ event.PROPS.ABOUT_TITLE.VALUE }}</h2>
                            <div class="course-content" v-html="decodedAboutDescription"></div>
                        </div>
                        <!-- Блок Почему стоит посетить курс -->
                        <div v-if="event?.PROPS?.WHY_ICONS?.VALUE" class="ui-section why-attend-section article">
                            <h2 class="ui-block-title">{{ event.PROPS.WHY_TITLE.VALUE }}</h2>
                            <div class="why-attend-items row">
                                <div v-for="(item, index) in event.PROPS.WHY_ICONS.VALUE" :key="index" class="col-md-6 col-sm-12">
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
                        <!-- Блок Теги -->
                        <div v-if="event?.TAGS" class="ui-section tags-section">
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
                                :title="$t('report.webinarTitle')"
                                :link-name="$t('report.lookAll')"
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
                                    <img v-if="event.PREVIEW_PICTURE" :src="getImageUrl(event.PREVIEW_PICTURE)" :alt="event.NAME" />
                                </div>
                                <div class="event-card-badges">
                                    <div class="event-card-badge ui-badge">{{ event.PROPS.TYPE?.VALUE }}</div>
                                    <div v-if="event.PROPS.LESSONS?.VALUE.length || event.PROPS.VIDEO_LONG?.VALUE" class="event-card-badge ui-badge ui-badge__dark">
                                        <span v-if="event.PROPS.LESSONS?.VALUE.length">{{ event.PROPS.LESSONS?.VALUE.length }} {{ declineWord(event.PROPS.LESSONS?.VALUE.length, ['урок', 'урока', 'уроков']) }}</span>
                                        <span v-if="event.PROPS.VIDEO_LONG?.VALUE">{{ event.PROPS.VIDEO_LONG?.VALUE }}</span>
                                    </div>
                                </div>
                                <div v-if="event?.PROPS?.PRICE?.VALUE" class="event-card-price">
                                    <div v-if="isFree" class="event-card-price-value">
                                        <span>{{ event.PROPS.IS_FREE?.NAME }}</span>
                                    </div>
                                    <div v-else-if="isMainLesson" class="event-card-price-value">
                                        <span>{{ event.PROPS.PRICE_FOR_ALL?.VALUE }}</span> {{ $t('courses.currency') }}
                                    </div>
                                    <div v-else class="event-card-price-value">
                                        <span>{{ event.PROPS.PRICE?.VALUE }}</span> {{ $t('courses.currency') }}
                                    </div>
                                </div>
                                <div class="event-card-pay">
                                    <button
                                        class="ui-btn ui-btn__primary event-card-pay-btn"
                                        :disabled="!hasAvailableSeats || isCoursePaidComputed || isCourseAccessStatus"
                                        @click="takePart"
                                    >
                                        <template v-if="!hasAvailableSeats">Мест нет</template>
                                        <template v-else-if="isFree">{{ $t('webinars.getAccess') }}</template>
                                        <template v-else-if="isMainLesson">{{ $t('webinars.payAll') }}</template>
                                        <template v-else>{{ $t('webinars.payPart') }}</template>
                                    </button>
                                    <button class="event-card-fav-btn" @click="addToFav">
                                        <NuxtIcon
                                            :name="isAddingToFav ? 'heart' : (isFavorite ? 'heart-filled' : 'heart')"
                                            class="icon"
                                            filled
                                        />
                                    </button>
                                </div>
                                <button class="event-card-more cost-group-btn" @click="openTooltipModal(null)">Подробнее об оплате</button>
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
    <!-- хардкод -->
    <EducationCards />
    <!-- Модальное окно -->
    <ModalsTooltipModal
        :is-open="isTooltipModalOpen"
        :content="tooltipContent"
        :title="tooltipTitle"
        @close="closeTooltipModal"
    />
    <ModalsMapModal
        :is-open="isMapModalOpen"
        :latitude="mapLatitude"
        :longitude="mapLongitude"
        @close="closeMapModal"
    />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onUnmounted } from 'vue';
import { useRoute, useRouter, useRequestURL } from 'nuxt/app';
import { useAuthStore } from '~/stores/auth';
import { useModalsStore } from '~/stores/modals';
import { useSettingsStore } from '~/stores/settings';
import { useI18n } from 'vue-i18n';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation as SwiperNavigation, Pagination } from 'swiper/modules';
import { useLocaleStore } from '~/stores/locale';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();

const modalsStore = useModalsStore();
const authStore = useAuthStore();
const settingsStore = useSettingsStore();

const localeStore = useLocaleStore();
const locale = computed(() => localeStore.locale);

const config = useRuntimeConfig();
const imageBaseUrl = config.public.imageBaseUrl;
const baseUrl = config.public.baseUrl;

const eventCode = route.params.code;

const event = ref(null);
const eventError = ref(null);
const lectorsData = ref([]);
const reportData = ref(null);
const isShareLinksShow = ref(false);
const isAddingToFav = ref(false);
const childLessons = ref([]);
const isSpoilerOpen = ref(false);

// Состояние для модального окна
const isTooltipModalOpen = ref(false);
const tooltipContent = ref('');
const tooltipTitle = ref('');

const isMapModalOpen = ref(false);
const mapLatitude = ref(53.90257);
const mapLongitude = ref(27.557088);

const isCoursePaid = ref<boolean | null>(null);
const isCourseAccessStatus = ref<boolean | null>(null);

// Текущий URL страницы
const currentUrl = computed(() => {
    const requestUrl = useRequestURL();
    return requestUrl.href;
});

// Заголовок новости для шаринга
const shareTitle = computed(() => {
    return event.value?.NAME || 'Курс';
});

// Описание для шаринга
const shareDescription = computed(() => {
    return (
        event.value?.PREVIEW_TEXT || ''
    );
});

// Изображение для шаринга
const shareImage = computed(() => {
    return event.value?.PREVIEW_PICTURE
        ? `${imageBaseUrl}${event.value.PREVIEW_PICTURE}`
        : `${baseUrl}/images/logo.svg`;
});

const toggleSpoiler = () => {
    isSpoilerOpen.value = !isSpoilerOpen.value;
}

const openMapModal = () => {
    if (event.value?.PROPS?.WHEN_MAP?.VALUE) {
        const [lat, lng] = event.value.PROPS.WHEN_MAP.VALUE.split(',').map(coord => Number(coord.trim()))
        mapLatitude.value = lat
        mapLongitude.value = lng
    }
    isMapModalOpen.value = true
}

const closeMapModal = () => {
    isMapModalOpen.value = false
}

// Проверка, находится ли курс в избранном
const isFavorite = computed(() => {
    if (!event.value?.ID || !authStore.favorites.length) return false;
    const eventId = Number(event.value.ID);
    const isInFavorites = authStore.favorites.includes(eventId);
    return isInFavorites;
});

const tooltipTitlePay = ref('Оплата');
const tooltipTitleDiscount = ref('Скидка');

if (settingsStore.settings) {
    tooltipTitlePay.value = settingsStore.getSetting('TOOLTIP_TITLE_PAY', locale.value) || 'Оплата';
    tooltipTitleDiscount.value = settingsStore.getSetting('TOOLTIP_TITLE_DISCOUNT', locale.value) || 'Скидка';
} else if (settingsStore.error) {
    console.error('Ошибка загрузки настроек:', settingsStore.error);
}

const getImageUrl = (path) => {
    return `${imageBaseUrl}${path}`;
};

// Форматирование дат мероприятия
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
        return response.item;
    } catch (error) {
        console.error('Ошибка при запросе отчета:', error);
        return null;
    }
};

const reportUrl = computed(() => {
    if (!reportData.value || !reportData.value[locale.value]?.DETAIL_PAGE_URL) {
        return '/journal/reports';
    }
    return reportData.value[locale.value].DETAIL_PAGE_URL.replace(/\.html$/, '');
});

// Функция для получения дочерних уроков
const fetchChildLessons = async (parentCourseId: number) => {
    if (!event.value?.ID) {
        console.error('fetchChildLessons: Event ID not found');
        childLessons.value = [];
        return;
    }

    // Формируем тело запроса
    const requestBody: { COURSE_ID: number; TOKEN?: string } = {
        COURSE_ID: !parentCourseId ? Number(event.value.ID) : parentCourseId,
    };

    // Добавляем TOKEN, только если пользователь авторизован
    if (authStore.token) {
        requestBody.TOKEN = authStore.token;
    }

    try {
        const response = await $fetch('/api/webinars/getlessons', {
            method: 'POST',
            body: requestBody
        });

        if (response && response.ITEMS && response.ITEMS[locale.value]) {
            childLessons.value = response.ITEMS[locale.value];
        } else {
            console.warn('No child lessons found or invalid response structure');
            childLessons.value = [];
        }
    } catch (error) {
        console.error('Ошибка при загрузке дочерних уроков:', error);
        const errorMessage = error.data?.message || error.statusMessage || 'Неизвестная ошибка';
        console.error('Подробности ошибки:', errorMessage);
        childLessons.value = [];
    }
};

// Функция для получения родительского урока
const fetchParentLesson = async () => {
    if (!event.value?.ID) {
        console.error('fetchParentLesson: Event ID not found');
        return;
    }

    const lessonId = Number(event.value.ID);
    if (!Number.isInteger(lessonId) || lessonId <= 0) {
        console.error('fetchParentLesson: Invalid Lesson ID, must be a positive integer', lessonId);
        return;
    }

    try {
        const response = await $fetch('/api/webinars/getmainlesson', {
            method: 'POST',
            body: {
                params: lessonId
            }
        });

        if (response && response.ITEM && response.ITEM[locale.value]) {
            const parentLesson = response.ITEM[locale.value];

            // Проверка валидности ID родительского курса
            const parentCourseId = Number(parentLesson.ID);
            if (!Number.isInteger(parentCourseId) || parentCourseId <= 0) {
                console.error('fetchParentLesson: Invalid Parent Course ID, must be a positive integer', parentCourseId);
                return;
            }

            // Вызов функции для получения дочерних уроков
            await fetchChildLessons(parentCourseId);
        } else {
            console.warn('No parent lesson found or invalid response structure');
        }
    } catch (error) {
        console.error('Ошибка при загрузке родительского урока:', error);
        const errorMessage = error.data?.message || error.statusMessage || 'Неизвестная ошибка';
        console.error('Подробности ошибки:', errorMessage);
    }
};

// Загрузка данных мероприятия и отчета
const fetchEventData = async () => {
    try {
        const { data, error } = await useFetch(`/api/item/${eventCode}`, {
            method: 'GET',
            query: {
                iblockId: 19,
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

        // Загружаем дочерние уроки, если это главный вебинар
        if (isMainLesson.value) {
            await fetchChildLessons();
        } else {
            await fetchParentLesson();
        }
    } catch (error) {
        eventError.value = { details: error.message || 'Ошибка загрузки мероприятия' };
    }

    if(authStore.token) {
        try {
            const { data, error } = await useFetch('/api/courses/checkCourseBuy', {
                method: 'POST',
                body: {
                    params: {
                        TOKEN: authStore.token,
                        COURSE_ID: Number(event.value.ID)
                    }
                }
            })

            if (error.value) {
                console.error('Ошибка проверки оплаты:', error.value)
                isCoursePaid.value = false
            } else if (data.value?.PAY_EXISTS === 1) {
                isCoursePaid.value = true
            } else {
                isCoursePaid.value = false
            }
        } catch (err) {
            console.error('Ошибка при запросе статуса оплаты:', err)
            isCoursePaid.value = false
        }

        try {
            const { data, error } = await useFetch('/api/courses/checkCourseAccess', {
                method: 'POST',
                body: {
                    params: {
                        TOKEN: authStore.token,
                        COURSE_ID: Number(event.value.ID)
                    }
                }
            })

            if (error.value) {
                console.error('Ошибка проверки доступа:', error.value)
                isCourseAccessStatus.value = false
            } else if (data.value?.ACCESS === 1) {
                isCourseAccessStatus.value = true
            } else {
                isCourseAccessStatus.value = false
            }
        } catch (err) {
            console.error('Ошибка при запросе статуса оплаты:', err)
            isCourseAccessStatus.value = false
        }
    } else {
        isCoursePaid.value = false;
        isCourseAccessStatus.value = false;
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

// Логика для "липкого" поведения event-aside
const eventAside = ref<HTMLElement | null>(null);
onMounted(async () => {
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

const isCoursePaidComputed = computed(() => isCoursePaid.value !== null ? isCoursePaid.value : false);

const isAuth = computed(() => !!authStore.token);

// Устанавливаем метатеги
onMounted(() => {
    if (event.value) {
        useHead(computed(() => {
            const meta = [];

            meta.push(
                { name: 'description', content: event?.value?.PREVIEW_TEXT },
                { property: 'og:title', content: event?.value?.NAME },
                { property: 'og:description', content: event.value?.DETAIL_TEXT?.substring(0, 200) || 'Детали мероприятия от Dental Training House' },
                { property: 'og:image', content: event.value?.PREVIEW_PICTURE ? `${imageBaseUrl}${event.value.PREVIEW_PICTURE}` : `${baseUrl}/images/logo.png` },
                { property: 'og:url', content: `${baseUrl}${route.fullPath}` },
                { property: 'og:type', content: 'article' },
                { property: 'og:site_name', content: 'DTH Events' },
            );

            return {
                title: event?.value?.NAME,
                meta,
            };
        }));
    }
});

// Проверка, является ли курс главным
const isMainLesson = computed(() => {
    return event.value?.PROPS?.MAIN_LESSON?.VALUE === 1;
});

const addToFav = async () => {
    if (!authStore.isAuthenticated) {
        modalsStore.openModal('login');
        return;
    }

    if (!event.value?.ID) {
        console.error('addToFav: Event ID not found');
        return;
    }

    isAddingToFav.value = true;

    try {
        const eventId = Number(event.value.ID);

        if (isFavorite.value) {
            // Удаление из избранного
            await $fetch('/api/favorites/remove', {
                method: 'POST',
                body: {
                    token: authStore.token,
                    itemId: eventId
                }
            });
            authStore.removeFavorite(eventId);
        } else {
            // Добавление в избранное
            await $fetch('/api/favorites/add', {
                method: 'POST',
                body: {
                    token: authStore.token,
                    itemId: eventId
                }
            });
            authStore.addFavorite(eventId);
        }
        await authStore.fetchProfile();
    } catch (error) {
        console.error('addToFav: Error:', error);
        const errorMessage = error.data?.error || error.statusMessage || 'Произошла ошибка';
        if (error.data?.error === 'ERROR_INVALID_TOKEN') {
            console.warn('addToFav: Invalid token, opening login modal');
            modalsStore.openModal('login');
        } else if (error.data?.error === 'ERROR_ITEM_ALREADY_FAVORITE') {
            await authStore.fetchProfile();
        } else if (error.data?.error === 'ERROR_ITEM_NOT_FAVORITE') {
            await authStore.fetchProfile();
        } else {
            console.error('addToFav: Unknown error:', errorMessage);
        }
    } finally {
        isAddingToFav.value = false;
    }
};

const isFree = computed(() => {
    return event.value?.PROPS?.IS_FREE?.VALUE === 1;
});

// Проверка наличия свободных мест
const hasAvailableSeats = computed(() => {
    if (!event.value?.PROPS?.SEATS?.VALUE) return true;
    const totalSeats = Number(event.value.PROPS.SEATS.VALUE);
    const registered = Number(event.value.PROPS.REGISTERED?.VALUE || 0);
    return totalSeats - registered > 0;
});

// const takePart = async () => {
//     if (!authStore.isAuthenticated) {
//         modalsStore.openModal('login');
//         return;
//     }
//
//     if (!event.value?.ID) {
//         return;
//     }
//
//     if (isFree.value) {
//         try {
//             const response = await $fetch('/api/orders/create', {
//                 method: 'POST',
//                 body: {
//                     token: authStore.token,
//                     courseId: Number(event.value.ID),
//                     paymentMethodId: 4
//                 }
//             });
//
//             const orderCookie = useCookie('orderData', {
//                 maxAge: 60 * 60 * 24,
//                 path: '/',
//                 sameSite: 'lax',
//             });
//             orderCookie.value = {
//                 orderId: response.orderId,
//                 amount: response.amount,
//                 name: event.value.NAME || 'Unknown Course',
//                 paymentMethod: 4
//             };
//
//             router.push('/payment/success');
//         } catch (error) {
//             console.error('Ошибка при создании заказа:', error);
//             const errorMessage = error.data?.error || error.statusMessage || 'Произошла ошибка';
//             let userFriendlyMessage = 'Ошибка при создании заказа';
//
//             switch (errorMessage) {
//                 case 'ERROR_INVALID_TOKEN':
//                     userFriendlyMessage = t('errors.invalidToken');
//                     modalsStore.openModal('login');
//                     break;
//                 case 'ERROR_INVALID_COURSE_ID':
//                     userFriendlyMessage = t('errors.invalidCourseId');
//                     break;
//                 case 'ERROR_INVALID_PAYMENT_METHOD':
//                     userFriendlyMessage = t('errors.invalidPaymentMethod');
//                     break;
//                 case 'ERROR_COURSE_NOT_FOUND':
//                     userFriendlyMessage = t('errors.courseNotFound');
//                     break;
//                 case 'ERROR_NO_AVAILABLE_SEATS':
//                     userFriendlyMessage = t('errors.noAvailableSeats');
//                     break;
//                 case 'ERROR_REGISTRATION_CLOSED':
//                     userFriendlyMessage = t('errors.registrationClosed');
//                     break;
//                 case 'ERROR_ORDER_ALREADY_EXISTS':
//                     userFriendlyMessage = t('errors.orderAlreadyExists');
//                     router.push('/profile/courses');
//                     break;
//                 case 'ERROR_INVALID_BOOKING_PERIOD':
//                     userFriendlyMessage = t('errors.invalidBookingPeriod');
//                     break;
//                 case 'ERROR_ORDER_CREATION_FAILED':
//                     userFriendlyMessage = t('errors.orderCreationFailed');
//                     break;
//                 case 'ERROR_INVALID_PARAMS':
//                     userFriendlyMessage = t('errors.invalidParams');
//                     break;
//                 case 'Invalid API key':
//                     userFriendlyMessage = t('errors.invalidApiKey');
//                     break;
//                 default:
//                     userFriendlyMessage = errorMessage;
//             }
//         }
//     } else {
//         router.push({
//             path: '/payment',
//             query: { code: eventCode },
//         });
//     }
// };

// Обновленная функция takePart
const takePart = async () => {
    if (!authStore.isAuthenticated) {
        modalsStore.openModal('login');
        return;
    }

    if (!event.value?.ID) {
        return;
    }

    if (isFree.value) {
        try {
            const requestBody = {
                token: authStore.token,
                courseId: Number(event.value.ID),
                paymentMethodId: 4
            };

            // Добавляем PACK для главного вебинара
            if (isMainLesson.value) {
                requestBody.PACK = 1;
            }

            const response = await $fetch('/api/orders/create', {
                method: 'POST',
                body: requestBody
            });

            const orderCookie = useCookie('orderData', {
                maxAge: 60 * 60 * 24,
                path: '/',
                sameSite: 'lax',
            });
            orderCookie.value = {
                orderId: response.orderId,
                amount: response.amount,
                name: event.value.NAME || 'Unknown Course',
                paymentMethod: 4
            };

            router.push('/payment/success');
        } catch (error) {
            console.error('Ошибка при создании заказа:', error);
            const errorMessage = error.data?.error || error.statusMessage || 'Произошла ошибка';
            let userFriendlyMessage = 'Ошибка при создании заказа';

            switch (errorMessage) {
                case 'ERROR_INVALID_TOKEN':
                    userFriendlyMessage = t('errors.invalidToken');
                    modalsStore.openModal('login');
                    break;
                case 'ERROR_INVALID_COURSE_ID':
                    userFriendlyMessage = t('errors.invalidCourseId');
                    break;
                case 'ERROR_INVALID_PAYMENT_METHOD':
                    userFriendlyMessage = t('errors.invalidPaymentMethod');
                    break;
                case 'ERROR_COURSE_NOT_FOUND':
                    userFriendlyMessage = t('errors.courseNotFound');
                    break;
                case 'ERROR_NO_AVAILABLE_SEATS':
                    userFriendlyMessage = t('errors.noAvailableSeats');
                    break;
                case 'ERROR_REGISTRATION_CLOSED':
                    userFriendlyMessage = t('errors.registrationClosed');
                    break;
                case 'ERROR_ORDER_ALREADY_EXISTS':
                    userFriendlyMessage = t('errors.orderAlreadyExists');
                    router.push('/profile/courses');
                    break;
                case 'ERROR_INVALID_BOOKING_PERIOD':
                    userFriendlyMessage = t('errors.invalidBookingPeriod');
                    break;
                case 'ERROR_ORDER_CREATION_FAILED':
                    userFriendlyMessage = t('errors.orderCreationFailed');
                    break;
                case 'ERROR_INVALID_PARAMS':
                    userFriendlyMessage = t('errors.invalidParams');
                    break;
                case 'Invalid API key':
                    userFriendlyMessage = t('errors.invalidApiKey');
                    break;
                default:
                    userFriendlyMessage = errorMessage;
            }

            throw createError({
                statusCode: error.statusCode || 400,
                statusMessage: userFriendlyMessage,
                data: { error: errorMessage }
            });
        }
    } else {
        router.push({
            path: '/payment',
            query: { code: eventCode, isMain: event.value?.PROPS?.MAIN_LESSON?.VALUE, isWebinar: 1 },
        });
    }
};

const payTooltip = computed(() => {
    return event.value?.PROPS?.COST_ABOUT_PAY?.VALUE?.TEXT || '';
});

const discountTooltip = computed(() => {
    return event.value?.PROPS?.COST_GR_SALE_DESCRIPTION?.VALUE?.[0]?.TEXT || '';
});

// Функция для открытия модального окна
const openTooltipModal = (costGroup) => {
    if (costGroup && costGroup?.SUB_VALUES?.COST_GR_SALE_DESCRIPTION) {
        tooltipContent.value = getDecodedHTML(discountTooltip.value);
        tooltipTitle.value = tooltipTitleDiscount.value;
    } else {
        tooltipContent.value = getDecodedHTML(payTooltip.value);
        tooltipTitle.value = tooltipTitlePay.value;
    }
    isTooltipModalOpen.value = true;
};

// Функция для закрытия модального окна
const closeTooltipModal = () => {
    isTooltipModalOpen.value = false;
    tooltipContent.value = '';
};

// Функция для склонения слова
const declineWord = (number: number, words: [string, string, string]): string => {
    number = Math.abs(number) % 100;
    const lastDigit = number % 10;

    if (number > 10 && number < 20) {
        return words[2];
    }
    if (lastDigit > 1 && lastDigit < 5) {
        return words[1];
    }
    if (lastDigit === 1) {
        return words[0];
    }
    return words[2];
};
</script>

<style scoped lang="scss">
:deep(.breadcrumbs) {
    color: var(--header-color);
    margin-bottom: p2r(32);

    .breadcrumbs-current, .breadcrumbs-link {
        color: var(--header-color);
    }

    .breadcrumbs-separator {
        background-color: var(--header-color);
    }
}
:deep(.ui-badge) {
    font-weight: 600;
    font-size: p2r(14);
    padding-top: p2r(6);
    padding-bottom: p2r(6);

    span {
        &:not(:last-child) {
            &::after {
                height: p2r(10);
            }
        }
    }
}
.container {
    @media (min-width: 1367px) {
        padding-left: p2r(180);
    }
}
.event {
    &-wrapper {
        display: flex;
        gap: p2r(30);
        flex-grow: 1;

        @media(max-width: 1024px) {
            flex-direction: column-reverse;
        }

        @media (max-width: 599px) {
            gap: p2r(20);
        }
    }

    &-main {
        width: calc(100% - 26.25rem);
        flex: 0 0 calc(100% - 26.25rem);

        @media(max-width: 1280px) {
            width: calc(100% - 20rem);
            flex: 0 0 calc(100% - 20rem);
        }

        @media(max-width: 1024px) {
            width: 100%;
            flex: auto;
        }

        &-title {
            color: var(--header-color);
        }
    }
    &-right {
        width: p2r(390);
        flex: 0 0 p2r(390);

        @media(max-width: 1280px) {
            width: p2r(320);
            flex: 0 0 p2r(320);
        }

        @media(max-width: 1024px) {
            width: 100%;
            flex: auto;
        }
    }
    &-detail {
        margin-top: p2r(-30);
    }
    &-header {
        position: relative;
        padding-top: p2r(60);
        min-height: p2r(500);
        display: flex;
        flex-direction: column;
        background-color: var(--header-bg);

        .event-main {
            position: relative;
            display: flex;
            flex-direction: column;
        }

        .container {
            flex-grow: 1;
            display: flex;
            flex-direction: column;
            width: 100%;
        }

        &-bg {
            position: absolute;
            top: 0;
            right: 0;
            height: 100%;
            object-fit: cover;
        }
    }
    &-preview {
        &-text {
            color: var(--header-color);
            margin-bottom: p2r(60);
        }
    }

    &-content {
        padding-top: p2r(20);
        padding-bottom: p2r(98);

        @media (max-width: 1366px) {
            padding-bottom: p2r(90);
        }

        @media (max-width: 1024px) {
            padding-bottom: p2r(80);
        }

        @media (max-width: 768px) {
            padding-bottom: p2r(60);
        }

        @media (max-width: 599px) {
            padding-bottom: p2r(40);
        }
    }

    &-props {
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        row-gap: p2r(24);
        margin-bottom: p2r(54);
        margin-top: auto;

        @media(max-width: 1280px) {
            margin-bottom: p2r(48);
        }

        @media(max-width: 1024px) {
            margin-bottom: p2r(40);
        }

        &-list {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            row-gap: p2r(12);
        }

        &-item {
            color: var(--header-color);
            position: relative;
            display: flex;
            align-items: center;
            gap: p2r(4);
            padding-right: p2r(16);
            margin-right: p2r(16);

            &-icon {
                font-size: p2r(24);
                line-height: p2r(22);
                color: var(--header-color);
            }

            &::after {
                position: absolute;
                right: 0;
                top: 50%;
                transform: translate(0, -50%);
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
            position: relative;
            display: flex;
            align-items: center;
            gap: p2r(4);
            margin-right: p2r(10);
            margin-left: auto;

            &-icon {
                font-size: p2r(20);
                color: var(--header-color);
            }
        }
    }

    &-share {
        &-head {
            cursor: pointer;

            &-title {
                color: var(--header-color);
                border-bottom: 1px dotted var(--header-color);
                margin-right: p2r(8);
            }
        }

        &-links {
            position: absolute;
            right: 0;
            top: 100%;
            display: flex;
            gap: p2r(12);
            padding: p2r(20);
            background: $bgc;
            box-shadow: 0 4px 35px rgba(114, 142, 174, 0.1);
            border-radius: p2r(8);
            z-index: 2;

            @media (max-width: 599px) {
                width: calc(100vw - 60px);
                flex-wrap: wrap;
            }

            @media (max-width: 420px) {
                width: calc(100vw - 40px);
            }
        }

        &-link {
            &-icon {
                display: block;
                font-size: p2r(48);
                line-height: p2r(32);
            }
        }
    }

    &-aside {
        margin-top: p2r(-424);
        padding: p2r(20) p2r(20) p2r(38) p2r(20);
        background-color: $bgc;
        box-shadow: 0 4px 35px rgba(114, 142, 174, 0.1);
        border-radius: p2r(8);

        @media(max-width: 1024px) {
            position: static !important;
            margin-top: 0;
            max-width: p2r(390);
            margin-left: auto;
            margin-right: auto;
        }

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
            background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_14" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><g transform="translate(1 1)"><g><g><path d="M255-1C114.2-1-1,114.2-1,255s115.2,256,256,256s256-115.2,256-256S395.8-1,255-1z M255,16.067 c63.054,0,120.598,24.764,163.413,65.033l-65.336,64.802L334.36,97.987c-0.853-2.56-4.267-5.12-7.68-5.12H185.027 c-3.413,0-5.973,1.707-7.68,5.12L156.013,152.6h-48.64c-17.067,0-30.72,13.653-30.72,30.72v168.96 c0,17.067,13.653,30.72,30.72,30.72h6.653l-34.26,33.981C40.285,374.319,16.067,317.354,16.067,255 C16.067,123.587,123.587,16.067,255,16.067z M314.733,255c0,33.28-26.453,59.733-59.733,59.733 c-13.563,0-25.99-4.396-35.957-11.854l84.125-83.438C310.449,229.34,314.733,241.616,314.733,255z M195.267,255 c0-33.28,26.453-59.733,59.733-59.733c13.665,0,26.174,4.467,36.179,12.028l-84.183,83.495 C199.613,280.852,195.267,268.487,195.267,255z M303.374,195.199C290.201,184.558,273.399,178.2,255,178.2 c-42.667,0-76.8,34.133-76.8,76.8c0,18.17,6.206,34.779,16.61,47.877l-63.576,63.057H106.52c-7.68,0-13.653-5.973-13.653-13.653 V183.32c0-7.68,5.973-13.653,13.653-13.653h54.613c3.413,0,6.827-2.56,7.68-5.12l21.333-54.613h129.707l19.404,49.675 L303.374,195.199z M206.848,314.974C219.987,325.509,236.703,331.8,255,331.8c42.667,0,76.8-34.133,76.8-76.8 c0-18.068-6.138-34.592-16.436-47.655l37.988-37.678h49.274c7.68,0,13.653,5.973,13.653,13.653v168.96 c0,7.68-5.973,13.653-13.653,13.653H155.469L206.848,314.974z M255,493.933c-62.954,0-120.415-24.686-163.208-64.843L138.262,383 H403.48c17.067,0,30.72-13.653,31.573-30.72V183.32c0-17.067-13.653-30.72-30.72-30.72H370.56l59.865-59.376 c39.368,42.639,63.509,99.521,63.509,161.776C493.933,386.413,386.413,493.933,255,493.933z" style="fill: %23E0E0E0"/><path d="M383,186.733c-9.387,0-17.067,7.68-17.067,17.067c0,9.387,7.68,17.067,17.067,17.067s17.067-7.68,17.067-17.067 C400.067,194.413,392.387,186.733,383,186.733z" style="fill: %23E0E0E0"/></g></g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><script xmlns=""/></svg>');
            background-color: $placeholder;
            background-repeat: no-repeat;
            background-position: center;
            background-size: p2r(60);

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
                font-size: p2r(14);
                line-height: 1.3;
                text-transform: uppercase;
                color: $font-white;
                background: $primary;
                border-radius: p2r(2);
                padding: p2r(8) p2r(10) p2r(7) p2r(10);
            }
        }

        &-badges {
            display: flex;
            flex-wrap: wrap;
            gap: p2r(4);
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
            margin-left: auto;

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

                @media (max-width: 599px) {
                    width: p2r(48);
                    flex: 0 0 p2r(48);
                }

                .icon {
                    font-size: p2r(28);
                    line-height: p2r(26);
                    color: $primary;
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
        margin-top: p2r(60);
        margin-bottom: p2r(36);
    }

    &-preview {
        color: $font-white;
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

        @media (max-width: 1366px) {
            margin-left: p2r(-32);
            margin-right: p2r(-32);
            max-width: calc(100% + 64px);
        }

        @media (max-width: 768px) {
            margin-left: p2r(-24);
            margin-right: p2r(-24);
            max-width: calc(100% + 48px);
        }
    }
}

.why-attend {
    &-section {
        padding-top: p2r(60);
        padding-bottom: p2r(60);

        @media (max-width: 1366px) {
            padding-top: p2r(50);
            padding-bottom: p2r(50);
        }

        @media (max-width: 1024px) {
            padding-top: p2r(40);
            padding-bottom: p2r(40);
        }

        @media (max-width: 768px) {
            padding-top: p2r(40);
            padding-bottom: p2r(32);
        }

        @media (max-width: 599px) {
            padding-top: p2r(32);
            padding-bottom: p2r(24);
        }
    }

    &-items {
        border-top: 1px solid $border;
        border-bottom: 1px solid $border;
        margin-bottom: p2r(40);
        padding-top: p2r(40);
        padding-bottom: p2r(10);

        @media (max-width: 768px) {
            margin-bottom: p2r(32);
            padding-top: p2r(32);
        }

        @media (max-width: 599px) {
            margin-bottom: p2r(24);
            padding-top: p2r(24);
        }
    }
    &-item {
        display: flex;
        gap: p2r(20);
        margin-bottom: p2r(30);

        @media (max-width: 599px) {
            flex-direction: column;
            align-items: center;
        }
    }

    &-icon {
        position: relative;
        width: p2r(66);
        height: p2r(66);
        flex: 0 0 p2r(66);

        @media (max-width: 599px) {
            width: p2r(58);
            height: p2r(58);
            flex: 0 0 p2r(58);
        }

        img {
            position: absolute;
            display: block;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
        }
    }

    &-text {
        @media (max-width: 599px) {
            text-align: center;
        }

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

    @media (max-width: 768px) {
        padding-bottom: p2r(32);
        margin-bottom: p2r(32);
    }

    @media (max-width: 599px) {
        padding-bottom: p2r(24);
        margin-bottom: p2r(24);
    }

    .row {
        row-gap: p2r(24);
    }

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

        @media(max-width: 599px) {
            display: none;
        }
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

    @media (max-width: 1024px) {
        padding: p2r(40);
    }

    @media (max-width: 768px) {
        padding: p2r(32);
    }

    @media (max-width: 599px) {
        padding: p2r(24);
    }

    @media (max-width: 420px) {
        padding: p2r(20);
    }

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

        @media (max-width: 599px) {
            font-size: p2r(18);
        }

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
            justify-content: space-between;
            padding: p2r(20) p2r(30);
            border-bottom: 1px solid $border;
            min-height: p2r(90);

            &-text {
                display: flex;
                flex-direction: column;
            }

            &-icon {
                color: $primary;
                font-size: p2r(32);
                line-height: p2r(28);
            }
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
            cursor: pointer;
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
    padding: p2r(18) p2r(16);
}

.video-section {
    margin-bottom: p2r(40);
}

.report {
    &-section {
        margin-bottom: 0;
        padding-top: p2r(20);
        padding-bottom: p2r(10);
        overflow: hidden;
    }
}

.video {
    &-previews {
        display: flex;
        flex-wrap: wrap;
        margin-right: p2r(-5);
        margin-left: p2r(-5);
        row-gap: p2r(24);
        margin-bottom: p2r(30);
    }

    &-preview {
        width: 25%;
        flex: 0 0 25%;
        padding-right: p2r(5);
        padding-left: p2r(5);

        @media (max-width: 768px) {
            width: 50%;
            flex: 0 0 50%;
        }

        &-image {
            position: relative;
            display: block;
            background-color: $placeholder;
            aspect-ratio: 265/160;
            margin-bottom: p2r(10);
            border-radius: p2r(6);
            overflow: hidden;

            &.active {
                border: p2r(4) solid $primary;

                .video-preview-badge {
                    top: p2r(6);
                    left: p2r(6);
                }
            }

            img {
                display: block;
                width: 100%;
                height: 100%;
                object-fit: cover;
                object-position: center;
            }
        }

        &-title {
            font-weight: 500;
            letter-spacing: -0.03em;
            color: $font;
        }

        &-lock {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
            width: p2r(52);
            height: p2r(52);
            border-radius: 50%;
            background-color: $bgc;

            &-icon {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                font-size: p2r(24);
                line-height: p2r(20);
            }
        }

        &-badge {
            position: absolute;
            top: p2r(10);
            left: p2r(10);
            display: flex;
            align-items: center;
            background: $font-dark-grey;
            border-radius: p2r(2);
            padding: p2r(6) p2r(8);
            font-weight: 600;
            font-size: p2r(10);
            line-height: p2r(12);
            text-transform: uppercase;
            color: $font-white;

            &-item {
                &:not(:last-child) {
                    position: relative;
                    padding-right: p2r(6);
                    margin-right: p2r(6);

                    &::after {
                        content: '';
                        position: absolute;
                        top: 50%;
                        right: 0;
                        transform: translate(50%, -50%);
                        height: p2r(8);
                        width: 1px;
                        background-color: #686464;
                    }
                }
            }
        }
    }

    &-section {

        &-main {
            margin-bottom: p2r(10);
        }
        &-image {
            position: relative;
            aspect-ratio: 16/9;
            border-radius: p2r(6);
            overflow: hidden;
            background-color: $placeholder;

            img {
                display: block;
                width: 100%;
                height: 100%;
                object-fit: cover;
                object-position: center;
            }
        }

        &-access {
            position: absolute;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
        }

        &-lock {
            position: relative;
            width: p2r(100);
            height: p2r(100);
            border-radius: 50%;
            background-color: $bgc;
            margin-left: auto;
            margin-right: auto;
            margin-bottom: p2r(20);

            &-icon {
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
                font-size: p2r(48);
                line-height: p2r(40);
                color: $primary;
            }
        }
    }

    &-more {
        color: $primary;
        transition: border-color 0.3s;

        @media (hover: hover) and (pointer: fine) {
            &:hover {
                border-color: $primary;
            }
        }
    }
}

:deep(.video-player) {
    margin-bottom: p2r(10);
}

:deep(.report-head) {
    margin-bottom: p2r(18);
}

/* Стили для пагинации с использованием :deep() */
:deep(.swiper-wrapper) {
    padding-bottom: p2r(32);
}
:deep(.swiper-pagination-bullets.swiper-pagination-horizontal) {
    width: auto;
}
:deep(.swiper-pagination) {
    bottom: p2r(0);
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    display: none;
    gap: p2r(2);

    @media(max-width: 599px) {
        display: flex;
    }
}

:deep(.swiper-pagination-bullet) {
    width: p2r(8);
    height: p2r(8);
    background: #D9F0E8;
    border-radius: p2r(8);
    cursor: pointer;
    opacity: 1;
    transition: opacity 0.3s ease;
}

:deep(.swiper-pagination-bullet-active) {
    background-color: $primary;
    width: p2r(48);
}

:deep(.breadcrumbs-item) {
    &:last-child {
        display: none;
    }
    &:nth-last-child(2) {
        .breadcrumbs-separator {
            display: none;
        }
    }
}
</style>