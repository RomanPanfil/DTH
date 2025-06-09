<!--<template>-->
<!--    <div class="container">-->
<!--        <div class="payment-content">-->
<!--            <div class="payment-main">-->
<!--                <Breadcrumbs />-->
<!--                <h1 class="page-title">{{ $t('payment.title') }}</h1>-->
<!--                <p class="payment-instructions">{{ $t('payment.instructions') }}</p>-->
<!--                <form v-if="paymentMethods.length" class="payment-form" @submit.prevent="handleSubmit">-->
<!--                    <div class="payment-types">-->
<!--                        <label-->
<!--                            v-for="method in paymentMethods"-->
<!--                            :key="method.ID"-->
<!--                            class="payment-type custom-radio"-->
<!--                        >-->
<!--                            <Field-->
<!--                                type="radio"-->
<!--                                name="paymentMethod"-->
<!--                                :value="method.ID"-->
<!--                                v-model="selectedMethod"-->
<!--                                class="radio-input"-->
<!--                                :rules="{ required: true }"-->
<!--                            />-->
<!--                            <span class="radio-indicator"></span>-->
<!--                            <span class="payment-type-name">{{ method.NAME }}</span>-->
<!--                            <span v-if="method.DESCRIPTION" class="payment-type-description"> ({{ method.DESCRIPTION }})</span>-->
<!--                        </label>-->
<!--                    </div>-->
<!--                    <button-->
<!--                        type="submit"-->
<!--                        class="payment-submit ui-btn ui-btn__primary"-->
<!--                        :disabled="!agreement || !selectedMethod"-->
<!--                    >-->
<!--                        {{ $t('payment.submit') }}-->
<!--                    </button>-->
<!--                    <div class="payment-agree form-field checkbox-field">-->
<!--                        <div class="custom-checkbox">-->
<!--                            <Field-->
<!--                                name="agreement"-->
<!--                                v-model="agreement"-->
<!--                                type="checkbox"-->
<!--                                :value="true"-->
<!--                                :unchecked-value="false"-->
<!--                                :rules="{ required: true }"-->
<!--                                class="checkbox-input"-->
<!--                            />-->
<!--                            <span class="checkbox-indicator"></span>-->
<!--                            <label for="agreement" class="payment-agree-text checkbox-label">-->
<!--                                {{ $t('agree.main') }}-->
<!--                                <a href="/terms" target="_blank">{{ $t('agree.userAgreement') }}</a>-->
<!--                                {{ $t('agree.and') }}-->
<!--                                <a href="/privacy" target="_blank">{{ $t('agree.politics') }}</a>-->
<!--                            </label>-->
<!--                        </div>-->
<!--                        <ErrorMessage name="agreement" class="error-message" />-->
<!--                    </div>-->
<!--                </form>-->
<!--                <div class="payment-systems">-->
<!--                    <img src="/images/pay-systems.svg" alt="systems">-->
<!--                </div>-->
<!--            </div>-->
<!--            <div v-if="event" class="payment-side">-->
<!--                <div class="event-aside" ref="eventAside">-->
<!--                    <div class="event-card-image">-->
<!--                        <img :src="getImageUrl(event?.PREVIEW_PICTURE)" :alt="event.NAME" />-->
<!--                    </div>-->
<!--                    <NuxtLink :to="getEventUrl(event)" class="event-card-title">-->
<!--                        {{ event.NAME }}-->
<!--                    </NuxtLink>-->
<!--                    <div class="event-card-info">-->
<!--                        <div v-if="event.PROPS?.WHEN_DATE?.VALUE" class="event-card-info-item">-->
<!--                            {{ formatEventDates(event.PROPS.WHEN_DATE.VALUE) }}-->
<!--                        </div>-->
<!--                        <div v-if="event.PROPS?.WHEN_ADDR?.VALUE" class="event-card-info-item">-->
<!--                            <NuxtIcon name="pin" filled class="event-card-info-icon" />-->
<!--                            {{ event.PROPS.CITY?.VALUE }}-->
<!--                        </div>-->
<!--                        <div v-if="event.PROPS?.FORMAT?.VALUE && event.PROPS.FORMAT.VALUE === 'Online'" class="event-card-info-item">-->
<!--                            {{ event.PROPS.FORMAT.VALUE }}-->
<!--                        </div>-->
<!--                    </div>-->
<!--                    <div v-if="event?.PROPS?.PRICE?.VALUE || event?.PROPS?.SEATS?.VALUE" class="event-card-price">-->
<!--                        <div v-if="event.PROPS.PRICE?.VALUE" class="event-card-price-value">-->
<!--                            <span>{{ event.PROPS.PRICE.VALUE }}</span> бел.руб.-->
<!--                        </div>-->
<!--                        <div v-if="event.PROPS.SEATS?.VALUE" class="event-card-seats">-->
<!--                            <div class="event-card-seats-title">Осталось мест:</div>-->
<!--                            {{ Math.max(0, event.PROPS.SEATS.VALUE - (event.PROPS.REGISTERED?.VALUE || 0)) }}-->
<!--                            из {{ event.PROPS.SEATS.VALUE }}-->
<!--                        </div>-->
<!--                    </div>-->
<!--                </div>-->
<!--            </div>-->
<!--        </div>-->
<!--    </div>-->
<!--</template>-->

<!--<script setup lang="ts">-->
<!--import { Field, ErrorMessage } from 'vee-validate';-->
<!--import { ref } from 'vue';-->
<!--import { useI18n } from 'vue-i18n';-->
<!--import { useRoute } from 'nuxt/app';-->

<!--const { t } = useI18n();-->
<!--const route = useRoute();-->

<!--const paymentMethods = ref<any[]>([]);-->
<!--const selectedMethod = ref<string | null>(null);-->
<!--const agreement = ref<boolean>(false);-->
<!--const eventCode = ref<string | null>(route.query.code as string | null);-->
<!--const event = ref(null);-->
<!--const eventError = ref(null);-->

<!--async function fetchPaymentMethods() {-->
<!--    try {-->
<!--        const response = await $fetch('/api/payment-methods');-->
<!--        paymentMethods.value = response.methods || [];-->
<!--        selectedMethod.value = null;-->
<!--    } catch (error) {-->
<!--        console.error('Ошибка при получении способов оплаты:', error);-->
<!--        paymentMethods.value = [];-->
<!--    }-->
<!--}-->

<!--async function handleSubmit() {-->
<!--    if (!agreement.value || !selectedMethod.value) return;-->

<!--    try {-->
<!--        console.log('Выбран способ оплаты:', selectedMethod.value);-->
<!--        // Здесь будет логика отправки выбранного способа оплаты-->
<!--    } catch (error) {-->
<!--        console.error('Ошибка при обработке оплаты:', error);-->
<!--    }-->
<!--}-->

<!--const config = useRuntimeConfig();-->
<!--const imageBaseUrl = config.public.imageBaseUrl;-->

<!--const getImageUrl = (path: string | undefined) => {-->
<!--    return path ? `${imageBaseUrl}${path}` : '';-->
<!--};-->

<!--const formatEventDates = (dateStrings: string[]) => {-->
<!--    if (!dateStrings || !Array.isArray(dateStrings) || dateStrings.length === 0)-->
<!--        return 'Дата не указана';-->
<!--    const sortedDates = [...dateStrings].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());-->
<!--    const dates = sortedDates.map(dateString => {-->
<!--        const date = new Date(dateString);-->
<!--        const fullMonth = date.toLocaleDateString('ru-RU', { month: 'long' });-->
<!--        const shortMonth = fullMonth.substring(0, 3);-->
<!--        return {-->
<!--            date: date,-->
<!--            day: date.getDate(),-->
<!--            month: date.getMonth(),-->
<!--            monthFormatted: shortMonth,-->
<!--        };-->
<!--    });-->

<!--    const groupedByMonth: { [key: string]: number[] } = {};-->
<!--    dates.forEach(dateObj => {-->
<!--        const monthKey = dateObj.monthFormatted;-->
<!--        if (!groupedByMonth[monthKey]) {-->
<!--            groupedByMonth[monthKey] = [];-->
<!--        }-->
<!--        groupedByMonth[monthKey].push(dateObj.day);-->
<!--    });-->

<!--    const formattedGroups: string[] = [];-->
<!--    for (const [month, days] of Object.entries(groupedByMonth)) {-->
<!--        days.sort((a, b) => a - b);-->
<!--        const ranges: Array<[number, number]> = [];-->
<!--        let rangeStart = days[0];-->
<!--        let rangeEnd = days[0];-->

<!--        for (let i = 1; i < days.length; i++) {-->
<!--            if (days[i] === rangeEnd + 1) {-->
<!--                rangeEnd = days[i];-->
<!--            } else {-->
<!--                ranges.push([rangeStart, rangeEnd]);-->
<!--                rangeStart = days[i];-->
<!--                rangeEnd = days[i];-->
<!--            }-->
<!--        }-->
<!--        ranges.push([rangeStart, rangeEnd]);-->

<!--        const formattedDays = ranges.map(([start, end]) => {-->
<!--            if (start === end) {-->
<!--                return `${start}`;-->
<!--            } else {-->
<!--                return `${start}-${end}`;-->
<!--            }-->
<!--        }).join(', ');-->
<!--        formattedGroups.push(`${formattedDays} ${month}`);-->
<!--    }-->
<!--    return formattedGroups.join(', ');-->
<!--};-->

<!--const fetchEventData = async () => {-->
<!--    if (!eventCode.value) return;-->

<!--    try {-->
<!--        const response = await $fetch(`/api/item/${eventCode.value}`, {-->
<!--            method: 'GET',-->
<!--            query: {-->
<!--                iblockId: 13,-->
<!--            },-->
<!--        });-->

<!--        if (!response?.event) {-->
<!--            eventError.value = { details: 'Мероприятие не найдено' };-->
<!--            return;-->
<!--        }-->

<!--        event.value = response.event;-->

<!--    } catch (error: any) {-->
<!--        eventError.value = { details: error.message || 'Ошибка загрузки мероприятия' };-->
<!--    }-->
<!--};-->

<!--const getEventUrl = (event: any) => {-->
<!--    return `/courses/${event.CODE}`;-->
<!--};-->

<!--// Загружаем данные при инициализации компонента-->
<!--if (eventCode.value) {-->
<!--    fetchEventData();-->
<!--}-->

<!--// Также загружаем методы оплаты-->
<!--fetchPaymentMethods();-->
<!--</script>-->

<!--<style scoped lang="scss">-->
<!--.payment {-->
<!--    &-content {-->
<!--        display: flex;-->
<!--        padding-bottom: p2r(100);-->
<!--    }-->
<!--    &-main {-->
<!--        flex-grow: 1;-->
<!--        padding-right: p2r(40);-->
<!--    }-->
<!--    &-side {-->
<!--        width: p2r(390);-->
<!--        flex: 0 0 p2r(390);-->
<!--    }-->
<!--    &-form {-->
<!--        margin-bottom: p2r(60);-->
<!--    }-->
<!--    &-instructions {-->
<!--        margin-bottom: p2r(60);-->
<!--    }-->
<!--    &-types {-->
<!--        margin-bottom: p2r(60);-->
<!--    }-->
<!--    &-type {-->
<!--        margin-bottom: p2r(20);-->
<!--        font-weight: 500;-->
<!--        color: $bgc-dark;-->

<!--        &-description {-->
<!--            font-weight: 400;-->
<!--            color: #858585;-->
<!--        }-->
<!--    }-->
<!--    &-submit {-->
<!--        margin-bottom: p2r(40);-->
<!--    }-->

<!--    &-agree {-->
<!--        max-width: p2r(750);-->

<!--        &-text {-->
<!--            font-size: p2r(16);-->
<!--            line-height: 1.4;-->
<!--            margin-left: p2r(8);-->
<!--        }-->
<!--    }-->

<!--    &-systems {-->
<!--        width: auto;-->
<!--        height: p2r(28);-->
<!--    }-->
<!--}-->
<!--.custom-checkbox:deep() {-->
<!--    align-items: flex-start;-->
<!--}-->
<!--//.payment-form {-->
<!--//    display: flex;-->
<!--//    flex-direction: column;-->
<!--//    gap: 15px;-->
<!--//}-->

<!--.error-message {-->
<!--    color: red;-->
<!--    font-size: 0.9em;-->
<!--    margin-top: 5px;-->
<!--}-->

<!--.event {-->
<!--    &-aside {-->
<!--        padding: p2r(20);-->
<!--        background-color: $bgc;-->
<!--        box-shadow: 0 4px 35px rgba(114, 142, 174, 0.1);-->
<!--        border-radius: p2r(8);-->
<!--    }-->
<!--    &-card {-->
<!--        &-image {-->
<!--            position: relative;-->
<!--            aspect-ratio: 1.8;-->
<!--            border-radius: p2r(6);-->
<!--            overflow: hidden;-->
<!--            margin-bottom: p2r(20);-->

<!--            @media (hover: hover) {-->
<!--                &:hover {-->
<!--                    img {-->
<!--                        transform: scale(1.1);-->
<!--                    }-->
<!--                }-->
<!--            }-->

<!--            img {-->
<!--                display: block;-->
<!--                width: 100%;-->
<!--                height: 100%;-->
<!--                object-fit: cover;-->
<!--                object-position: center;-->
<!--                transition: transform 0.3s;-->
<!--            }-->
<!--        }-->

<!--        &-title {-->
<!--            font-weight: 500;-->
<!--            font-size: p2r(20);-->
<!--            line-height: 1.2;-->
<!--            letter-spacing: -0.03em;-->
<!--            color: $font;-->
<!--            margin-bottom: p2r(20);-->
<!--            display: block;-->
<!--        }-->

<!--        &-info {-->
<!--            display: flex;-->
<!--            flex-wrap: wrap;-->
<!--            gap: p2r(4);-->
<!--            border-bottom: 1px solid $border;-->
<!--            padding-bottom: p2r(20);-->

<!--            &-item {-->
<!--                font-weight: 600;-->
<!--                font-size: p2r(14);-->
<!--                line-height: 1.4;-->
<!--                text-transform: uppercase;-->
<!--                color: $font-white;-->
<!--                display: flex;-->
<!--                //align-items: center;-->
<!--                gap: 2px;-->
<!--                background: $primary;-->
<!--                border-radius: p2r(2);-->
<!--                padding: p2r(8) p2r(10) p2r(7) p2r(10);-->
<!--            }-->

<!--            &-icon {-->
<!--                font-size: p2r(18);-->
<!--                line-height: p2r(16);-->
<!--            }-->
<!--        }-->

<!--        &-price {-->
<!--            display: flex;-->
<!--            justify-content: space-between;-->
<!--            align-items: center;-->
<!--            margin-top: p2r(20);-->
<!--            margin-bottom: p2r(20);-->

<!--            &-value {-->
<!--                font-size: p2r(18);-->

<!--                span {-->
<!--                    font-weight: 600;-->
<!--                    font-size: p2r(32);-->
<!--                }-->
<!--            }-->
<!--        }-->

<!--        &-seats {-->
<!--            font-size: p2r(18);-->
<!--            margin-left: auto;-->

<!--            &-title {-->
<!--                font-size: p2r(10);-->
<!--            }-->
<!--        }-->

<!--        &-pay {-->
<!--            display: flex;-->
<!--            gap: p2r(10);-->
<!--            margin-bottom: p2r(20);-->

<!--            &-btn {-->
<!--                flex-grow: 1;-->
<!--            }-->
<!--        }-->

<!--        &-fav {-->
<!--            &-btn {-->
<!--                border: 1px solid $primary;-->
<!--                border-radius: p2r(4);-->
<!--                background-color: transparent;-->
<!--                width: p2r(52);-->
<!--                flex: 0 0 p2r(52);-->
<!--                cursor: pointer;-->

<!--                .icon {-->
<!--                    font-size: p2r(28);-->
<!--                    line-height: p2r(26);-->
<!--                    color: $primary;-->
<!--                }-->
<!--            }-->
<!--        }-->

<!--        &-more {-->
<!--            display: block;-->
<!--            margin-left: auto;-->
<!--            margin-right: auto;-->
<!--        }-->
<!--    }-->
<!--}-->
<!--</style>-->




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
                            <span class="payment-type-name">{{ method.NAME }}</span>
                            <span v-if="method.DESCRIPTION" class="payment-type-description"> ({{ method.DESCRIPTION }})</span>
                        </label>
                    </div>
                    <button
                        type="submit"
                        class="payment-submit ui-btn ui-btn__primary"
                        :disabled="!agreement || !selectedMethod"
                    >
                        {{ $t('payment.submit') }}
                    </button>
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
                                <a href="/terms" target="_blank">{{ $t('agree.userAgreement') }}</a>
                                {{ $t('agree.and') }}
                                <a href="/privacy" target="_blank">{{ $t('agree.politics') }}</a>
                            </label>
                        </div>
                        <ErrorMessage name="agreement" class="error-message" />
                    </div>
                </form>
                <div class="payment-systems">
                    <img src="/images/pay-systems.svg" alt="systems">
                </div>
            </div>
            <div v-if="event" class="payment-side">
                <div class="event-aside" ref="eventAside">
                    <div class="event-card-image">
                        <img :src="getImageUrl(event?.PREVIEW_PICTURE)" :alt="event.NAME" />
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

// Загрузка данных о мероприятии на сервере
const { data: eventData, error: eventFetchError } = await useAsyncData('event', async () => {
    if (!eventCode) {
        return null;
    }
    const response = await $fetch(`/api/item/${eventCode}`, {
        method: 'GET',
        query: {
            iblockId: 13,
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

    try {
        const response = await $fetch('/api/orders/create', {
            method: 'POST',
            body: {
                token: authStore.token,
                courseId: Number(eventData?.value?.ID),
                paymentMethodId: Number(selectedMethod.value)
            }
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
        const errorMessage = error.data?.error || error.statusMessage || 'Произошла ошибка';
        let userFriendlyMessage = errorMessage;

        switch (errorMessage) {
            case 'ERROR_INVALID_TOKEN':
                userFriendlyMessage = t('errors.invalidToken');
                modalsStore.openModal('login');
                break;
            case 'ERROR_INVALID_COURSE_ID':
                userFriendlyMessage = t('errors.invalidCourseId');
                break;
            case 'ERROR_INVALID_PAYMENT_METHOD':
                userFriendlyMessage = t('errors.invalidPaymentMethodId');
                break;
            case 'ERROR_COURSE_NOT_FOUND':
                userFriendlyMessage = t('errors.courseNotFound');
                break;
            case 'ERROR_NO_AVAILABLE_SEATS':
                userFriendlyMessage = t('errors.noAvailableSeats');
                break;
            case 'ERROR_REGISTRATION_CLOSED':
                userFriendlyMessage = t('errors.registrationClosed');
                break;
            case 'ERROR_ORDER_ALREADY_EXISTS':
                userFriendlyMessage = t('errors.orderAlreadyExists');
                router.push('/profile/courses');
                break;
            case 'ERROR_INVALID_BOOKING_PERIOD':
                userFriendlyMessage = t('errors.invalidBookingPeriod');
                break;
            case 'ERROR_ORDER_CREATION_FAILED':
                userFriendlyMessage = t('errors.orderCreationFailed');
                break;
            case 'ERROR_INVALID_PARAM':
                userFriendlyMessage = t('errors.invalidParams');
                break;
            case 'Invalid API key':
                userFriendlyMessage = t('errors.invalidApiKey');
                break;
            default:
                userFriendlyMessage = errorMessage;
        }

        // toast.error(userFriendlyMessage);
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
    }
    &-main {
        flex-grow: 1;
        padding-right: p2r(40);
    }
    &-side {
        width: p2r(390);
        flex: 0 0 p2r(390);
    }
    &-form {
        margin-bottom: p2r(60);
    }
    &-instructions {
        margin-bottom: p2r(60);
    }
    &-types {
        margin-bottom: p2r(60);
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
.error-message {
    color: red;
    font-size: 0.9em;
    margin-top: 5px;
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