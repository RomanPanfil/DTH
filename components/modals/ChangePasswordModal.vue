<template>
    <div class="change-modal">
        <h2 class="change-modal-title">{{ $t('titles.changePassword') }}</h2>
        <ClientOnly>
            <Form v-slot="{ errors }" @submit="savePassword">
                <div class="form-field">
                    <label class="label" :class="{ active: oldPasswordFocused && passwordForm.oldPassword, empty: !passwordForm.oldPassword }">
                        {{ $t('placeholders.oldPassword') }}
                    </label>
                    <Field
                        name="oldPassword"
                        v-model="passwordForm.oldPassword"
                        :type="showOldPassword ? 'text' : 'password'"
                        class="ui-input"
                        :class="{ active: oldPasswordFocused && passwordForm.oldPassword, error: errors.oldPassword }"
                        :rules="{ required: true, min: 6 }"
                        @focus="oldPasswordFocused = true"
                        @blur="oldPasswordFocused = false"
                    />
                    <button
                        type="button"
                        class="toggle-password"
                        @click="showOldPassword = !showOldPassword"
                        aria-label="Показать/скрыть пароль"
                    >
                        <NuxtIcon v-if="showOldPassword" name="eye-visible" filled class="toggle-password-icon" />
                        <NuxtIcon v-else name="eye-hidden" filled class="toggle-password-icon" />
                    </button>
                    <span v-if="errors.oldPassword" class="error-message">{{ errors.oldPassword }}</span>
                </div>
                <div class="form-field">
                    <label class="label" :class="{ active: newPasswordFocused && passwordForm.newPassword, empty: !passwordForm.newPassword }">
                        {{ $t('placeholders.newPassword') }}
                    </label>
                    <Field
                        name="newPassword"
                        v-model="passwordForm.newPassword"
                        :type="showNewPassword ? 'text' : 'password'"
                        class="ui-input"
                        :class="{ active: newPasswordFocused && passwordForm.newPassword, error: errors.newPassword }"
                        :rules="{ required: true, min: 6 }"
                        @focus="newPasswordFocused = true"
                        @blur="newPasswordFocused = false"
                    />
                    <button
                        type="button"
                        class="toggle-password"
                        @click="showNewPassword = !showNewPassword"
                        aria-label="Показать/скрыть пароль"
                    >
                        <NuxtIcon v-if="showNewPassword" name="eye-visible" filled class="toggle-password-icon" />
                        <NuxtIcon v-else name="eye-hidden" filled class="toggle-password-icon" />
                    </button>
                    <span v-if="errors.newPassword" class="error-message">{{ errors.newPassword }}</span>
                </div>
                <div class="form-field">
                    <label class="label" :class="{ active: repeatPasswordFocused && passwordForm.repeatPassword, empty: !passwordForm.repeatPassword }">
                        {{ $t('placeholders.newPasswordRepeat') }}
                    </label>
                    <Field
                        name="repeatPassword"
                        v-model="passwordForm.repeatPassword"
                        :type="showRepeatPassword ? 'text' : 'password'"
                        class="ui-input"
                        :class="{ active: repeatPasswordFocused && passwordForm.repeatPassword, error: errors.repeatPassword }"
                        :rules="{ required: true, min: 6, confirmed: '@newPassword' }"
                        @focus="repeatPasswordFocused = true"
                        @blur="repeatPasswordFocused = false"
                    />
                    <button
                        type="button"
                        class="toggle-password"
                        @click="showRepeatPassword = !showRepeatPassword"
                        aria-label="Показать/скрыть пароль"
                    >
                        <NuxtIcon v-if="showRepeatPassword" name="eye-visible" filled class="toggle-password-icon" />
                        <NuxtIcon v-else name="eye-hidden" filled class="toggle-password-icon" />
                    </button>
                    <span v-if="errors.repeatPassword" class="error-message">{{ errors.repeatPassword }}</span>
                </div>
                <button type="submit" class="ui-btn ui-btn__primary ui-btn__block change-modal-btn">
                    {{ $t('recover.changePass') }}
                </button>
                <button class="ui-btn ui-btn__transparent ui-btn__block" @click="emit('close')">
                    {{ $t('recover.cancel') }}
                </button>
                <span v-if="serverError" class="server-error">{{ serverError }}</span>
            </Form>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import {reactive, ref, watch} from 'vue'
import { Form, Field } from 'vee-validate'
import { useAuthStore } from '@/stores/auth'
import { useI18n } from 'vue-i18n'

const authStore = useAuthStore()
const { t } = useI18n()

const modalsStore = useModalsStore();

const isMenuOpen = ref(false);

watch(isMenuOpen, (newValue) => {
    if (newValue === true) {
        document.body.classList.add('non-scroll');
    } else {
        document.body.classList.remove('non-scroll');
    }
});

const passwordForm = ref({
    oldPassword: '',
    newPassword: '',
    repeatPassword: '',
})

const showOldPassword = ref(false)
const showNewPassword = ref(false)
const showRepeatPassword = ref(false)

const oldPasswordFocused = ref(false)
const newPasswordFocused = ref(false)
const repeatPasswordFocused = ref(false)

const serverError = ref(null)

const emit = defineEmits(['close'])

const allowedErrors = [
    'ERROR_FIELD_REQUIRED',
    'ERROR_INVALID_TOKEN',
    'ERROR_CURRENT_PASSWORD',
    'ERROR_CONFIRM_PASSWORD',
    'Incorrect method',
    'Incorrect type',
    'Action is not defined',
    'Invalid API key'
]

const savePassword = async () => {
    serverError.value = null

    try {
        const response = await $fetch.raw('/api/auth/change-password', {
            method: 'POST',
            body: {
                token: authStore.token,
                current_password: passwordForm.value.oldPassword,
                new_password: passwordForm.value.newPassword,
                confirm_password: passwordForm.value.repeatPassword
            }
        })

        if (response._data?.message === 'PASSWORD_CHANGED_SUCCESSFULLY') {
            emit('close')
            modalsStore.openModal('changePasswordSuccess');
            isMenuOpen.value = false;
        } else {
            const errorCode = response._data?.error || 'Unknown error'
            if (allowedErrors.includes(errorCode)) {
                serverError.value = t(`errors.${errorCode}`)
            }
            console.error('Ошибка смены пароля:', response._data?.details || errorCode)
        }
    } catch (error) {
        const errorCode = error.data?.data?.error || 'Unknown error'

        if (allowedErrors.includes(errorCode)) {
            serverError.value = t(`errors.${errorCode}`)
        } else {
            serverError.value = t('errors.unknownError')
        }
        console.error('Не удалось сменить пароль:', error.data?.details || errorCode)
    }
}
</script>

<style scoped lang="scss">
.change-modal {
    padding: p2r(80) p2r(60);

    @media(max-width: 599px) {
        padding: p2r(60) p2r(24) p2r(24) p2r(24);
        width: 100%;
    }

    &-title {
        font-weight: 500;
        font-size: p2r(32);
        text-align: center;
        color: $font-dark-grey;
        margin-bottom: p2r(32);
    }

    &-btn {
        margin-top: p2r(12);
        margin-bottom: p2r(12);
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

.error-message {
    color: $error;
    font-size: p2r(12);
    margin-top: p2r(4);
    display: block;
}

.server-error {
    color: $error;
    font-size: p2r(12);
    margin-top: p2r(4);
    display: block;
}
</style>