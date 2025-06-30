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
                                <div v-if="event?.PROPS?.SERTIFICATE?.VALUE === 'Да'" class="event-props-item">
                                    <NuxtIcon name="award" class="event-props-item-icon" filled />
                                    {{ event?.PROPS?.SERTIFICATE?.NAME}}
                                </div>
                                <div v-if="event?.PROPS?.RECORDING_AVAILABLE?.VALUE" class="event-props-item">
                                    <NuxtIcon name="play-circle" class="event-props-item-icon" filled />
                                    {{ event.PROPS.RECORDING_AVAILABLE.VALUE }}
                                </div>
                            </div>
                            <div class="event-props-share">
                                <div class="event-share-head" @click="isShareLinksShow = !isShareLinksShow">
                                    <span class="event-share-head-title">{{ $t('news.share')}}</span>
                                    <NuxtIcon name="share" class="event-props-share-icon" filled />
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
                        <div v-if="event?.PROPS?.AFISHA_VIDEO_FILE?.VALUE_PATH || event?.PROPS?.AFISHA_VIDEO_LINK?.VALUE" class="video-section">
                            <Video
                                :preview="event?.PROPS?.AFISHA_IMG?.VALUE_PATH ? `${baseUrl}${event?.PROPS?.AFISHA_IMG?.VALUE_PATH}` : ''"
                                :file="event?.PROPS?.AFISHA_VIDEO_FILE?.VALUE_PATH ? `${baseUrl}${event?.PROPS?.AFISHA_VIDEO_FILE.VALUE_PATH}` : ''"
                                :code="event?.PROPS?.AFISHA_VIDEO_LINK?.VALUE || ''"
                            />
                        </div>
                        <div v-else-if="event?.PROPS?.AFISHA_IMG?.VALUE_PATH">
                            <img :src="`${baseUrl}${event?.PROPS?.AFISHA_IMG?.VALUE_PATH}`" :alt="event?.PROPS?.AFISHA_IMG?.NAME">
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
                            <h2 class="ui-block-title">{{ event.PROPS.ABOUT_TITLE.VALUE || 'О курсе' }}</h2>
                            <div class="course-content" v-html="decodedAboutDescription"></div>
                        </div>
                        <!-- Блок Почему стоит посетить курс -->
                        <div v-if="event?.PROPS?.WHY_ICONS?.VALUE" class="ui-section why-attend-section article">
                            <h2 class="ui-block-title">{{ event.PROPS.WHY_TITLE.VALUE || 'Почему стоит посетить курс?' }}</h2>
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
                                    <div v-if="event?.PROPS?.WHEN_ADDR?.VALUE" class="col-lg-4 col-md-6 col-sm-4 col-xs-6">
                                        <div class="when-info-item">
                                            <NuxtIcon name="pin" class="when-info-icon" filled />
                                            <div class="when-info-text">
                                                <div class="when-info-label">
                                                    Адрес проведения:
                                                </div>
                                                <div class="when-info-value">
                                                    <div>{{ event.PROPS?.WHEN_ADDR?.VALUE }}</div>
                                                </div>
                                                <a href="#" class="when-map-link" @click.prevent="openMapModal">Посмотреть на карте</a>
                                            </div>
                                        </div>
                                    </div>
                                    <div v-if="event?.PROPS?.WHEN_DATE?.VALUE" class="col-lg-4 col-md-6 col-sm-4 col-xs-6">
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
                                    <div v-if="event?.PROPS?.WHEN_PHONE?.VALUE || event.PROPS?.WHEN_EMAIL?.VALUE" class="col-lg-4 col-md-6 col-sm-4 col-xs-6">
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
                                        :modules="[SwiperNavigation, Pagination]"
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
                                        :pagination="{ clickable: true, el: '.swiper-pagination' }"
                                        :loop="event.PROPS?.WHEN_GALL?.VALUE_PATH?.length > 3"
                                        class="when-gallery-swiper"
                                    >
                                        <SwiperSlide v-for="(image, index) in event.PROPS?.WHEN_GALL?.VALUE_RESIZE" :key="index">
                                            <img :src="image ? `${baseUrl}${image}` : ''" alt="Gallery image" class="when-gallery-image" @click="openGalleryPopup(index)" />
                                        </SwiperSlide>
                                        <div class="swiper-pagination"></div>
                                    </Swiper>
                                </div>

                                <GalleryPopup
                                    v-if="isImagesPopupOpen"
                                    :images="event.PROPS?.WHEN_GALL?.VALUE_PATH?.map(path => `${baseUrl}${path}`)"
                                    :initial-index="currentSlideIndex"
                                    :captions="whenGalleryCaptions"
                                    @close="closeGalleryPopup"
                                />

                            </div>
                            <div class="when-description" v-html="getDecodedHTML(event.PROPS?.WHEN_DESCRIPTION?.VALUE?.TEXT || '')"></div>
                        </div>

                        <div v-if="event?.PROPS?.PLAYER_DATE_START?.VALUE && showBroadcastInfo" class="broadcast-info">
                           <NuxtIcon name="device-monitor" class="broadcast-icon" filled />
                              <div class="broadcast-title">
                                 онлайн-трансляция начнется<br>
                              <span>{{ formatDate(event.PROPS.PLAYER_DATE_START.VALUE) }}</span>
                           </div>
                        </div>
                        <div v-if="showBroadcastPlayer && isCourseAccessStatus" class="broadcast-player">
                           Плеер трансляции<br>
                           Дата и время показа плеера {{ formatDate(event?.PROPS?.PLAYER_DATE_SHOW.VALUE) }}<br>
                           Дата и время начала трансляции {{ formatDate(event?.PROPS?.PLAYER_DATE_START.VALUE) }}<br>
                           Запись будет доступна до {{ formatDate(event?.PROPS?.PLAYER_DATE_VIDEO_ACCESS.VALUE) }}
                            <div v-if="event?.PROPS?.PLAYER_VIDEO?.VALUE_PATH || event?.PROPS?.PLAYER_CODE?.VALUE" style="width: 100%">

                                <Video
                                    :preview="event?.PROPS?.VIDEO_PREVIEW?.VALUE ? `${baseUrl}${event.PROPS?.VIDEO_PREVIEW?.VALUE}` : ''"
                                    :file="event?.PROPS?.PLAYER_VIDEO?.VALUE_PATH ? `${baseUrl}${event.PROPS?.PLAYER_VIDEO.VALUE_PATH}` : ''"
                                    :code="event?.PROPS?.PLAYER_CODE?.VALUE || ''"
                                />
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
                                                <div class="cost-group-header-text">
                                                    <div class="cost-group-title">{{ costGroup.SUB_VALUES.COST_GR_TITLE.VALUE }}</div>
                                                    <div v-if="costGroup.SUB_VALUES.COST_GR_SUBTITLE?.VALUE" class="cost-group-subtitle">
                                                        {{ costGroup.SUB_VALUES.COST_GR_SUBTITLE.VALUE }}
                                                    </div>
                                                </div>
                                                <NuxtIcon v-if="costGroup?.SUB_VALUES?.COST_GR_SALE_DESCRIPTION" name="discount" filled class="cost-group-header-icon"/>
                                            </div>
                                            <div class="cost-group-details">
                                                <div class="cost-group-type">{{ costGroup.SUB_VALUES.COST_GR_TYPE.VALUE }}:</div>
                                                <div class="cost-group-price">{{ costGroup.SUB_VALUES.COST_GR_PRICE.VALUE }}</div>
                                                <button class="cost-group-btn" @click="openTooltipModal(costGroup)">
                                                    <template v-if="costGroup?.SUB_VALUES?.COST_GR_SALE_DESCRIPTION">
                                                        Подробнее о скидке
                                                    </template>
                                                    <template v-else>
                                                        Подробнее об оплате
                                                    </template>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!--   Блок Теги  -->
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
                                    <img v-if="event.PREVIEW_PICTURE" :src="getImageUrl(event.PREVIEW_PICTURE)" :alt="event.NAME" />
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
                                    <div v-if="isFree" class="event-card-price-value">
                                        <span>{{ event.PROPS.IS_FREE?.NAME }}</span>
                                    </div>
                                    <div v-else-if="event?.PROPS?.PRICE?.VALUE" class="event-card-price-value">
                                        <span>{{ event.PROPS.PRICE?.VALUE }}</span> бел.руб.
                                    </div>
                                    <div v-if="event?.PROPS?.SEATS?.VALUE && event?.PROPS?.NO_LIMIT?.VALUE !== 'Да'" class="event-card-seats">
                                        <div class="event-card-seats-title">Осталось мест:</div>
                                        {{ Math.max(0, event.PROPS.SEATS?.VALUE - (event.PROPS.REGISTERED?.VALUE || 0)) }}
                                        из {{ event.PROPS.SEATS?.VALUE }}
                                    </div>
                                </div>
                                <div class="event-card-pay">
                                    <button
                                        class="ui-btn ui-btn__primary event-card-pay-btn"
                                        :disabled="!hasAvailableSeats || isCoursePaidComputed"
                                        @click="takePart"
                                    >
                                        <template v-if="!hasAvailableSeats">Мест нет</template>
                                        <template v-else-if="isFree">{{ $t('courses.takePart') }}</template>
                                        <template v-else>{{ $t('courses.payPart') }}</template>
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
    <!--    хардкод-->
<!--    <EducationCards />-->
    <CourcesColored :courses="featuredWebinars"/>

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
import {computed, onMounted, ref} from 'vue';
import {useRequestURL, useRoute, useRouter} from 'nuxt/app';
import {useAuthStore} from '~/stores/auth';
import {useModalsStore} from '~/stores/modals';
import {useSettingsStore} from '~/stores/settings';
import {useI18n} from 'vue-i18n';
import {Swiper, SwiperSlide} from 'swiper/vue';
import {Navigation as SwiperNavigation, Pagination} from 'swiper/modules';
import {useLocaleStore} from '~/stores/locale';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const { $toast } = useNuxtApp();

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

// Состояние для модального окна
const isTooltipModalOpen = ref(false);
const tooltipContent = ref('');
const tooltipTitle = ref('');

const isMapModalOpen = ref(false);
const mapLatitude = ref(53.90257);
const mapLongitude = ref(27.557088);

const isCoursePaid = ref<boolean | null>(null);
const isCourseAccessStatus = ref<boolean | null>(null);

const showBroadcastInfo = ref(true);
const showBroadcastPlayer = ref(false);

// Принудительное обновление токена каждые 5 минут
useTokenRefresh({
    customInterval: 3,
    forceInterval: true
})

// Функция для проверки времени показа плеера
const checkBroadcastTime = () => {
    if (!event.value?.PROPS?.PLAYER_DATE_SHOW?.VALUE) {
        showBroadcastInfo.value = true;
        showBroadcastPlayer.value = false;
        return;
    }

    const showDate = new Date(event.value.PROPS.PLAYER_DATE_SHOW.VALUE);
    const accessDate = event.value?.PROPS?.PLAYER_DATE_VIDEO_ACCESS?.VALUE
        ? new Date(event.value.PROPS.PLAYER_DATE_VIDEO_ACCESS.VALUE)
        : null;
    const now = new Date();

    if (now < showDate) {
        // До времени показа плеера
        showBroadcastInfo.value = true;
        showBroadcastPlayer.value = false;
    } else if (accessDate && now > accessDate) {
        // После времени окончания доступа
        showBroadcastInfo.value = false;
        showBroadcastPlayer.value = false;
    } else {
        // В период между началом показа и окончанием доступа
        showBroadcastInfo.value = false;
        showBroadcastPlayer.value = true;
    }
};

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
        event.value?.IPROPERTY_VALUES?.ELEMENT_META_DESCRIPTION ||
        event.value?.DETAIL_TEXT?.substring(0, 200) ||
        ''
    );
});

// Изображение для шаринга
const shareImage = computed(() => {
    return event.value?.PREVIEW_PICTURE
        ? `${imageBaseUrl}${event.value.PREVIEW_PICTURE}`
        : `${baseUrl}/images/logo.svg`;
});

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
    return authStore.favorites.includes(eventId);
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
const isImagesPopupOpen = ref(false);
const currentSlideIndex = ref(0);

const openGalleryPopup = (index) => {
    currentSlideIndex.value = index;
    isImagesPopupOpen.value = true;
};

const closeGalleryPopup = () => {
    isImagesPopupOpen.value = false;
    currentSlideIndex.value = 0;
};

const whenGalleryCaptions = computed(() => {
    if (!event.value?.PROPS?.WHEN_GALL?.DESCRIPTION) return [];
    return event.value.PROPS.WHEN_GALL.DESCRIPTION.map(desc => desc || '');
});

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

        // Проверяем время показа плеера сразу после загрузки данных
        checkBroadcastTime();
    } catch (error) {
        eventError.value = { details: error.message || 'Ошибка загрузки мероприятия' };
    }

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
            if(error.value.data?.data?.error === 'ERROR_INVALID_TOKEN') {
                authStore.logout();
                await router.push('/');
                modalsStore.openModal('login');
            }

            console.error('Ошибка проверки оплаты:', error.value)
            isCoursePaid.value = false // По умолчанию считаем не оплаченным при ошибке
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
            if(error.value.data?.data?.error === 'ERROR_INVALID_TOKEN') {
                authStore.logout();
                await router.push('/');
                modalsStore.openModal('login');
            }
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
// Периодическая проверка времени
let broadcastInterval = null;
onMounted(async () => {
    checkBroadcastTime();
    // Запускаем периодическую проверку каждые 60 секунд
    broadcastInterval = setInterval(checkBroadcastTime, 60 * 1000);
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

onUnmounted(() => {
    // Очищаем интервал при размонтировании компонента
    if (broadcastInterval) {
        clearInterval(broadcastInterval);
    }
})

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
            // useToast().success('Курс удален из избранного');
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
            // useToast().success('Курс добавлен в избранное');
        }
        // Синхронизируем избранное с сервером
        await authStore.fetchProfile();
    } catch (error) {
        console.error('addToFav: Error:', error);
        const errorMessage = error.data?.error || error.statusMessage || 'Произошла ошибка';
        if (error.data?.error === 'ERROR_INVALID_TOKEN') {
            console.warn('addToFav: Invalid token, opening login modal');
            modalsStore.openModal('login');
        } else if (error.data?.error === 'ERROR_ITEM_ALREADY_FAVORITE') {
            await authStore.fetchProfile(); // Синхронизируем избранное
            // useToast().info('Курс уже в избранном');
        } else if (error.data?.error === 'ERROR_ITEM_NOT_FAVORITE') {
            await authStore.fetchProfile(); // Синхронизируем избранное
            // useToast().info('Курс не находится в избранном');
        } else {
            console.error('addToFav: Unknown error:', errorMessage);
            // useToast().error('Не удалось изменить избранное');
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
    if (!event.value?.PROPS?.SEATS?.VALUE) return true; // Если мест не указано, считаем, что ограничения нет
    const totalSeats = Number(event.value.PROPS.SEATS.VALUE);
    const registered = Number(event.value.PROPS.REGISTERED?.VALUE || 0);
    return totalSeats - registered > 0;
});

const takePart = async () => {
    if (!authStore.isAuthenticated) {
        modalsStore.openModal('login');
        // toast.error(t('courses.notAuthenticated'));
        return;
    }

    if (!event.value?.ID) {
        // toast.error('ID мероприятия не найден');
        return;
    }

    if (isFree.value) {
        try {
            const response = await $fetch('/api/orders/create', {
                method: 'POST',
                body: {
                    token: authStore.token,
                    courseId: Number(event.value.ID),
                    paymentMethodId: 4 // Бесплатный тип оплаты
                }
            });

            // Сохранение данных заказа в куки
            const orderCookie = useCookie('orderData', {
                maxAge: 60 * 60 * 24, // 24 часа
                path: '/',
                sameSite: 'lax',
            });
            orderCookie.value = {
                orderId: response.orderId,
                amount: response.amount,
                name: event.value.NAME || 'Unknown Course',
                paymentMethod: 4
            };

            // toast.success('Заказ успешно создан!');
            // router.push('/payment/success');
            $toast.success('Успешно! Курс будет добавлен в личном кабинете');
            isCoursePaid.value = true;
            isCourseAccessStatus.value = true;

            // router.push('/profile/courses'); // Перенаправление на страницу курсов
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
                    router.push('/profile/courses'); // Перенаправляем, так как заказ уже существует
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

            // toast.error(userFriendlyMessage);
        }
    } else {
        router.push({
            path: '/payment',
            query: { code: eventCode },
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

// слайдер курсов внизу
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
            margin-bottom: p2r(60);
        }
    }

    &-content {
        background-color: #F5F5F5;
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
                color: $font;
                transition: color 0.3s;
            }
        }
    }

    &-share {
        &-head {
            cursor: pointer;

            @media (hover: hover) and (pointer: fine) {
                &:hover {
                    .event-share-head-title {
                        color: $primary;
                        border-color: $primary;
                    }
                    .event-props-share-icon {
                        color: $primary;
                    }
                }
            }

            &-title {
                border-bottom: 1px dotted $font;
                margin-right: p2r(8);
                transition: color 0.3s, border-color 0.3s;
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
                transition: color 0.3s;
            }
        }
    }

    &-aside {
        margin-top: p2r(-354);
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
            background-color: $placeholder;
            background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_14" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><g transform="translate(1 1)"><g><g><path d="M255-1C114.2-1-1,114.2-1,255s115.2,256,256,256s256-115.2,256-256S395.8-1,255-1z M255,16.067 c63.054,0,120.598,24.764,163.413,65.033l-65.336,64.802L334.36,97.987c-0.853-2.56-4.267-5.12-7.68-5.12H185.027 c-3.413,0-5.973,1.707-7.68,5.12L156.013,152.6h-48.64c-17.067,0-30.72,13.653-30.72,30.72v168.96 c0,17.067,13.653,30.72,30.72,30.72h6.653l-34.26,33.981C40.285,374.319,16.067,317.354,16.067,255 C16.067,123.587,123.587,16.067,255,16.067z M314.733,255c0,33.28-26.453,59.733-59.733,59.733 c-13.563,0-25.99-4.396-35.957-11.854l84.125-83.438C310.449,229.34,314.733,241.616,314.733,255z M195.267,255 c0-33.28,26.453-59.733,59.733-59.733c13.665,0,26.174,4.467,36.179,12.028l-84.183,83.495 C199.613,280.852,195.267,268.487,195.267,255z M303.374,195.199C290.201,184.558,273.399,178.2,255,178.2 c-42.667,0-76.8,34.133-76.8,76.8c0,18.17,6.206,34.779,16.61,47.877l-63.576,63.057H106.52c-7.68,0-13.653-5.973-13.653-13.653 V183.32c0-7.68,5.973-13.653,13.653-13.653h54.613c3.413,0,6.827-2.56,7.68-5.12l21.333-54.613h129.707l19.404,49.675 L303.374,195.199z M206.848,314.974C219.987,325.509,236.703,331.8,255,331.8c42.667,0,76.8-34.133,76.8-76.8 c0-18.068-6.138-34.592-16.436-47.655l37.988-37.678h49.274c7.68,0,13.653,5.973,13.653,13.653v168.96 c0,7.68-5.973,13.653-13.653,13.653H155.469L206.848,314.974z M255,493.933c-62.954,0-120.415-24.686-163.208-64.843L138.262,383 H403.48c17.067,0,30.72-13.653,31.573-30.72V183.32c0-17.067-13.653-30.72-30.72-30.72H370.56l59.865-59.376 c39.368,42.639,63.509,99.521,63.509,161.776C493.933,386.413,386.413,493.933,255,493.933z" style="fill: %23E0E0E0"/><path d="M383,186.733c-9.387,0-17.067,7.68-17.067,17.067c0,9.387,7.68,17.067,17.067,17.067s17.067-7.68,17.067-17.067 C400.067,194.413,392.387,186.733,383,186.733z" style="fill: %23E0E0E0"/></g></g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><script xmlns=""/></svg>');
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
    &-info {
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
    }

    &-player {
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
            transition: border-color 0.3s;

            @media (hover: hover) and (pointer: fine) {
                &:hover {
                    border-color: transparent;
                }
            }
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
        overflow: hidden;
    }
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