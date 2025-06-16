<template>
    <div class="container">
        <div class="payment-container">
            <div class="payment-header">
                <div class="payment-title">Оплата отменена</div>
            </div>
            <div class="order-details">
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