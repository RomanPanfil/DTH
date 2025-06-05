<template>
    <div class="join">
        <img src="/public/images/join-bg-img.svg" alt="tooth" class="join-image">
        <div class="container">
            <div class="join-content">
                <div v-if="settingsError && itemsError" class="error-message">
                    Не удалось загрузить данные
                </div>
                <div v-else class="join-header">
                    <h2 class="join-title">
                        {{ mainTitle }}
                    </h2>
                    <div class="join-subtitle">
                        {{ mainSubtitle }}
                    </div>
                </div>
                <div v-if="itemsError" class="error-message">
                    Не удалось загрузить карточки: {{ itemsError.value?.data }}
                </div>
                <div v-else-if="!items.length" class="error-message">
                    Нет доступных карточек
                </div>
                <div v-else class="row">
                    <div v-for="item in items" :key="item.ID" class="col-md-6">
                        <div class="join-card">
                            <div class="join-card-header">
                                <div class="join-card-title">
                                    {{ item.NAME }}
                                </div>
                                <img
                                    :src="getImageUrl(item.PREVIEW_PICTURE)"
                                    :alt="item.NAME || 'Картинка'"
                                    class="join-card-image"
                                >
                            </div>
                            <div class="join-card-text" v-html="item.PREVIEW_TEXT"></div>
                            <button
                                :href="item.PROPS?.BTN_LINK?.VALUE || '#'"
                                class="ui-btn ui-btn__primary join-card-btn"
                                @click="handleRegister"
                            >
                                {{ item.PROPS?.BTN_TEXT?.VALUE }}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { computed } from 'vue';
import { useLocaleStore } from '~/stores/locale';
import { useRouter } from 'nuxt/app';

const router = useRouter();
const authStore = useAuthStore();

const runtimeConfig = useRuntimeConfig();
const imageBaseUrl = runtimeConfig.public.imageBaseUrl;

const localeStore = useLocaleStore();
const locale = computed(() => localeStore.locale);

const mainTitle = computed(() => {
    const localeSuffix = locale.value?.toUpperCase() || 'RU';
    return settings.value?.MAIN_TITLE_BLOCK?.[`VALUE_${localeSuffix}`] || '';
});

const mainSubtitle = computed(() => {
    const localeSuffix = locale.value?.toUpperCase() || 'RU';
    return settings.value?.MAIN_TITLE_DESC?.[`VALUE_${localeSuffix}`] || '';
});

const { data: settings, error: settingsError } = await useFetch('/api/settings', {
    method: 'POST',
    body: {},
});

const { data: itemsData, error: itemsError } = await useFetch('/api/join', {
    method: 'POST',
    body: {},
});

const items = computed(() => {
    const itemList = itemsData.value?.items || [];
    console.log('Computed items:', JSON.stringify(itemList, null, 2));
    return itemList;
});

const getImageUrl = (path: string) => {
    return path ? `${imageBaseUrl}${path}` : '/public/images/belcart.svg';
};

if (settingsError.value) {
    console.error('Failed to fetch settings:', settingsError.value);
}
if (itemsError.value) {
    console.error('Failed to fetch items:', itemsError.value);
}

const handleRegister = () => {
    if (!authStore.token) {
        router.push('/register');
    }
}
</script>

<style lang="scss" scoped>
.join {
    position: relative;
    background-color: $primary;
    color: $font-white;
    margin-left: p2r(40);
    margin-right: p2r(40);
    padding-top: p2r(100);
    padding-bottom: p2r(100);
    border-radius: p2r(48);
    overflow: hidden;
    margin-bottom: p2r(100);

    @media(max-width: 1280px) {
        padding-top: p2r(80);
        padding-bottom: p2r(80);
    }

    @media(max-width: 992px) {
        padding-top: p2r(60);
        padding-bottom: p2r(60);
    }

    @media(max-width: 768px) {
        padding-top: p2r(40);
        padding-bottom: p2r(40);
        margin-left: 0;
        margin-right: 0;
        border-radius: p2r(32);
    }

    @media(max-width: 599px) {
        padding-top: p2r(32);
        padding-bottom: p2r(24);
        border-radius: p2r(16);
        margin-bottom: p2r(32);
    }

    &-image {
        position: absolute;
        right: p2r(-30);
        top: p2r(-30);
        width: p2r(690);

        @media(max-width: 1280px) {
            display: none;
        }
    }

    &-header {
        margin-bottom: p2r(60);

        @media(max-width: 768px) {
            margin-bottom: p2r(40);
        }

        @media(max-width: 599px) {
            margin-bottom: p2r(32);
        }
    }

    &-title {
        color: $font-white;
        margin-bottom: p2r(20);

        @media(max-width: 599px) {
            font-size: p2r(24);
        }
    }

    &-subtitle {
        font-weight: 500;
        font-size: p2r(18);

        @media(max-width: 599px) {
            font-size: p2r(14);
            line-height: 1.3;
        }
    }

    &-card {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        background-color: $bgc;
        color: $font;
        border-radius: p2r(8);
        padding: p2r(60);
        height: 100%;

        @media(max-width: 1366px) {
            padding: p2r(40);
        }

        @media(max-width: 1280px) {
            padding: p2r(32);
        }

        @media(max-width: 1024px) {
            margin-bottom: p2r(24);
            height: calc(100% - 24px);
        }

        @media(max-width: 599px) {
            padding: p2r(32) p2r(20);
            margin-bottom: p2r(16);
            height: calc(100% - 16px);
        }

        &-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: p2r(12);
            margin-bottom: p2r(14);
            width: 100%;

            @media(max-width: 599px) {
                flex-direction: column-reverse;
                align-items: flex-start;
                gap: p2r(16);
            }
        }

        &-title {
            position: relative;
            font-weight: 500;
            font-size: p2r(32);
            line-height: 1.3;
            text-transform: uppercase;

            @media(max-width: 1366px) {
                font-size: p2r(28);
            }

            @media(max-width: 599px) {
                font-size: p2r(24);
            }

            &::after {
                content: '';
                position: absolute;
                left: 0;
                bottom: p2r(-20);
                width: p2r(128);
                height: 1px;
                background-color: $border;

                @media(max-width: 599px) {
                    display: none;
                }
            }
        }

        &-image {
            width: p2r(100);
            flex: 0 0 p2r(100);

            @media(max-width: 1366px) {
                width: p2r(80);
                flex: 0 0 p2r(80);
            }

            @media(max-width: 599px) {
                width: p2r(60);
                flex: 0 0 p2r(60);
            }
        }

        &-text {
            font-size: p2r(16);
            line-height: 1.5;
            margin-bottom: p2r(30);
            max-width: p2r(550);

            @media(max-width: 599px) {
                font-size: p2r(14);
            }

            p {
                margin-bottom: p2r(10);
            }
        }

        &-btn {
            margin-top: auto;
        }
    }

    .error-message {
        color: $font-white;
        font-size: p2r(18);
        text-align: center;
        margin-bottom: p2r(20);
    }
}
</style>