<template>
    <div class="login-modal">
        <h2 class="login-modal-title">{{ $t('titles.changePassword') }}</h2>
        <p class="login-modal-text">
            На указанный вами email <span class="color-primary">{{ authStore?.userProfile?.EMAIL }}</span> отправлено письмо с уведомлением о смене пароля.
        </p>
        <p>
            Если вы сменили пароль случайно и/или не запомнили новый установленный пароль,
            то вы всегда можете сменить его через функцию восстановления забытого пароля.
        </p>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useModalsStore } from '~/stores/modals'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const { t } = useI18n()
const modalsStore = useModalsStore()
const authStore = useAuthStore()

const emit = defineEmits<{
    (e: 'close'): void
}>()
</script>

<style scoped lang="scss">
.login-modal {
  padding: p2r(80) p2r(60);

  @media(max-width: 599px) {
    padding: p2r(60) p2r(24) p2r(24) p2r(24);
  }

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