<template>
    <div class="container">
        <div class="register-container">
            <div class="register-header">
                <div class="register-title">{{ $t('thankYou.title') }}</div>
            </div>
            <div class="message-container">
                <p class="message-text">
                         {{ $t('thankYou.messagePart1') }}<span class="ui-bold">{{ requestId }}.</span><br>
                         {{ $t('thankYou.messagePart2') }}
                </p>
                <NuxtLink to="/" class="ui-btn ui-btn__primary">{{ $t('register.toHome') }}</NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRoute } from 'nuxt/app'
import { computed } from 'vue'

const route = useRoute()
const requestId = computed(() => route.query.requestId?.toString() || '')
</script>

<style scoped lang="scss">
.register {
    &-container {
        position: relative;
        background-color: $bgc;
        padding: p2r(80) p2r(60);
        border-radius: p2r(32);
        box-shadow: 0 4px 35px rgba(114, 142, 174, 0.1);
        max-width: p2r(860);
        margin: p2r(100) auto;

        @media (max-width: 1366px) {
            padding: p2r(60) p2r(50);
            margin: p2r(70) auto;
        }

        @media (max-width: 1280px) {
            padding: p2r(50) p2r(40);
            margin: p2r(40) auto;
        }

        @media (max-width: 1024px) {
            padding: p2r(32) p2r(32);
            margin: p2r(24) auto;
        }

        @media (max-width: 599px) {
            border-radius: 0;
            margin-left: p2r(-30);
            margin-right: p2r(-30);
        }

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

        @media(max-width: 768px) {
            padding: p2r(32) p2r(24);
        }
    }

    &-header {
        margin-bottom: p2r(32);
        padding-bottom: p2r(16);
        border-bottom: 1px solid $border;
    }

    &-btn {
        width: calc(50% - 10px);

        @media(max-width: 768px) {
            width: 100%;
        }
    }

    &-title {
        font-weight: 500;
        font-size: p2r(32);
        color: $font-dark-grey;
    }
}

.message-text {
    color: $font;
    margin-bottom: p2r(60);
}
</style>