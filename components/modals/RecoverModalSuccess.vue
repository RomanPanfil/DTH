<template>
    <div class="login-modal">
        <h2 class="login-modal-title">{{ $t('recover.title') }}</h2>
        <p class="login-modal-text">
            На указанный вами email uladzimir.pr@gmail.com отправлено письмо для смены пароля.
        </p>
        <p>
            Пожалуйста, не забудьте проверить спам и мусорную корзину, если вы не можете найти письмо.
        </p>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useModalsStore } from '~/stores/modals'

const router = useRouter()
const { t } = useI18n()
const modalsStore = useModalsStore()

const emit = defineEmits<{
    (e: 'close'): void
}>()
</script>

<style scoped lang="scss">
.login-modal {
  padding: p2r(80) p2r(60);

  &-title {
    font-weight: 500;
    font-size: p2r(32);
    text-align: center;
    color: $font-dark-grey;
    margin-bottom: p2r(20);
  }

  &-description {
    font-size: 14px;
    line-height: 1.3;
    color: $font-grey;
    margin-bottom: p2r(40);
  }
}
</style>