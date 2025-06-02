<template>
    <div class="advantages">
        <div v-if="pending" class="advantages-placeholder">
            Загрузка данных...
        </div>
        <div v-else-if="error" class="advantages-placeholder">
            Ошибка загрузки данных: {{ error.message || 'Неизвестная ошибка' }}
        </div>
        <div v-else-if="data.items && data.items.length" class="row">
            <div v-for="(item, index) in data.items" :key="index" class="col-md-3 col-sm-6">
                <div class="advantages-item">
                    <img :src="imageBaseUrl + item.icon" :alt="`Иконка преимущества ${index + 1}`" class="advantages-icon" />
                    <div class="advantages-text">{{ item.text }}</div>
                </div>
            </div>
        </div>
        <div v-else class="advantages-placeholder">
            Нет данных для отображения
        </div>
    </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const imageBaseUrl = config.public.imageBaseUrl;

// Загрузка данных преимуществ
const { data, pending, error, refresh } = await useAsyncData('advantages', async () => {
    try {
        const response = await $fetch('/api/advantages', {
            query: {
                iblockId: 17,
                GET_ALL_FILES: 'Y',
            },
        });
        if (response.error) {
            throw new Error(response.details);
        }
        return response; // Возвращаем весь объект ответа
    } catch (err) {
        console.error('Ошибка загрузки преимуществ:', err);
        return { title: 'Почему мы?', items: [] };
    }
});

// Ручное обновление данных для проверки
const checkData = () => {
    refresh();
};
</script>

<style scoped lang="scss">
.advantages {
    padding-left: p2r(20);
    padding-right: p2r(20);

    &-item {
        display: flex;
        align-items: center;
        //justify-content: center;
        gap: p2r(20);
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: p2r(8);
        height: 100%;

        @media(max-width: 1023px) {
            margin-bottom: p2r(20)
        }
    }

    &-icon {
        width: p2r(68);
        height: p2r(68);
        flex: 0 0 p2r(68);
        object-fit: contain;
        margin-bottom: p2r(10);

        @media(max-width: 1366px) {
            width: p2r(52);
            height: p2r(52);
            flex: 0 0 p2r(52);
        }

        @media(max-width: 1280px) {
            width: p2r(52);
            height: p2r(52);
            flex: 0 0 p2r(52);
        }
    }

    &-text {
        @media(max-width: 1366px) {
            font-size: p2r(15);
        }
        @media(max-width: 1280px) {
            font-size: p2r(14);
        }
    }

    &-placeholder {
        color: $font-white;
        font-size: p2r(16);
        padding: p2r(20);
    }
}
</style>