<template>
    <Teleport to="body">
        <div class="gallery-popup" @click.self="close">
            <button class="gallery-popup-close" @click="close">✕</button>
            <div class="gallery-popup-inner">
                <div class="gallery-swiper-wrapper">
                    <Swiper
                        :modules="[SwiperNavigation]"
                        :slides-per-view="1"
                        :space-between="10"
                        :initial-slide="initialIndex"
                        :navigation="{
              prevEl: '.swiper-button-prev',
              nextEl: '.swiper-button-next',
            }"
                        :loop="images.length > 1"
                        class="gallery-swiper"
                        @slide-change="onSlideChange"
                    >
                        <SwiperSlide v-for="(img, index) in images" :key="index">
                            <img :src="img" :alt="`Report photo ${index + 1}`" />
                        </SwiperSlide>
                    </Swiper>
                    <div class="swiper-button-prev"></div>
                    <div class="swiper-button-next"></div>
                </div>
                <div class="gallery-popup-info">
                    <div class="gallery-popup-counter">{{ $t('news.photo') }}: {{ currentIndex + 1 }} / {{ images.length }}</div>
                    <div class="gallery-popup-title">
                        {{ captions && captions[currentIndex] ? captions[currentIndex] : $t('advantages.title') }}
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation as SwiperNavigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const props = defineProps({
    images: {
        type: Array,
        default: () => []
    },
    initialIndex: {
        type: Number,
        default: 0
    },
    captions: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['close']);

const currentIndex = ref(props.initialIndex);

const onSlideChange = (swiper) => {
    currentIndex.value = swiper.realIndex;
};

const close = () => {
    emit('close');
};
</script>

<style scoped lang="scss">
.gallery-popup {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.gallery-popup-close {
    position: fixed;
    top: p2r(60);
    right: p2r(60);
    font-size: p2r(30);
    color: $font-black;
    border: none;
    background: none;
    width: p2r(52);
    height: p2r(52);
    border-radius: 50%;
    background-color: $bgc;
    cursor: pointer;
    z-index: 1001;
    transition: background-color 0.3s;

    @media (max-width: 1366px) {
        right: p2r(54);
        width: p2r(46);
        height: p2r(46);
        font-size: p2r(26);
    }

    @media (max-width: 1280px) {
        right: p2r(16);
        top: p2r(16);
    }

    &:hover {
        background-color: rgba(255, 255, 255, 0.3);
    }
}

.gallery-popup-inner {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 90%;
    max-height: 90vh;
}

.gallery-swiper-wrapper {
    position: relative;
    width: 100%;
    max-width: 1024px;
}

.gallery-swiper {
    width: 100%;
    height: auto;
}

.swiper-wrapper {
    align-items: center;
}

.swiper-slide {
    display: flex;
    justify-content: center;
    align-items: center;
    img {
        width: 100%;
        height: auto;
        max-height: 80vh;
        object-fit: contain;
    }
}

.swiper-button-prev,
.swiper-button-next {
    width: p2r(64);
    height: p2r(64);
    background: $bgc;
    color: $font-black;
    border-radius: 50%;
    cursor: pointer;
    top: 50%;
    transform: translateY(-50%);
    margin-top: 0;
    z-index: 10;
    transition: background-color 0.3s;

    @media (max-width: 1366px) {
        width: p2r(50);
        height: p2r(50);
    }

    &:after {
        font-size: p2r(22);
        font-weight: 600;

        @media (max-width: 1366px) {
            font-size: p2r(18);
        }
    }

    &:hover {
        background-color: rgba(255, 255, 255, 0.3);
    }
}

.swiper-button-prev {
    left: p2r(-110);

    @media (max-width: 1366px) {
        left: p2r(0);
    }
}

.swiper-button-next {
    right: p2r(-110);

    @media (max-width: 1366px) {
        right: p2r(0);
    }
}

.gallery-popup-info {
    font-size: p2r(14);
    font-weight: 500;
    align-self: flex-start;
    display: flex;
    margin-top: p2r(20);
    color: #fff;
}

.gallery-popup-counter {
    margin-right: p2r(30);
}

.gallery-popup-title {
    position: relative;
    padding-left: p2r(30);

    &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 50%;
        transform: translate(0%, -50%);
        width: 1px;
        height: p2r(11);
        background-color: $bgc;
    }
}
</style>