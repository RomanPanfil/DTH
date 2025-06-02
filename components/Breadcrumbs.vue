<template>
    <nav class="breadcrumbs" aria-label="Breadcrumb">
        <ol class="breadcrumbs-list">
            <li v-for="(crumb, index) in computedBreadcrumbs" :key="crumb.path" class="breadcrumbs-item">
                <NuxtLink
                    v-if="index < computedBreadcrumbs.length - 1"
                    :to="crumb.path"
                    class="breadcrumbs-link"
                >
                    {{ crumb.name }}
                </NuxtLink>
                <span v-else class="breadcrumbs-current">
                    {{ crumb.name }}
                </span>
                <span v-if="index < computedBreadcrumbs.length - 1" class="breadcrumbs-separator"></span>
            </li>
        </ol>
    </nav>
</template>

<style scoped lang="scss">
.breadcrumbs {
    padding: 0;
    margin-bottom: p2r(70);

    &-list {
        display: flex;
        flex-wrap: wrap;
    }

    &-item {
        display: flex;
        align-items: center;
    }

    &-link {
        color: $bgc-dark;

        &:hover {
            color: $placeholder;
        }
    }

    &-current {
        color: $placeholder;
    }

    &-separator {
        margin: 0 p2r(8);
        color: $font-white-dark;
        width: p2r(20);
        height: p2r(1);
        background-color: $font-black;
    }
}
</style>

<script setup lang="ts">
import { useRoute } from 'nuxt/app';
import { useI18n } from 'vue-i18n';
import { useLocaleStore } from '~/stores/locale';

const { newsTitle, eventTitle } = defineProps<{
    items?: { name: string; path: string }[];
    newsTitle?: string;
    eventTitle?: string;
}>();

const route = useRoute();
const { t } = useI18n();
const localeStore = useLocaleStore();
const locale = computed(() => localeStore.locale);

// Получаем рубрики для журнала
const { data: rubricsData } = await useFetch('/api/rubrics');
const rubrics = computed(() => rubricsData.value?.rubrics || []);

// Получаем меню
const { data: menuTopData } = await useFetch('/api/menu', {
    method: 'GET',
    query: { type: 'MENU_TOP' },
});
const { data: menuBottomData } = await useFetch('/api/menu', {
    method: 'GET',
    query: { type: 'MENU_BOTTOM' },
});
const { data: menuTehData } = await useFetch('/api/menu', {
    method: 'GET',
    query: { type: 'MENU_TEH' },
});

const menuTop = computed(() => menuTopData.value?.menu?.[locale.value] || []);
const menuBottom = computed(() => menuBottomData.value?.menu?.[locale.value] || []);
const menuTeh = computed(() => menuTehData.value?.menu?.[locale.value] || []);

const allMenuItems = computed(() => [
    ...menuTop.value,
    ...menuBottom.value,
    ...menuTeh.value,
]);

const getRubricName = (sectionCode) => {
    if (!sectionCode) return null;
    const rubric = rubrics.value.find((r) => r.CODE === sectionCode);
    return rubric ? rubric.UF_SHORT_NAME || rubric.NAME : null;
};

const computedBreadcrumbs = computed(() => {
    const crumbs = [{ name: t('breadcrumbs.home'), path: '/' }];

    // Логика для страницы оплаты
    if (route.path === '/payment') {
        crumbs.push({ name: t('breadcrumbs.payment'), path: '/payment' });
        return crumbs;
    }

    // Логика для страницы поиска
    if (route.path.startsWith('/search-result')) {
        crumbs.push({ name: t('breadcrumbs.search-result'), path: '/search-result' });
        return crumbs;
    }

    // Логика для других страниц через меню
    const currentMenuItem = allMenuItems.value.find((item) => {
        const normalizedItemUrl = item.URL.endsWith('/') ? item.URL : `${item.URL}/`;
        const normalizedRoutePath = route.path.endsWith('/') ? route.path : `${route.path}/`;
        return normalizedItemUrl === normalizedRoutePath;
    });

    if (currentMenuItem) {
        crumbs.push({ name: currentMenuItem.NAME, path: currentMenuItem.URL });
        return crumbs;
    }

    // Логика для профиля
    if (route.path.startsWith('/profile')) {
        crumbs.push({ name: t('breadcrumbs.profile'), path: '/profile/personal-data' });

        const profilePages = {
            'personal-data': t('accountSidebar.personalData'),
            'certificates': t('accountSidebar.certificates'),
            'courses': t('accountSidebar.courses'),
            'webinars': t('accountSidebar.webinars'),
            'favorites': t('accountSidebar.favorites'),
            'payments': t('accountSidebar.paymentHistory'),
        };

        const currentPage = route.path.split('/').pop();
        if (currentPage && profilePages[currentPage]) {
            crumbs.push({ name: profilePages[currentPage], path: route.path });
        }

        return crumbs;
    }

    // Логика для мероприятий
    if (route.path.startsWith('/courses')) {
        crumbs.push({ name: t('breadcrumbs.courses'), path: '/courses' });

        // Добавляем название конкретного мероприятия, если есть eventTitle
        if (eventTitle && route.path !== '/courses') {
            crumbs.push({ name: eventTitle, path: route.path });
        }

        return crumbs;
    }

    // Логика для журнала
    if (route.path.startsWith('/journal')) {
        crumbs.push({ name: t('breadcrumbs.journal'), path: '/journal' });

        const sectionCode = route.params.section;
        if (sectionCode) {
            const rubricName = getRubricName(sectionCode);
            if (rubricName) {
                crumbs.push({ name: rubricName, path: `/journal/${sectionCode}` });
            }
        }

        if (newsTitle && route.params.code) {
            crumbs.push({ name: newsTitle, path: route.path });
        }
    }
    return crumbs;
});
</script>