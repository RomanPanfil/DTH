<template>
    <div class="container">
        <Breadcrumbs />
        <div class="profile">
            <div class="row">
                <!-- Sidebar -->
                <div class="col-lg-3">
                    <aside class="sidebar">
                        <div class="sidebar-profile">
                            <div class="sidebar-id">Ваш ID {{ userProfile?.ID || 'N/A' }}</div>
                            <div class="sidebar-person">
                                <div class="sidebar-avatar">
                                    <img v-if="userProfile?.PHOTO" :src="`${imageBaseUrl}${userProfile.PHOTO}`" alt="avatar" class="sidebar-avatar-image">
                                </div>
                                <div class="sidebar-name">
                                    {{ userProfile?.NAME || 'Имя' }}<br> {{ userProfile?.LAST_NAME || 'Фамилия' }}
                                </div>
                            </div>
                        </div>
                        <div class="sidebar-main">
                            <nav class="sidebar-nav">
                                <nuxt-link to="/profile/personal-data" class="sidebar-link" active-class="active">
                                    <NuxtIcon name="person" filled class="sidebar-icon" />
                                    {{ $t('accountSidebar.personalData') }}
                                </nuxt-link>
                                <nuxt-link to="/profile/certificates" class="sidebar-link" active-class="active">
                                    <NuxtIcon name="story" filled class="sidebar-icon" />
                                    {{ $t('accountSidebar.certificates') }}
                                </nuxt-link>
                                <nuxt-link to="/profile/courses" class="sidebar-link" active-class="active">
                                    <NuxtIcon name="calendar-check" filled class="sidebar-icon" />
                                    {{ $t('accountSidebar.courses') }}
                                </nuxt-link>
                                <nuxt-link to="/profile/webinars" class="sidebar-link" active-class="active">
                                    <NuxtIcon name="calendar-check" filled class="sidebar-icon" />
                                    {{ $t('accountSidebar.webinars') }}
                                </nuxt-link>
                                <nuxt-link to="/profile/favorites" class="sidebar-link" active-class="active">
                                    <NuxtIcon name="heart" filled class="sidebar-icon" />
                                    {{ $t('accountSidebar.favorites') }}
                                </nuxt-link>
                                <nuxt-link to="/profile/payments" class="sidebar-link" active-class="active">
                                    <NuxtIcon name="credit-card" filled class="sidebar-icon" />
                                    {{ $t('accountSidebar.paymentHistory') }}
                                </nuxt-link>
                                <button class="sidebar-link sidebar-link-button" @click="logout">
                                    <NuxtIcon name="info-error" filled class="sidebar-icon" />
                                    {{ $t('accountSidebar.logout') }}
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
                <!-- Content -->
                <div class="col-lg-9">
                    <section class="content">
                        <NuxtPage />
                    </section>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { useRouter } from 'vue-router';
import { ref, onMounted, watch } from 'vue';
import { useModalsStore } from '~/stores/modals';

const modalsStore = useModalsStore();
const authStore = useAuthStore();
const router = useRouter();
const userProfile = ref(null);
const config = useRuntimeConfig();
const imageBaseUrl = config.public.imageBaseUrl;

const fetchProfile = async () => {
    if (!authStore.token) {
        console.error('fetchProfile: No token available, redirecting to login')
        router.push('/')
        modalsStore.openModal('login')
        return
    }

    try {
        // console.log('fetchProfile: Sending request to /api/auth/profile with token:', authStore.token)
        const response = await $fetch('/api/auth/profile', {
            method: 'POST',
            body: { token: authStore.token }
        })
        // console.log('fetchProfile: Received response:', JSON.stringify(response, null, 2))
        userProfile.value = response
    } catch (error) {
        console.error('fetchProfile: Request failed:', {
            message: error.message,
            status: error.status,
            data: error.data
        })
        if (error.data?.error === 'ERROR_INVALID_TOKEN') {
            authStore.logout()
            router.push('/')
            modalsStore.openModal('login')
        }
    }
};

const logout = () => {
    authStore.logout()
    router.push('/')
    modalsStore.openModal('login')
};

onMounted(() => {
    fetchProfile()
});

// Синхронизация с userProfile из authStore
watch(() => authStore.userProfile, (newProfile) => {
    userProfile.value = newProfile;
}, { immediate: true });
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
    margin-right: p2r(30);

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
        overflow: hidden;
        flex: 0 0 p2r(60);
        background-color: #F5F5F5;
        border-radius: 50%;
        background-size: p2r(32);
        background-repeat: no-repeat;
        background-position: center;
        background-image: url('data:image/svg+xml,<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.9983 16.4C11.3879 16.4 7.50618 19.52 6.34946 23.7639C5.96217 25.1848 7.19226 26.4 8.66502 26.4H23.3316C24.8044 26.4 26.0346 25.1848 25.6472 23.7639C24.4906 19.52 20.6088 16.4 15.9983 16.4Z" fill="%234D5452" stroke="%234D5452" stroke-width="1.25" stroke-linecap="round"/><path d="M20.6653 7.73332C20.6653 10.3107 18.576 12.4 15.9986 12.4C13.4213 12.4 11.332 10.3107 11.332 7.73332C11.332 5.15598 13.4213 3.06665 15.9986 3.06665C18.576 3.06665 20.6653 5.15598 20.6653 7.73332Z" fill="%234D5452" stroke="%234D5452" stroke-width="1.25" stroke-linecap="round"/></svg>');

        &-image {
            object-fit: cover;
            object-position: top center;
            width: 100%;
            height: 100%;
        }
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
                transition: color 0.3s;
            }
        }

        @media (hover: hover) and (pointer: fine) {
            &:hover {
                color: $primary;

                .sidebar-icon {
                    color: $primary;
                }
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
        line-height: p2r(22);
        flex: 0 0 p2r(24);
        color: #4D5452;
        margin-right: p2r(10);
    }

    &-help {
        padding-left: p2r(30);
        padding-right: p2r(30);

        .ui-btn {
            @media (hover: hover) and (pointer: fine) {
                &:hover {
                    .sidebar-icon {
                        color: $primary;
                    }
                }
            }
        }
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