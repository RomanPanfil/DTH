<template>
    <div class="journal">
        <div class="journal-head">
            <div class="journal-head-text">
                <h2 class="journal-head-title">Журнал</h2>
                <NuxtLink to="/journal" class="journal-head-more">Смотреть все</NuxtLink>
            </div>
            <div class="slider-btns">
                <button class="slider-btn slider-prev" :disabled="isBeginning" @click="slidePrev">
                    <NuxtIcon name="arrow-left" class="slider-icon" filled />
                </button>
                <button class="slider-btn slider-next" :disabled="isEnd" @click="slideNext">
                    <NuxtIcon name="arrow-right" class="slider-icon" filled />
                </button>
            </div>
        </div>
        <div class="journal-cards">
            <Swiper
                    :modules="[SwiperNavigation]"
                    :slides-per-view="4"
                    :space-between="30"
                    :navigation="{
                    prevEl: '.slider-prev',
                    nextEl: '.slider-next',
                }"
                    class="journal-swiper"
                    @swiper="onSwiper"
                    @slideChange="onSlideChange"
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

const onSwiper = (swiper) => {
    swiperInstance.value = swiper;
    isBeginning.value = swiper.isBeginning;
    isEnd.value = swiper.isEnd;
};

const onSlideChange = (swiper) => {
    isBeginning.value = swiper.isBeginning;
    isEnd.value = swiper.isEnd;
};

const slidePrev = () => swiperInstance.value?.slidePrev();
const slideNext = () => swiperInstance.value?.slideNext();
</script>

<style scoped lang="scss">
.journal {
  padding-top: p2r(104);
  padding-bottom: p2r(100);

  &-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: p2r(24);
    margin-bottom: p2r(30);

    &-text {
      display: flex;
      align-items: baseline;
      gap: p2r(24);
    }

    &-more {
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