<template>
    <div class="education">
        <div class="container">
            <div class="education-head">
                <div class="education-head-text">
                    <h2 class="education-head-title">Наши Курсы</h2>
                    <NuxtLink to="/courses" class="education-head-more">Смотреть все</NuxtLink>
                </div>
                <div v-if="showNavigation" class="slider-btns" >
                    <button class="slider-btn slider-prev education-slider-prev" :disabled="isBeginning" @click="slidePrev">
                        <NuxtIcon name="arrow-left" class="slider-icon" filled />
                    </button>
                    <button class="slider-btn slider-next education-slider-next" :disabled="isEnd" @click="slideNext">
                        <NuxtIcon name="arrow-right" class="slider-icon" filled />
                    </button>
                </div>
            </div>
            <div class="education-cards">
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
                        prevEl: '.education-slider-prev',
                        nextEl: '.education-slider-next',
                    }"
                        :pagination="{ clickable: true, el: '.swiper-pagination' }"
                        class="education-swiper"
                        @swiper="onSwiper"
                        @slideChange="onSlideChange"
                >
                    <SwiperSlide v-for="event in courses" :key="event.ID">
                        <CourcesCard :event="event" />
                    </SwiperSlide>
                    <div class="swiper-pagination"></div>
                </Swiper>
            </div>
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
    courses: any[];
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
.education {
  background-color: $primary;
  padding-top: p2r(104);
  padding-bottom: p2r(100);

  @media(max-width: 1280px) {
    padding-top: p2r(80);
    padding-bottom: p2r(80);
  }

  @media(max-width: 992px) {
    padding-top: p2r(60);
    padding-bottom: p2r(60);
  }

  @media(max-width: 768px) {
    padding-top: p2r(50);
    padding-bottom: p2r(50);
  }

  @media(max-width: 599px) {
    padding-top: p2r(32);
    padding-bottom: p2r(32);
  }

  &-head {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: p2r(24);
    margin-bottom: p2r(30);

    &-text {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: p2r(24);

      @media(max-width: 599px) {
        row-gap: p2r(4);
        flex-direction: column;
      }
    }

    &-title {
      color: $font-white;
      margin-bottom: 0;
    }

    &-more {
      font-size: p2r(18);
      color: #D9F0E8;
      border-bottom: 1px solid #D9F0E8;
      transition: border-color 0.3s;

      @media (hover: hover) and (pointer: fine) {
        &:hover {
          border-color: transparent;
        }
      }

      @media(max-width: 599px) {
        font-size: p2r(14);
        line-height: 1.3;
      }
    }
  }

  &-card {
    display: flex;
    flex-direction: column;
    height: 100%;
    background-color: $bgc;
    border-radius: p2r(6);
    overflow: hidden;

    &-image {
      aspect-ratio: 1.61;
      overflow: hidden;
      display: block;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center;
        transition: transform 0.3s;
      }

      @media (hover: hover) {
        &:hover {
          img {
            transform: scale(1.1);
          }
        }
      }
    }

    &-content {
      padding: p2r(20);
    }

    &-badges {
      display: flex;
      gap: p2r(4);
      margin-bottom: p2r(20);
    }

    &-title {
      font-weight: 500;
      font-size: p2r(20);
      line-height: 1.3;
      color: $font;
      margin-bottom: p2r(20);
    }

    &-names {
      font-weight: 400;
      font-size: p2r(14);
      color: $font-grey;
    }

    &-free {
      font-weight: 600;
      font-size: p2r(20);
      margin-top: p2r(20);
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
    border-radius: 50%;
    border: 1px solid $border;
    background: $bgc;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    @media (hover: hover) and (pointer: fine) {
      &:hover {
        .slider-icon {
           color: $primary;
        }
      }
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      pointer-events: none;
    }

    &:hover:not(:disabled) {
      //background-color: $bgc-dark;
    }
  }

  &-icon {
    font-size: p2r(26);
    line-height: p2r(22);
    color: $font;
    transition: color 0.3s;
  }
}

.swiper-slide {
  height: auto;
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
  background-color: #fff;
  width: p2r(48);
}
</style>