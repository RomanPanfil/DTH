<template>
    <div class="login-modal">
        <h2 class="login-modal-title">{{ $t('login.title') }}</h2>
        <p class="login-modal-description">
            {{ $t('login.welcome') }}
        </p>
        <ClientOnly>
            <Form v-slot="{ errors }" @submit="handleLogin">
                <div class="form-field">
                    <label class="label" :class="{ active: emailFocused && loginForm.email, empty: !loginForm.email }">
                        {{ $t('placeholders.loginEmail') }}
                    </label>
                    <Field
                        name="email"
                        v-model="loginForm.email"
                        type="email"
                        class="ui-input"
                        :class="{ active: emailFocused && loginForm.email, error: errors.email || serverEmailError }"
                        :rules="{ required: true, email: true }"
                        @focus="emailFocused = true"
                        @blur="emailFocused = false"
                    />
                    <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                    <span v-else-if="serverEmailError" class="error-message">{{ serverEmailError }}</span>
                </div>
                <div class="form-field">
                    <label class="label" :class="{ active: passwordFocused && loginForm.password, empty: !loginForm.password }">
                        {{ $t('placeholders.password') }}
                    </label>
                    <Field
                        name="password"
                        v-model="loginForm.password"
                        :type="showPassword ? 'text' : 'password'"
                        class="ui-input"
                        :class="{ active: passwordFocused && loginForm.password, error: errors.password || serverPasswordError }"
                        :rules="{ required: true, min: 6 }"
                        @focus="passwordFocused = true"
                        @blur="passwordFocused = false"
                    />
                    <button
                        type="button"
                        class="toggle-password"
                        @click="showPassword = !showPassword"
                        aria-label="Показать/скрыть пароль"
                    >
                        <NuxtIcon v-if="showPassword" name="eye-visible" filled class="toggle-password-icon" />
                        <NuxtIcon v-else name="eye-hidden" filled class="toggle-password-icon" />
                    </button>
                    <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
                    <span v-else-if="serverPasswordError" class="error-message">{{ serverPasswordError }}</span>
                </div>
                <div class="forgot-password" @click="openRecoverModal">
                    {{ $t('login.forgotPassword') }}
                </div>
                <button type="submit" class="ui-btn ui-btn__primary ui-btn__block">{{ $t('login.login') }}</button>
            </Form>
        </ClientOnly>
        <p class="register-text">
            {{ $t('login.isNewUser') }} <NuxtLink to="/register" @click="emit('close')">{{ $t('login.createAccount') }}</NuxtLink>
        </p>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { Form, Field } from 'vee-validate'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore()
import { useModalsStore } from '~/stores/modals';
const router = useRouter()
const { t } = useI18n()

const modalsStore = useModalsStore();

const loginForm = reactive<{
    email: string
    password: string
}>({
    email: '',
    password: ''
})

const showPassword = ref<boolean>(false)
const emailFocused = ref<boolean>(false)
const passwordFocused = ref<boolean>(false)
const serverEmailError = ref<string | null>(null)
const serverPasswordError = ref<string | null>(null)

// Список разрешённых ошибок для отображения
const allowedErrors = ['ERROR_LOGIN', 'ERROR_NOT_ACTIVATION', 'ERROR_AUTH']

const emit = defineEmits<{
    (e: 'close'): void
}>()

const handleLogin = async () => {
    // Очищаем серверные ошибки перед новой отправкой
    serverEmailError.value = null
    serverPasswordError.value = null

    try {
        const response = await $fetch.raw('/api/auth/login', {
            method: 'POST',
            body: loginForm
        })

        if (response.status >= 200 && response.status < 300 && response._data?.USER_ID && response._data?.TOKEN) {
            authStore.login(loginForm.email, response._data.USER_ID, response._data.TOKEN, response._data.EXPIRES)

            const currentRoute = router.currentRoute.value
            if (currentRoute.name === 'register') {
                // Если находимся на странице регистрации, переходим на главную
                await router.push('/')
            }
            // В остальных случаях остаемся на той же странице

            emit('close')
        } else {
            const errorCode = response._data?.data?.error || response._data?.statusMessage || response._data?.message || 'Unknown error'

            // Обрабатываем только разрешённые ошибки
            if (allowedErrors.includes(errorCode)) {
                if (errorCode === 'ERROR_LOGIN' || errorCode === 'ERROR_NOT_ACTIVATION') {
                    serverEmailError.value = t(`errors.${errorCode}`)
                } else if (errorCode === 'ERROR_AUTH') {
                    serverPasswordError.value = t(`errors.${errorCode}`)
                }
            }
            console.error('Ошибка авторизации:', response._data?.details || errorCode)
        }
    } catch (error) {
        const errorMessageText = error.message || 'Unknown error'
        const errorCodeMatch = errorMessageText.match(/401[:\s]+(\w+)/)
        const errorCode = errorCodeMatch ? errorCodeMatch[1] : 'Unknown error'

        // Обрабатываем только разрешённые ошибки
        if (allowedErrors.includes(errorCode)) {
            if (errorCode === 'ERROR_LOGIN' || errorCode === 'ERROR_NOT_ACTIVATION') {
                serverEmailError.value = t(`errors.${errorCode}`)
            } else if (errorCode === 'ERROR_AUTH') {
                serverPasswordError.value = t(`errors.${errorCode}`)
            }
        }
        console.error('Не удалось войти:', error.data?.details || errorCode)
    }
}

const openRecoverModal = () => {
   modalsStore.openModal('recover');
};

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

.toggle-password {
    position: absolute;
    right: p2r(12);
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
    padding: p2r(4);

    &-icon {
        font-size: 24px;
        line-height: 24px;
        color: $font;
    }
}

.forgot-password {
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
</style>