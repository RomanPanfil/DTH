<!--<template>-->
<!--    <Teleport to="body">-->
<!--        <Transition name="modal">-->
<!--            <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">-->
<!--                <div class="modal-wrapper">-->
<!--                    <div class="modal-content">-->
<!--                        <button class="close-btn" @click="closeModal" aria-label="Закрыть модальное окно">-->
<!--                            <svg class="close-btn-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">-->
<!--                                <path d="M18 6L6 18" stroke="#4D5452" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>-->
<!--                                <path d="M6 6L18 18" stroke="#4D5452" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>-->
<!--                            </svg>-->
<!--                        </button>-->
<!--                        <div class="map-container" ref="mapContainer"></div>-->
<!--                    </div>-->
<!--                </div>-->
<!--            </div>-->
<!--        </Transition>-->
<!--    </Teleport>-->
<!--</template>-->

<!--<script setup lang="ts">-->
<!--import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'-->

<!--const props = defineProps<{-->
<!--    isOpen: boolean-->
<!--    latitude: number-->
<!--    longitude: number-->
<!--}>()-->

<!--const emit = defineEmits<{-->
<!--    (e: 'close'): void-->
<!--}>()-->

<!--const isOpen = ref(props.isOpen)-->
<!--const mapContainer = ref<HTMLElement | null>(null)-->
<!--let map: any = null-->

<!--const closeModal = () => {-->
<!--    emit('close')-->
<!--}-->

<!--const handleEscape = (event: KeyboardEvent) => {-->
<!--    if (event.key === 'Escape' && props.isOpen) {-->
<!--        closeModal()-->
<!--    }-->
<!--}-->

<!--// Функция ожидания готовности API Яндекс.Карт-->
<!--const waitForYandexMaps = (): Promise<any> => {-->
<!--    return new Promise((resolve, reject) => {-->
<!--        let attempts = 0-->
<!--        const maxAttempts = 50-->

<!--        const checkYmaps = () => {-->
<!--            if (window.ymaps && window.ymaps.ready) {-->
<!--                window.ymaps.ready(resolve)-->
<!--            } else if (attempts < maxAttempts) {-->
<!--                attempts++-->
<!--                setTimeout(checkYmaps, 100)-->
<!--            } else {-->
<!--                reject(new Error('Yandex Maps API не загружен'))-->
<!--            }-->
<!--        }-->

<!--        checkYmaps()-->
<!--    })-->
<!--}-->

<!--const initializeMap = async () => {-->
<!--    if (!mapContainer.value) return-->

<!--    try {-->
<!--        await waitForYandexMaps()-->
<!--        await nextTick()-->

<!--        if (!mapContainer.value || !props.isOpen) return-->

<!--        await new Promise(resolve => setTimeout(resolve, 100))-->

<!--        const containerRect = mapContainer.value.getBoundingClientRect()-->
<!--        if (containerRect.width === 0 || containerRect.height === 0) {-->
<!--            console.warn('Контейнер карты имеет нулевые размеры')-->
<!--            return-->
<!--        }-->

<!--        map = new window.ymaps.Map(mapContainer.value, {-->
<!--            center: [props.latitude, props.longitude],-->
<!--            zoom: 17,-->
<!--            controls: [],-->
<!--            behaviors: []-->
<!--        })-->

<!--        const placemark = new window.ymaps.Placemark([props.latitude, props.longitude], {}, {-->
<!--            preset: 'islands#redDotIcon'-->
<!--        })-->
<!--        map.geoObjects.add(placemark)-->

<!--        setTimeout(() => {-->
<!--            if (map && props.isOpen) {-->
<!--                map.container.fitToViewport()-->
<!--            }-->
<!--        }, 200)-->

<!--    } catch (error) {-->
<!--        console.error('Ошибка инициализации карты:', error)-->
<!--    }-->
<!--}-->

<!--const destroyMap = () => {-->
<!--    if (map) {-->
<!--        try {-->
<!--            map.destroy()-->
<!--        } catch (error) {-->
<!--            console.error('Ошибка при уничтожении карты:', error)-->
<!--        }-->
<!--        map = null-->
<!--    }-->
<!--}-->

<!--watch(() => props.isOpen, async (newVal) => {-->
<!--    isOpen.value = newVal-->

<!--    if (newVal) {-->
<!--        document.addEventListener('keydown', handleEscape)-->
<!--        document.body.style.overflow = 'hidden'-->

<!--        await nextTick()-->

<!--        if (mapContainer.value) {-->
<!--            initializeMap()-->
<!--        }-->
<!--    } else {-->
<!--        destroyMap()-->
<!--        document.removeEventListener('keydown', handleEscape)-->
<!--        document.body.style.overflow = ''-->
<!--    }-->
<!--})-->

<!--onMounted(async () => {-->
<!--    if (props.isOpen) {-->
<!--        await nextTick()-->
<!--        if (mapContainer.value) {-->
<!--            initializeMap()-->
<!--        }-->
<!--    }-->
<!--})-->

<!--onUnmounted(() => {-->
<!--    destroyMap()-->
<!--    document.removeEventListener('keydown', handleEscape)-->
<!--    document.body.style.overflow = ''-->
<!--})-->
<!--</script>-->

<!--<style scoped lang="scss">-->
<!--.modal-overlay {-->
<!--    position: fixed;-->
<!--    top: 0;-->
<!--    left: 0;-->
<!--    width: 100%;-->
<!--    height: 100%;-->
<!--    background: rgba(0, 0, 0, 0.5);-->
<!--    display: flex;-->
<!--    justify-content: center;-->
<!--    align-items: center;-->
<!--    z-index: 1000;-->
<!--}-->

<!--.modal-wrapper {-->
<!--    position: relative;-->
<!--    width: 100%;-->
<!--    display: flex;-->
<!--    align-items: center;-->
<!--    max-width: p2r(1090);-->
<!--}-->

<!--.modal-content {-->
<!--    position: relative;-->
<!--    background: $bgc;-->
<!--    border-radius: p2r(16);-->
<!--    padding: p2r(20);-->
<!--    width: 100%;-->
<!--    height: 69vh;-->
<!--    max-height: 80vh;-->
<!--    z-index: 1000;-->
<!--}-->

<!--.close-btn {-->
<!--    position: absolute;-->
<!--    top: p2r(-24);-->
<!--    right: p2r(-64);-->
<!--    background: $bgc;-->
<!--    border: 1px solid $border;-->
<!--    border-radius: 50%;-->
<!--    width: p2r(52);-->
<!--    height: p2r(52);-->
<!--    display: flex;-->
<!--    align-items: center;-->
<!--    justify-content: center;-->
<!--    cursor: pointer;-->
<!--    padding: 0;-->
<!--    z-index: 1001;-->

<!--    &:hover {-->
<!--        background: #f5f5f5;-->
<!--    }-->

<!--    &-icon {-->
<!--        width: p2r(24);-->
<!--        height: p2r(24);-->
<!--    }-->
<!--}-->

<!--.map-container {-->
<!--    width: 100%;-->
<!--    height: 100%;-->
<!--    border-radius: p2r(12);-->
<!--    overflow: hidden;-->
<!--    // Добавляем минимальные размеры для избежания проблем-->
<!--    min-width: p2r(300);-->
<!--    min-height: p2r(400);-->
<!--}-->

<!--/* Анимации */-->
<!--.modal-enter-active,-->
<!--.modal-leave-active {-->
<!--    transition: opacity 0.3s ease;-->
<!--}-->

<!--.modal-enter-from,-->
<!--.modal-leave-to {-->
<!--    opacity: 0;-->
<!--}-->

<!--.modal-enter-active .modal-content,-->
<!--.modal-leave-active .modal-content {-->
<!--    transition: transform 0.3s ease;-->
<!--}-->
<!--</style>-->


<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
                <div class="modal-wrapper">
                    <div class="modal-content">
                        <button class="close-btn" @click="closeModal" aria-label="Закрыть модальное окно">
                            <svg class="close-btn-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M18 6L6 18" stroke="#4D5452" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                <path d="M6 6L18 18" stroke="#4D5452" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        </button>
                        <div class="map-container" ref="mapContainer"></div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRuntimeConfig } from 'nuxt/app'

const props = defineProps<{
    isOpen: boolean
    latitude: number
    longitude: number
}>()

const emit = defineEmits<{
    (e: 'close'): void
}>()

const isOpen = ref(props.isOpen)
const mapContainer = ref<HTMLElement | null>(null)
let map: any = null

const baseUrl = ref<string>(typeof window !== 'undefined' ? window.location.origin : '')

const closeModal = () => {
    emit('close')
}

const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && props.isOpen) {
        closeModal()
    }
}

// Функция ожидания готовности API Яндекс.Карт
const waitForYandexMaps = (): Promise<any> => {
    return new Promise((resolve, reject) => {
        let attempts = 0
        const maxAttempts = 50

        const checkYmaps = () => {
            if (window.ymaps && window.ymaps.ready) {
                window.ymaps.ready(resolve)
            } else if (attempts < maxAttempts) {
                attempts++
                setTimeout(checkYmaps, 100)
            } else {
                reject(new Error('Yandex Maps API не загружен'))
            }
        }

        checkYmaps()
    })
}

const initializeMap = async () => {
    if (!mapContainer.value) return

    try {
        await waitForYandexMaps()
        await nextTick()

        if (!mapContainer.value || !props.isOpen) return

        await new Promise(resolve => setTimeout(resolve, 100))

        const containerRect = mapContainer.value.getBoundingClientRect()
        if (containerRect.width === 0 || containerRect.height === 0) {
            console.warn('Контейнер карты имеет нулевые размеры')
            return
        }

        map = new window.ymaps.Map(mapContainer.value, {
            center: [props.latitude, props.longitude],
            zoom: 17,
            controls: [],
            behaviors: []
        })

        const customMarkerUrl = `${baseUrl.value}/images/custom-marker.svg`
        console.log(baseUrl)
        console.log(customMarkerUrl)
        const placemark = new window.ymaps.Placemark([props.latitude, props.longitude], {}, {
            iconLayout: 'default#image',
            iconImageHref: customMarkerUrl,
            iconImageSize: [56, 56],
            iconImageOffset: [-28, -56]
        })
        map.geoObjects.add(placemark)

        setTimeout(() => {
            if (map && props.isOpen) {
                map.container.fitToViewport()
            }
        }, 200)

    } catch (error) {
        console.error('Ошибка инициализации карты:', error)
    }
}

const destroyMap = () => {
    if (map) {
        try {
            map.destroy()
        } catch (error) {
            console.error('Ошибка при уничтожении карты:', error)
        }
        map = null
    }
}

watch(() => props.isOpen, async (newVal) => {
    isOpen.value = newVal

    if (newVal) {
        document.addEventListener('keydown', handleEscape)
        document.body.style.overflow = 'hidden'

        await nextTick()

        if (mapContainer.value) {
            initializeMap()
        }
    } else {
        destroyMap()
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = ''
    }
})

onMounted(async () => {
    if (props.isOpen) {
        await nextTick()
        if (mapContainer.value) {
            initializeMap()
        }
    }
})

onUnmounted(() => {
    destroyMap()
    document.removeEventListener('keydown', handleEscape)
    document.body.style.overflow = ''
})
</script>

<style scoped lang="scss">
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-wrapper {
    position: relative;
    width: 100%;
    display: flex;
    align-items: center;
    max-width: p2r(1090);
}

.modal-content {
    position: relative;
    background: $bgc;
    border-radius: p2r(16);
    padding: p2r(20);
    width: 100%;
    height: 69vh;
    max-height: 80vh;
    z-index: 1000;
}

.close-btn {
    position: absolute;
    top: p2r(-24);
    right: p2r(-64);
    background: $bgc;
    border: 1px solid $border;
    border-radius: 50%;
    width: p2r(52);
    height: p2r(52);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    z-index: 1001;

    &:hover {
        background: #f5f5f5;
    }

    &-icon {
        width: p2r(24);
        height: p2r(24);
    }
}

.map-container {
    width: 100%;
    height: 100%;
    border-radius: p2r(12);
    overflow: hidden;
    min-width: p2r(300);
    min-height: p2r(400);
}

/* Анимации */
.modal-enter-active,
.modal-leave-active {
    transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
    opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
    transition: transform 0.3s ease;
}
</style>