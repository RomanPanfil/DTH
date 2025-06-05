<template>
    <footer class="footer">
        <div class="container">
            <div class="footer-top">
                <NuxtLink to="/" class="footer-logo">
                    <img src="/images/logo-footer.svg" loading="lazy" alt="DTH Logo" class="footer-logo-img" />
                </NuxtLink>
                <div class="footer-copy">
                    <span class="footer-copy-year">{{ currentYear }}</span>, DTH.com
                </div>
                <nav class="footer-nav">
                    <NuxtLink
                        v-for="item in menuTop"
                        :key="item.ID"
                        :to="item.URL"
                        class="footer-nav-link"
                    >
                        {{ item.NAME }}
                    </NuxtLink>
                </nav>
                <div class="footer-socials">
                    <a href="https://vk.com/dthbelarus" target="_blank" class="footer-socials-link">
                        <NuxtIcon name="vk-white" class="footer-socials-link-icon" filled />
                    </a>
                    <a href="https://www.facebook.com/profile.php?id=100090072254050" target="_blank" class="footer-socials-link">
                        <NuxtIcon name="fb-white" class="footer-socials-link-icon" filled />
                    </a>
                    <a href="https://t.me/+tEBLLAqlyEBmNGI6" target="_blank" class="footer-socials-link">
                        <NuxtIcon name="tg-white" class="footer-socials-link-icon" filled />
                    </a>
                    <a href="https://www.instagram.com/dental.training.house/" target="_blank" class="footer-socials-link">
                        <NuxtIcon name="instagram-white" class="footer-socials-link-icon" filled />
                    </a>
                </div>
            </div>
            <div class="footer-bottom">
                <div class="footer-bottom-links">
                    <NuxtLink
                        v-for="item in menuBottom"
                        :key="item.ID"
                        :to="item.URL"
                        class="footer-bottom-link"
                    >
                        {{ item.NAME }}
                    </NuxtLink>
                </div>
                <div class="footer-pay">
                    <div class="footer-pay-icon">
                        <img src="/images/webpay.svg" alt="webpay" loading="lazy">
                    </div>
                    <div class="footer-pay-icon">
                        <img src="/images/belcart.svg" alt="belcart" loading="lazy">
                    </div>
                    <div class="footer-pay-icon">
                        <img src="/images/erip.svg" alt="erip" loading="lazy">
                    </div>
                    <div class="footer-pay-icon">
                        <img src="/images/mastercard.svg" alt="mastercard" loading="lazy">
                    </div>
                    <div class="footer-pay-icon">
                        <img src="/images/visa.svg" alt="visa" loading="lazy">
                    </div>
                </div>
                <div class="footer-development">
                    {{ $t('footer.development') }}
                    <a href="http://www.farba-studio.com/ru/" target="_blank" class="footer-development-link">
                        <NuxtIcon name="farba" class="footer-development-icon" filled />
                        Farba
                    </a>
                </div>
            </div>
        </div>
    </footer>
</template>

<style scoped lang="scss">
.footer {
    color: $font-white;
    background-color: $bgc-dark;

    &-logo {
        margin-right: p2r(43);

        @media(max-width: 599px) {
            margin-right: p2r(20);
        }

        &-img {
            display: block;
            max-height: p2r(48);

            @media(max-width: 1366px) {
                max-height: p2r(42);
            }
        }
    }

    &-copy {
        font-weight: 300;
        font-size: p2r(18);
        margin-right: p2r(97);

        @media(max-width: 1680px) {
            font-size: p2r(16);
            margin-right: p2r(60);
        }

        @media(max-width: 1366px) {
            font-size: p2r(14);
            margin-right: p2r(40);
        }

        @media(max-width: 992px) {
            font-size: p2r(16);
        }

        @media(max-width: 768px) {
            margin-right: 0;
        }

        &:before {
            content: '';
            width: p2r(14);
            height: p2r(14);
            display: inline-block;
            vertical-align: middle;
            background-size: p2r(14);
            margin-right: p2r(4);
            background-image: url('data:image/svg+xml,<svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M11.844 11.308C10.572 12.58 9.036 13.216 7.236 13.216C5.436 13.216 3.9 12.58 2.628 11.308C1.356 10.036 0.72 8.5 0.72 6.7C0.72 4.9 1.356 3.364 2.628 2.092C3.9 0.82 5.436 0.184 7.236 0.184C9.036 0.184 10.572 0.82 11.844 2.092C13.116 3.364 13.752 4.9 13.752 6.7C13.752 8.5 13.116 10.036 11.844 11.308ZM3.006 10.966C4.182 12.13 5.592 12.712 7.236 12.712C8.88 12.712 10.284 12.13 11.448 10.966C12.624 9.79 13.212 8.368 13.212 6.7C13.212 5.032 12.624 3.616 11.448 2.452C10.284 1.276 8.88 0.688 7.236 0.688C5.592 0.688 4.182 1.276 3.006 2.452C1.842 3.616 1.26 5.032 1.26 6.7C1.26 8.368 1.842 9.79 3.006 10.966ZM7.29 10.156C6.306 10.156 5.478 9.82 4.806 9.148C4.134 8.476 3.798 7.66 3.798 6.7C3.798 5.74 4.134 4.924 4.806 4.252C5.478 3.58 6.306 3.244 7.29 3.244C7.926 3.244 8.502 3.394 9.018 3.694C9.546 3.994 9.954 4.402 10.242 4.918L9.252 5.494C9.084 5.122 8.82 4.84 8.46 4.648C8.1 4.456 7.71 4.36 7.29 4.36C6.594 4.36 6.03 4.594 5.598 5.062C5.178 5.518 4.968 6.064 4.968 6.7C4.968 7.336 5.178 7.888 5.598 8.356C6.03 8.812 6.594 9.04 7.29 9.04C7.722 9.04 8.118 8.944 8.478 8.752C8.838 8.548 9.102 8.26 9.27 7.888L10.26 8.482C9.972 8.998 9.564 9.406 9.036 9.706C8.508 10.006 7.926 10.156 7.29 10.156Z" fill="white"/></svg>');
        }
    }

    &-nav {
        margin-right: p2r(24);

        @media(max-width: 1280px) {
            margin-right: 0;
            margin-left: auto;
        }

        @media(max-width: 992px) {
            margin-left: 0;
            width: 100%;
        }

        @media(max-width: 768px) {
            display: none;
        }
        &-link {
            font-family: 'Inter';
            font-weight: 400;
            font-size: p2r(18);
            color: $font-white;
            margin-right: p2r(36);
            text-decoration: none;

            @media(max-width: 1680px) {
                font-size: p2r(16);
                margin-right: p2r(24);
            }

            @media(max-width: 1366px) {
                font-size: p2r(14);
                margin-right: p2r(20);
            }

            @media(max-width: 992px) {
                font-size: p2r(18);
            }
        }
    }

    &-socials {
        display: flex;
        column-gap: p2r(16);
        margin-left: auto;

        @media(max-width: 1680px) {
            column-gap: p2r(10);
        }

        @media(max-width: 1280px) {
            display: none;
        }

        &-link {
            position: relative;
            width: p2r(32);
            height: p2r(32);
            flex: 0 0 p2r(32);
            border-radius: 50%;
            background-color: #323232;

            &-icon {
                font-size: p2r(22);
                line-height: p2r(19);
                color: $font-white;
                position: absolute;
                left: 50%;
                top: 50%;
                transform: translate(-50%, -50%);
            }
        }
    }

    &-top {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        padding-top: p2r(53);
        padding-bottom: p2r(44);
        border-bottom: 1px solid #323232;

        @media(max-width: 992px) {
            row-gap: p2r(24);
        }

        @media(max-width: 768px) {
            flex-direction: row;
            align-items: center;
            flex-wrap: wrap;
        }

        @media(max-width: 599px) {
            padding-top: p2r(32);
            padding-bottom: p2r(32);
        }
    }

    &-bottom {
        display: flex;
        flex-wrap: wrap;
        row-gap: p2r(32);
        padding-top: p2r(43);
        padding-bottom: p2r(46);

        &-links {
            display: flex;
            column-gap: p2r(22);
            margin-right: p2r(60);

            @media(max-width: 992px) {
                flex-wrap: wrap;
                margin-right: 0;
            }

            @media(max-width: 599px) {
                flex-direction: column;
            }
        }

        @media(max-width: 992px) {
            flex-direction: column;
            row-gap: p2r(24);
        }

        @media(max-width: 599px) {
            padding-top: p2r(24);
            padding-bottom: p2r(32);
            row-gap: p2r(20);
        }

        &-link {
            font-size: p2r(16);
            color: $font-white-dark;

            &:last-child {
                @media(max-width: 599px) {
                    margin-top: p2r(20);
                }
            }

            @media(max-width: 1680px) {
                font-size: p2r(14);
            }

            @media(max-width: 1366px) {
                font-size: p2r(13);
            }

            @media(max-width: 992px) {
                font-size: p2r(16);
            }

            @media(max-width: 599px) {
                font-size: p2r(14);
            }
        }
    }

    &-pay {
        display: flex;
        column-gap: p2r(16);

        @media(max-width: 1280px) {
            display: none;
        }

        &-icon {
            img {
                display: block;
                max-height: p2r(24);
            }
        }
    }

    &-development {
        margin-left: auto;

        @media(max-width: 1680px) {
            font-size: p2r(14);
        }

        @media(max-width: 1366px) {
            font-size: p2r(13);
        }

        @media(max-width: 992px) {
            margin-left: 0;
            font-size: p2r(16);
        }

        @media(max-width: 599px) {
            font-size: p2r(14);
        }

        &-link {
            position: relative;
            color: $font-white;
            padding-left: p2r(34);
        }

        &-icon {
            position: absolute;
            left: p2r(-4);
            bottom: p2r(-4);
            font-size: p2r(36);
        }
    }
}
</style>

<script setup lang="ts">
import { useLocaleStore } from '~/stores/locale';

const currentYear = new Date().getFullYear();

// Получаем текущий язык из стора
const localeStore = useLocaleStore();
const locale = computed(() => localeStore.locale);

// Загружаем меню MENU_BOTTOM для .footer-nav
const { data: menuTopData, error: menuTopError } = await useFetch('/api/menu', {
    method: 'GET',
    query: { type: 'MENU_BOTTOM' },
});

const menuTop = computed(() => {
    if (menuTopError.value) {
        console.error('Ошибка загрузки MENU_BOTTOM:', menuTopError.value);
        return [];
    }
    return menuTopData.value?.menu?.[locale.value] || [];
});

// Загружаем меню MENU_TEH для .footer-bottom-links
const { data: menuBottomData, error: menuBottomError } = await useFetch('/api/menu', {
    method: 'GET',
    query: { type: 'MENU_TEH' },
});

const menuBottom = computed(() => {
    if (menuBottomError.value) {
        console.error('Ошибка загрузки MENU_TEH:', menuBottomError.value);
        return [];
    }
    return menuBottomData.value?.menu?.[locale.value] || [];
});
</script>