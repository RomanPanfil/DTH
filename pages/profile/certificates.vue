<template>
    <div>
        <h1 class="page-title">Сертификаты</h1>
        <p v-if="loading">Загрузка...</p>
        <div class="row" v-if="!loading && !error && certificates.length > 0">
            <div v-for="item in certificates" :key="item.ID" class="col-lg-4 col-xs-6">
                <NuxtLink :to="item.DETAIL_PAGE_URL" class="certificate-card">
                    <div class="certificate-card-image">
                        <img v-if="item.PREVIEW_PICTURE" :src="getImageUrl(item.PREVIEW_PICTURE)" :alt="item.NAME">
                    </div>
                    <div class="certificate-card-content">
                        <NuxtLink :to="item.DETAIL_PAGE_URL" class="certificate-card-title">
                            {{ item.NAME }}
                        </NuxtLink>
                        <a :href="getBaseUrl(item.FILE_SERTIFICATE)" class="certificate-download" download>
                            <NuxtIcon name="download" filled class="certificate-download-icon" />
                            Скачать сертификат
                        </a>
                    </div>
                </NuxtLink>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useI18n } from 'vue-i18n';
import { useLocaleStore } from '~/stores/locale';

const { t } = useI18n();

const config = useRuntimeConfig();
const imageBaseUrl = config.public.imageBaseUrl;
const baseUrl = config.public.baseUrl;
const loading = ref(false);
const error = ref<string | null>(null);
const authStore = useAuthStore();
const localeStore = useLocaleStore();
const locale = computed(() => localeStore.locale);
const certificates = ref<any[]>([]);

// Функция для загрузки сертификатов
const loadCertificates = async () => {
    if (!authStore.token) {
        error.value = 'Токен не найден';
        return;
    }

    loading.value = true;
    error.value = null;

    try {
        // Используем $fetch вместо useFetch для принудительного запроса
        const response = await $fetch('/api/certificates/getusersertificates', {
            method: 'POST',
            body: {
                params: {
                    TOKEN: authStore.token,
                    sort: { ACTIVE_FROM: 'DESC' },
                    resize: [390, 242, true],
                    select: ['NAME', 'IBLOCK_ID', 'ID', 'PREVIEW_PICTURE', 'PROPERTY_*', 'DETAIL_PAGE_URL'],
                    pager: { start: 1, limit: 5 }
                }
            }
        });

        if (response && response.ITEMS) {
            certificates.value = response.ITEMS[locale.value] || [];
        } else {
            certificates.value = [];
        }
    } catch (err: any) {
        error.value = err.statusMessage || err.message || 'Произошла ошибка при загрузке сертификатов';
        console.error('Error fetching certificates:', err);
        certificates.value = [];
    } finally {
        loading.value = false;
    }
};

// Загружаем данные при монтировании компонента
onMounted(() => {
    loadCertificates();
});

// Перезагружаем данные при смене локали
watch(locale, () => {
    loadCertificates();
});

// Перезагружаем данные при смене токена (если пользователь перезашел)
watch(() => authStore.token, (newToken) => {
    if (newToken) {
        loadCertificates();
    } else {
        certificates.value = [];
        error.value = 'Токен не найден';
    }
});

const getImageUrl = (path: string) => {
    if (!path) return '';
    return `${imageBaseUrl}${path}`;
};

const getBaseUrl = (path: string) => {
    if (!path) return '';
    return `${baseUrl}${path}`;
};

// Экспортируем функцию для внешнего вызова (если нужно)
defineExpose({
    loadCertificates
});
</script>

<style lang="scss" scoped>
.error {
    color: $error;
}

.certificate {
    &-card {
        border-radius: p2r(6);
        box-shadow: 0 p2r(4) p2r(35) rgba(114, 142, 174, 0.1);
        background-color: $bgc;
        overflow: hidden;
        margin-bottom: p2r(30);
        height: calc(100% - 30px);
        display: flex;
        flex-direction: column;

        &-image {
            position: relative;
            aspect-ratio: 1.61;
            border-radius: p2r(6);
            overflow: hidden;
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

        &-content {
            position: relative;
            padding: p2r(20) p2r(20) p2r(24) p2r(20);
            display: flex;
            flex-direction: column;
            flex-grow: 1;
        }

        &-title {
            color: $font;
            font-weight: 500;
            font-size: p2r(18);
            line-height: 1.3;
            margin-bottom: p2r(20);
        }
    }

    &-download {
        border: 1px solid $border;
        border-radius: p2r(4);
        padding: p2r(12);
        margin-top: auto;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
        font-size: p2r(14);
        letter-spacing: -0.03em;
        color: #13231E;
        transition: color 0.3s;

        @media (hover: hover) and (pointer: fine) {
            &:hover {
                color: $primary;
            }
        }

        &-icon {
            color: $primary;
            font-size: p2r(24);
            line-height: p2r(20);
            margin-right: p2r(10);
        }
    }
}
</style>