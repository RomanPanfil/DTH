<template>
    <div class="login-modal">
        <h2 class="login-modal-title">{{ $t('login.title') }}</h2>
        <p class="login-modal-description">
            {{ $t('login.welcome') }}
        </p>
        <form @submit.prevent="handleLogin">
            <div class="form-field">
                <label class="label" :class="{ active: emailFocused && loginForm.email }">
                    {{ $t('placeholders.loginEmail') }}
                </label>
                <input
                    class="ui-input"
                    :class="{ active: emailFocused && loginForm.email }"
                    id="email"
                    v-model="loginForm.email"
                    type="email"
                    :placeholder="$t('placeholders.loginEmail')"
                    required
                    @focus="emailFocused = true"
                    @blur="emailFocused = false"
                />
            </div>
            <div class="form-field">
                <label class="label" :class="{ active: passwordFocused && loginForm.password }">
                    {{ $t('placeholders.password') }}
                </label>
                <input
                    class="ui-input"
                    :class="{ active: passwordFocused && loginForm.password }"
                    id="password"
                    v-model="loginForm.password"
                    :type="showPassword ? 'text' : 'password'"
                    :placeholder="$t('placeholders.password')"
                    required
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
            </div>
            <NuxtLink to="/forgot-password" class="forgot-password">
                {{ $t('login.forgotPassword') }}
            </NuxtLink>
            <button type="submit" class="ui-btn ui-btn__primary ui-btn__block">{{ $t('login.login') }}</button>
        </form>
        <p class="register-text">
            {{ $t('login.isNewUser') }} <NuxtLink to="/register" @click="emit('close')">{{ $t('login.createAccount') }}</NuxtLink>
        </p>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const router = useRouter()

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
const errorMessage = ref<string | null>(null)

const emit = defineEmits<{
    (e: 'close'): void
}>()

const handleLogin = async () => {
    errorMessage.value = null
    try {
        const response = await $fetch('/api/auth/login', {
            method: 'POST',
            body: loginForm
        })

        if (response.USER_ID && response.TOKEN) {
            authStore.login(loginForm.email, response.USER_ID, response.TOKEN)
            await router.push('/account')
            emit('close')
        } else {
            errorMessage.value = response.details || 'Ошибка авторизации'
            console.error('Ошибка авторизации:', response.details || 'Неизвестная ошибка')
        }
    } catch (error) {
        errorMessage.value = error.data?.details || 'Не удалось войти'
        console.error('Не удалось войти:', error.data?.details || 'Неизвестная ошибка')
    }
}


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
    top: 50%; /* Сдвинем ниже, чтобы учесть метку */
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

    &:hover {
        color: darken(#0ab271, 10%);
    }
}

.register-text {
    font-size: p2r(14);
    color: $font-grey;
    text-align: center;
    margin-top: p2r(20);
    margin-bottom: 0;

    a {
        color: #0ab271;
        text-decoration: none;

        &:hover {
            color: darken(#0ab271, 10%);
        }
    }
}
</style>