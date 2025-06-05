<template>
    <header class="header">
        <div class="container">
            <div class="header-wrapper">
                <NuxtLink to="/" class="header-logo">
                    <img src="/images/logo.svg" loading="lazy" alt="DTH Logo" class="header-logo-img" />
                </NuxtLink>
                <nav class="header-nav">
                    <NuxtLink
                        v-for="item in menu"
                        :key="item.ID"
                        :to="item.URL"
                        class="header-nav-link"
                    >
                        {{ item.NAME }}
                    </NuxtLink>
                </nav>
                <form class="header-search" @submit.prevent="handleSearch">
                    <input
                        v-model="searchQuery"
                        type="search"
                        :placeholder="$t('header.searchPlaceholder')"
                        class="ui-input ui-input__search"
                    >
                    <button class="header-search-btn" type="submit">
                        <NuxtIcon name="search" class="header-search-btn-icon" filled />
                    </button>
                </form>
                <button @click="handleAccountClick" class="header-account">
                    <NuxtIcon name="user" class="header-account-icon" filled />
                    {{ $t('header.account') }}
                </button>
                <button @click="toggleMenu" :class="burgerClasses" class="header-burger">
                    <div class="header-burger-icon">
                        <span class="burger-line line-1"></span>
                        <span class="burger-line line-2"></span>
                        <span class="burger-line line-3"></span>
                    </div>
                    меню
                </button>
            </div>
        </div>
    </header>
</template>

<style scoped lang="scss">
.header {
    padding-top: p2r(26);
    padding-bottom: p2r(26);
    background-color: $bgc;
    box-shadow: 0px 4px 35px rgba(114, 142, 174, 0.1);

    @media(max-width: 599px) {
        padding-top: p2r(13);
        padding-bottom: p2r(13);
    }

    &-wrapper {
        display: flex;
        align-items: center;

        @media(max-width: 1366px) {
            justify-content: space-between;
        }
    }

    &-logo {
        margin-right: p2r(60);

        @media(max-width: 1366px) {
            margin-right: p2r(50);
        }

        @media(max-width: 1280px) {
            margin-right: p2r(40);
        }

        &-img {
            max-height: p2r(48);
            display: block;

            @media(max-width: 1366px) {
                max-height: p2r(42);
            }
        }
    }

    &-nav {
        margin-right: p2r(24);

        @media(max-width: 1366px) {
            margin-right: p2r(16);
        }

        @media(max-width: 1024px) {
            display: none;
        }
        &-link {
            font-family: 'Inter';
            font-weight: 500;
            font-size: p2r(18);
            color: $font;
            margin-right: p2r(36);
            text-decoration: none;
            white-space: nowrap;

            @media(max-width: 1680px) {
                font-size: p2r(16);
                margin-right: p2r(24);
            }

            @media(max-width: 1280px) {
                font-size: p2r(14);
                margin-right: p2r(18);
            }
        }
    }

    &-account {
        color: $font-white;
        height: p2r(48);
        line-height: p2r(44);
        background: $primary;
        border: 2px solid $primary;
        border-radius: p2r(4);
        padding-left: p2r(20);
        padding-right: p2r(20);
        display: flex;
        align-items: center;
        white-space: nowrap;
        cursor: pointer;

        @media(max-width: 1280px) {
            font-size: p2r(14);
            padding-left: p2r(12);
            padding-right: p2r(12);
        }

        @media(max-width: 1024px) {
            display: none;
        }

        &-icon {
            width: p2r(22);
            height: p2r(22);
            flex: 0 0 p2r(22);
            font-size: p2r(18);
            border-radius: 50%;
            background: $primary_light;
            color: $primary;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-right: p2r(6);

            @media(max-width: 1280px) {
                width: p2r(20);
                height: p2r(20);
                flex: 0 0 p2r(20);
                font-size: p2r(16);
            }
        }
    }

    &-search {
        position: relative;
        display: flex;
        flex-grow: 1;
        margin-right: p2r(30);

        @media(max-width: 1366px) {
            margin-right: p2r(24);
        }

        @media(max-width: 1280px) {
            margin-right: p2r(20);
        }

        @media(max-width: 1024px) {
            display: none;
        }

        &-btn {
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            border: none;
            background-color: transparent;
            padding-left: p2r(20);
            padding-right: p2r(20);
            color: $font;
            cursor: pointer;

            &-icon {
                font-size: p2r(22);

                @media(max-width: 1280px) {
                    font-size: p2r(18);
                }
            }
        }
    }

    &-burger {
        display: none;
        width: p2r(32);
        font-weight: 600;
        font-size: p2r(8);
        text-transform: uppercase;
        color: $font;
        cursor: pointer;
        background-color: transparent;
        border: none;
        position: relative;

        @media(max-width: 1024px) {
            display: block;
            //flex-direction: column;
            //align-items: center;
            //justify-content: center;
        }

        &-icon {
            width: p2r(32);
            height: p2r(32);
            position: relative;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
        }

        .burger-line {
            width: p2r(18);
            height: p2r(1.25);
            background-color: $font;
            border-radius: p2r(1.25);
            position: absolute;
            transition: all 0.3s ease;
        }

        .line-1 {
            top: 30%;
        }

        .line-2 {
            top: 49%
        }

        .line-3 {
            top: 68%;
            top: 68%;
        }

        &.active {
            .line-1 {
                transform: rotate(45deg);
                top: p2r(14);
            }

            .line-2 {
                opacity: 0;
            }

            .line-3 {
                transform: rotate(-45deg);
                top: p2r(14);
            }
        }
    }
}
</style>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { useLocaleStore } from '~/stores/locale';
import { useAuthStore } from '~/stores/auth';
import { useModalsStore } from '~/stores/modals';
import { useRouter, useRoute } from 'nuxt/app';

const modalsStore = useModalsStore();
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

// Состояние для бургер-меню
const isMenuOpen = ref(false);

const toggleMenu = () => {
    isMenuOpen.value = !isMenuOpen.value;
    console.log(isMenuOpen.value ? 'Menu opened' : 'Menu closed');
};

// Добавляем класс active при открытии меню
const burgerClasses = computed(() => ({
    'header-burger': true,
    'active': isMenuOpen.value
}));

// Поиск
const searchQuery = ref('');

const handleSearch = async () => {
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.trim();

        try {
            const isOnSearchPage = route.path === '/search-result';

            if (isOnSearchPage) {
                await router.push('/');
                setTimeout(() => {
                    router.push({
                        path: '/search-result',
                        query: { query: query }
                    });
                }, 10);
            } else {
                await router.push({
                    path: '/search-result',
                    query: { query: query }
                });
            }

            searchQuery.value = '';
        } catch (error) {
            console.error('Ошибка при навигации:', error);
        }
    }
};

const localeStore = useLocaleStore();
const locale = computed(() => localeStore.locale);

const { data: menuData, error: menuError } = await useFetch('/api/menu', {
    method: 'GET',
    query: { type: 'MENU_TOP' },
});

const menu = computed(() => {
    if (menuError.value) {
        console.error('Ошибка загрузки меню:', menuError.value);
        return [];
    }
    return menuData.value?.menu?.[locale.value] || [];
});

const handleAccountClick = () => {
    if (authStore.isAuthenticated) {
        router.push('/profile');
    } else {
        modalsStore.openModal('login');
    }
};

watch(() => route.query.query, (newQuery) => {
    console.log('Current search query:', newQuery);
});
</script>