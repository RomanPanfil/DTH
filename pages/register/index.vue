<template>
    <div class="container">
        <div class="register-container">
            <div class="register-header">
                <div class="register-title">{{ $t('register.title') }}</div>
                <div class="register-header-text">
                    {{ $t('register.isHaveAccount') }} <a href="#" class="login-link" @click="handleAccountClick">{{ $t('register.loginTo') }}</a>
                </div>
            </div>
            <ClientOnly>
                <div v-if="!isLoading">
                    <Form v-if="!isRegistered && !isActivated" v-slot="{ errors }" @submit="handleRegister">
                        <div class="form-row">
                            <div class="form-field">
                                <label class="label" :class="{ active: nameFocused && registerForm.name, empty: !registerForm.name }">
                                    {{ $t('placeholders.name') }}
                                    <span class="label-required">*</span>
                                </label>
                                <Field
                                    name="name"
                                    v-model="registerForm.name"
                                    type="text"
                                    class="ui-input"
                                    :class="{ active: nameFocused && registerForm.name, error: errors.name }"
                                    :rules="{ required: true, min: 2, onlyLetters: true }"
                                    @focus="nameFocused = true"
                                    @blur="nameFocused = false"
                                    :placeholder="$t('placeholders.name')"
                                />
                                <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
                            </div>
                            <div class="form-field">
                                <label class="label" :class="{ active: lastNameFocused && registerForm.last_name, empty: !registerForm.last_name }">
                                    {{ $t('placeholders.lastName') }}
                                    <span class="label-required">*</span>
                                </label>
                                <Field
                                    name="last_name"
                                    v-model="registerForm.last_name"
                                    type="text"
                                    class="ui-input"
                                    :class="{ active: lastNameFocused && registerForm.last_name, error: errors.last_name }"
                                    :rules="{ required: true, min: 2, onlyLetters: true }"
                                    @focus="lastNameFocused = true"
                                    @blur="lastNameFocused = false"
                                    :placeholder="$t('placeholders.lastName')"
                                />
                                <span v-if="errors.last_name" class="error-message">{{ errors.last_name }}</span>
                            </div>
                            <div class="form-field">
                                <label class="label" :class="{ active: phoneFocused && registerForm.phone, empty: !registerForm.phone }">
                                    {{ $t('placeholders.phone') }}
                                    <span class="label-required">*</span>
                                </label>
                                <Field
                                    name="phone"
                                    v-model="registerForm.phone"
                                    type="tel"
                                    class="ui-input"
                                    :class="{ active: phoneFocused && registerForm.phone, error: errors.phone || serverPhoneError }"
                                    :rules="{ required: true }"
                                    ref="phoneInput"
                                    @focus="phoneFocused = true"
                                    @blur="phoneFocused = false"
                                    :placeholder="$t('placeholders.phone')"
                                />
                                <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
                                <span v-else-if="serverPhoneError" class="error-message">{{ serverPhoneError }}</span>
                            </div>
                            <div class="form-field">
                                <label class="label" :class="{ active: emailFocused && registerForm.email, empty: !registerForm.email }">
                                    {{ $t('placeholders.emailLogin') }}
                                    <span class="label-required">*</span>
                                </label>
                                <Field
                                    name="email"
                                    v-model="registerForm.email"
                                    type="email"
                                    class="ui-input"
                                    :class="{ active: emailFocused && registerForm.email, error: errors.email || serverEmailError }"
                                    :rules="{ required: true, email: true }"
                                    @focus="emailFocused = true"
                                    @blur="emailFocused = false"
                                    :placeholder="$t('placeholders.emailLogin')"
                                />
                                <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                                <span v-else-if="serverEmailError" class="error-message">{{ serverEmailError }}</span>
                            </div>
                            <div class="form-field">
                                <label class="label" :class="{ active: passwordFocused && registerForm.password, empty: !registerForm.password }">
                                    {{ $t('placeholders.password') }}
                                    <span class="label-required">*</span>
                                </label>
                                <Field
                                    name="password"
                                    v-model="registerForm.password"
                                    :type="showPassword ? 'text' : 'password'"
                                    class="ui-input"
                                    :class="{ active: passwordFocused && registerForm.password, error: errors.password }"
                                    :rules="{ required: true, min: 6 }"
                                    @focus="passwordFocused = true"
                                    @blur="passwordFocused = false"
                                    :placeholder="$t('placeholders.password')"
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
                            </div>
                            <div class="form-field">
                                <label class="label" :class="{ active: confirmPasswordFocused && registerForm.confirm_password, empty: !registerForm.confirm_password }">
                                    {{ $t('placeholders.passwordRepeat') }}
                                    <span class="label-required">*</span>
                                </label>
                                <Field
                                    name="confirm_password"
                                    v-model="registerForm.confirm_password"
                                    :type="showPassword ? 'text' : 'password'"
                                    class="ui-input"
                                    :class="{ active: confirmPasswordFocused && registerForm.confirm_password, error: errors.confirm_password || serverPasswordError }"
                                    :rules="{ required: true, confirmed: '@password' }"
                                    @focus="confirmPasswordFocused = true"
                                    @blur="confirmPasswordFocused = false"
                                    :placeholder="$t('placeholders.passwordRepeat')"
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
                                <span v-if="errors.confirm_password" class="error-message">{{ errors.confirm_password }}</span>
                                <span v-else-if="serverPasswordError" class="error-message">{{ serverPasswordError }}</span>
                            </div>
                            <div class="form-field checkbox-field">
                                <div class="custom-checkbox">
                                    <Field
                                        name="agreement"
                                        v-model="agreement"
                                        type="checkbox"
                                        :value="true"
                                        :unchecked-value="false"
                                        :rules="{ required: true }"
                                        class="checkbox-input"
                                    />
                                    <span class="checkbox-indicator"></span>
                                    <label for="agreement" class="checkbox-label">
                                        {{ $t('register.agree') }} <a href="/terms" target="_blank">{{ $t('register.userAgreement') }}</a> {{ $t('register.and') }} <a href="/privacy" target="_blank">{{ $t('register.politics') }}</a>
                                    </label>
                                </div>
                                <span v-if="errors.agreement" class="error-message">{{ errors.agreement }}</span>
                            </div>
                            <button type="submit" class="ui-btn ui-btn__primary ui-btn__block register-btn">{{ $t('register.register') }}</button>
                        </div>
                    </Form>
                    <template v-if="isRegistered && !isActivated" class="message-container">
                        <p class="message-text">{{ $t('register.thankYou') }}</p>
                        <NuxtLink to="/" class="ui-btn ui-btn__primary">{{ $t('register.toHome') }}</NuxtLink>
                    </template>
                    <template v-if="isActivated" class="message-container">
                        <p class="message-text">{{ $t('register.activated') }}</p>
                        <button class="ui-btn ui-btn__primary" @click="handleAccountClick">{{ $t('register.enter') }}</button>
                    </template>
                </div>
            </ClientOnly>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, nextTick, onBeforeMount } from 'vue'
import { Form, Field } from 'vee-validate'
import IMask from 'imask'
import { useAuthStore } from '~/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { useModalsStore } from '~/stores/modals'
import { useI18n } from 'vue-i18n'

const modalsStore = useModalsStore()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const { t } = useI18n()

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
const isLoading = ref<boolean>(false)
const serverPhoneError = ref<string | null>(null)
const serverEmailError = ref<string | null>(null)
const serverPasswordError = ref<string | null>(null)
const phoneInput = ref<any>(null)
const phoneMask = ref<any>(null)

const allowedErrors = ['ERROR_PHONE_INVALID', 'ERROR_UNIQUE_EMAIL', 'ERROR_CONFIRM_PASSWORD']

watch(phoneInput, async (newValue) => {
    if (newValue && newValue.$el) {
        await nextTick()
        const inputElement = newValue.$el

        phoneMask.value = IMask(inputElement, {
            mask: [
                {
                    mask: '+375 (00) 000-00-00',
                    startsWith: '375',
                    country: 'Belarus'
                },
                {
                    mask: '+7 (000) 000-00-00',
                    startsWith: '7',
                    country: 'Russia'
                },
                {
                    mask: '+380 (00) 000-00-00',
                    startsWith: '380',
                    country: 'Ukraine'
                },
                {
                    mask: '+371 0000 0000',
                    startsWith: '371',
                    country: 'Latvia'
                },
                {
                    mask: '+370 (000) 00000',
                    startsWith: '370',
                    country: 'Lithuania'
                },
                {
                    mask: '+48 000 000 000',
                    startsWith: '48',
                    country: 'Poland'
                },
                {
                    mask: '+49 000 00000000',
                    startsWith: '49',
                    country: 'Germany'
                },
                {
                    mask: '+000 00000000000',
                    startsWith: '',
                    country: 'unknown'
                }
            ],
            dispatch: function (appended, dynamicMasked) {
                let number = (dynamicMasked.value + appended).replace(/\D/g, '');
                return dynamicMasked.compiledMasks.find(function (m) {
                    return number.indexOf(m.startsWith) === 0;
                });
            }
        })
    }
})

onBeforeMount(async () => {
    const activationCode = route.query.CODE?.toString()
    if (activationCode) {
        isLoading.value = true
        await handleActivate(activationCode)
        isLoading.value = false
    }
})

const handleRegister = async () => {
    serverPhoneError.value = null
    serverEmailError.value = null
    serverPasswordError.value = null

    if (phoneMask.value && !phoneMask.value.masked.isComplete) {
        serverPhoneError.value = t('errors.incompletePhone')
        return
    }

    try {
        const response = await $fetch('/api/auth/register', {
            method: 'POST',
            body: registerForm
        })

        if (response.USER_ID && response.TOKEN) {
            authStore.login(registerForm.email, response.USER_ID, response.TOKEN)
            isRegistered.value = true
        } else {
            let errorCode = response.error || response.details || 'Unknown error'

            if (response.details === 'Пользователь с таким email уже существует') {
                errorCode = 'ERROR_UNIQUE_EMAIL'
            } else if (response.details === 'Номер телефона недействителен') {
                errorCode = 'ERROR_PHONE_INVALID'
            } else if (response.details === 'Пароли не совпадают') {
                errorCode = 'ERROR_CONFIRM_PASSWORD'
            }

            if (allowedErrors.includes(errorCode)) {
                if (errorCode === 'ERROR_PHONE_INVALID') {
                    serverPhoneError.value = t('errors.ERROR_PHONE_INVALID')
                } else if (errorCode === 'ERROR_UNIQUE_EMAIL') {
                    serverEmailError.value = t('errors.ERROR_UNIQUE_EMAIL')
                } else if (errorCode === 'ERROR_CONFIRM_PASSWORD') {
                    serverPasswordError.value = t('errors.ERROR_CONFIRM_PASSWORD')
                }
            } else {
                console.error('Неизвестная ошибка регистрации:', errorCode)
            }
        }
    } catch (error) {
        let errorCode = error.data?.error || error.data?.data?.error || error.data?.details || error.message || 'Unknown error'

        if (error.data?.details === 'Пользователь с таким email уже существует') {
            errorCode = 'ERROR_UNIQUE_EMAIL'
        } else if (error.data?.details === 'Номер телефона недействителен') {
            errorCode = 'ERROR_PHONE_INVALID'
        } else if (error.data?.details === 'Пароли не совпадают') {
            errorCode = 'ERROR_CONFIRM_PASSWORD'
        }

        if (allowedErrors.includes(errorCode)) {
            if (errorCode === 'ERROR_PHONE_INVALID') {
                serverPhoneError.value = t('errors.ERROR_PHONE_INVALID')
            } else if (errorCode === 'ERROR_UNIQUE_EMAIL') {
                serverEmailError.value = t('errors.ERROR_UNIQUE_EMAIL')
            } else if (errorCode === 'ERROR_CONFIRM_PASSWORD') {
                serverPasswordError.value = t('errors.ERROR_CONFIRM_PASSWORD')
            }
        } else {
            console.error('Не удалось зарегистрироваться:', errorCode)
        }
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
            isRegistered.value = false
        } else {
            console.error('Ошибка активации:', response.details || 'Неизвестная ошибка')
        }
    } catch (error) {
        console.error('Не удалось активировать учетную запись:', error.data?.details || 'Неизвестная ошибка')
    }
}

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
        z-index: -1;
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