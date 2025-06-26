<template>
    <transition-group name="toast" tag="div" class="toast-container">
        <div
            v-for="toast in toasts"
            :key="toast.id"
            :class="['toast', `toast--${toast.type}`]"
            @click="removeToast(toast.id)"
        >
            <span>{{ toast.message }}</span>
            <button v-if="toast.showClose" class="toast-close" @click.stop="removeToast(toast.id)">×</button>
        </div>
    </transition-group>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])

const addToast = (message, type = 'info', duration = 3000, showClose = true) => {
    const id = Date.now()
    toasts.value.push({ id, message, type, showClose })
    if (duration > 0) {
        setTimeout(() => removeToast(id), duration)
    }
}

const removeToast = (id) => {
    toasts.value = toasts.value.filter((toast) => toast.id !== id)
}

defineExpose({ addToast })
</script>

<style scoped lang="scss">
.toast-container {
    position: fixed;
    top: p2r(20);
    right: p2r(20);
    z-index: 1000;
    display: flex;
    flex-direction: column;
    gap: p2r(20);
}

.toast {
    background-color: $bgc;
    padding: p2r(12) p2r(20);
    border-radius: p2r(8);
    color: $font;
    font-size: p2r(16);
    display: flex;
    justify-content: space-between;
    align-items: center;
    min-width: p2r(220);
    max-width: p2r(400);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: all 0.3s ease;
}

.toast--success {
    //background-color: #4caf50;
    border: 2px solid $primary;
    color: $font;
}

.toast--error {
    border: 2px solid $error;
}

.toast--warning {
    border: 2px solid $primary;
}

.toast--info {
    border: 2px solid $primary;
}

.toast-close {
    background: none;
    border: none;
    color: $font;
    font-size: p2r(22);
    cursor: pointer;
    margin-left: p2r(10);
}

.toast-enter-active,
.toast-leave-active {
    transition: opacity 0.3s ease, transform 0.3s ease;
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateX(100%);
}
</style>