<template>
    <div class="container">
        <div class="payment-container">
            <div class="payment-header">
                <div class="payment-title">Заказ сформирован</div>
            </div>
            <div v-if="order" class="order-details">
                <!-- Динамическое отображение текста для всех методов оплаты -->
                <div v-if="parsedSuccessText">
                    <div v-for="(paragraph, index) in parsedSuccessText" :key="index">
                        <p>
                            <template v-for="(part, partIndex) in paragraph" :key="partIndex">
                                <span v-if="part.type === 'text'" v-html="part.content"></span>
                                <NuxtLink v-else-if="part.type === 'link'" :to="part.url">{{ part.text }}</NuxtLink>
                            </template>
                        </p>
                    </div>
                </div>
                <p v-else-if="order.paymentMethod === 1">Ваш заказ появится в <NuxtLink to="/profile/personal-data">личном кабинете</NuxtLink></p>
            </div>
            <div v-else class="order-details">
                <p>Загрузка данных заказа...</p>
            </div>
            <div class="payment-btns">
                <NuxtLink to="/" class="ui-btn ui-btn__primary payment-btn">
                    На главную
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useLocaleStore } from '~/stores/locale';
import { useCookie } from '#imports';

const order = ref<any>(null);
const cardSuccessText = ref<string | null>(null);
const cashlessSuccessText = ref<string | null>(null);
const eripSuccessText = ref<string | null>(null);
const freeSuccessText = ref<string | null>(null);

const localeStore = useLocaleStore();
const locale = computed(() => localeStore.locale);

// Чтение данных из куки
const orderCookie = useCookie('orderData', {
    maxAge: 60 * 60 * 24, // 24 часа
    path: '/',
    sameSite: 'lax',
});

onMounted(() => {
    order.value = orderCookie.value || null;
});

const { data: settings, error: settingsError } = await useFetch('/api/settings', {
    method: 'POST',
    body: {},
});

if (settings.value) {
    if (locale.value === 'RU') {
        cardSuccessText.value = settings.value.CARD_SUCCESS?.VALUE_RU;
        cashlessSuccessText.value = settings.value.CASHLESS_SUCCESS?.VALUE_RU;
        eripSuccessText.value = settings.value.ERIP_SUCCESS?.VALUE_RU;
        freeSuccessText.value = settings.value.FREE_SUCCESS?.VALUE_RU;
    }
} else if (settingsError.value) {
    console.error('Ошибка загрузки настроек:', settingsError.value);
}

// Универсальный парсер для всех типов оплаты
const parsedSuccessText = computed(() => {
    let textToParse: string | null = null;

    // Выбор текста в зависимости от paymentMethod
    if (order.value?.paymentMethod === 1 && cardSuccessText.value) {
        textToParse = cardSuccessText.value;
    } else if (order.value?.paymentMethod === 2 && eripSuccessText.value) {
        textToParse = eripSuccessText.value;
    } else if (order.value?.paymentMethod === 3 && cashlessSuccessText.value) {
        textToParse = cashlessSuccessText.value;
    } else if (order.value?.paymentMethod === 4 && freeSuccessText.value) {
        textToParse = freeSuccessText.value;
    }

    if (!textToParse) return null;

    const paragraphs = textToParse
        .split('</p>')
        .map(p => p.replace('<p>', '').trim())
        .filter(p => p.length > 0);

    return paragraphs.map(paragraph => {
        const parts = [];
        let currentText = paragraph;

        // Обработка {{profile}}
        const profilePlaceholder = '{{profile}}';
        let profileIndex = currentText.indexOf(profilePlaceholder);
        if (profileIndex !== -1) {
            if (profileIndex > 0) {
                parts.push({
                    type: 'text',
                    content: currentText.substring(0, profileIndex)
                });
            }
            parts.push({
                type: 'link',
                url: '/profile/personal-data',
                text: 'профиле'
            });
            currentText = currentText.substring(profileIndex + profilePlaceholder.length);
        }

        // Обработка {{orderId}}
        const orderIdPlaceholder = '{{orderId}}';
        const orderIdIndex = currentText.indexOf(orderIdPlaceholder);
        if (orderIdIndex !== -1) {
            if (orderIdIndex > 0) {
                parts.push({
                    type: 'text',
                    content: currentText.substring(0, orderIdIndex)
                });
            }
            parts.push({
                type: 'text',
                content: order.value?.orderId?.toString() || 'N/A'
            });
            const afterOrderId = currentText.substring(orderIdIndex + orderIdPlaceholder.length);
            if (afterOrderId.length > 0) {
                parts.push({
                    type: 'text',
                    content: afterOrderId
                });
            }
        } else if (currentText.length > 0) {
            parts.push({
                type: 'text',
                content: currentText
            });
        }

        return parts;
    });
});
</script>

<style scoped lang="scss">
.payment {
    &-container {
        position: relative;
        background-color: $bgc;
        padding: p2r(80) p2r(60);
        border-radius: p2r(32);
        box-shadow: 0px 4px 35px rgba(114, 142, 174, 0.1);
        max-width: p2r(860);
        margin: p2r(100) auto;

        &::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            transform: translate(-100%, -50%);
            background-color: $primary;
            width: p2r(21);
            height: 70%;
            border-top-left-radius: p2r(4);
            border-bottom-left-radius: p2r(4);

            @media(max-width: 1366px) {
                width: p2r(18);
            }

            @media(max-width: 1024px) {
                width: p2r(12);
            }

            @media(max-width: 768px) {
                width: p2r(8);
            }
        }

        @media(max-width: 1366px) {
            margin: p2r(80) auto;
        }

        @media(max-width: 1280px) {
            margin: p2r(60) auto;
        }

        @media(max-width: 1024px) {
            padding: p2r(70) p2r(50);
            margin: p2r(40) auto;
        }

        @media(max-width: 992px) {
            padding: p2r(60) p2r(40);
            border-radius: p2r(24);
            margin: p2r(32) auto;
        }

        @media(max-width: 768px) {
            padding: p2r(32) p2r(24);
            margin: p2r(24) auto;
        }
    }

    &-header {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: p2r(6);
        align-items: center;
        margin-bottom: p2r(40);
        padding-bottom: p2r(16);
        border-bottom: 1px solid $border;

        @media (max-width: 768px) {
            margin-bottom: p2r(32);
        }

        @media (max-width: 599px) {
            margin-bottom: p2r(24);
        }

        &-text {
            font-size: p2r(14);
            color: $font-grey;
        }
    }

    &-btn {
        width: calc(50% - 10px);
        text-align: center;

        @media(max-width: 768px) {
            width: 100%;
        }
    }

    &-title {
        font-weight: 500;
        font-size: p2r(32);
        color: $font-dark-grey;

        @media (max-width: 768px) {
            font-size: p2r(28);
        }

        @media (max-width: 599px) {
            font-size: p2r(24);
        }
    }
}

.order-details {
    margin-bottom: p2r(40);

    @media (max-width: 1024px) {
        margin-bottom: p2r(32);
    }
    @media (max-width: 599px) {
        font-size: p2r(14);
        margin-bottom: p2r(24);
    }
}
</style>