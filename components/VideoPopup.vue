<!--<template>-->
<!--    <div class="video-popup">-->
<!--        <div class="video-popup-overlay" @click="$emit('close')"></div>-->
<!--        <div class="video-popup-content">-->
<!--            <div class="video-popup-close" @click="$emit('close')">-->
<!--                <NuxtIcon name="close" class="video-popup-close-icon" />-->
<!--            </div>-->
<!--            <div class="video-player" ref="playerContainer">-->
<!--                &lt;!&ndash; Локальное видео (приоритет) &ndash;&gt;-->
<!--                <video v-if="video?.file" playsinline controls :poster="video.preview">-->
<!--                    <source :src="video.file" type="video/mp4">-->
<!--                </video>-->
<!--                &lt;!&ndash; YouTube видео &ndash;&gt;-->
<!--                <div v-else-if="video?.code" class="plyr__video-embed" :data-plyr-provider="'youtube'" :data-plyr-embed-id="videoId"></div>-->
<!--            </div>-->
<!--        </div>-->
<!--    </div>-->
<!--</template>-->

<!--<script setup lang="ts">-->
<!--import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';-->

<!--const props = defineProps({-->
<!--    video: {-->
<!--        type: Object,-->
<!--        default: () => ({}),-->
<!--    }-->
<!--});-->

<!--const playerContainer = ref(null);-->
<!--let player = null;-->

<!--const videoId = computed(() => {-->
<!--    if (!props.video?.code) return '';-->
<!--    const match = props.video.code.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?/]+)/);-->
<!--    return match ? match[1] : props.video.code.split('/').pop();-->
<!--});-->

<!--const initPlyr = async () => {-->
<!--    if (typeof window === 'undefined' || !playerContainer.value) return;-->

<!--    try {-->
<!--        const Plyr = (await import('plyr')).default;-->
<!--        await import('plyr/dist/plyr.css');-->

<!--        const options = {-->
<!--            controls: [-->
<!--                'play-large',-->
<!--                'play',-->
<!--                'progress',-->
<!--                'current-time',-->
<!--                'mute',-->
<!--                'volume',-->
<!--                'captions',-->
<!--                'settings',-->
<!--                'pip',-->
<!--                'airplay',-->
<!--                'fullscreen'-->
<!--            ],-->
<!--            ratio: '16:9',-->
<!--            hideControls: false,-->
<!--            youtube: {-->
<!--                noCookie: true,-->
<!--                rel: 0,-->
<!--                showinfo: 0,-->
<!--                iv_load_policy: 3-->
<!--            }-->
<!--        };-->

<!--        const element = playerContainer.value.querySelector('video, .plyr__video-embed');-->
<!--        if (element) {-->
<!--            player = new Plyr(element, options);-->
<!--        }-->
<!--    } catch (error) {-->
<!--        console.error('Error initializing Plyr:', error);-->
<!--    }-->
<!--};-->

<!--// Автоматическое обновление при изменении источника-->
<!--watch(() => props.video, () => {-->
<!--    if (player) {-->
<!--        player.destroy();-->
<!--        player = null;-->
<!--    }-->
<!--    nextTick(() => {-->
<!--        initPlyr();-->
<!--    });-->
<!--}, { deep: true });-->

<!--onMounted(() => {-->
<!--    if (process.client) {-->
<!--        setTimeout(initPlyr, 100);-->
<!--    }-->
<!--});-->

<!--onUnmounted(() => {-->
<!--    if (player) {-->
<!--        player.destroy();-->
<!--        player = null;-->
<!--    }-->
<!--});-->
<!--</script>-->

<!--<style scoped lang="scss">-->
<!--.video-popup {-->
<!--    position: fixed;-->
<!--    top: 0;-->
<!--    left: 0;-->
<!--    right: 0;-->
<!--    bottom: 0;-->
<!--    z-index: 9999;-->
<!--    display: flex;-->
<!--    align-items: center;-->
<!--    justify-content: center;-->

<!--    &-overlay {-->
<!--        position: absolute;-->
<!--        top: 0;-->
<!--        left: 0;-->
<!--        right: 0;-->
<!--        bottom: 0;-->
<!--        background-color: rgba(0, 0, 0, 0.8);-->
<!--        z-index: 1;-->
<!--    }-->

<!--    &-content {-->
<!--        position: relative;-->
<!--        z-index: 2;-->
<!--        width: 90%;-->
<!--        max-width: p2r(1200);-->
<!--        max-height: 90vh;-->
<!--    }-->

<!--    &-close {-->
<!--        position: absolute;-->
<!--        top: p2r(-40);-->
<!--        right: 0;-->
<!--        width: p2r(30);-->
<!--        height: p2r(30);-->
<!--        display: flex;-->
<!--        align-items: center;-->
<!--        justify-content: center;-->
<!--        cursor: pointer;-->
<!--        z-index: 3;-->
<!--        background-color: rgba(255, 255, 255, 0.2);-->
<!--        border-radius: 50%;-->

<!--        &-icon {-->
<!--            color: white;-->
<!--            font-size: p2r(24);-->
<!--        }-->

<!--        &:hover {-->
<!--            background-color: rgba(255, 255, 255, 0.4);-->
<!--        }-->
<!--    }-->
<!--}-->

<!--.video-player {-->
<!--    width: 100%;-->
<!--    border-radius: p2r(6);-->
<!--    overflow: hidden;-->
<!--    background-color: #000;-->

<!--    :deep(.plyr) {-->
<!--        border-radius: p2r(6);-->
<!--        width: 100%;-->
<!--        aspect-ratio: 16/9;-->

<!--        .plyr__control&#45;&#45;overlaid {-->
<!--            background: $bgc;-->
<!--            width: p2r(100);-->
<!--            height: p2r(100);-->

<!--            &:hover {-->
<!--                background: $primary;-->
<!--            }-->

<!--            svg {-->
<!--                position: absolute;-->
<!--                width: p2r(40);-->
<!--                height: p2r(40);-->
<!--                left: 50%;-->
<!--                top: 50%;-->
<!--                transform: translate(-38%, -50%);-->
<!--            }-->
<!--        }-->

<!--        .plyr__video-embed {-->
<!--            position: relative;-->
<!--            padding-bottom: 56.25%;-->
<!--            height: 0;-->

<!--            iframe {-->
<!--                position: absolute;-->
<!--                top: 0;-->
<!--                left: 0;-->
<!--                width: 100%;-->
<!--                height: 100%;-->
<!--            }-->
<!--        }-->
<!--    }-->
<!--}-->
<!--</style>-->



<template>
    <Teleport to="body">
        <div class="video-popup" @click.self="$emit('close')">
            <button class="video-popup-close" @click="$emit('close')">✕</button>
            <div class="video-popup-inner">
                <div class="video-player" ref="playerContainer">
                    <!-- Локальное видео (приоритет) -->
                    <video v-if="video?.file" playsinline controls :poster="video.preview">
                        <source :src="video.file" type="video/mp4" />
                    </video>
                    <!-- YouTube видео -->
                    <div
                        v-else-if="video?.code"
                        class="plyr__video-embed"
                        :data-plyr-provider="'youtube'"
                        :data-plyr-embed-id="videoId"
                    ></div>
                </div>
            </div>
        </div>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue';

const props = defineProps({
    video: {
        type: Object,
        default: () => ({}),
    },
});

const playerContainer = ref(null);
let player = null;

const videoId = computed(() => {
    if (!props.video?.code) return '';
    const match = props.video.code.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?/]+)/);
    return match ? match[1] : props.video.code.split('/').pop();
});

const initPlyr = async () => {
    if (typeof window === 'undefined' || !playerContainer.value) return;

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
            youtube: {
                noCookie: true,
                rel: 0,
                showinfo: 0,
                iv_load_policy: 3,
            },
        };

        const element = playerContainer.value.querySelector('video, .plyr__video-embed');
        if (element) {
            player = new Plyr(element, options);
        }
    } catch (error) {
        console.error('Error initializing Plyr:', error);
    }
};

// Автоматическое обновление при изменении источника
watch(
    () => props.video,
    () => {
        if (player) {
            player.destroy();
            player = null;
        }
        nextTick(() => {
            initPlyr();
        });
    },
    { deep: true }
);

onMounted(() => {
    if (process.client) {
        setTimeout(initPlyr, 100);
    }
});

onUnmounted(() => {
    if (player) {
        player.destroy();
        player = null;
    }
});
</script>

<style scoped lang="scss">
.video-popup {
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

.video-popup-close {
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

.video-popup-inner {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 90%;
    max-height: 90vh;
    width: 100%;
}

.video-player {
    position: relative;
    width: 100%;
    max-width: 1024px;
    border-radius: p2r(6);
    overflow: hidden;

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
</style>