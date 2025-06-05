<template>
    <div>
        <h1 class="page-title">{{ $t('accountSidebar.paymentHistory') }}</h1>
        <div v-if="isLoading" class="loading">Загрузка...</div>
        <div v-else-if="orders.length === 0" class="no-orders">Нет заказов</div>
        <div v-else class="orders-table">
            <div class="orders-table-header">
                <div class="header-cell">Дата и время</div>
                <div class="header-cell">Сумма</div>
                <div class="header-cell">Метод оплаты</div>
                <div class="header-cell">Название продукта</div>
            </div>
            <div class="orders-table-body">
                <div v-for="order in orders" :key="order.ID" class="order-row">
                    <div class="cell" v-html="formatDate(order.CREATED)"></div>
                    <div class="cell">{{ order.AMOUNT }} BYN</div>
                    <div class="cell">{{ order.PAYMENT_METHOD }}</div>
                    <div class="cell">{{ order.COURSE_NAME }}</div>
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
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'nuxt/app';
import { useAuthStore } from '~/stores/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const orders = ref([]);
const isLoading = ref(true);

const currentPage = computed(() => Number(route.query.page) || 1);
const pagination = ref({ total: 0, limit: 10 });
const totalPages = computed(() => Math.ceil(pagination.value.total / pagination.value.limit));

const formatDate = (dateString: string) => {
    if (!dateString || typeof dateString !== 'string') {
        return 'Дата неизвестна';
    }

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            return 'Неверный формат даты';
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
        return 'Ошибка даты';
    }
};

const fetchOrders = async (page: number) => {
    isLoading.value = true;
    if (!authStore.isAuthenticated || !authStore.token) {
        console.log('Пользователь не авторизован или токен отсутствует');
        isLoading.value = false;
        return;
    }

    try {
        const { data, error } = await useFetch('/api/orders/get', {
            method: 'POST',
            body: {
                token: authStore.token,
                pager: {
                    start: page,
                    limit: 6,
                },
            },
        });

        if (error.value) {
            console.error('Ошибка при получении заказов:', error.value);
        } else if (data.value) {
            orders.value = data.value.orders || [];
            pagination.value.total = data.value.pagenav?.TOTAL || 0;
            pagination.value.limit = data.value.pagenav?.LIMIT || 10;
            console.log('Полученные заказы:', data.value);
        } else {
            console.log('Заказы не найдены');
        }
    } catch (err) {
        console.error('Неожиданная ошибка при запросе заказов:', err);
    } finally {
        isLoading.value = false;
    }
};

const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
        router.push({ path: route.path, query: { page } });
        fetchOrders(page);
    }
};

onMounted(async () => {
    let attempts = 0;
    const maxAttempts = 50; // ~5 секунд с интервалом 100ms
    const checkInterval = setInterval(() => {
        attempts++;
        if (authStore.token || attempts >= maxAttempts) {
            clearInterval(checkInterval);
            fetchOrders(currentPage.value);
        }
    }, 100);

    onUnmounted(() => clearInterval(checkInterval));
});
</script>

<style lang="scss" scoped>
.orders-table {
    overflow: hidden;
    margin-top: p2r(24);
    margin-bottom: p2r(40);
}

.orders-table-header {
    display: grid;
    grid-template-columns: 2fr 1fr 2fr 3fr;
    color: $font-dark-green;
}

.header-cell {
    padding: p2r(20) p2r(30);
    text-align: left;
}

.orders-table-body {
    display: grid;
    grid-template-columns: 2fr 1fr 2fr 3fr;
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

    :deep(.time) {
        color: $font-grey;
    }

    span {
        color: yellow;
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