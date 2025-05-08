<template>
    <div class="journal">
        <div class="journal-head">
            <div class="journal-head-text">
                <h2 class="journal-head-title">{{ $t('journal.title') }}</h2>
                <NuxtLink to="/journal" class="journal-head-more">Смотреть все</NuxtLink>
            </div>
            <div v-if="showNavigation" class="slider-btns">
                <button class="slider-btn slider-prev journal-slider-prev" :disabled="isBeginning" @click="slidePrev">
                    <NuxtIcon name="arrow-left" class="slider-icon" filled />
                </button>
                <button class="slider-btn slider-next journal-slider-next" :disabled="isEnd" @click="slideNext">
                    <NuxtIcon name="arrow-right" class="slider-icon" filled />
                </button>
            </div>
        </div>
        <div class="journal-cards">
            <Swiper
                :modules="[SwiperNavigation]"
                :slides-per-view="4"
                :space-between="30"
                :breakpoints="{
                    320: { slidesPerView: 1 },
                    768: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                    1280: { slidesPerView: 4 }
                }"
                :navigation="{
                    prevEl: '.journal-slider-prev',
                    nextEl: '.journal-slider-next',
                }"
                class="journal-swiper"
                @swiper="onSwiper"
                @slideChange="onSlideChange"
                @breakpoint="onBreakpoint"
            >
                <SwiperSlide v-for="item in news" :key="item.ID">
                    <JournalCard :item="item" :rubrics="rubrics" />
                </SwiperSlide>
            </Swiper>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation as SwiperNavigation } from 'swiper/modules';
import 'swiper/css';

defineProps<{
    news: any[];
    rubrics: any[];
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
.journal {
    padding-top: p2r(104);
    padding-bottom: p2r(26);

    &-head {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: p2r(24);
        margin-bottom: p2r(30);

        &-title {
            margin-bottom: 0;
        }

        &-text {
            display: flex;
            align-items: baseline;
            gap: p2r(24);
        }

        &-more {
            font-size: p2r(18);
            color: $font;
            border-bottom: 1px solid $border;
        }
    }
}

.slider {
    &-btns {
        display: flex;
        gap: p2r(20);
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
</style>