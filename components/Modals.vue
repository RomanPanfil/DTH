<template>
    <Teleport to="body">
        <Transition name="modal">
            <div v-if="modalsStore.isModalOpen" class="modal-backdrop" @click.self="modalsStore.closeModal">
                <div class="modal-wrapper" :class="`modal-${modalsStore.modalPayload?.type}`">
                    <div class="modal-accent"></div>
                    <div class="modal-content">
                        <button class="close-btn" @click="modalsStore.closeModal" aria-label="Закрыть">
                            <NuxtIcon name="cross" filled  class="close-btn-icon"/>
                        </button>
                        <component
                            :is="modalComponent"
                            v-if="modalsStore.modalPayload"
                            v-bind="modalsStore.modalPayload.props"
                            @close="modalsStore.closeModal"
                        />
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted } from 'vue'
import { useModalsStore } from '~/stores/modals'
import LoginModal from '~/components/modals/LoginModal.vue'
import RecoverModal from "~/components/modals/RecoverModal.vue";
import ChangePasswordModal from "~/components/modals/ChangePasswordModal.vue";
import ChangePasswordModalSuccess from "~/components/modals/ChangePasswordModalSuccess.vue";

const modalsStore = useModalsStore()

// Регистрация компонентов модалок
const modalComponents: Record<string, any> = {
    login: LoginModal,
    recover: RecoverModal,
    changePassword: ChangePasswordModal,
    changePasswordSuccess: ChangePasswordModalSuccess,
}

const modalComponent = computed(() => {
    const type = modalsStore.modalPayload?.type
    return type && modalComponents[type] ? modalComponents[type] : null
})

// Отслеживание состояния модалки
watch(() => modalsStore.isModalOpen, (newValue) => {
    if (newValue) {
        document.body.classList.add('non-scroll');
    } else {
        document.body.classList.remove('non-scroll');
    }
});

onMounted(() => {
    if (modalsStore.isModalOpen) {
        document.body.classList.add('non-scroll');
    }
});

onUnmounted(() => {
    document.body.classList.remove('non-scroll');
});
</script>

<style scoped lang="scss">
.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
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

    &.modal-login {
        max-width: p2r(500); // Ширина для модалки login
        @media(max-width: 599px) {
            max-width: 100%;
        }
    }

    &.modal-recover {
        max-width: p2r(500); // Ширина для модалки recover
        @media(max-width: 599px) {
            max-width: 100%;
        }
    }

    &.modal-changePassword {
        max-width: p2r(500);
        @media(max-width: 599px) {
            max-width: 100%;
        }
    }

    &.modal-changePasswordSuccess {
        max-width: p2r(500);
        @media(max-width: 599px) {
            max-width: 100%;
        }
    }

    @media(max-width: 599px) {
        margin-left: p2r(-30);
        margin-right: p2r(-30);
    }
}

.modal-accent {
    position: absolute;
    left: 0;
    transform: translateX(-100%);
    width: p2r(20);
    height: 70%;
    background: #0ab271;
    border-top-left-radius: p2r(4);
    border-bottom-left-radius: p2r(4);

    @media(max-width: 1366px) {
        width: p2r(18);
    }

    @media(max-width: 1024px) {
        width: p2r(12);
    }

    @media(max-width: 768px) {
        width: p2r(8);
    }
}

.modal-content {
    position: relative;
    background: $bgc;
    border-radius: p2r(32);
    box-shadow: 0 p2r(4) p2r(35) rgba(114, 142, 174, 0.1);
    flex: 1;

    @media(max-width: 599px) {
        border-radius: 0;
        position: fixed;
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;
        overflow-y: auto;
        display: flex;
        align-items: center;
    }
}

.close-btn {
    position: absolute;
    top: 0;
    right: p2r(-10);
    transform: translate(100%, -50%);
    background: $bgc;
    border: none;
    border-radius: 50%;
    width: p2r(52);
    height: p2r(52);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    z-index: 1001;

    @media(max-width: 768px) {
        transform: unset;
        right: p2r(12);
        top: p2r(12);
    }

    &-icon {
        font-size: p2r(24);
        line-height: p2r(24);
        color: $font;
    }

    &:hover {
        background: #f5f5f5;
    }
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