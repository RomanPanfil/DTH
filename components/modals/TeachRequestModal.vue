<template>
    <div class="request-modal">
        <h2 class="request-modal-title">{{ $t('join.title') }}</h2>
        <p class="request-modal-description">
            {{ $t('join.welcome') }}
        </p>
        <ClientOnly>
            <Form v-slot="{ errors }" @submit="handleTeacherRequest">
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
                        <span class="label-required">*</span>
                    </label>
                    <Field
                        name="email"
                        v-model="registerForm.email"
                        type="email"
                        class="ui-input"
                        :class="{ active: emailFocused && registerForm.email, error: errors.email }"
                        :rules="{ required: true, email: true }"
                        @focus="emailFocused = true"
                        @blur="emailFocused = false"
                        :placeholder="$t('placeholders.email')"
                    />
                    <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                </div>
                <button type="submit" class="ui-btn ui-btn__primary ui-btn__block submit-btn">{{ $t('join.send') }}</button>
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
            </Form>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { Form, Field } from 'vee-validate'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '~/stores/auth'
import { useModalsStore } from '~/stores/modals'

const router = useRouter()
const { t } = useI18n()
const modalsStore = useModalsStore()
const authStore = useAuthStore()

const registerForm = reactive<{
    name: string,
    phone: string,
    email: string
}>({
    name: authStore.isAuthenticated ? authStore.userProfile?.NAME || '' : '',
    phone: authStore.isAuthenticated ? authStore.userProfile?.PHONE || '' : '',
    email: authStore.isAuthenticated ? authStore.userProfile?.EMAIL || '' : '',
})

const emailFocused = ref<boolean>(false)
const nameFocused = ref<boolean>(false)
const phoneFocused = ref<boolean>(false)
const teacherRequestId = ref<string | null>(null)
const agreement = ref<boolean>(false)

const emit = defineEmits<{
    (e: 'close'): void
}>()

onMounted(() => {
    if (authStore.isAuthenticated && authStore.userProfile) {
        registerForm.name = authStore.userProfile?.NAME || ''
        registerForm.phone = authStore.userProfile?.PHONE || ''
        registerForm.email = authStore.userProfile?.EMAIL || ''
    }
})

const handleTeacherRequest = async () => {
    try {
        const response = await $fetch('/api/teacher-request', {
            method: 'POST',
            body: registerForm
        })

        if (response.result === 'OK' && response.id) {
            teacherRequestId.value = response.id
            await router.push({ path: '/thank-you', query: { requestId: teacherRequestId.value } })
            emit('close')
        } else {
            console.error('Ошибка отправки заявки:', response.details || response.error)
        }
    } catch (error) {
        console.error('Не удалось отправить заявку:', error.data?.details || error.message)
    }
}
</script>

<style scoped lang="scss">
.request-modal {
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

.submit-btn {
    margin-bottom: p2r(20);
}

.custom-checkbox {
    display: flex;
    align-items: flex-start;
    gap: p2r(10);
}

.checkbox-field {
    margin-bottom: 0;
}

.ui-input {
    &::placeholder {
        display: none;
        opacity: 0;
    }
}
</style>