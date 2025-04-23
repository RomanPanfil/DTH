<template>
    <div class="container">
        <div class="register-container">
            <div class="register-header">
                <div class="register-title">{{ $t('register.title') }}</div>
                <div class="register-header-text">
                    {{ $t('register.isHaveAccount') }} <a href="#" class="login-link" @click="handleAccountClick">{{ $t('register.loginTo') }}</a>
                </div>
            </div>
            <form v-if="!isRegistered && !isActivated" @submit.prevent="handleRegister">
                <div class="form-row">
                    <div class="form-field">
                        <label class="label" :class="{ active: nameFocused && registerForm.name, empty: !registerForm.name }">
                            {{ $t('placeholders.name') }}
                            <span class="label-required">*</span>
                        </label>
                        <input
                            class="ui-input"
                            :class="{ active: nameFocused && registerForm.name }"
                            id="name"
                            v-model="registerForm.name"
                            type="text"
                            required
                            @focus="nameFocused = true"
                            @blur="nameFocused = false"
                        />
                    </div>
                    <div class="form-field">
                        <label class="label" :class="{ active: lastNameFocused && registerForm.last_name, empty: !registerForm.last_name }">
                            {{ $t('placeholders.lastName') }}
                            <span class="label-required">*</span>
                        </label>
                        <input
                            class="ui-input"
                            :class="{ active: lastNameFocused && registerForm.last_name }"
                            id="last_name"
                            v-model="registerForm.last_name"
                            type="text"
                            required
                            @focus="lastNameFocused = true"
                            @blur="lastNameFocused = false"
                        />
                    </div>
                    <div class="form-field">
                        <label class="label" :class="{ active: phoneFocused && registerForm.phone, empty: !registerForm.phone }">
                            {{ $t('placeholders.phone') }}
                            <span class="label-required">*</span>
                        </label>
                        <input
                            class="ui-input"
                            :class="{ active: phoneFocused && registerForm.phone }"
                            id="phone"
                            v-model="registerForm.phone"
                            type="tel"
                            required
                            @focus="phoneFocused = true"
                            @blur="phoneFocused = false"
                        />
                    </div>
                    <div class="form-field">
                        <label class="label" :class="{ active: emailFocused && registerForm.email, empty: !registerForm.email }">
                            {{ $t('placeholders.emailLogin') }}
                            <span class="label-required">*</span>
                        </label>
                        <input
                            class="ui-input"
                            :class="{ active: emailFocused && registerForm.email }"
                            id="email"
                            v-model="registerForm.email"
                            type="email"
                            required
                            @focus="emailFocused = true"
                            @blur="emailFocused = false"
                        />
                    </div>
                    <div class="form-field">
                        <label class="label" :class="{ active: passwordFocused && registerForm.password, empty: !registerForm.password }">
                            {{ $t('placeholders.password') }}
                            <span class="label-required">*</span>
                        </label>
                        <input
                            class="ui-input"
                            :class="{ active: passwordFocused && registerForm.password }"
                            id="password"
                            v-model="registerForm.password"
                            :type="showPassword ? 'text' : 'password'"
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
                    <div class="form-field">
                        <label class="label" :class="{ active: confirmPasswordFocused && registerForm.confirm_password, empty: !registerForm.confirm_password }">
                            {{ $t('placeholders.passwordRepeat') }}
                            <span class="label-required">*</span>
                        </label>
                        <input
                            class="ui-input"
                            :class="{ active: confirmPasswordFocused && registerForm.confirm_password }"
                            id="confirm_password"
                            v-model="registerForm.confirm_password"
                            :type="showPassword ? 'text' : 'password'"
                            required
                            @focus="confirmPasswordFocused = true"
                            @blur="confirmPasswordFocused = false"
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
                    <div class="form-field checkbox-field">
                        <div class="custom-checkbox">
                            <input
                                type="checkbox"
                                id="agreement"
                                v-model="agreement"
                                required
                            />
                            <span class="checkbox-indicator"></span>
                            <label for="agreement" class="checkbox-label">
                                {{ $t('register.agree') }} <a href="/terms" target="_blank">{{ $t('register.userAgreement') }}</a> {{ $t('register.and') }} <a href="/privacy" target="_blank">{{ $t('register.politics') }}</a>
                            </label>
                        </div>
                    </div>
                    <button type="submit" class="ui-btn ui-btn__primary ui-btn__block register-btn">{{ $t('register.register') }}</button>
                </div>
            </form>
            <!-- Сообщение об отправке письма -->
            <template v-if="isRegistered && !isActivated" class="message-container">
                <p class="message-text">{{ $t('register.thankYou') }}</p>
                <NuxtLink to="/" class="ui-btn ui-btn__primary">{{ $t('register.toHome') }}</NuxtLink>
            </template>

            <!-- Сообщение об успешной активации -->
            <template v-if="isActivated" class="message-container">
                <p class="message-text">{{ $t('register.activated') }}</p>
                <button class="ui-btn ui-btn__primary" @click="handleAccountClick">{{ $t('register.enter') }}</button>
            </template>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { useModalsStore } from '~/stores/modals'

const modalsStore = useModalsStore()

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const registerForm = reactive<{
    name: string
    last_name: string
    phone: string
    email: string
    password: string
    confirm_password: string
}>({
    name: '',
    last_name: '',
    phone: '',
    email: '',
    password: '',
    confirm_password: ''
})

const showPassword = ref<boolean>(false)
const nameFocused = ref<boolean>(false)
const lastNameFocused = ref<boolean>(false)
const phoneFocused = ref<boolean>(false)
const emailFocused = ref<boolean>(false)
const passwordFocused = ref<boolean>(false)
const confirmPasswordFocused = ref<boolean>(false)
const agreement = ref<boolean>(false)
const isRegistered = ref<boolean>(false)
const isActivated = ref<boolean>(false)
const errorMessage = ref<string | null>(null)

const handleRegister = async () => {
    console.log('Данные формы перед отправкой:', registerForm)
    try {
        const response = await $fetch('/api/auth/register', {
            method: 'POST',
            body: registerForm
        })

        if (response.USER_ID && response.TOKEN) {
            authStore.login(registerForm.email, response.USER_ID, response.TOKEN)
            isRegistered.value = true // Показываем сообщение об отправке письма
        } else {
            errorMessage.value = response.details || 'Ошибка активации'
            console.error('Ошибка регистрации:', response.details || 'Неизвестная ошибка')
        }
    } catch (error) {
        errorMessage.value = error.data?.details || 'Не удалось активировать учетную запись'
        console.error('Не удалось зарегистрироваться:', error.data?.details || 'Неизвестная ошибка')
    }
}

const handleActivate = async (code: string) => {
    try {
        const response = await $fetch('/api/auth/activate', {
            method: 'POST',
            body: { activation_code: code }
        })

        if (response.MESSAGE === 'ACCOUNT_ACTIVATED_SUCCESSFULLY') {
            authStore.setActivationStatus(true)
            isActivated.value = true
            isRegistered.value = false // Скрываем сообщение об отправке письма
        } else {
            console.error('Ошибка активации:', response.details || 'Неизвестная ошибка')
        }
    } catch (error) {
        console.error('Не удалось активировать учетную запись:', error.data?.details || 'Неизвестная ошибка')
    }
}

// Проверяем наличие кода в URL при загрузке страницы
onMounted(() => {
    const activationCode = route.query.CODE?.toString()
    if (activationCode) {
        handleActivate(activationCode)
    }
})

const handleAccountClick = () => {
    modalsStore.openModal('login')
}
</script>

<style scoped lang="scss">
.register {
    &-container {
        position: relative;
        background-color: $bgc;
        padding: p2r(80) p2r(60);
        border-radius: p2r(32);
        box-shadow: 0px 4px 35px rgba(114, 142, 174, 0.1);
        max-width: p2r(860);
        margin: p2r(100) auto;

        &::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            transform: translate(-100%, -50%);
            background-color: $primary;
            width: p2r(21);
            height: 70%;
            border-top-left-radius: p2r(4);
            border-bottom-left-radius: p2r(4);
        }

        @media(max-width: 768px) {
            padding: p2r(32) p2r(24);
        }
    }

    &-header {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 6px;
        align-items: center;
        margin-bottom: p2r(40);
        padding-bottom: p2r(16);
        border-bottom: 1px solid $border;

        &-text {
            font-size: p2r(14);
            color: $font-grey;
        }
    }

    &-btn {
        width: calc(50% - 10px);

        @media(max-width: 768px) {
            width: 100%;
        }
    }

    &-title {
        font-weight: 500;
        font-size: p2r(32);
        color: $font-dark-grey;
    }
}

.form-row {
    display: flex;
    flex-wrap: wrap;
    column-gap: p2r(20);
}

.form-field {
    width: calc(50% - 10px);
    position: relative;

    @media(max-width: 768px) {
        width: 100%;
    }
}

.label {
    font-size: p2r(14);
    color: #666;
    position: absolute;
    top: p2r(12);
    left: p2r(16);
    transition: all 0.2s ease;
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

    &-required {
        color: $error;
    }
}

.toggle-password {
    position: absolute;
    right: p2r(15);
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    cursor: pointer;
}

.toggle-password-icon {
    font-size: p2r(20);
    color: $font;
}

.checkbox-field {
    width: 100%;
    display: flex;
    align-items: center;
    margin-bottom: p2r(40);
}

.message-text {
    color: $font;
    margin-bottom: p2r(60);
}
</style>