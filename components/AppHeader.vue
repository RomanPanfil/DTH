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
        &-link {
            font-family: 'Inter';
            font-weight: 500;
            font-size: p2r(18);
            color: $font;
            margin-right: p2r(36);
            text-decoration: none;

            @media(max-width: 1680px) {
                font-size: p2r(16);
                margin-right: p2r(24);
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
        cursor: pointer;

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
        }
    }

    &-search {
        position: relative;
        display: flex;
        flex-grow: 1;
        margin-right: p2r(30);

        @media(max-width: 1366px) {
            max-width: p2r(260);
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

// Поиск
const searchQuery = ref('');

const handleSearch = async () => {
    if (searchQuery.value.trim()) {
        // Сохраняем текущий запрос
        const query = searchQuery.value.trim();

        try {
            // Проверяем, находимся ли мы уже на странице результатов поиска
            const isOnSearchPage = route.path === '/search-result';

            if (isOnSearchPage) {
                // Сначала переходим на промежуточную страницу
                await router.push('/'); // Можно использовать любую другую страницу

                // Затем сразу возвращаемся на страницу поиска с новым запросом
                setTimeout(() => {
                    router.push({
                        path: '/search-result',
                        query: { query: query }
                    });
                }, 10);
            } else {
                // Стандартный переход на страницу поиска
                await router.push({
                    path: '/search-result',
                    query: { query: query }
                });
            }

            // Очистка инпута после перехода
            searchQuery.value = '';
        } catch (error) {
            console.error('Ошибка при навигации:', error);
        }
    }
};

// Получаем текущий язык из стора
const localeStore = useLocaleStore();
const locale = computed(() => localeStore.locale);

// Загружаем меню MENU_TOP
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

// Обработка клика по кнопке аккаунта
const handleAccountClick = () => {
    if (authStore.isAuthenticated) {
        router.push('/profile');
    } else {
        modalsStore.openModal('login');
    }
};

// Отслеживаем изменения параметра query в URL
watch(() => route.query.query, (newQuery) => {
    console.log('Current search query:', newQuery);
});
</script>