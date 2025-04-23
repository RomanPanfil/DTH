<template>
    <div class="video-player" ref="playerContainer">
        <!-- Локальное видео (приоритет) -->
        <video
            v-if="file"
            :poster="preview"
            playsinline
            controls
        >
            <source :src="file" type="video/mp4">
        </video>

        <!-- YouTube видео -->
        <div
            v-else-if="code"
            class="plyr__video-embed"
            :data-plyr-provider="'youtube'"
            :data-plyr-embed-id="videoId"
        ></div>
    </div>
</template>

<script setup>
    import { ref, onMounted, onUnmounted, computed, watch } from 'vue'

    const props = defineProps({
        preview: String,
        file: String,
        code: String
    })

    const playerContainer = ref(null)
    let player = null

    const videoId = computed(() => {
        if (!props.code) return ''
        const match = props.code.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?/]+)/)
        return match ? match[1] : props.code.split('/').pop()
    })

    const initPlyr = async () => {
        if (typeof window === 'undefined' || !playerContainer.value) return

        const Plyr = (await import('plyr')).default
        await import('plyr/dist/plyr.css')

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
                'fullscreen'
            ],
            ratio: '16:9',
            hideControls: false,
            youtube: {
                noCookie: true,
                rel: 0,
                showinfo: 0,
                iv_load_policy: 3
            }
        }

        player = new Plyr(playerContainer.value.querySelector('video, .plyr__video-embed'), options)

        if (props.file && props.preview) {
            const poster = player.elements.poster
            if (poster) {
                poster.style.backgroundImage = `url('${props.preview}')`
            }
        }
    }

    // Автоматическое обновление при изменении источника
    watch([() => props.file, () => props.code], () => {
        if (player) {
            player.destroy()
            initPlyr()
        }
    })

    onMounted(() => {
        if (process.client) {
            setTimeout(initPlyr, 100)
        }
    })

    onUnmounted(() => {
        if (player) {
            player.destroy()
        }
    })
</script>



<style scoped lang="scss">
    .video-player {
        margin: p2r(20) 0;
        border-radius: p2r(6);
        overflow: hidden;

        :deep(.plyr) {
            border-radius: p2r(6);
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




