<template>
    <div class="container">
        <Breadcrumbs />
        <div class="profile">
            <!-- Sidebar -->
            <div class="row">
                <div class="col-lg-3">
                    <aside class="sidebar">
                        <div class="sidebar-profile">
                            <div class="sidebar-id">Ваш ID {{ userProfile?.ID || 'N/A' }}</div>
                            <div class="sidebar-person">
                                <div class="sidebar-avatar" :style="{ backgroundImage: userProfile?.PHOTO ? `url(${userProfile.PHOTO})` : '' }"></div>
                                <div class="sidebar-name">
                                    {{ userProfile?.NAME || 'Имя' }} {{ userProfile?.LAST_NAME || 'Фамилия' }}
                                </div>
                            </div>
                        </div>
                        <div class="sidebar-main">
                            <nav class="sidebar-nav">
                                <nuxt-link to="/profile/personal-data" class="sidebar-link active">
                                    <NuxtIcon name="person" filled class="sidebar-icon" />
                                    Личные данные
                                </nuxt-link>
                                <nuxt-link to="/profile/certificates" class="sidebar-link">
                                    <NuxtIcon name="story" filled class="sidebar-icon" />
                                    Свидетельства
                                </nuxt-link>
                                <nuxt-link to="/profile/courses" class="sidebar-link">
                                    <NuxtIcon name="calendar-check" filled class="sidebar-icon" />
                                    Курсы
                                </nuxt-link>
                                <nuxt-link to="/profile/webinars" class="sidebar-link">
                                    <NuxtIcon name="calendar-check" filled class="sidebar-icon" />
                                    Вебинары
                                </nuxt-link>
                                <nuxt-link to="/profile/favorites" class="sidebar-link">
                                    <NuxtIcon name="heart" filled class="sidebar-icon" />
                                    Избранное
                                </nuxt-link>
                                <nuxt-link to="/profile/payments" class="sidebar-link">
                                    <NuxtIcon name="credit-card" filled class="sidebar-icon" />
                                    История оплат
                                </nuxt-link>
                                <button class="sidebar-link sidebar-link-button" @click="logout">
                                    <NuxtIcon name="info-error" filled class="sidebar-icon" />
                                    Выйти из аккаунта
                                </button>
                            </nav>
                            <div class="sidebar-help">
                                <button class="ui-btn ui-btn__transparent ui-btn__block sidebar-btn">
                                    <NuxtIcon name="help" filled class="sidebar-icon" />
                                    Помощь
                                </button>
                            </div>
                        </div>
                    </aside>
                </div>
                <div class="col-lg-9">
                    <section class="content">
                        <h1 class="page-title">Личные данные</h1>
                        <Form class="content__form">
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
                                    />
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
                                    />
                                </div>
                                <div class="form-field">
                                    <label class="ui-label">
                                        {{ $t('placeholders.Surname') }}
                                        <span class="ui-label-required">*</span>
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
                                        ref="phoneInput"
                                    />
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
                                    />
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
                                        />
                                        <button
                                            type="button"
                                            class="change-password"
                                        >
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
                                        accept="image/*"
                                        @change="handleAvatarUpload"
                                    />
                                    <label for="avatar-upload" class="ui-btn ui-btn__secondary ui-btn__mid">
                                        {{ $t('placeholders.avatarDownload') }}
                                    </label>
                                    <span class="avatar-file-name">{{ avatarFileName || $t('placeholders.fileNotSelected') }}</span>
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
                                <button type="button" class="ui-btn ui-btn__primary">Сохранить данные</button>
                            </div>
                        </Form>
                    </section>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Field, Form } from "vee-validate";
import { reactive, ref, computed, onMounted, onUnmounted } from "vue";
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';

const { t } = useI18n();
const authStore = useAuthStore();
const router = useRouter();
import { useModalsStore } from '~/stores/modals';

const modalsStore = useModalsStore();
const userProfile = ref(null);
const errorMessage = ref<string | null>(null);
const config = useRuntimeConfig();
const imageBaseUrl = config.public.imageBaseUrl;

// Форма профиля
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
    confirm_password: string;
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
    password: '',
    confirm_password: '',
    telegram: '',
    viber: '',
    whatsApp: ''
});

// Загрузка данных профиля
const fetchProfile = async () => {
    if (!authStore.token) {
        console.error('fetchProfile: No token available, redirecting to home')
        router.push('/')
        modalsStore.openModal('login')
        return
    }

    try {
        console.log('fetchProfile: Sending request to /api/auth/profile with token:', authStore.token)
        const response = await $fetch('/api/auth/profile', {
            method: 'POST',
            body: { token: authStore.token }
        })
        console.log('fetchProfile: Received response:', JSON.stringify(response, null, 2))
        userProfile.value = response

        // Заполняем форму данными из профиля
        profilerForm.name = response.NAME || ''
        profilerForm.last_name = response.LAST_NAME || ''
        profilerForm.surname = response.SECOND_NAME || ''
        profilerForm.name_lat = response.NAME_EN || ''
        profilerForm.last_name_lat = response.LAST_NAME_EN || ''
        profilerForm.surname_lat = response.SECOND_NAME_EN || ''
        profilerForm.phone = response.PHONE || ''
        profilerForm.email = response.EMAIL || response.LOGIN || ''
        profilerForm.telegram = response.LINK_VK || '' // Пример, замените на реальное поле
        profilerForm.viber = response.LINK_FB || '' // Пример, замените на реальное поле
        profilerForm.whatsApp = response.LINK_INST || '' // Пример, замените на реальное поле

        // Разбиваем дату рождения (BIRTHDAY: '1987-02-21')
        if (response.BIRTHDAY) {
            const [year, month, day] = response.BIRTHDAY.split('-')
            profilerForm.birth_year = year
            profilerForm.birth_month = month
            profilerForm.birth_day = day
        }
    } catch (error) {
        console.error('fetchProfile: Request failed:', {
            message: error.message,
            status: error.status,
            data: error.data
        })
        errorMessage.value = error.data?.error || 'Ошибка загрузки профиля'
        if (error.data?.error === 'ERROR_INVALID_TOKEN') {
            authStore.logout()
            router.push('/')
            modalsStore.openModal('login')
        }
    }
};

// Выход из аккаунта
const logout = () => {
    authStore.logout()
    router.push('/')
    modalsStore.openModal('login')
};

// Списки стран и месяцев
const countries = ref([
    { label: 'Россия', value: 'russia' },
    { label: 'Беларусь', value: 'belarus' },
    { label: 'Казахстан', value: 'kazakhstan' },
    { label: 'Украина', value: 'ukraine' },
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

// Выпадающие списки
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

// Ограничение ввода только цифр
const restrictToNumbers = (event: Event, field: string) => {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^0-9]/g, '');
    profilerForm[field] = value;
};

// Обработка загрузки аватара
const avatarFileName = ref<string | null>(null);
const handleAvatarUpload = (event: Event) => {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
        profilerForm.avatar = input.files[0];
        avatarFileName.value = input.files[0].name;
    } else {
        profilerForm.avatar = undefined;
        avatarFileName.value = null;
    }
};

// Закрытие выпадающих списков при клике вне элемента
const closeDropdownOnClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.custom-select')) {
        Object.keys(dropdownStates).forEach(key => {
            dropdownStates[key] = false;
        });
    }
};

onMounted(() => {
    document.addEventListener('click', closeDropdownOnClickOutside);
    fetchProfile();
});

onUnmounted(() => {
    document.removeEventListener('click', closeDropdownOnClickOutside);
});

const showPassword = ref<boolean>(false);
const nameFocused = ref<boolean>(false);
const lastNameFocused = ref<boolean>(false);
const surNameFocused = ref<boolean>(false);
const phoneFocused = ref<boolean>(false);
const emailFocused = ref<boolean>(false);
const passwordFocused = ref<boolean>(false);
const confirmPasswordFocused = ref<boolean>(false);
const agreement = ref<boolean>(false);
const promoAgreement = ref<boolean>(false);
const isRegistered = ref<boolean>(false);
const isActivated = ref<boolean>(false);
const serverPhoneError = ref<string | null>(null);
const serverEmailError = ref<string | null>(null);
const serverPasswordError = ref<string | null>(null);
const phoneInput = ref<any>(null);
const phoneMask = ref<any>(null);
</script>

<style lang="scss" scoped>
.profile {
    margin-bottom: p2r(80);
}
/* Sidebar */
.sidebar {
    background: $bgc;
    box-shadow: 0 4px 35px rgba(114, 142, 174, 0.1);
    border-radius: p2r(6);

    &-profile {
        position: relative;
        display: flex;
        flex-direction: column;
        padding: p2r(30);
        border-bottom: 1px solid $border;
    }

    &-avatar {
        width: p2r(60);
        height: p2r(60);
        flex: 0 0 p2r(60);
        background-color: #F5F5F5;
        border-radius: 50%;
        background-size: cover;
        background-position: center;
    }

    &-name {
        font-weight: 500;
        font-size: p2r(18);
        line-height: 1.3;
        color: #13231E;
    }

    &-id {
        position: absolute;
        right: p2r(8);
        top: p2r(8);
        font-weight: 500;
        font-size: p2r(12);
        margin-left: auto;
    }

    &-person {
        display: flex;
        align-items: center;
        gap: p2r(16);
    }

    &-main {
        padding-top: p2r(30);
        padding-bottom: p2r(30);
    }

    &-nav {
        display: flex;
        flex-direction: column;
        gap: 8px;
        margin-bottom: p2r(46);
    }

    &-link {
        position: relative;
        font-weight: 500;
        letter-spacing: -0.03em;
        color: $font;
        display: flex;
        align-items: center;
        padding: p2r(12) p2r(12) p2r(12) p2r(60);
        text-decoration: none;
        margin-bottom: p2r(15);

        &:last-child {
            margin-bottom: 0;
        }

        &.active {
            &::before {
                content: '';
                width: 4px;
                height: 100%;
                background-color: $primary;
                position: absolute;
                left: 0;
                top: 0;
                border-top-right-radius: p2r(4);
                border-bottom-right-radius: p2r(4);
            }

            .sidebar-icon {
                color: $primary;
            }
        }

        &-button {
            background: none;
            border: none;
            text-align: left;
            cursor: pointer;
        }
    }

    &-icon {
        font-size: p2r(24);
        line-height: p2r(24);
        flex: 0 0 p2r(24);
        color: #4D5452;
        margin-right: p2r(10);
    }

    &-help {
        padding-left: p2r(30);
        padding-right: p2r(30);
    }
}

/* Content */
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
    }

    .avatar-input {
        display: none;
    }

    .avatar-file-name {
        font-size: p2r(14);
        color: $placeholder;
        letter-spacing: -0.03em;
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
}
</style>