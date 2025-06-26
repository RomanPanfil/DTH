<template>
    <div>
        <h1 class="page-title">Избранное</h1>
        <div v-if="pending" class="loading">
            {{ t('page.loading') }}
        </div>
        <div v-else-if="error" class="error">
            {{ error.message || t('page.errorLoading') }}
        </div>
        <div v-else>
            <div class="sort-tabs">
                <div
                    class="sort-tabs-item"
                    :class="{ active: activeTab === 'courses' }"
                    @click="setActiveTab('courses')"
                >
                    {{ $t('coursesTabs.courses') }}
                </div>
                <div
                    class="sort-tabs-item"
                    :class="{ active: activeTab === 'webinars' }"
                    @click="setActiveTab('webinars')"
                >
                    {{ $t('coursesTabs.webinars') }}
                </div>
            </div>
            <div class="row">
                <div v-for="event in uniqueEvents" :key="event.ID" class="col-lg-4 col-xs-6">
                    <CourcesCard v-if="activeTab === 'courses'" :event="event" :is-fav="true" />
                    <WebinarsCard v-else-if="activeTab === 'webinars'" :event="event" :is-fav="true" />
                </div>
            </div>
            <Pagination
                v-if="totalPages > 1"
                :current-page="currentPage"
                :total-pages="totalPages"
                @page-change="handlePageChange"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'nuxt/app';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '~/stores/auth';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const config = useRuntimeConfig();
const baseUrl = config.public.baseUrl;

const COURSES_IBLOCK_ID = 13;
const WEBINARS_IBLOCK_ID = 19;
const LIMIT = 6;

const activeTab = ref((route.query.tab as string) || 'courses');
const currentPage = computed(() => Number(route.query.page) || 1);

// Получаем актуальный IBLOCK_ID в зависимости от активной вкладки
const currentIblockId = computed(() => {
    return activeTab.value === 'courses' ? COURSES_IBLOCK_ID : WEBINARS_IBLOCK_ID;
});

const authToken = useCookie('auth_token');
const tokenExpires = useCookie('token_expires');

const isAuthenticated = computed(() => {
    if (process.server) {
        if (!authToken.value || !tokenExpires.value) return false;
        try {
            const expiresDate = new Date(tokenExpires.value);
            return !isNaN(expiresDate.getTime()) && expiresDate > new Date();
        } catch {
            return false;
        }
    }
    return authStore.isAuthenticated;
});

const loadServerProfile = async () => {
    if (!authToken.value) return null;

    try {
        const response = await $fetch('/api/auth/profile', {
            method: 'POST',
            body: { token: authToken.value }
        });
        return response;
    } catch (error) {
        console.error('Server profile fetch failed:', error);
        return null;
    }
};

const loadFavoritesData = async () => {
    let userFavorites = [];

    if (process.server) {
        const profile = await loadServerProfile();
        if (profile?.FAVORITES) {
            userFavorites = profile.FAVORITES.map(Number);
        }
    } else {
        if (!authStore.isAuthenticated) {
            return { events: [], pagination: { currentPage: 1, limit: LIMIT, total: 0 } };
        }

        if (!authStore.userProfile) {
            await authStore.fetchProfile();
        }

        userFavorites = authStore.favorites;
    }

    if (!userFavorites.length) {
        return { events: [], pagination: { currentPage: 1, limit: LIMIT, total: 0 } };
    }

    try {
        const response = await $fetch('/api/events', {
            query: { page: currentPage.value, iblockId: currentIblockId.value, GET_ALL_FILES: 'Y' },
            method: 'POST',
            body: {
                params: {
                    filter: { IBLOCK_ID: currentIblockId.value, ACTIVE: 'Y', ID: userFavorites },
                    select: ['NAME', 'IBLOCK_ID', 'ID', 'PROPERTY_*'],
                    pager: { start: currentPage.value, limit: LIMIT },
                },
            },
        });

        if (!response?.events) {
            return { events: [], pagination: { currentPage: 1, limit: LIMIT, total: 0 } };
        }

        const allLectorIds = new Set<number>();
        response.events.forEach((event) => {
            const lectorSet = event.PROPS?.LECTOR_SET?.VALUE;
            if (Array.isArray(lectorSet)) {
                lectorSet.forEach((lector) => {
                    const id = Number(lector.SUB_VALUES?.LECTORS?.VALUE);
                    if (id) allLectorIds.add(id);
                });
            }
        });

        let profiles = {};
        if (allLectorIds.size > 0) {
            profiles = await $fetch('/api/getprofilesbyids', {
                method: 'POST',
                body: { params: { USER_IDS: [...allLectorIds] } },
            });
        }

        response.events = response.events.map((event) => {
            const lectorSet = event.PROPS?.LECTOR_SET?.VALUE;
            if (Array.isArray(lectorSet)) {
                event.lectors = lectorSet
                    .map((lector) => {
                        const id = Number(lector.SUB_VALUES?.LECTORS?.VALUE);
                        return {
                            id,
                            name: profiles[id]
                                ? `${profiles[id].NAME} ${profiles[id].LAST_NAME || ''}`.trim()
                                : t('favorites.unknownLector'),
                        };
                    })
                    .filter((lector) => lector.id);
            } else {
                event.lectors = [];
            }
            return event;
        });

        return response;
    } catch (error) {
        console.error('Error fetching favorite events:', error);
        throw createError({
            statusCode: 500,
            statusMessage: error.message || t('favorites.errorLoading')
        });
    }
};

const { data: eventsData, pending, error, refresh } = await useAsyncData(
    `favorites-${activeTab.value}-${currentPage.value}`,
    loadFavoritesData,
    {
        watch: [currentPage, activeTab],
        server: true,
        client: true,
        default: () => ({ events: [], pagination: { currentPage: 1, limit: LIMIT, total: 0 } })
    }
);

const uniqueEvents = computed(() => {
    const seenIds = new Set();
    return (eventsData.value?.events || []).filter((event) => {
        if (seenIds.has(event.ID)) return false;
        seenIds.add(event.ID);
        return true;
    });
});

const pagination = computed(() => eventsData.value?.pagination || { currentPage: 1, limit: LIMIT, total: 0 });
const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.limit));

const handlePageChange = async (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        await navigateTo({
            path: route.path,
            query: { page, tab: activeTab.value }
        });
    }
};

const setActiveTab = async (tab: string) => {
    if (activeTab.value !== tab) {
        activeTab.value = tab;
        await navigateTo({
            path: route.path,
            query: { page: 1, tab }
        });
    }
};

if (process.client) {
    onMounted(async () => {
        if (!authStore.token && authToken.value) {
            authStore.initialize();
        }

        if (authStore.token && !authStore.userProfile) {
            await authStore.fetchProfile();
            await refresh();
        }
    });

    watch(
        () => authStore.favorites,
        async () => {
            await refresh();
        }
    );
}

// Следим за изменениями query параметров
watch(() => route.query.tab, (newTab) => {
    if (newTab && newTab !== activeTab.value) {
        activeTab.value = newTab as string;
    }
});
</script>

<style lang="scss" scoped>
.loading, .error, .not-authenticated, .no-favorites {
    text-align: center;
}

.error {
    color: $error;
}

.not-authenticated, .no-favorites {
    color: #6c757d;
}
</style>