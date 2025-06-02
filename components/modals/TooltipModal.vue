<template>
    <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
        <div class="modal-content">
            <button class="close-btn" @click="closeModal" aria-label="Закрыть модальное окно">
                <NuxtIcon name="cross" filled  class="close-btn-icon"/>
            </button>
            <h2>{{ title }}</h2>
            <div class="modal-body text-section" v-html="content"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
    isOpen: boolean
    content: string
    title: string
}>()

const emit = defineEmits<{
    (e: 'close'): void
}>()

const closeModal = () => {
    emit('close')
}

// Закрытие модального окна по нажатию клавиши Escape
const handleEscape = (event: KeyboardEvent) => {
    if (event.key === 'Escape' && props.isOpen) {
        closeModal()
    }
}

watch(() => props.isOpen, (newVal) => {
    if (newVal) {
        document.addEventListener('keydown', handleEscape)
        document.body.style.overflow = 'hidden' // Блокировка скролла
    } else {
        document.removeEventListener('keydown', handleEscape)
        document.body.style.overflow = '' // Разблокировка скролла
    }
})

onUnmounted(() => {
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

.modal-content {
  position: relative;
  background: $bgc;
  border-radius: p2r(16);
  padding: p2r(60) p2r(40) p2r(60) p2r(40);
  max-width: p2r(560);
  width: 90%;
  //max-height: 80vh;
  //overflow-y: auto;
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

    &-icon {
        font-size: p2r(24);
        line-height: p2r(24);
        color: $font;
    }

    &:hover {
        background: #f5f5f5;
    }
}



.modal-body {
  font-size: p2r(16);
  line-height: 1.5;
  color: $font;
  padding-right: p2r(20);

    //background: $bgc;
    //border-radius: p2r(16);
    //padding: p2r(40);
    //max-width: p2r(560);
    //width: 90%;
    max-height: 40vh;
    overflow-y: auto;

      &::-webkit-scrollbar {
        width: p2r(6);
        height: p2r(6);
        background: #EEF1F8;
        border-radius: p2r(6);
      }
      &::-webkit-scrollbar-thumb {
        width: p2r(6);
        height: p2r(6);
        background-color: $primary;
        border-radius: p2r(6);
      }


  :deep(p) {
    margin-bottom: p2r(16);
  }

  :deep(ul), :deep(ol) {
    margin-bottom: p2r(16);
    padding-left: p2r(20);
  }

  :deep(li) {
    margin-bottom: p2r(8);
  }

  :deep(a) {
    color: $primary;
    text-decoration: underline;
  }
}
</style>