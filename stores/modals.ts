import { defineStore } from 'pinia'
import { ref } from 'vue'

export type ModalType = 'login' | 'recover' | string

export interface ModalPayload {
    type: ModalType
    props?: Record<string, any>
}

export const useModalsStore = defineStore('modals', () => {
    const isModalOpen = ref<boolean>(false)
    const modalPayload = ref<ModalPayload | null>(null)

    const openModal = (type: ModalType, props: Record<string, any> = {}) => {
        console.log(`Opening modal: ${type}`, props)
        modalPayload.value = { type, props }
        isModalOpen.value = true
    }

    const closeModal = () => {
        isModalOpen.value = false
        modalPayload.value = null
    }

    return {
        isModalOpen,
        modalPayload,
        openModal,
        closeModal
    }
})