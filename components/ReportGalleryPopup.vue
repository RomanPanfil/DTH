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
                        :loop="items.length > 1"
                        class="gallery-swiper"
                        @slide-change="onSlideChange"
                    >
                        <SwiperSlide v-for="(item, index) in items" :key="index">
                            <div class="slide-content">
                                <!-- Изображение -->
                                <img
                                    v-if="item.type === 'image'"
                                    :src="item.src"
                                    :alt="`Report photo ${index + 1}`"
                                    class="slide-image"
                                />
                                <!-- Локальное видео -->
                                <video
                                    v-else-if="item.type === 'video' && item.file"
                                    :ref="el => setVideoRef(el, index)"
                                    playsinline
                                    :poster="item.preview"
                                    class="slide-video"
                                >
                                    <source :src="item.file" type="video/mp4" />
                                </video>
                                <!-- YouTube видео -->
                                <div
                                    v-else-if="item.type === 'video' && item.code"
                                    :ref="el => setVideoRef(el, index)"
                                    class="plyr__video-embed slide-video"
                                    :data-plyr-provider="'youtube'"
                                    :data-plyr-embed-id="videoId(item.code)"
                                ></div>
                            </div>
                        </SwiperSlide>
                    </Swiper>
                    <div class="swiper-button-prev"></div>
                    <div class="swiper-button-next"></div>
                </div>
                <div class="gallery-popup-info">
                    <div class="gallery-popup-counter">
                        {{ $t('news.item') }}: {{ currentIndex + 1 }} / {{ items.length }}
                    </div>
                    <div class="gallery-popup-title">
                        {{ itemTypeLabel(currentIndex) }}
                    </div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Navigation as SwiperNavigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

const props = defineProps({
    items: {
        type: Array,
        default: () => [],
    },
    initialIndex: {
        type: Number,
        default: 0,
    },
});

const emit = defineEmits(['close']);

const currentIndex = ref(props.initialIndex);
let player = null;
const videoRefs = ref({});

const setVideoRef = (el, index) => {
    if (el) {
        videoRefs.value[index] = el;
    }
};

const videoId = (code) => {
    if (!code) return '';
    const match = code.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?/]+)/);
    const id = match ? match[1] : code.split('/').pop();

    return id;
};

const initPlyr = async (element, isYouTube = false) => {
    if (!element || typeof window === 'undefined') {
        console.warn('No element or window unavailable for Plyr initialization');
        return;
    }

    try {
        const Plyr = (await import('plyr')).default;
        await import('plyr/dist/plyr.css');

        const options = {
            controls: [
                'play-large',
                'play',
                'progress',
                'current-time',
                'mute',
                'volume',
                'captions',
                'settings',
                'pip',
                'airplay',
                'fullscreen',
            ],
            ratio: '16:9',
            hideControls: false,
            youtube: isYouTube
                ? {
                    noCookie: true,
                    rel: 0,
                    showinfo: 0,
                    iv_load_policy: 3,
                }
                : undefined,
        };

        player = new Plyr(element, options);
    } catch (error) {
        console.error('Error initializing Plyr:', error);
    }
};

const destroyPlyr = () => {
    if (player) {
        try {
            player.destroy();
            player = null;
        } catch (error) {
            console.warn('Error destroying Plyr:', error);
        }
    }
};

const onSlideChange = async (swiper) => {
    currentIndex.value = swiper.realIndex;
    destroyPlyr();

    await nextTick();
    const currentItem = props.items[currentIndex.value];
    if (currentItem?.type === 'video') {
        const element = videoRefs.value[currentIndex.value];
        if (element) {
            const isYouTube = !currentItem.file && currentItem.code;
            setTimeout(() => initPlyr(element, isYouTube), isYouTube ? 100 : 0);
        } else {
            console.warn('No video element found for index:', currentIndex.value);
        }
    }
};

const close = () => {
    destroyPlyr();
    emit('close');
};

const itemTypeLabel = (index) => {
    const item = props.items[index];
    return item?.type === 'video' ? 'Video' : 'Photo';
};

onMounted(() => {
    if (process.client && props.items[props.initialIndex]?.type === 'video') {
        nextTick(() => {
            const element = videoRefs.value[props.initialIndex];
            if (element) {
                const isYouTube = !props.items[props.initialIndex].file && props.items[props.initialIndex].code;
                setTimeout(() => initPlyr(element, isYouTube), isYouTube ? 100 : 0);
            } else {
                console.warn('No initial video element found for index:', props.initialIndex);
            }
        });
    }
});

onUnmounted(() => {
    destroyPlyr();
});
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
    top: 60px;
    right: 60px;
    font-size: 30px;
    color: $font-black;
    border: none;
    background: none;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background-color: $bgc;
    cursor: pointer;
    z-index: 1001;
    transition: background-color 0.3s;

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
    width: 100%;
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
}

.slide-content {
    width: 100%;
    height: auto;
    max-height: 80vh;
}

.slide-image {
    width: 100%;
    height: auto;
    max-height: 80vh;
    object-fit: contain;
}

.slide-video {
    width: 100%;
    max-height: 80vh;
    aspect-ratio: 16/9;
    object-fit: contain;

    :deep(.plyr) {
        border-radius: p2r(6);
        width: 100%;
        max-height: 80vh;
        aspect-ratio: 16/9;

        .plyr__control--overlaid {
            background: $bgc;
            width: p2r(100);
            height: p2r(100);

            &:hover {
                background: $primary;
            }

            svg {
                position: absolute;
                width: p2r(40);
                height: p2r(40);
                left: 50%;
                top: 50%;
                transform: translate(-38%, -50%);
            }
        }

        .plyr__video-embed {
            position: relative;
            padding-bottom: 56.25%;
            height: 0;

            iframe {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
            }
        }
    }
}

.swiper-button-prev,
.swiper-button-next {
    width: 64px;
    height: 64px;
    background: $bgc;
    color: $font-black;
    border-radius: 50%;
    cursor: pointer;
    top: 50%;
    transform: translateY(-50%);
    margin-top: 0;
    z-index: 10;
    transition: background-color 0.3s;

    &:after {
        font-size: 22px;
        font-weight: 600;
    }

    &:hover {
        background-color: rgba(255, 255, 255, 0.3);
    }
}

.swiper-button-prev {
    left: -110px;
}

.swiper-button-next {
    right: -110px;
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