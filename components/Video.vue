<template>
    <div class="video-player" ref="playerContainer">
        <!-- Локальное видео (приоритет) -->
        <div class="video-wrapper" v-if="file">
            <video
                :poster="preview"
                playsinline
                controls
                ref="videoElement"
            >
                <source :src="file" type="video/mp4">
            </video>
            <div class="watermark" ref="watermarkElement">
                <div
                    v-for="i in 10"
                    :key="i"
                    class="watermark-item"
                >
                    {{ watermarkText }}
                </div>
            </div>
        </div>

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
import { ref, onMounted, onUnmounted, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useModalsStore } from '~/stores/modals'

const props = defineProps({
    preview: String,
    file: String,
    code: String
})

const modalsStore = useModalsStore()
const authStore = useAuthStore()
const router = useRouter()
const playerContainer = ref(null)
const videoElement = ref(null)
const watermarkElement = ref(null)
let player = null
let fullscreenWatermark = null
let watermarkObserver = null
let fullscreenWatermarkObserver = null
let integrityChecker = null
let styleProtection = null
let styleCheckInterval = null

const watermarkText = computed(() => {
    return authStore?.userProfile
        ? `dht.by ${authStore?.userProfile?.LAST_NAME_EN} ${authStore?.userProfile?.NAME_EN} ${authStore?.userProfile?.ID}`
        : 'dht.by'
})

const videoId = computed(() => {
    if (!props.code) return ''
    const match = props.code.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?/]+)/)
    return match ? match[1] : props.code.split('/').pop()
})

// Функция для обработки взлома
const handleWatermarkTampering = () => {
    authStore.logout()
    router.push('/')
    modalsStore.openModal('login')
}

// Создание защитных стилей
const createStyleProtection = () => {
    const protectedStyles = `
    .watermark {
      position: absolute !important;
      top: 0 !important;
      bottom: 0 !important;
      left: 0 !important;
      right: 0 !important;
      pointer-events: none !important;
      z-index: 10 !important;
      overflow: hidden !important;
    }

    .watermark-item {
      position: absolute !important;
      opacity: 0.6 !important;
      visibility: visible !important;
      display: block !important;
      text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3) !important;
      transform: rotate(-45deg) !important;
      white-space: nowrap !important;
    }
  `

    const styleElement = document.createElement('style')
    styleElement.textContent = protectedStyles
    styleElement.id = 'watermark-protection-styles'
    document.head.appendChild(styleElement)

    const headObserver = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.removedNodes.length > 0) {
                Array.from(mutation.removedNodes).forEach(node => {
                    if (node === styleElement || node.id === 'watermark-protection-styles') {
                        handleWatermarkTampering()
                    }
                })
            }
        })
    })

    headObserver.observe(document.head, { childList: true })

    return {
        destroy: () => {
            headObserver.disconnect()
            if (styleElement.parentNode) {
                styleElement.parentNode.removeChild(styleElement)
            }
        }
    }
}

// Проверка целостности водяного знака
const createIntegrityChecker = (element) => {
    let originalState = new Map()

    const saveOriginalState = () => {
        if (!element) return
        originalState.clear()
        const items = element.querySelectorAll('.watermark-item')
        items.forEach((item, index) => {
            const computedStyle = window.getComputedStyle(item)
            const rect = item.getBoundingClientRect()
            originalState.set(index, {
                opacity: computedStyle.opacity,
                visibility: computedStyle.visibility,
                display: computedStyle.display,
                position: computedStyle.position,
                color: computedStyle.color,
                fontSize: computedStyle.fontSize,
                transform: computedStyle.transform,
                top: item.style.top,
                left: item.style.left,
                width: rect.width,
                height: rect.height,
                textContent: item.textContent
            })
        })
    }

    const checkIntegrity = () => {
        if (!element || originalState.size === 0) return

        const items = element.querySelectorAll('.watermark-item')

        if (items.length !== 10) {
            handleWatermarkTampering()
            return
        }

        items.forEach((item, index) => {
            const computedStyle = window.getComputedStyle(item)
            const original = originalState.get(index)
            const rect = item.getBoundingClientRect()

            if (!original) return

            if (parseFloat(computedStyle.opacity) < 0.5 ||
                computedStyle.visibility === 'hidden' ||
                computedStyle.display === 'none' ||
                rect.width === 0 || rect.height === 0) {
                handleWatermarkTampering()
            }

            if (item.textContent !== original.textContent) {
                handleWatermarkTampering()
            }

            if (item.style.top !== original.top || item.style.left !== original.left) {
                handleWatermarkTampering()
            }
        })
    }

    return {
        destroy: () => {
            if (styleCheckInterval) {
                clearInterval(styleCheckInterval)
                styleCheckInterval = null
            }
        },
        saveOriginalState,
        checkIntegrity
    }
}

// Расширенный MutationObserver
const createAdvancedObserver = (element) => {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.type === 'attributes') {
                const attributeName = mutation.attributeName
                const target = mutation.target

                if (attributeName === 'style' ||
                    attributeName === 'class' ||
                    attributeName === 'hidden' ||
                    attributeName === 'data-hidden' ||
                    attributeName === 'aria-hidden') {

                    if (attributeName === 'style') {
                        const computedStyle = window.getComputedStyle(target)
                        if (computedStyle.display === 'none' ||
                            computedStyle.visibility === 'hidden' ||
                            parseFloat(computedStyle.opacity) < 0.1) {
                            handleWatermarkTampering()
                        }
                    }

                    handleWatermarkTampering()
                }
            }

            if (mutation.type === 'childList') {
                if (mutation.removedNodes.length > 0) {
                    Array.from(mutation.removedNodes).forEach(node => {
                        if (node.classList && node.classList.contains('watermark-item')) {
                            handleWatermarkTampering()
                        }
                    })
                }

                if (element.children.length < 10) {
                    handleWatermarkTampering()
                }
            }

            if (mutation.type === 'characterData') {
                handleWatermarkTampering()
            }
        })
    })

    observer.observe(element, {
        childList: true,
        attributes: true,
        attributeFilter: ['style', 'class', 'hidden', 'data-hidden', 'aria-hidden'],
        subtree: true,
        characterData: true,
        attributeOldValue: true,
        characterDataOldValue: true
    })

    return observer
}

// Создание водяного знака для полноэкранного режима
const createFullscreenWatermark = () => {
    if (!watermarkElement.value) return null

    const watermark = document.createElement('div')
    watermark.className = 'watermark-fullscreen'
    watermark.innerHTML = watermarkElement.value.innerHTML

    watermark.style.cssText = `
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    height: 100% !important;
    pointer-events: none !important;
    z-index: 999999 !important;
    overflow: hidden !important;
  `

    setTimeout(() => {
        if (watermark && watermark.parentNode) { // Проверка, что элемент всё ещё в DOM
            const fullscreenObserver = createAdvancedObserver(watermark)
            const fullscreenIntegrityChecker = createIntegrityChecker(watermark)
            fullscreenIntegrityChecker.saveOriginalState()
            styleCheckInterval = setInterval(() => {
                if (fullscreenIntegrityChecker && fullscreenIntegrityChecker.checkIntegrity) {
                    fullscreenIntegrityChecker.checkIntegrity()
                }
            }, 2000)

            watermark._protectionObserver = fullscreenObserver
            watermark._integrityChecker = fullscreenIntegrityChecker
        }
    }, 100)

    return watermark
}

// Применение стилей к элементам водяного знака в полноэкранном режиме
const styleFullscreenWatermarkItems = (watermark) => {
    const items = watermark.querySelectorAll('.watermark-item')
    items.forEach(item => {
        item.style.cssText = `
      position: absolute !important;
    `
    })

    const positions = [
        { top: '5%', left: '0%' },
        { top: '5%', left: '40%' },
        { top: '5%', left: '85%' },
        { top: '25%', left: '10%' },
        { top: '25%', left: '55%' },
        { top: '45%', left: '25%' },
        { top: '60%', left: '80%' },
        { top: '100%', left: '-10%' },
        { top: '90%', left: '16%' },
        { top: '80%', left: '50%' }
    ]

    items.forEach((item, index) => {
        if (positions[index]) {
            item.style.top = positions[index].top
            item.style.left = positions[index].left
        }
    })
}

const handleFullscreenChange = () => {
    const isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
    )

    if (isFullscreen && props.file && watermarkElement.value && player) {
        if (!fullscreenWatermark) {
            setTimeout(() => {
                fullscreenWatermark = createFullscreenWatermark()
                if (fullscreenWatermark) {
                    styleFullscreenWatermarkItems(fullscreenWatermark)

                    let added = false

                    if (player.elements.container) {
                        player.elements.container.appendChild(fullscreenWatermark)
                        added = true
                    }

                    if (!added && player.elements.wrapper) {
                        player.elements.wrapper.appendChild(fullscreenWatermark)
                        added = true
                    }

                    if (!added) {
                        const plyrElement = document.querySelector('.plyr--fullscreen')
                        if (plyrElement) {
                            plyrElement.appendChild(fullscreenWatermark)
                            added = true
                        }
                    }

                    if (!added) {
                        const fullscreenEl = document.fullscreenElement ||
                            document.webkitFullscreenElement ||
                            document.mozFullScreenElement ||
                            document.msFullscreenElement
                        if (fullscreenEl) {
                            fullscreenEl.appendChild(fullscreenWatermark)
                            added = true
                        }
                    }

                    if (!added) {
                        fullscreenWatermark = null
                    }
                }
            }, 100)
        }
    } else {
        if (fullscreenWatermark) {
            const parent = fullscreenWatermark.parentNode
            if (parent) {
                parent.removeChild(fullscreenWatermark)
            }
            if (fullscreenWatermark._protectionObserver) {
                fullscreenWatermark._protectionObserver.disconnect()
            }
            if (fullscreenWatermark._integrityChecker) {
                fullscreenWatermark._integrityChecker.destroy()
            }
            if (styleCheckInterval) {
                clearInterval(styleCheckInterval)
                styleCheckInterval = null
            }
            fullscreenWatermark = null
        }
    }
}

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

    const target = playerContainer.value.querySelector('video, .plyr__video-embed')
    if (target) {
        player = new Plyr(target, options)

        if (props.file && props.preview) {
            const poster = player.elements.poster
            if (poster) {
                poster.style.backgroundImage = `url('${props.preview}')`
            }
        }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)
}

const initWatermarkObserver = () => {
    if (watermarkElement.value && !watermarkObserver) {
        watermarkObserver = createAdvancedObserver(watermarkElement.value)
        integrityChecker = createIntegrityChecker(watermarkElement.value)
        styleProtection = createStyleProtection()

        setTimeout(() => {
            if (integrityChecker) {
                integrityChecker.saveOriginalState()
                styleCheckInterval = setInterval(() => {
                    if (integrityChecker && integrityChecker.checkIntegrity) {
                        integrityChecker.checkIntegrity()
                    }
                }, 2000)
            }
        }, 500)
    }
}

watch([() => props.file, () => props.code], () => {
    if (player) {
        player.destroy()
        if (fullscreenWatermark) {
            const parent = fullscreenWatermark.parentNode
            if (parent) {
                parent.removeChild(fullscreenWatermark)
            }
            if (fullscreenWatermark._protectionObserver) {
                fullscreenWatermark._protectionObserver.disconnect()
            }
            if (fullscreenWatermark._integrityChecker) {
                fullscreenWatermark._integrityChecker.destroy()
            }
            if (styleCheckInterval) {
                clearInterval(styleCheckInterval)
                styleCheckInterval = null
            }
            fullscreenWatermark = null
        }
        initPlyr()
    }
})

onMounted(() => {
    if (process.client) {
        setTimeout(initPlyr, 100)
        nextTick(() => initWatermarkObserver())
    }
})

onUnmounted(() => {
    if (player) {
        player.destroy()
    }
    if (fullscreenWatermark) {
        const parent = fullscreenWatermark.parentNode
        if (parent) {
            parent.removeChild(fullscreenWatermark)
        }
        if (fullscreenWatermark._protectionObserver) {
            fullscreenWatermark._protectionObserver.disconnect()
        }
        if (fullscreenWatermark._integrityChecker) {
            fullscreenWatermark._integrityChecker.destroy()
        }
        if (styleCheckInterval) {
            clearInterval(styleCheckInterval)
            styleCheckInterval = null
        }
        fullscreenWatermark = null
    }

    if (watermarkObserver) {
        watermarkObserver.disconnect()
        watermarkObserver = null
    }
    if (integrityChecker) {
        integrityChecker.destroy()
        integrityChecker = null
    }
    if (styleProtection) {
        styleProtection.destroy()
        styleProtection = null
    }

    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
    document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
})
</script>

<style scoped lang="scss">
.video-player {
    margin: p2r(20) 0;
    border-radius: p2r(6);
    overflow: hidden;
    position: relative;

    .video-wrapper {
        position: relative;
    }

    .watermark {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        pointer-events: none;
        z-index: 10;
        overflow: hidden;

        .watermark-item {
            position: absolute;
            color: $font-white-dark;
            font-size: p2r(24);
            text-transform: uppercase;
            opacity: 0.6;
            transform: rotate(-45deg);
            text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
            white-space: nowrap;

            @media (max-width: 599px) {
                font-size: p2r(12);
            }

            /* Распределение элементов по диагонали */
            &:nth-child(1) { top: 8%; left: -3%; }
            &:nth-child(2) { top: -10%; left: 20%; }
            &:nth-child(3) { top: 10%; left: 35%; }
            &:nth-child(4) { top: 20%; left: 80%; }
            &:nth-child(5) { top: 40%; left: -5%; }
            &:nth-child(6) { top: 40%; left: 50%; }
            &:nth-child(7) { top: 90%; left: 40%; }
            &:nth-child(8) { top: 60%; left: 20%; }
            &:nth-child(9) { top: 70%; left: -5%; }
            &:nth-child(10) { top: 80%; left: 70%; }
        }
    }

    :deep(.plyr) {
        border-radius: p2r(6);
        aspect-ratio: 16/9;

        .plyr__control--overlaid {
            background: $bgc;
            width: p2r(100);
            height: p2r(100);

            @media (max-width: 1280px) {
                width: p2r(80);
                height: p2r(80);
            }

            @media (max-width: 768px) {
                width: p2r(60);
                height: p2r(60);
            }

            @media (max-width: 599px) {
                width: p2r(50);
                height: p2r(50);
            }

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

                @media (max-width: 1280px) {
                    width: p2r(32);
                    height: p2r(32);
                }

                @media (max-width: 768px) {
                    width: p2r(24);
                    height: p2r(24);
                }

                @media (max-width: 599px) {
                    width: p2r(20);
                    height: p2r(20);
                }
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

        .plyr__poster {
            background-size: cover;
        }
    }
}

// Глобальные стили для водяного знака в полноэкранном режиме
:global(.watermark-fullscreen) {
    position: absolute;
    color: $font-white-dark;
    font-size: p2r(32);
    text-transform: uppercase;
    opacity: 0.7;
    //transform: rotate(-45deg);
    text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
    white-space: nowrap;

    @media (max-width: 599px) {
        font-size: p2r(12);
    }
}
</style>