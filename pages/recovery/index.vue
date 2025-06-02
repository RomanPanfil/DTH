<template>
    <div class="container">
        <div class="register-container">
            <div class="register-header">
                <div class="register-title">{{ $t('recover.changePassTitle') }}</div>
            </div>
            <ClientOnly>
                <div v-if="!isLoading">
                    <div v-if="!isSuccess">
                        <Form v-slot="{ errors }" @submit="handleChange">
                            <div class="form-row">
                                <div class="form-field">
                                    <label class="label" :class="{ active: passwordFocused && resetForm.password, empty: !resetForm.password }">
                                        {{ $t('placeholders.newPassword') }}
                                        <span class="label-required">*</span>
                                    </label>
                                    <Field
                                        name="password"
                                        v-model="resetForm.password"
                                        :type="showPassword ? 'text' : 'password'"
                                        class="ui-input"
                                        :class="{ active: passwordFocused && resetForm.password, error: errors.password }"
                                        :rules="{ required: true, min: 6 }"
                                        @focus="passwordFocused = true"
                                        @blur="passwordFocused = false"
                                        :placeholder="$t('placeholders.newPassword')"
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
                                    <label class="label" :class="{ active: confirmPasswordFocused && resetForm.confirm_password, empty: !resetForm.confirm_password }">
                                        {{ $t('placeholders.newPasswordRepeat') }}
                                        <span class="label-required">*</span>
                                    </label>
                                    <Field
                                        name="confirm_password"
                                        v-model="resetForm.confirm_password"
                                        :type="showPassword ? 'text' : 'password'"
                                        class="ui-input"
                                        :class="{ active: confirmPasswordFocused && resetForm.confirm_password, error: errors.confirm_password || serverPasswordError }"
                                        :rules="{ required: true, confirmed: '@password' }"
                                        @focus="confirmPasswordFocused = true"
                                        @blur="confirmPasswordFocused = false"
                                        :placeholder="$t('placeholders.newPasswordRepeat')"
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

                            </div>
                            <button type="submit" class="ui-btn ui-btn__primary ui-btn__block register-btn">{{ $t('recover.savePass') }}</button>
                        </Form>
                    </div>
                    <div v-else class="message-container">
                        <p class="message-text">{{ $t('recover.resetSuccess') }} <span @click="handleLogin">{{ $t('recover.resetSuccessLogin') }}</span>.</p>
                        <NuxtLink to="/" class="ui-btn ui-btn__primary">{{ $t('recover.goToMain') }}</NuxtLink>
                    </div>
                </div>
            </ClientOnly>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, onBeforeMount } from 'vue'
import { Form, Field } from 'vee-validate'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useModalsStore } from '~/stores/modals';

const router = useRouter()
const route = useRoute()
const { t } = useI18n()
const modalsStore = useModalsStore();

const resetForm = reactive<{
    reset_code: string
    password: string
    confirm_password: string
}>({
    reset_code: '',
    password: '',
    confirm_password: ''
})

const showPassword = ref<boolean>(false)
const passwordFocused = ref<boolean>(false)
const confirmPasswordFocused = ref<boolean>(false)
const isSuccess = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const serverError = ref<string | null>(null)
const serverPasswordError = ref<string | null>(null)

const allowedErrors = ['ERROR_FIELD_REQUIRED', 'ERROR_CONFIRM_PASSWORD', 'ERROR_RESET_CODE']

onBeforeMount(() => {
    const resetCode = route.query.CODE?.toString()
    if (resetCode) {
        resetForm.reset_code = resetCode
    } else {
        serverError.value = t('errors.missingResetCode')
    }
})

const handleChange = async () => {
    serverError.value = null
    serverPasswordError.value = null

    try {
        const response = await $fetch.raw('/api/auth/reset-password', {
            method: 'POST',
            body: {
                reset_code: resetForm.reset_code,
                new_password: resetForm.password,
                confirm_password: resetForm.confirm_password
            }
        })

        if (response._data?.message === 'PASSWORD_SUCCESSFULLY_RESET') {
            isSuccess.value = true
        } else {
            const errorCode = response._data?.error || 'Unknown error'
            if (allowedErrors.includes(errorCode)) {
                if (errorCode === 'ERROR_CONFIRM_PASSWORD') {
                    serverPasswordError.value = t(`errors.${errorCode}`)
                } else {
                    serverError.value = t(`errors.${errorCode}`)
                }
            }
            console.error('Ошибка сброса пароля:', response._data?.details || errorCode)
        }
    } catch (error) {
        const errorMessageText = error.message || 'Unknown error'
        const errorCodeMatch = errorMessageText.match(/401[:\s]+(\w+)/)
        const errorCode = errorCodeMatch ? errorCodeMatch[1] : 'Unknown error'

        if (allowedErrors.includes(errorCode)) {
            if (errorCode === 'ERROR_CONFIRM_PASSWORD') {
                serverPasswordError.value = t(`errors.${errorCode}`)
            } else {
                serverError.value = t(`errors.${errorCode}`)
            }
        }
        console.error('Не удалось сбросить пароль:', error.data?.details || errorCode)
    }
}

const handleLogin = () => {
    modalsStore.openModal('login');
};
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
    margin-bottom: p2r(20);
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

.message-text {
    color: $font;
    margin-bottom: p2r(60);

    span {
        cursor: pointer;
        color: $primary;
    }
}

.error-message {
    color: $error;
    font-size: p2r(12);
    margin-top: p2r(4);
    display: block;
}
</style>