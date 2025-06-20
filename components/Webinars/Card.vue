<template>
    <div class="education-card">
        <NuxtLink :to="getEventUrl(event)" class="education-card-image">
            <img v-if="event.PREVIEW_PICTURE" :src="getImageUrl(event.PREVIEW_PICTURE)" :alt="event.NAME" />
            <div v-if="isFav" class="education-card-fav" @click.stop.prevent="handleRemoveFav">
                <NuxtIcon name="heart-filled" filled class="education-card-fav-icon" />
            </div>
        </NuxtLink>
        <div class="education-card-content">
            <div class="education-card-badges">
                <div class="education-card-badge ui-badge">{{ event.PROPS.TYPE?.VALUE }}</div>
                <div v-if="event.PROPS.LESSONS?.VALUE.length || event.PROPS.VIDEO_LONG?.VALUE" class="education-card-badge ui-badge ui-badge__dark">
                    <span v-if="event.PROPS.LESSONS?.VALUE.length">{{ event.PROPS.LESSONS?.VALUE.length }} {{ declineWord(event.PROPS.LESSONS?.VALUE.length, ['урок', 'урока', 'уроков']) }}</span>
                    <span v-if="event.PROPS.VIDEO_LONG?.VALUE">{{ event.PROPS.VIDEO_LONG?.VALUE }}</span>
                </div>
            </div>
            <NuxtLink to="/">
                <h4 class="education-card-title">{{ event.NAME }}</h4>
            </NuxtLink>
            <div v-if="event.lectors" class="education-card-names">{{ getLectorNames(event.lectors) }}</div>
            <div v-if="event.PROPS.IS_FREE.VALUE" class="education-card-free">{{ event.PROPS.IS_FREE.NAME }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, ref } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { useModalsStore } from '~/stores/modals';
import { useI18n } from 'vue-i18n';

const props = defineProps<{
    event: any;
    isFav: boolean;
}>();

const config = useRuntimeConfig();
const imageBaseUrl = config.public.imageBaseUrl;
const authStore = useAuthStore();
const modalsStore = useModalsStore();
const { t } = useI18n();

const isRemovingFav = ref(false);

// Функция для склонения слова
const declineWord = (number: number, words: [string, string, string]): string => {
    number = Math.abs(number) % 100;
    const lastDigit = number % 10;

    if (number > 10 && number < 20) {
        return words[2]; // 11–14 уроков
    }
    if (lastDigit > 1 && lastDigit < 5) {
        return words[1]; // 2–4 урока
    }
    if (lastDigit === 1) {
        return words[0]; // 1 урок
    }
    return words[2]; // 0, 5–9, 10 уроков
};

const getLectorNames = (lectors: any[]) => {
    if (!lectors || lectors.length === 0) return '';
    return lectors.map(lector => lector.name).join(', ');
};

const getImageUrl = (path: string) => {
    return `${imageBaseUrl}${path}`;
};

const getEventUrl = (event: any) => {
    return `/webinars/${event.CODE}`;
};

const handleRemoveFav = async () => {
    if (!authStore.isAuthenticated) {
        modalsStore.openModal('login');
        return;
    }

    if (!props.event?.ID) {
        console.error('handleRemoveFav: Event ID not found');
        return;
    }

    isRemovingFav.value = true;

    try {
        const eventId = Number(props.event.ID);

        await $fetch('/api/favorites/remove', {
            method: 'POST',
            body: {
                token: authStore.token,
                itemId: eventId
            }
        });

        authStore.removeFavorite(eventId);

        // Синхронизируем избранное с сервером
        await authStore.fetchProfile();
    } catch (error) {
        console.error('handleRemoveFav: Error:', error);
        const errorMessage = error.data?.error || error.statusMessage || t('favorites.errorGeneric');
        if (error.data?.error === 'ERROR_INVALID_TOKEN') {
            console.warn('handleRemoveFav: Invalid token, opening login modal');
            modalsStore.openModal('login');
        } else if (error.data?.error === 'ERROR_ITEM_NOT_FAVORITE') {
            await authStore.fetchProfile();
        } else {
            console.error('handleRemoveFav: Unknown error:', errorMessage);
        }
    } finally {
        isRemovingFav.value = false;
    }
};
</script>

<style scoped lang="scss">
.education {
    &-card {
        display: flex;
        flex-direction: column;
        background-color: $bgc;
        box-shadow: 0 p2r(4) p2r(35) rgba(114, 142, 174, 0.1);
        border-radius: p2r(6);
        margin-bottom: p2r(60);
        height: calc(100% - 3.75rem);
        overflow: hidden;

        @media(max-width: 1366px) {
            margin-bottom: p2r(50);
            height: calc(100% - 3.125rem);
        }

        @media(max-width: 768px) {
            margin-bottom: p2r(40);
            height: calc(100% - 2.5rem);
        }

        @media(max-width: 599px) {
            margin-bottom: p2r(32);
            height: calc(100% - 2rem);
        }

        @media(max-width: 420px) {
            margin-bottom: p2r(24);
            height: calc(100% - 1.5rem);
        }

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
            padding: p2r(20);
        }

        &-badges {
            display: flex;
            gap: p2r(4);
            margin-bottom: p2r(20);
        }

        &-title {
            font-weight: 500;
            font-size: p2r(20);
            line-height: 1.3;
            color: $font;
            margin-bottom: p2r(20);
        }

        &-names {
            font-weight: 400;
            font-size: p2r(14);
            color: $font-grey;
        }

        &-free {
            font-weight: 600;
            font-size: p2r(20);
            margin-top: p2r(20);
        }

        &-fav {
            position: absolute;
            top: p2r(20);
            right: p2r(20);
            width: p2r(40);
            height: p2r(40);
            border-radius: p2r(4);
            background-color: $bgc;
            cursor: pointer;
            transition: opacity 0.3s;

            &[disabled] {
                opacity: 0.5;
                cursor: not-allowed;
            }

            &-icon {
                font-size: p2r(24);
                line-height: p2r(20);
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
        }
    }
}
</style>