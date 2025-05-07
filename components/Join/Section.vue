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
                        {{ settings?.MAIN_TITLE_BLOCK?.VALUE_RU }}
                    </h2>
                    <div class="join-subtitle">
                        {{ settings?.MAIN_TITLE_DESC?.VALUE_RU }}
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
                            <a
                                :href="item.PROPS?.BTN_LINK?.VALUE || '#'"
                                class="ui-btn ui-btn__primary"
                            >
                                {{ item.PROPS?.BTN_TEXT?.VALUE }}
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
const runtimeConfig = useRuntimeConfig();
const imageBaseUrl = runtimeConfig.public.imageBaseUrl;

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

    &-image {
        position: absolute;
        right: p2r(-30);
        top: p2r(-30);
        width: p2r(690);
    }

    &-header {
        margin-bottom: p2r(60);
    }

    &-title {
        color: $font-white;
        margin-bottom: p2r(20);
    }

    &-subtitle {
        font-weight: 500;
        font-size: p2r(18);
    }

    &-card {
        background-color: $bgc;
        color: $font;
        border-radius: p2r(8);
        padding: p2r(80) p2r(80) p2r(100) p2r(80);
        height: 100%;

        &-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: p2r(20);
        }

        &-title {
            font-weight: 500;
            font-size: p2r(32);
            line-height: 1.3;
        }

        &-image {
            width: p2r(55);
            flex: 0 0 p2r(55);
        }

        &-text {
            font-size: p2r(16);
            line-height: 1.5;
            margin-bottom: p2r(30);
            max-width: p2r(518);

            p {
                margin-bottom: p2r(10);
            }
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