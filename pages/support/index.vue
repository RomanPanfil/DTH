<template>
    <div class="container">
        <div class="register-container">
            <div class="register-header">
                <div class="register-title">{{ $t('support.title') }}</div>
                <div class="register-header-text">
                    {{ $t('support.solved') }} <NuxtLink to="/" class="login-link">{{ $t('support.toMain') }}</NuxtLink>
                </div>
            </div>
            <ClientOnly>
                <div v-if="!isLoading">
                    <Form v-slot="{ errors }" @submit="handleFeedbackRequest">
                        <div class="form-row">
                            <div class="form-col">
                                <div class="form-field">
                                    <label class="label" :class="{ active: nameFocused && registerForm.name, empty: !registerForm.name }">
                                        {{ $t('placeholders.name') }}
                                    </label>
                                    <Field
                                        name="name"
                                        v-model="registerForm.name"
                                        type="text"
                                        class="ui-input"
                                        :class="{ active: nameFocused && registerForm.name, error: errors.name }"
                                        :rules="{ min: 2, onlyLetters: true }"
                                        @focus="nameFocused = true"
                                        @blur="nameFocused = false"
                                        :placeholder="$t('placeholders.name')"
                                    />
                                    <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
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
                                        :class="{ active: phoneFocused && registerForm.phone, error: errors.phone }"
                                        :rules="{ required: true }"
                                        ref="phoneInput"
                                        @focus="phoneFocused = true"
                                        @blur="phoneFocused = false"
                                        :placeholder="$t('placeholders.phone')"
                                    />
                                    <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
                                </div>
                                <div class="form-field">
                                    <label class="label" :class="{ active: emailFocused && registerForm.email, empty: !registerForm.email }">
                                        {{ $t('placeholders.email') }}
                                    </label>
                                    <Field
                                        name="email"
                                        v-model="registerForm.email"
                                        type="email"
                                        class="ui-input"
                                        :class="{ active: emailFocused && registerForm.email, error: errors.email }"
                                        :rules="{ email: true }"
                                        @focus="emailFocused = true"
                                        @blur="emailFocused = false"
                                        :placeholder="$t('placeholders.email')"
                                    />
                                    <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                                </div>
                            </div>
                            <div class="form-col">
                                <div class="form-field form-field__textarea">
                                    <label class="label" :class="{ active: messageFocused && registerForm.message, empty: !registerForm.message }">
                                        {{ $t('placeholders.message') }}
                                    </label>
                                    <Field
                                        name="message"
                                        v-model="registerForm.message"
                                        as="textarea"
                                        class="ui-textarea"
                                        :class="{ active: messageFocused && registerForm.message, error: errors.message }"
                                        @focus="messageFocused = true"
                                        @blur="messageFocused = false"
                                        :placeholder="$t('placeholders.message')"
                                    />
                                    <span v-if="errors.message" class="error-message">{{ errors.message }}</span>
                                </div>
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
                                        {{ $t('register.agree') }} <NuxtLink to="/user-agreement">{{ $t('register.userAgreement') }}</NuxtLink> {{ $t('register.and') }} <NuxtLink to="/politics">{{ $t('register.politics') }}</NuxtLink>
                                    </label>
                                </div>
                                <span v-if="errors.agreement" class="error-message">{{ errors.agreement }}</span>
                            </div>
                            <button type="submit" class="ui-btn ui-btn__primary ui-btn__block register-btn">{{ $t('support.sendMessage') }}</button>
                        </div>
                    </Form>
                </div>
            </ClientOnly>
        </div>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, watch, nextTick, onMounted } from 'vue'
import { Form, Field } from 'vee-validate'
import IMask from 'imask'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'

const router = useRouter()
const { t } = useI18n()
const authStore = useAuthStore()

const registerForm = reactive<{
    name: string
    phone: string
    email: string
    message: string
}>({
    name: authStore.isAuthenticated ? authStore.userProfile?.NAME || '' : '',
    phone: authStore.isAuthenticated ? authStore.userProfile?.PHONE || '' : '',
    email: authStore.isAuthenticated ? authStore.userProfile?.EMAIL || '' : '',
    message: '',
})

const nameFocused = ref<boolean>(false)
const phoneFocused = ref<boolean>(false)
const emailFocused = ref<boolean>(false)
const messageFocused = ref<boolean>(false)
const agreement = ref<boolean>(false)
const isLoading = ref<boolean>(false)
const feedbackRequestId = ref<string | null>(null)
const phoneInput = ref<any>(null)
const phoneMask = ref<any>(null)

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

onMounted(() => {
    if (authStore.isAuthenticated && authStore.userProfile) {
        registerForm.name = authStore.userProfile?.NAME || ''
        registerForm.phone = authStore.userProfile?.PHONE || ''
        registerForm.email = authStore.userProfile?.EMAIL || ''
    }
})

const handleFeedbackRequest = async () => {
    if (phoneMask.value && !phoneMask.value.masked.isComplete) {
        registerForm.phone = ''
        return
    }

    try {
        const response = await $fetch('/api/feedback-request', {
            method: 'POST',
            body: registerForm
        })

        if (response.result === 'OK' && response.id) {
            feedbackRequestId.value = response.id
            await router.push({ path: '/thank-you', query: { requestId: feedbackRequestId.value } })
        } else {
            console.error('Ошибка отправки заявки:', response.details || response.error)
        }
    } catch (error) {
        console.error('Не удалось отправить заявку:', error.data?.details || error.message)
    }
}
</script>

<style scoped lang="scss">
.register {
    &-container {
        position: relative;
        background-color: $bgc;
        padding: p2r(80) p2r(60);
        border-radius: p2r(32);
        box-shadow: 0 4px 35px rgba(114, 142, 174, 0.1);
        max-width: p2r(860);
        margin: p2r(100) auto;

        @media (max-width: 1366px) {
            padding: p2r(60) p2r(50);
            margin: p2r(70) auto;
        }

        @media (max-width: 1280px) {
            padding: p2r(50) p2r(40);
            margin: p2r(40) auto;
        }

        @media (max-width: 1024px) {
            padding: p2r(32) p2r(32);
            margin: p2r(24) auto;
        }

        @media (max-width: 599px) {
            border-radius: 0;
            margin-left: p2r(-30);
            margin-right: p2r(-30);
        }

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

            @media(max-width: 1366px) {
                width: p2r(18);
            }

            @media(max-width: 1024px) {
                width: p2r(12);
            }

            @media(max-width: 768px) {
                width: p2r(8);
            }
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

.form-col {
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
        //z-index: -1;
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

.form-field__textarea {
    height: calc(100% - 1.25rem);

    .label.empty {
        top: p2r(27);
    }
}

.ui-input {
    &::placeholder {
        display: none;
        opacity: 0;
    }
}
.ui-textarea {
    &::placeholder {
        display: none;
        opacity: 0;
    }
}
</style>