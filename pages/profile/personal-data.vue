<template>
    <div>
        <h1 class="page-title">{{ $t('account.personalData') }}</h1>
        <Form class="content__form" v-slot="{ errors }" @submit="submitForm">
            <div class="content__grid">
                <div class="form-field">
                    <label class="ui-label">
                        {{ $t('placeholders.name') }}
                        <span class="ui-label-required">*</span>
                    </label>
                    <Field
                        name="name"
                        v-model="profilerForm.name"
                        type="text"
                        class="ui-input"
                        :rules="{ required: true, min: 2, onlyLetters: true }"
                    />
                    <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
                </div>
                <div class="form-field">
                    <label class="ui-label">
                        {{ $t('placeholders.lastName') }}
                        <span class="ui-label-required">*</span>
                    </label>
                    <Field
                        name="last_name"
                        v-model="profilerForm.last_name"
                        type="text"
                        class="ui-input"
                        :rules="{ required: true, min: 2, onlyLetters: true }"
                    />
                    <span v-if="errors.last_name" class="error-message">{{ errors.last_name }}</span>
                </div>
                <div class="form-field">
                    <label class="ui-label">
                        {{ $t('placeholders.Surname') }}
                    </label>
                    <Field
                        name="surname"
                        v-model="profilerForm.surname"
                        type="text"
                        class="ui-input"
                    />
                </div>
                <div class="form-field">
                    <label class="ui-label">
                        {{ $t('placeholders.nameLat') }}
                    </label>
                    <Field
                        name="name_lat"
                        v-model="profilerForm.name_lat"
                        type="text"
                        class="ui-input"
                    />
                </div>
                <div class="form-field">
                    <label class="ui-label">
                        {{ $t('placeholders.lastNameLat') }}
                    </label>
                    <Field
                        name="last_name_lat"
                        v-model="profilerForm.last_name_lat"
                        type="text"
                        class="ui-input"
                    />
                </div>
                <div class="form-field">
                    <label class="ui-label">
                        {{ $t('placeholders.SurnameLat') }}
                    </label>
                    <Field
                        name="surname_lat"
                        v-model="profilerForm.surname_lat"
                        type="text"
                        class="ui-input"
                    />
                </div>
                <div class="form-field birthday-field">
                    <label class="ui-label">
                        {{ $t('placeholders.birthday') }}
                    </label>
                    <div class="birthday-selects">
                        <div class="birthday-input-wrapper">
                            <Field
                                name="birth_day"
                                v-model="profilerForm.birth_day"
                                type="text"
                                class="ui-input birthday-input"
                                maxlength="2"
                                pattern="[0-9]*"
                                @input="restrictToNumbers($event, 'birth_day')"
                            />
                        </div>
                        <div class="custom-select-wrapper">
                            <Field
                                name="birth_month"
                                v-model="profilerForm.birth_month"
                                type="hidden"
                            />
                            <div class="custom-select" @click="toggleDropdown('month')">
                                <div class="custom-select__trigger">
                                    <span>{{ selectedMonthLabel || '' }}</span>
                                    <NuxtIcon name="arrow-down" filled class="custom-select__arrow" />
                                </div>
                                <div v-if="isMonthDropdownOpen" class="custom-select__dropdown">
                                    <div
                                        v-for="month in months"
                                        :key="month.value"
                                        class="custom-select__option"
                                        @click="selectMonth(month)"
                                    >
                                        {{ month.label }}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="birthday-input-wrapper">
                            <Field
                                name="birth_year"
                                v-model="profilerForm.birth_year"
                                type="text"
                                class="ui-input birthday-input"
                                maxlength="4"
                                pattern="[0-9]*"
                                @input="restrictToNumbers($event, 'birth_year')"
                            />
                        </div>
                    </div>
                </div>
                <div class="form-field custom-select-wrapper">
                    <label class="ui-label">
                        {{ $t('placeholders.country') }}
                    </label>
                    <Field
                        name="country"
                        v-model="profilerForm.country"
                        type="hidden"
                    />
                    <div class="custom-select" @click="toggleDropdown('country')">
                        <div class="custom-select__trigger">
                            <span>{{ selectedCountryLabel || '' }}</span>
                            <NuxtIcon name="arrow-down" filled class="custom-select__arrow" />
                        </div>
                        <div v-if="isCountryDropdownOpen" class="custom-select__dropdown">
                            <div
                                v-for="country in countries"
                                :key="country.value"
                                class="custom-select__option"
                                @click="selectCountry(country)"
                            >
                                {{ country.label }}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-field">
                    <label class="ui-label">
                        {{ $t('placeholders.city') }}
                    </label>
                    <Field
                        name="city"
                        v-model="profilerForm.city"
                        type="text"
                        class="ui-input"
                    />
                </div>
                <div class="form-field">
                    <label class="ui-label">
                        {{ $t('placeholders.phone') }}
                        <span class="ui-label-required">*</span>
                    </label>
                    <Field
                        name="phone"
                        v-model="profilerForm.phone"
                        type="tel"
                        class="ui-input"
                        :rules="{ required: true, phoneMaskComplete: true }"
                        ref="phoneInput"
                    />
                    <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
                </div>
                <div class="form-field">
                    <label class="ui-label">
                        {{ $t('placeholders.emailLogin') }}
                        <span class="ui-label-required">*</span>
                    </label>
                    <Field
                        name="email"
                        v-model="profilerForm.email"
                        type="email"
                        class="ui-input"
                        :rules="{ required: true, email: true }"
                        disabled
                    />
                    <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
                </div>
                <div class="form-field">
                    <label class="ui-label">
                        {{ $t('placeholders.password') }}
                    </label>
                    <div class="ui-password-content">
                        <Field
                            name="password"
                            v-model="profilerForm.password"
                            class="ui-input"
                            disabled
                        />
                        <button type="button" class="change-password" @click="changePasswordClick">
                            <NuxtIcon name="edit" filled class="change-password-icon" />
                        </button>
                    </div>
                </div>
            </div>
            <label class="ui-label">
                {{ $t('placeholders.messengers') }}
            </label>
            <div class="content-messengers">
                <div class="form-field">
                    <Field
                        name="telegram"
                        v-model="profilerForm.telegram"
                        type="text"
                        class="ui-input"
                    />
                    <NuxtIcon name="telegram" filled class="ui-input-icon" />
                </div>
                <div class="form-field">
                    <Field
                        name="viber"
                        v-model="profilerForm.viber"
                        type="text"
                        class="ui-input"
                    />
                    <NuxtIcon name="viber" filled class="ui-input-icon" />
                </div>
                <div class="form-field">
                    <Field
                        name="whatsApp"
                        v-model="profilerForm.whatsApp"
                        type="text"
                        class="ui-input"
                    />
                    <NuxtIcon name="whatsApp" filled class="ui-input-icon" />
                </div>
            </div>
            <label class="ui-label">
                {{ $t('placeholders.avatar') }}
            </label>
            <div class="content-avatar">
                <div class="avatar-upload">
                    <input
                        type="file"
                        name="avatar"
                        id="avatar-upload"
                        class="avatar-input"
                        accept="image/jpeg,image/png,image/gif"
                        @change="handleAvatarUpload"
                        :disabled="photoDel"
                    />
                    <label for="avatar-upload" class="ui-btn ui-btn__secondary ui-btn__mid avatar-upload-btn" :class="{ disabled: photoDel }">
                        <span v-if="avatarPreviewUrl" class="avatar-preview">
                            <img :src="avatarPreviewUrl" class="avatar-preview-img" alt="Avatar Preview" />
                            {{ $t('placeholders.avatarChange') }}
                        </span>
                        <span v-else>{{ $t('placeholders.avatarDownload') }}</span>
                    </label>
                    <button type="button" class="avatar-delete" @click="deleteAvatar" v-if="!photoDel && (hasAvatar || avatarPreviewUrl)">
                        {{ $t('placeholders.deleteAvatar') }}
                        <div class="avatar-delete-icon"></div>
                    </button>
                    <span class="avatar-file-name" v-if="!avatarPreviewUrl && !hasAvatar">{{ avatarFileName || $t('placeholders.fileNotSelected') }}</span>
                </div>
            </div>
            <div class="form-field checkbox-field">
                <div class="custom-checkbox">
                    <Field
                        name="promo_agreement"
                        v-model="promoAgreement"
                        type="checkbox"
                        :value="true"
                        :unchecked-value="false"
                        class="checkbox-input"
                    />
                    <span class="checkbox-indicator"></span>
                    <label for="promo_agreement" class="checkbox-label">
                        {{ $t('account.agree') }}
                    </label>
                </div>
            </div>
            <div class="content-save">
                <button type="submit" class="ui-btn ui-btn__primary" :disabled="isSubmitting">
                    {{ isSubmitting ? $t('account.saving') : $t('account.save') }}
                </button>
            </div>
        </Form>
    </div>
</template>

<script setup lang="ts">
import { Field, Form, defineRule } from "vee-validate";
import { reactive, ref, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '~/stores/auth';
import { useNuxtApp } from 'nuxt/app';
import { useRouter } from 'vue-router';
import IMask from 'imask';

const { t } = useI18n();
const authStore = useAuthStore();
const { $toast } = useNuxtApp();
const router = useRouter();
const config = useRuntimeConfig();
const imageBaseUrl = config.public.imageBaseUrl;
import { useModalsStore } from '~/stores/modals';

const modalsStore = useModalsStore();

const isMenuOpen = ref(false);

watch(isMenuOpen, (newValue) => {
    if (newValue === true) {
        document.body.classList.add('non-scroll');
    } else {
        document.body.classList.remove('non-scroll');
    }
});

// Определение кастомного правила валидации для проверки заполненности маски
defineRule('phoneMaskComplete', (value: string) => {
    if (phoneMask.value && !phoneMask.value.masked.isComplete) {
        return t('errors.incompletePhone');
    }
    return true;
});

const profilerForm = reactive<{
    name: string;
    last_name: string;
    surname: string;
    name_lat: string;
    last_name_lat: string;
    surname_lat: string;
    birth_day: string;
    birth_month: string;
    birth_year: string;
    country: string;
    city: string;
    phone: string;
    email: string;
    password: string;
    telegram: string;
    viber: string;
    whatsApp: string;
    avatar?: File;
}>({
    name: '',
    last_name: '',
    surname: '',
    name_lat: '',
    last_name_lat: '',
    surname_lat: '',
    birth_day: '',
    birth_month: '',
    birth_year: '',
    country: '',
    city: '',
    phone: '',
    email: '',
    password: '******',
    telegram: '',
    viber: '',
    whatsApp: ''
});

const avatarFileName = ref<string | null>(null);
const avatarPreviewUrl = ref<string | null>(null);
const photoDel = ref<boolean>(false);
const hasAvatar = ref<boolean>(false);
const isSubmitting = ref<boolean>(false);
const phoneInput = ref<any>(null);
const phoneMask = ref<any>(null);

const countries = ref([
    { label: 'Россия', value: 'Россия' },
    { label: 'Беларусь', value: 'Беларусь' },
    { label: 'Казахстан', value: 'Казахстан' },
    { label: 'Украина', value: 'Украина' },
]);

const months = ref(
    Array.from({ length: 12 }, (_, i) => {
        const monthNumber = (i + 1).toString();
        return {
            label: t(`months.${monthNumber}`),
            value: monthNumber.padStart(2, '0')
        };
    })
);

const dropdownStates = reactive({
    month: false,
    country: false,
});

const selectedMonthLabel = computed(() => {
    const selected = months.value.find(month => month.value === profilerForm.birth_month);
    return selected ? selected.label : '';
});

const selectedCountryLabel = computed(() => {
    const selected = countries.value.find(country => country.value === profilerForm.country);
    return selected ? selected.label : '';
});

const isMonthDropdownOpen = computed(() => dropdownStates.month);
const isCountryDropdownOpen = computed(() => dropdownStates.country);

const toggleDropdown = (type: 'month' | 'country') => {
    Object.keys(dropdownStates).forEach(key => {
        dropdownStates[key] = key === type ? !dropdownStates[key] : false;
    });
};

const selectMonth = (month: { label: string; value: string }) => {
    profilerForm.birth_month = month.value;
    dropdownStates.month = false;
};

const selectCountry = (country: { label: string; value: string }) => {
    profilerForm.country = country.value;
    dropdownStates.country = false;
};

const restrictToNumbers = (event: Event, field: string) => {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '');
    profilerForm[field] = value;
};

const handleAvatarUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        const file = input.files[0];
        if (file.size > 5 * 1024 * 1024) {
            $toast?.error(t('errors.photoTooLarge'));
            return;
        }
        if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
            $toast?.error(t('errors.invalidPhotoType'));
            return;
        }
        profilerForm.avatar = file;
        avatarFileName.value = file.name;
        avatarPreviewUrl.value = URL.createObjectURL(file);
        photoDel.value = false;
    } else {
        profilerForm.avatar = undefined;
        avatarFileName.value = null;
        avatarPreviewUrl.value = null;
    }
};

const deleteAvatar = () => {
    profilerForm.avatar = undefined;
    avatarFileName.value = null;
    avatarPreviewUrl.value = null;
    photoDel.value = true;
};

// Настройка маски для телефона
watch(phoneInput, async (newValue) => {
    if (newValue && newValue.$el) {
        await nextTick();
        const inputElement = newValue.$el;

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
        });

        // Синхронизация начального значения
        if (profilerForm.phone) {
            phoneMask.value.value = profilerForm.phone;
        }
    }
});

// Синхронизация маски при изменении значения через v-model
watch(() => profilerForm.phone, (newValue) => {
    if (phoneMask.value && newValue !== phoneMask.value.value) {
        phoneMask.value.value = newValue;
    }
});

const submitForm = async () => {
    if (!authStore.token) {
        $toast?.error(t('errors.noToken'));
        router.push('/');
        modalsStore.openModal('login');
        return;
    }

    isSubmitting.value = true;

    try {
        const profileData = {
            token: authStore.token,
            name: profilerForm.name,
            last_name: profilerForm.last_name,
            second_name: profilerForm.surname,
            phone: profilerForm.phone,
            link_inst: profilerForm.whatsApp,
            link_fb: profilerForm.viber,
            link_vk: profilerForm.telegram,
            name_en: profilerForm.name_lat,
            last_name_en: profilerForm.last_name_lat,
            second_name_en: profilerForm.surname_lat,
            personal_birthday: profilerForm.birth_year && profilerForm.birth_month && profilerForm.birth_day
                ? `${profilerForm.birth_year}-${profilerForm.birth_month}-${profilerForm.birth_day}`
                : '',
            country: profilerForm.country,
            city: profilerForm.city
        };

        const profileResponse = await $fetch('/api/auth/update-profile', {
            method: 'POST',
            body: profileData
        });

        if (profileResponse.message === 'PROFILE_UPDATED_SUCCESSFULLY') {
            $toast?.success(t('account.profileUpdated'));

            const profileFetch = await $fetch('/api/auth/profile', {
                method: 'POST',
                body: { token: authStore.token }
            });
            authStore.userProfile = profileFetch; // Обновляем профиль в store
            hasAvatar.value = !!profileFetch.PHOTO;
            if (profileFetch.PHOTO && !profilerForm.avatar && !photoDel.value) {
                avatarPreviewUrl.value = `${imageBaseUrl}${profileFetch.PHOTO}`;
            }
        }

        if (profilerForm.avatar || photoDel.value) {
            const formData = new FormData();
            formData.append('token', authStore.token);
            if (photoDel.value) {
                formData.append('photo_del', 'Y');
            } else if (profilerForm.avatar) {
                formData.append('photo', profilerForm.avatar);
            }

            const photoResponse = await $fetch('/api/auth/update-photo', {
                method: 'POST',
                body: formData
            });

            if (photoResponse.message === 'PHOTO_UPDATED_SUCCESSFULLY') {
                $toast?.success(t('account.photoUpdated'));
                const profileFetch = await $fetch('/api/auth/profile', {
                    method: 'POST',
                    body: { token: authStore.token }
                });
                authStore.userProfile = profileFetch; // Обновляем профиль в store после изменения фото
                hasAvatar.value = !!profileFetch.PHOTO;
                profilerForm.avatar = undefined;
                avatarFileName.value = null;
                avatarPreviewUrl.value = profileFetch.PHOTO ? `${imageBaseUrl}${profileFetch.PHOTO}` : null;
                photoDel.value = false;
            }
        }
    } catch (error) {
        console.error('Form submission error:', error);
        let userFriendlyMessage = t('errors.updateFailed');
        if (error.data?.error) {
            switch (error.data.error) {
                case 'ERROR_INVALID_TOKEN':
                    userFriendlyMessage = t('errors.invalidToken');
                    authStore.logout();
                    router.push('/');
                    modalsStore.openModal('login');
                    break;
                case 'ERROR_FIELD_NAME_REQUIRED':
                    userFriendlyMessage = t('errors.nameRequired');
                    break;
                case 'ERROR_FIELD_LAST_NAME_REQUIRED':
                    userFriendlyMessage = t('errors.lastNameRequired');
                    break;
                case 'ERROR_FIELD_PHONE_REQUIRED':
                    userFriendlyMessage = t('errors.phoneRequired');
                    break;
                case 'ERROR_INVALID_PHOTO_TYPE':
                    userFriendlyMessage = t('errors.invalidPhotoType');
                    break;
                case 'ERROR_PHOTO_TOO_LARGE':
                    userFriendlyMessage = t('errors.photoTooLarge');
                    break;
                default:
                    userFriendlyMessage = error.data.statusMessage || t('errors.updateFailed');
            }
        }
        $toast?.error(userFriendlyMessage);
    } finally {
        isSubmitting.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', closeDropdownOnClickOutside);
    if (authStore.token) {
        $fetch('/api/auth/profile', {
            method: 'POST',
            body: { token: authStore.token }
        }).then(response => {
            profilerForm.name = response.NAME || '';
            profilerForm.last_name = response.LAST_NAME || '';
            profilerForm.surname = response.SECOND_NAME || '';
            profilerForm.name_lat = response.NAME_EN || '';
            profilerForm.last_name_lat = response.LAST_NAME_EN || '';
            profilerForm.surname_lat = response.SECOND_NAME_EN || '';
            profilerForm.phone = response.PHONE || '';
            profilerForm.email = response.EMAIL || response.LOGIN || '';
            profilerForm.telegram = response.LINK_VK || '';
            profilerForm.viber = response.LINK_FB || '';
            profilerForm.whatsApp = response.LINK_INST || '';
            if (response.BIRTHDAY) {
                const [year, month, day] = response.BIRTHDAY.split('-');
                profilerForm.birth_year = year;
                profilerForm.birth_month = month;
                profilerForm.birth_day = day;
            }
            profilerForm.country = response.COUNTRY || '';
            profilerForm.city = response.CITY || '';
            hasAvatar.value = !!response.PHOTO;
            if (response.PHOTO) {
                avatarPreviewUrl.value = `${imageBaseUrl}${response.PHOTO}`;
            }
            authStore.userProfile = response;
        }).catch(error => {
            console.error('personal-data: Failed to load profile:', error);

            if (error.data?.error) {
                authStore.logout();
                router.push('/');
                modalsStore.openModal('login');
            }
        });
    }
});

onUnmounted(() => {
    document.removeEventListener('click', closeDropdownOnClickOutside);
    if (avatarPreviewUrl.value && avatarPreviewUrl.value.startsWith('blob:')) {
        URL.revokeObjectURL(avatarPreviewUrl.value);
    }
});

const closeDropdownOnClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select')) {
        Object.keys(dropdownStates).forEach(key => {
            dropdownStates[key] = false;
        });
    }
};

const changePasswordClick = () => {
    modalsStore.openModal('changePassword');
    isMenuOpen.value = false;
};

useHead({
    title: t('account.personalData'),
    meta: [
        { name: 'keywords', content: t('account.personalData') },
        { name: 'description', content: t('account.personalData') },
    ],
});
</script>

<style lang="scss" scoped>
.content {
    &__form {
        display: flex;
        flex-direction: column;
        margin-bottom: p2r(20);
    }

    &__grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        column-gap: p2r(20);

        @media(max-width: 768px) {
            grid-template-columns: repeat(2, 1fr);
        }

        @media(max-width: 599px) {
            grid-template-columns: repeat(1, 1fr);
        }
    }

    .change-password {
        position: absolute;
        right: p2r(15);
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        cursor: pointer;
    }

    .change-password-icon {
        font-size: p2r(24);
        line-height: p2r(24);
        color: #8A8A8A;
    }

    &-messengers {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        column-gap: p2r(20);

        @media(max-width: 768px) {
            grid-template-columns: repeat(2, 1fr);
        }

        @media(max-width: 599px) {
            grid-template-columns: repeat(1, 1fr);
        }
    }

    &-avatar {
        display: flex;
        flex-direction: column;
        gap: p2r(10);
        margin-bottom: p2r(30);
    }

    .avatar-upload {
        display: flex;
        align-items: center;
        gap: p2r(20);
        position: relative;
    }

    .avatar-upload-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        padding-left: p2r(20);
        padding-right: p2r(20);
        height: p2r(40);
        width: auto;
        min-width: p2r(150);
    }

    .avatar-preview {
        display: flex;
        align-items: center;
        gap: 8px;

        &-img {
            width: p2r(28);
            height: p2r(28);
            flex: 0 0 p2r(28);
            border-radius: 50%;
            object-fit: cover;
            object-position: center top;
        }
    }

    .avatar-delete {
        border: none;
        background-color: transparent;
        display: flex;
        align-items: center;
        gap: p2r(8);
        cursor: pointer;
        font-size: p2r(14);
        color: $placeholder;
    }

    .avatar-input {
        display: none;
    }

    .avatar-file-name {
        font-size: p2r(14);
        color: $placeholder;
        letter-spacing: -0.03em;
    }

    .disabled {
        opacity: 0.5;
        pointer-events: none;
    }

    .birthday-field {
        position: relative;
    }

    .birthday-selects {
        display: flex;
        gap: p2r(10);
    }

    .birthday-input-wrapper {
        flex: 0 0 p2r(80);
    }

    .birthday-input {
        text-align: center;
    }

    .custom-select-wrapper {
        position: relative;
        flex: 1;

        &:first-child {
            flex: 0 0 p2r(80);
        }

        &:last-child {
            flex: 0 0 p2r(100);
        }
    }

    .custom-select {
        position: relative;
        width: 100%;
        cursor: pointer;

        &__trigger {
            position: relative;
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: p2r(56);
            background: $bgc-input;
            padding: p2r(17) p2r(40) p2r(18) p2r(16);
            border: 1px solid $border;
            border-radius: p2r(4);
            color: $font;
            transition: .3s border, .3s color;
        }

        &__arrow {
            position: absolute;
            right: p2r(15);
            top: 50%;
            transform: translateY(-50%);
            font-size: p2r(24);
            line-height: p2r(24);
            color: #8A8A8A;
        }

        &__dropdown {
            position: absolute;
            top: 100%;
            left: 0;
            width: 100%;
            background: $bgc;
            border: 1px solid $border;
            border-radius: p2r(4);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            z-index: 10;
            max-height: p2r(200);
            overflow-y: auto;
        }

        &__option {
            padding: p2r(12) p2r(16);
            color: $font;
            transition: background-color 0.3s;

            &:hover {
                background-color: lighten($primary, 40%);
            }
        }
    }

    .error-message {
        color: $error;
        font-size: p2r(12);
        margin-top: p2r(5);
        display: block;
    }
}

.avatar-delete {
    transition: color 0.3s;

    &-icon {
        display: inline-block;
        width: p2r(16);
        height: p2r(16);
        border-radius: 50%;
        background-color: $delete;
        position: relative;
        cursor: pointer;
        opacity: 0;
        transition: opacity 0.3s;

        &::before, &::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            width: p2r(10);
            height: p2r(2);
            border-radius: p2r(2);
            background-color: white;
        }

        &::before {
            transform: translate(-50%, -50%) rotate(45deg);
        }

        &::after {
            transform: translate(-50%, -50%) rotate(-45deg);
        }
    }

    @media (hover: hover) and (pointer: fine) {
        &:hover {
            color: $delete;

            .avatar-delete-icon {
                opacity: 1;
            }
        }
    }
}
</style>