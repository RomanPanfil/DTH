<template>
    <div class="education">
        <div class="container">
            <div class="education-head">
                <div class="education-head-text">
                    <h2 class="education-head-title">Вебинары</h2>
                    <NuxtLink to="/webinars" class="education-head-more">Смотреть все</NuxtLink>
                </div>
                <div class="slider-btns">
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
                    <SwiperSlide v-for="(item, index) in webinars" :key="index">
                        <div class="education-card">
                            <NuxtLink to="/" class="education-card-image">
                                <img :src="item.image" :alt="item.title" />
                            </NuxtLink>
                            <div class="education-card-content">
                                <div class="education-card-badges">
                                    <div class="education-card-badge ui-badge">{{ item.category }}</div>
                                    <div class="education-card-badge ui-badge ui-badge__dark">
                                        <span>{{ item.lessons }}</span>
                                        <span>{{ item.duration }}</span>
                                    </div>
                                </div>
                                <NuxtLink to="/">
                                    <h4 class="education-card-title">{{ item.title }}</h4>
                                </NuxtLink>
                                <div class="education-card-names">{{ item.authors }}</div>
                                <div v-if="item.free" class="education-card-free">бесплатно</div>
                            </div>
                        </div>
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

// Данные для вебинаров
const webinars = ref([
    {
        image: '/images/examples/education-1.jpg',
        category: 'Протезирование',
        lessons: '6 уроков',
        duration: '22 ч 45 м',
        title: 'DIRECT ANTERIOR. Прямые реставрации фронтальной группы зубов',
        authors: 'Роман Карпенко, Владимир Приходько',
        free: false,
    },
    {
        image: '/images/examples/education-1.jpg',
        category: 'имплантация',
        lessons: '6 уроков',
        duration: '22 ч 45 м',
        title: 'Кондилография: интерпретация данных для практического использования',
        authors: 'Владимир Приходько',
        free: true,
    },
    {
        image: '/images/examples/education-1.jpg',
        category: 'ортодонтия',
        lessons: '6 уроков',
        duration: '22 ч 45 м',
        title: 'DIRECT ANTERIOR. Прямые реставрации фронтальной группы зубов',
        authors: 'Дмитрий Корольчук, Евгений Мартыненко',
        free: false,
    },
    {
        image: '/images/examples/education-1.jpg',
        category: 'практический семинар',
        lessons: '6 уроков',
        duration: '22 ч 45 м',
        title: 'Научно-обоснованное лечение дисфункций ВНЧС',
        authors: 'Екатерина Кулакова',
        free: false,
    },
    {
        image: '/images/examples/education-1.jpg',
        category: 'имплантация',
        lessons: '6 уроков',
        duration: '22 ч 45 м',
        title: 'Кондилография: интерпретация данных для практического использования',
        authors: 'Владимир Приходько',
        free: false,
    },
]);
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

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &:hover:not(:disabled) {
      //background-color: $bgc-dark;
    }
  }

  &-icon {
    font-size: p2r(26);
    line-height: p2r(22);
    color: $font;
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