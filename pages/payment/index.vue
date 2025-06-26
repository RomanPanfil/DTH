<template>
    <div class="container">
        <div class="payment-content">
            <div class="payment-main">
                <Breadcrumbs />
                <h1 class="page-title">{{ $t('payment.title') }}</h1>
                <p class="payment-instructions">{{ $t('payment.instructions') }}</p>
                <form v-if="paymentMethods.length" class="payment-form" @submit.prevent="handleSubmit">
                    <div class="payment-types">
                        <label
                            v-for="method in paymentMethods"
                            :key="method.ID"
                            class="payment-type custom-radio"
                        >
                            <Field
                                type="radio"
                                name="paymentMethod"
                                :value="method.ID"
                                v-model="selectedMethod"
                                class="radio-input"
                                :rules="{ required: true }"
                            />
                            <span class="radio-indicator"></span>
                            <div>
                                <span class="payment-type-name">{{ method.NAME }}</span>
                                <span v-if="method.DESCRIPTION" class="payment-type-description"> ({{ method.DESCRIPTION }})</span>
                            </div>
                        </label>
                    </div>
                    <div class="payment-submit">
                        <button
                            type="submit"
                            class="ui-btn ui-btn__primary"
                            :disabled="!agreement || !selectedMethod"
                        >
                            {{ $t('payment.submit') }}
                        </button>
                        <div v-if="errorText" class="error-text">{{ errorText }}</div>
                    </div>
                    <div class="payment-agree form-field checkbox-field">
                        <div class="custom-checkbox">
                            <Field
                                name="agreement"
                                v-model="agreement"
                                type="checkbox"
                                :value="true"
                                :unchecked-value="false"
                                :rules="{ required: true }"
                                class="checkbox-input"
                            />
                            <span class="checkbox-indicator"></span>
                            <label for="agreement" class="payment-agree-text checkbox-label">
                                {{ $t('agree.main') }}
                                <NuxtLink to="/user-agreement">{{ $t('agree.userAgreement') }}</NuxtLink>
                                {{ $t('agree.and') }}
                                <NuxtLink to="/politics">{{ $t('agree.politics') }}</NuxtLink>
                            </label>
                        </div>
                    </div>
                </form>
                <div class="payment-systems">
                    <img src="/images/pay-systems.svg" alt="systems">
                </div>
            </div>
            <div v-if="event" class="payment-side">
                <div class="event-aside" ref="eventAside">
                    <div class="event-card-image">
                        <img v-if="event?.PREVIEW_PICTURE" :src="getImageUrl(event?.PREVIEW_PICTURE)" :alt="event.NAME" />
                    </div>
                    <NuxtLink :to="getEventUrl(event)" class="event-card-title">
                        {{ event.NAME }}
                    </NuxtLink>
                    <div class="event-card-info">
                        <div v-if="event.PROPS?.WHEN_DATE?.VALUE" class="event-card-info-item">
                            {{ formatEventDates(event.PROPS.WHEN_DATE.VALUE) }}
                        </div>
                        <div v-if="event.PROPS?.WHEN_ADDR?.VALUE" class="event-card-info-item">
                            <NuxtIcon name="pin" filled class="event-card-info-icon" />
                            {{ event.PROPS.CITY?.VALUE }}
                        </div>
                        <div v-if="event.PROPS?.FORMAT?.VALUE && event.PROPS.FORMAT.VALUE === 'Online'" class="event-card-info-item">
                            {{ event.PROPS.FORMAT.VALUE }}
                        </div>
                    </div>
                    <div v-if="event?.PROPS?.PRICE?.VALUE || event?.PROPS?.SEATS?.VALUE" class="event-card-price">
                        <div v-if="event.PROPS.PRICE?.VALUE" class="event-card-price-value">
                            <span>{{ event.PROPS.PRICE.VALUE }}</span> бел.руб.
                        </div>
                        <div v-if="event.PROPS.SEATS?.VALUE" class="event-card-seats">
                            <div class="event-card-seats-title">Осталось мест:</div>
                            {{ Math.max(0, event.PROPS.SEATS.VALUE - (event.PROPS.REGISTERED?.VALUE || 0)) }}
                            из {{ event.PROPS.SEATS.VALUE }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="webpay-form"></div>
</template>

<script setup lang="ts">
import { Field, ErrorMessage } from 'vee-validate';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'nuxt/app';
import { useAuthStore } from '~/stores/auth';
import { useModalsStore } from '~/stores/modals';
import { useCookie } from '#imports';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const authStore = useAuthStore();
const modalsStore = useModalsStore();

const selectedMethod = ref<string | null>(null);
const agreement = ref<boolean>(false);
const eventCode = route.query.code as string | null;
const errorText = ref<string | null>(null);

const isMainLesson = computed(() => {
    return Number(route.query.isMain) === 1;
});

const isWebinar = computed(() => {
    return Number(route.query.isWebinar) === 1;
});


// Загрузка данных о мероприятии на сервере
const { data: eventData, error: eventFetchError } = await useAsyncData('event', async () => {
    if (!eventCode) {
        return null;
    }
    const response = await $fetch(`/api/item/${eventCode}`, {
        method: 'GET',
        query: {
            iblockId: isWebinar.value ? 19 : 13,
        },
    });
    if (!response?.event) {
        throw new Error('Мероприятие не найдено');
    }
    return response.event;
});

const event = eventData;
const eventError = ref(eventFetchError?.value?.message || null);

// Загрузка способов оплаты на сервере
const { data: paymentMethodsData } = await useAsyncData('payment-methods', async () => {
    const response = await $fetch('/api/payment-methods');
    return response?.methods || [];
});

const paymentMethods = ref(paymentMethodsData.value || []);

async function handleSubmit() {
    if (!agreement.value || !selectedMethod.value) return;

    errorText.value = null;

    try {
        const requestBody = {
            token: authStore.token,
            courseId: Number(eventData?.value?.ID),
            paymentMethodId: Number(selectedMethod.value)
        };

        // Добавляем PACK для главного вебинара
        if (isMainLesson.value) {
            requestBody.PACK = 1;
        }

        const response = await $fetch('/api/orders/create', {
            method: 'POST',
            body: requestBody
        });

        // Сохранение данных заказа в куки
        const orderCookie = useCookie('orderData', {
            maxAge: 60 * 60 * 24, // 24 часа
            path: '/', // Доступно на всех путях
            sameSite: 'lax', // Безопасность для CSRF
        });
        orderCookie.value = {
            orderId: response.orderId,
            amount: response.amount,
            name: eventData?.value?.NAME || 'Unknown Course',
            paymentMethod: response.paymentMethod
        };

        // Условный редирект в зависимости от paymentMethod
        if (response.paymentMethod === 2 || response.paymentMethod === 3) {
            router.push('/payment/success');
        } else {
            const webpayFormContainer = document.querySelector('.webpay-form');
            if (webpayFormContainer && response.form) {
                webpayFormContainer.innerHTML = response.form;
                const form = webpayFormContainer.querySelector('form');
                if (form) {
                    form.submit();
                }
            } else {
                router.push('/profile/courses');
            }
        }
    } catch (error) {
        console.error('Error creating order:', error);
        const errorMessage = error.data?.message || error.statusMessage || 'Произошла ошибка';
        errorText.value = errorMessage; // Устанавливаем текст ошибки напрямую из ответа
    }
}

const config = useRuntimeConfig();
const imageBaseUrl = config.public.imageBaseUrl;

function getImageUrl(path?: string) {
    return path ? `${imageBaseUrl}${path}` : '';
}

const formatEventDates = (dateStrings: string[]) => {
    if (!dateStrings || !Array.isArray(dateStrings) || dateStrings.length === 0)
        return t('date.notSpecified');

    const sortedDates = [...dateStrings].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
    const dates = sortedDates.map(dateString => {
        const date = new Date(dateString);
        const fullMonth = date.toLocaleDateString('ru-RU', { month: 'long' });
        const shortMonth = fullMonth.substring(0, 3);
        return {
            date: date,
            day: date.getDate(),
            month: date.getMonth(),
            monthFormatted: shortMonth,
        };
    });

    const groupedByMonth: { [key: string]: number[] } = {};

    dates.forEach(dateObj => {
        const monthKey = dateObj.monthFormatted;
        if (!groupedByMonth[monthKey]) {
            groupedByMonth[monthKey] = [];
        }
        groupedByMonth[monthKey].push(dateObj.day);
    });

    const formattedGroups: string[] = [];
    for (const [month, days] of Object.entries(groupedByMonth)) {
        days.sort((a, b) => a - b);
        const ranges: Array<[number, number]> = [];
        let rangeStart = days[0];
        let rangeEnd = days[0];

        for (let i = 1; i < days.length; i++) {
            if (days[i] === rangeEnd + 1) {
                rangeEnd = days[i];
            } else {
                ranges.push([rangeStart, rangeEnd]);
                rangeStart = days[i];
                rangeEnd = days[i];
            }
        }
        ranges.push([rangeStart, rangeEnd]);

        const formattedDays = ranges.map(([start, end]) => {
            if (start === end) {
                return `${start}`;
            } else {
                return `${start}-${end}`;
            }
        }).join(', ');
        formattedGroups.push(`${formattedDays} ${month}`);
    }
    return formattedGroups.join(', ');
};

const getEventUrl = (event: any) => {
    return `/courses/${event.CODE}`;
};
</script>

<style scoped lang="scss">
.payment {
    &-content {
        display: flex;
        padding-bottom: p2r(100);

        @media (max-width: 1366px) {
            padding-bottom: p2r(90);
        }

        @media (max-width: 1024px) {
            padding-bottom: p2r(60);
        }

        @media (max-width: 768px) {
            padding-bottom: p2r(40);
        }

        @media (max-width: 992px) {
            flex-direction: column;
        }
    }
    &-main {
        flex-grow: 1;
        padding-right: p2r(40);

        @media (max-width: 992px) {
            padding-right: 0;
        }
    }
    &-side {
        max-width: p2r(390);
        flex: 0 0 p2r(390);

        @media (max-width: 1280px) {
            max-width: p2r(320);
            flex: auto;
        }
    }
    &-form {
        margin-bottom: p2r(60);

        @media (max-width: 768px) {
            margin-bottom: p2r(40);
        }
    }
    &-instructions {
        margin-bottom: p2r(60);

        @media (max-width: 768px) {
            margin-bottom: p2r(40);
        }
    }
    &-types {
        margin-bottom: p2r(60);

        @media (max-width: 768px) {
            margin-bottom: p2r(40);
        }
    }
    &-type {
        margin-bottom: p2r(20);
        font-weight: 500;
        color: $bgc-dark;

        &-description {
            font-weight: 400;
            color: #858585;
        }
    }
    &-submit {
        margin-bottom: p2r(40);
    }

    &-agree {
        max-width: p2r(750);

        &-text {
            font-size: p2r(16);
            line-height: 1.4;
            margin-left: p2r(8);

            @media(max-width: 599px) {
                font-size: p2r(14);
            }
        }
    }

    &-systems {
        width: auto;
        height: p2r(28);
    }
}
.custom-checkbox:deep() {
    align-items: flex-start;
}
.error-text {
    color: $error;
    font-size: p2r(14);
    padding-top: p2r(6);
    padding-bottom: p2r(6);
}

.event {
    &-aside {
        padding: p2r(20);
        background-color: $bgc;
        box-shadow: 0 4px 35px rgba(114, 142, 174, 0.1);
        border-radius: p2r(8);
    }
    &-card {
        &-image {
            position: relative;
            aspect-ratio: 1.8;
            border-radius: p2r(6);
            overflow: hidden;
            margin-bottom: p2r(20);
            background-color: $placeholder;
            background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" id="Layer_14" x="0px" y="0px" viewBox="0 0 512 512" style="enable-background:new 0 0 512 512;" xml:space="preserve"><g transform="translate(1 1)"><g><g><path d="M255-1C114.2-1-1,114.2-1,255s115.2,256,256,256s256-115.2,256-256S395.8-1,255-1z M255,16.067 c63.054,0,120.598,24.764,163.413,65.033l-65.336,64.802L334.36,97.987c-0.853-2.56-4.267-5.12-7.68-5.12H185.027 c-3.413,0-5.973,1.707-7.68,5.12L156.013,152.6h-48.64c-17.067,0-30.72,13.653-30.72,30.72v168.96 c0,17.067,13.653,30.72,30.72,30.72h6.653l-34.26,33.981C40.285,374.319,16.067,317.354,16.067,255 C16.067,123.587,123.587,16.067,255,16.067z M314.733,255c0,33.28-26.453,59.733-59.733,59.733 c-13.563,0-25.99-4.396-35.957-11.854l84.125-83.438C310.449,229.34,314.733,241.616,314.733,255z M195.267,255 c0-33.28,26.453-59.733,59.733-59.733c13.665,0,26.174,4.467,36.179,12.028l-84.183,83.495 C199.613,280.852,195.267,268.487,195.267,255z M303.374,195.199C290.201,184.558,273.399,178.2,255,178.2 c-42.667,0-76.8,34.133-76.8,76.8c0,18.17,6.206,34.779,16.61,47.877l-63.576,63.057H106.52c-7.68,0-13.653-5.973-13.653-13.653 V183.32c0-7.68,5.973-13.653,13.653-13.653h54.613c3.413,0,6.827-2.56,7.68-5.12l21.333-54.613h129.707l19.404,49.675 L303.374,195.199z M206.848,314.974C219.987,325.509,236.703,331.8,255,331.8c42.667,0,76.8-34.133,76.8-76.8 c0-18.068-6.138-34.592-16.436-47.655l37.988-37.678h49.274c7.68,0,13.653,5.973,13.653,13.653v168.96 c0,7.68-5.973,13.653-13.653,13.653H155.469L206.848,314.974z M255,493.933c-62.954,0-120.415-24.686-163.208-64.843L138.262,383 H403.48c17.067,0,30.72-13.653,31.573-30.72V183.32c0-17.067-13.653-30.72-30.72-30.72H370.56l59.865-59.376 c39.368,42.639,63.509,99.521,63.509,161.776C493.933,386.413,386.413,493.933,255,493.933z" style="fill: %23E0E0E0"/><path d="M383,186.733c-9.387,0-17.067,7.68-17.067,17.067c0,9.387,7.68,17.067,17.067,17.067s17.067-7.68,17.067-17.067 C400.067,194.413,392.387,186.733,383,186.733z" style="fill: %23E0E0E0"/></g></g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><g></g><script xmlns=""/></svg>');
            background-repeat: no-repeat;
            background-position: center;
            background-size: p2r(60);

            @media (hover: hover) {
                &:hover {
                    img {
                        transform: scale(1.1);
                    }
                }
            }

            img {
                display: block;
                width: 100%;
                height: 100%;
                object-fit: cover;
                object-position: center;
                transition: transform 0.3s;
            }
        }

        &-title {
            font-weight: 500;
            font-size: p2r(20);
            line-height: 1.2;
            letter-spacing: -0.03em;
            color: $font;
            margin-bottom: p2r(20);
            display: block;
        }

        &-info {
            display: flex;
            flex-wrap: wrap;
            gap: p2r(4);
            border-bottom: 1px solid $border;
            padding-bottom: p2r(20);

            &-item {
                font-weight: 600;
                font-size: p2r(14);
                line-height: 1.4;
                text-transform: uppercase;
                color: $font-white;
                display: flex;
                gap: 2px;
                background: $primary;
                border-radius: p2r(2);
                padding: p2r(8) p2r(10) p2r(7) p2r(10);
            }

            &-icon {
                font-size: p2r(18);
                line-height: p2r(16);
            }
        }

        &-price {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: p2r(20);
            margin-bottom: p2r(20);

            &-value {
                font-size: p2r(18);

                span {
                    font-weight: 600;
                    font-size: p2r(32);
                }
            }
        }

        &-seats {
            font-size: p2r(18);
            margin-left: auto;

            &-title {
                font-size: p2r(10);
            }
        }

        &-pay {
            display: flex;
            gap: p2r(10);
            margin-bottom: p2r(20);

            &-btn {
                flex-grow: 1;
            }
        }

        &-fav {
            &-btn {
                border: 1px solid $primary;
                border-radius: p2r(4);
                background-color: transparent;
                width: p2r(52);
                flex: 0 0 p2r(52);
                cursor: pointer;

                .icon {
                    font-size: p2r(28);
                    line-height: p2r(26);
                    color: $primary;
                }
            }
        }

        &-more {
            display: block;
            margin-left: auto;
            margin-right: auto;
        }
    }
}
.webpay-form {
    width: 0;
    height: 0;
    opacity: 0;
    visibility: hidden;
}
</style>