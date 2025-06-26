<template>
    <div class="login-modal">
        <h2 class="login-modal-title">{{ $t('recover.title') }}</h2>
        <p v-if="!isSuccess" class="login-modal-description">
            {{ $t('recover.description') }}
        </p>
        <ClientOnly>
            <div v-if="!isSuccess">
                <Form v-slot="{ errors }" @submit="handleRecover">
                    <div class="form-field">
                        <label class="label" :class="{ active: emailFocused && recoverForm.email, empty: !recoverForm.email }">
                            {{ $t('placeholders.loginEmail') }}
                        </label>
                        <Field
                            name="email"
                            v-model="recoverForm.email"
                            type="email"
                            class="ui-input"
                            :class="{ active: emailFocused && recoverForm.email, error: errors.email || serverEmailError }"
                            :rules="{ required: true, email: true }"
                            @focus="emailFocused = true"
                            @blur="emailFocused = false"
                        />
                        <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                        <span v-else-if="serverEmailError" class="error-message">{{ serverEmailError }}</span>
                    </div>
                    <div class="remember-password" @click="openLoginModal">
                        {{ $t('recover.rememberedPassword') }}
                    </div>
                    <button type="submit" class="ui-btn ui-btn__primary ui-btn__block">{{ $t('recover.recover') }}</button>
                </Form>
            </div>
            <div v-else class="success-message">
                <p>
                    {{ $t('recover.email') }}
                    <a :href="`mailto=${recoverForm.email}`">{{ recoverForm.email }}</a>
                    {{ $t('recover.send') }}
                </p>
                <p>
                    {{ $t('recover.checkSpam') }}
                </p>
            </div>
        </ClientOnly>
        <p v-if="!isSuccess" class="register-text">
            {{ $t('recover.notRegistered') }} <NuxtLink to="/register" @click="emit('close')">{{ $t('recover.createAccount') }}</NuxtLink>
        </p>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue'
import { Form, Field } from 'vee-validate'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useModalsStore } from '~/stores/modals'

const router = useRouter()
const { t } = useI18n()
const modalsStore = useModalsStore()

const recoverForm = reactive<{
    email: string
}>({
    email: ''
})

const emailFocused = ref<boolean>(false)
const serverEmailError = ref<string | null>(null)
const isSuccess = ref<boolean>(false)

// Список разрешённых ошибок для отображения
const allowedErrors = ['ERROR_FIELD_EMAIL_REQUIRED', 'ERROR_LOGIN']

const emit = defineEmits<{
    (e: 'close'): void
}>()

const handleRecover = async () => {
    // Очищаем серверные ошибки перед новой отправкой
    serverEmailError.value = null

    try {
        const response = await $fetch.raw('/api/auth/recover', {
            method: 'POST',
            body: { email: recoverForm.email }
        })

        if (response._data?.message === 'RESET_CODE_SEND') {
            // Успешная отправка кода
            isSuccess.value = true // Показываем сообщение об успехе
        } else {
            const errorCode = response._data?.error || 'Unknown error'

            // Обрабатываем только разрешённые ошибки
            if (allowedErrors.includes(errorCode)) {
                serverEmailError.value = t(`errors.${errorCode}`)
            }
            console.error('Ошибка восстановления:', response._data?.details || errorCode)
        }
    } catch (error) {
        const errorMessageText = error.message || 'Unknown error'
        const errorCodeMatch = errorMessageText.match(/401[:\s]+(\w+)/)
        const errorCode = errorCodeMatch ? errorCodeMatch[1] : 'Unknown error'

        // Обрабатываем только разрешённые ошибки
        if (allowedErrors.includes(errorCode)) {
            serverEmailError.value = t(`errors.${errorCode}`)
        }
        console.error('Не удалось отправить запрос на восстановление:', error.data?.details || errorCode)
    }
}

const openLoginModal = () => {
    modalsStore.openModal('login')
}

// Сбрасываем состояние при закрытии модалки
watch(() => modalsStore.isModalOpen, (newValue) => {
    if (!newValue) {
        recoverForm.email = ''
        serverEmailError.value = null
        isSuccess.value = false
    }
})
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
        text-align: center;
        color: $font-grey;
        margin-bottom: p2r(40);
    }
}

.form-field {
    position: relative;
    margin-bottom: p2r(24);
}

.label {
    position: absolute;
    top: p2r(12);
    left: p2r(16);
    font-family: 'Inter', sans-serif;
    font-size: p2r(16);
    color: $font-grey;
    pointer-events: none;
    transition: all 0.2s ease;
    transform-origin: top left;
    opacity: 0;

    &.empty {
        font-size: p2r(16);
        color: $font;
        opacity: 1;
        top: 50%;
        transform: translateY(-50%);
    }

    &.active {
        top: p2r(8);
        font-size: p2r(12);
        color: $font-grey;
        opacity: 1;
    }
}

.remember-password {
    display: block;
    font-size: p2r(14);
    color: #0ab271;
    text-decoration: none;
    margin: p2r(20) 0 p2r(40);
    text-align: right;
    transition: opacity 0.3s;
    cursor: pointer;

    &:hover {
        opacity: 0.9;
    }
}

.register-text {
    font-size: p2r(14);
    color: $font-grey;
    text-align: center;
    margin-top: p2r(20);
    margin-bottom: 0;
    transition: opacity 0.3s;

    a {
        color: #0ab271;
        text-decoration: none;

        &:hover {
            opacity: 0.9;
        }
    }
}

.success-message {
    text-align: center;
    font-size: p2r(14);
    color: $font-grey;
    margin-bottom: p2r(40);

    p {
        margin-bottom: p2r(16);
    }
}
</style>