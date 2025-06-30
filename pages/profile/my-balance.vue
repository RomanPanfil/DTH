<template>
    <div>
        <div class="orders-header">
            <h1 class="page-title">{{ $t('accountSidebar.myBalance') }}</h1>
            <div class="orders-balance">
                <div class="orders-balance-icon">
                    <NuxtIcon name="coins" filled />
                </div>
                <div class="orders-balance-content">
                    <div class="orders-balance-title">
                        {{ $t('payments.totalEarned') }}
                    </div>
                    <div class="orders-balance-sum">
                        {{ formattedAmount }} <span class="orders-balance-sum-currency">BYN</span>
                    </div>
                </div>
            </div>
        </div>
        <div v-if="isLoading" class="loading">{{ $t('payments.loading') }}</div>
        <div v-else class="table-wrapper">
            <div class="orders-table">
                <div class="orders-table-header">
                    <div class="header-cell">{{ $t('payments.productName') }}</div>
                    <div class="header-cell">{{ $t('payments.dateTime') }}</div>
                    <div class="header-cell">{{ $t('payments.amount') }}</div>
                    <div class="header-cell">{{ $t('payments.status') }}</div>
                </div>
                <div class="orders-table-body">
                    <div v-for="order in orders" :key="order.ID" class="order-row">
                        <div class="cell">{{ order.COURSE_NAME }}</div>
                        <div class="cell" v-html="formatDate(order.CREATED)"></div>
                        <div class="cell">{{ order.AMOUNT }} BYN</div>
                        <div class="cell">
                            <NuxtIcon v-if="order.PAYMENT_STATUS_ID === '5'" name="apr" filled/>
                            <NuxtIcon v-else name="wt" filled/>
                            {{ order.PAYMENT_STATUS_ID === '5' ? 'Подтверждена' : 'Ожидает подтверждения' }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <Pagination
            v-if="totalPages > 1"
            :current-page="currentPage"
            :total-pages="totalPages"
            @page-change="handlePageChange"
        />
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'nuxt/app';
import { useAuthStore } from '~/stores/auth';
import { useModalsStore } from '~/stores/modals';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const modalsStore = useModalsStore();

const isLoading = ref(true);
const ordersError = ref(null);
const amountError = ref(null);

const currentPage = computed(() => Number(route.query.page) || 1);

// Флаг для предотвращения дублирования запросов
const isDataRefreshed = ref(false);

// Запрос суммы дохода
const { data: amountData, refresh: refreshAmount } = await useAsyncData(
    'lectorAmount',
    async () => {
        try {
            if (!authStore.isAuthenticated || !authStore.token) {
                throw new Error('ERROR_INVALID_TOKEN');
            }

            const response = await $fetch('/api/lector/amount', {
                method: 'POST',
                body: {
                    TOKEN: authStore.token,
                },
            });

            if (response.error) {
                throw new Error(response.error);
            }

            return response.amount || 0;
        } catch (error: any) {
            console.error('Ошибка загрузки суммы дохода:', error);

            if(error.data?.message === 'ERROR_INVALID_TOKEN') {
                authStore.logout();
                await router.push('/');
                modalsStore.openModal('login');
            }
            amountError.value = {
                statusMessage: error.message || t('orders.amountError'),
                statusCode: error.statusCode || 400,
                data: error.data || { error: error.message },
            };
            return 0;
        }
    },
    { watch: [] } // Убрали watch для authToken
);

// Форматирование суммы
const formattedAmount = computed(() => {
    const amount = amountData.value ?? 0;
    return amount.toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
});

// Запрос заказов
const { data: ordersData, refresh: refreshOrders } = await useAsyncData(
    'lectorOrders',
    async () => {
        try {
            isLoading.value = true;
            ordersError.value = null;

            if (!authStore.isAuthenticated || !authStore.token) {
                throw new Error('ERROR_INVALID_TOKEN');
            }

            const response = await $fetch('/api/lector/orders', {
                method: 'POST',
                body: {
                    TOKEN: authStore.token,
                    pager: {
                        start: currentPage.value,
                        limit: 6,
                    },
                },
            });

            if (response.error) {
                throw new Error(response.error);
            }

            return {
                orders: response.orders || [],
                pagination: response.pagination || { PAGE: 1, LIMIT: 6, TOTAL: 0 },
            };
        } catch (error: any) {
            console.error('Ошибка загрузки заказов:', error);
            ordersError.value = {
                statusMessage: error.message || t('orders.error'),
                statusCode: error.statusCode || 400,
                data: error.data || { error: error.message },
            };
            return { orders: [], pagination: { PAGE: 1, LIMIT: 6, TOTAL: 0 } };
        } finally {
            isLoading.value = false;
        }
    },
    { watch: [currentPage] }
);

const orders = computed(() => ordersData.value?.orders || []);
const pagination = computed(() => ({
    total: ordersData.value?.pagination?.TOTAL || 0,
    limit: ordersData.value?.pagination?.LIMIT || 6,
}));
const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.limit));

const formatDate = (dateString: string) => {
    if (!dateString || typeof dateString !== 'string') {
        return t('orders.unknownDate');
    }

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return t('orders.invalidDate');
        }

        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');

        const formattedDate = `${day}.${month}.${year}`;
        const formattedTime = `${hours}:${minutes}`;

        return `${formattedDate} <span class="time">(${formattedTime})</span>`;
    } catch (error) {
        console.error('Ошибка форматирования даты:', error);
        return t('orders.dateError');
    }
};

const handlePageChange = async (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        await router.push({ path: route.path, query: { page } });
        await refreshOrders();
    }
};

onMounted(async () => {
    if (isDataRefreshed.value) return;

    // Проверяем, были ли данные уже загружены
    if (!amountData.value || !ordersData.value) {
        let attempts = 0;
        const maxAttempts = 50;
        const checkInterval = setInterval(() => {
            attempts++;
            if (authStore.token || attempts >= maxAttempts) {
                clearInterval(checkInterval);
                refreshOrders();
                refreshAmount();
                isDataRefreshed.value = true;
            }
        }, 100);

        onUnmounted(() => clearInterval(checkInterval));
    }
});

useHead({
    title: t('accountSidebar.myBalance'),
    meta: [
        { name: 'keywords', content: t('accountSidebar.myBalance') },
        { name: 'description', content: t('accountSidebar.myBalance') },
    ],
});
</script>

<style lang="scss" scoped>
.error-message {
    text-align: center;
    padding: p2r(20);
    color: $error;
}

.table-wrapper {
    @media (max-width: 768px) {
        overflow-x: auto;

        &::-webkit-scrollbar {
            height: p2r(6);
        }

        &::-webkit-scrollbar-track {
            background: #f1f1f1;
            border-radius: p2r(3);
        }

        &::-webkit-scrollbar-thumb {
            background: $primary;
            border-radius: p2r(3);
        }
    }
}
.page-title {
    margin-bottom: 0;
}
.orders {
    &-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: p2r(24);
        margin-bottom: p2r(40);

        @media (max-width: 1024px) {
            margin-bottom: p2r(32);
        }

        @media (max-width: 768px) {
            margin-bottom: p2r(24);
        }

        @media (max-width: 599px) {
            margin-bottom: p2r(12);
        }
    }

    &-balance {
        display: flex;
        gap: p2r(11);
        align-items: center;

        &-icon {
            position: relative;
            width: p2r(48);
            height: p2r(48);
            border-radius: p2r(6);
            border: 1px solid $border;

            .nuxt-icon {
                font-size: p2r(24);
                line-height: p2r(20);
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
        }
        &-title {
            font-weight: 500;
            font-size: p2r(12);
            line-height: 1;
            letter-spacing: -0.03em;
            color: $font-grey;
            margin-bottom: p2r(2);
        }

        &-sum {
            font-weight: 600;
            font-size: p2r(32);
            line-height: 1;
            letter-spacing: -0.03em;

            @media (max-width: 768px) {
                font-size: p2r(28);
            }

            @media (max-width: 599px) {
                font-size: p2r(24);
            }

            &-currency {
                font-weight: 500;
                font-size: p2r(20);
                line-height: 1;
                letter-spacing: -0.03em;
            }
        }
    }
}

.orders-table {
    overflow: hidden;
    margin-top: p2r(24);
    margin-bottom: p2r(40);

    @media (max-width: 768px) {
        font-size: p2r(15);
        min-width: p2r(700);
        margin-bottom: 0;
    }
}

.orders-table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 2fr;
    color: $font-dark-green;
}

.header-cell {
    padding: p2r(20) p2r(30);
    text-align: left;

    @media (max-width: 1366px) {
        padding: p2r(18) p2r(24);
    }

    @media (max-width: 1280px) {
        padding: p2r(16) p2r(20);
    }

    @media (max-width: 599px) {
        padding: p2r(12);
    }
}

.orders-table-body {
    display: grid;
    grid-template-columns: 2fr 1fr 1fr 2fr;
    border: 1px solid $border;
    border-radius: p2r(6);
    box-shadow: 0 4px 35px rgba(114, 142, 174, 0.1);
}

.order-row {
    display: contents;
}

.cell {
    padding: p2r(30);
    border-bottom: 1px solid $border;
    display: flex;

    .nuxt-icon {
        font-size: p2r(24);
        line-height: p2r(20);
        margin-right: p2r(6);
    }

    @media (max-width: 1366px) {
        padding: p2r(24);
    }

    @media (max-width: 1280px) {
        padding: p2r(20);
    }

    @media (max-width: 599px) {
        padding: p2r(12);
    }

    :deep(.time) {
        color: $font-grey;
    }
}

.order-row:last-child .cell {
    border-bottom: none;
}

.loading {
    text-align: center;
    padding: p2r(20);
    color: $font-grey;
}

.no-orders {
    text-align: center;
    padding: p2r(20);
    color: $font-grey;
}
</style>