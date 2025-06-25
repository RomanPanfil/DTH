<template>
    <div class="courses">
        <div class="courses-head">
            <div class="courses-head-text">
                <h2 class="courses-head-title">Наши курсы</h2>
                <NuxtLink to="/courses" class="courses-head-more">Смотреть все</NuxtLink>
            </div>
            <div v-if="showNavigation" class="slider-btns">
                <button class="slider-btn slider-prev courses-slider-prev" :disabled="isBeginning" @click="slidePrev">
                    <NuxtIcon name="arrow-left" class="slider-icon" filled />
                </button>
                <button class="slider-btn slider-next courses-slider-next" :disabled="isEnd" @click="slideNext">
                    <NuxtIcon name="arrow-right" class="slider-icon" filled />
                </button>
            </div>
        </div>
        <div class="courses-cards">
            <Swiper
                :modules="[SwiperNavigation, Pagination]"
                :slides-per-view="4"
                :space-between="30"
                :breakpoints="{
                    320: { slidesPerView: 1 },
                    599: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                    1280: { slidesPerView: 4 }
                }"
                :navigation="{
                    prevEl: '.courses-slider-prev',
                    nextEl: '.courses-slider-next',
                }"
                :pagination="{ clickable: true, el: '.swiper-pagination' }"
                class="courses-swiper"
                @swiper="onSwiper"
                @slideChange="onSlideChange"
                @breakpoint="onBreakpoint"
            >
                <SwiperSlide v-for="event in events" :key="event.ID">
                    <CourcesCard :event="event" />
                </SwiperSlide>
                <div class="swiper-pagination"></div>
            </Swiper>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation as SwiperNavigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const props = defineProps<{
    events: any[];
}>();

const swiperInstance = ref(null);
const isBeginning = ref(true);
const isEnd = ref(false);
const showNavigation = ref(true);

const updateNavigationVisibility = (swiper) => {
    const slidesCount = swiper.slides.length;
    const slidesPerView = swiper.params.slidesPerView;
    showNavigation.value = slidesCount > slidesPerView;
};

const onSwiper = (swiper) => {
    swiperInstance.value = swiper;
    isBeginning.value = swiper.isBeginning;
    isEnd.value = swiper.isEnd;
    updateNavigationVisibility(swiper);
};

const onSlideChange = (swiper) => {
    isBeginning.value = swiper.isBeginning;
    isEnd.value = swiper.isEnd;
};

const onBreakpoint = (swiper) => {
    updateNavigationVisibility(swiper);
};

const slidePrev = () => swiperInstance.value?.slidePrev();
const slideNext = () => swiperInstance.value?.slideNext();
</script>

<style scoped lang="scss">
.courses {
    padding-top: p2r(104);
    padding-bottom: p2r(40);

    @media(max-width: 1280px) {
        padding-top: p2r(80);
        padding-bottom: p2r(32);
    }

    @media(max-width: 599px) {
        padding-top: p2r(12);
        padding-bottom: p2r(24);
    }

    &-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: p2r(24);
        margin-bottom: p2r(30);

        @media(max-width: 599px) {
            margin-bottom: p2r(24);
        }

        &-title {
            margin-bottom: 0;

            @media(max-width: 599px) {
                font-size: p2r(24);
                line-height: 1.30;
            }
        }

        &-text {
            display: flex;
            align-items: baseline;
            flex-wrap: wrap;
            gap: p2r(24);

            @media(max-width: 599px) {
                row-gap: p2r(4);
                flex-direction: column;
            }
        }

        &-more {
            font-size: p2r(18);
            color: $font;
            border-bottom: 1px solid $border;

            @media(max-width: 599px) {
                font-size: p2r(14);
                line-height: 1.3;
            }
        }
    }
}

.slider {
    &-btns {
        display: flex;
        gap: p2r(20);

        @media(max-width: 599px) {
            display: none;
        }
    }

    &-btn {
        width: p2r(44);
        height: p2r(44);
        border: none;
        border-radius: 50%;
        background: $primary;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }
    }

    &-icon {
        font-size: p2r(26);
        line-height: p2r(22);
        color: $font-white;
    }
}

.swiper-slide {
    height: auto;
}

/* Стили для пагинации с использованием :deep() */
:deep(.swiper-pagination-bullets.swiper-pagination-horizontal) {
    width: auto;
}
:deep(.swiper-pagination) {
    bottom: p2r(24);
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
    display: none;
    gap: p2r(2);

    @media(max-width: 599px) {
        display: flex;
        bottom: p2r(0);
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
</style>