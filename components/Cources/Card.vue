<template>
    <div class="event-card">
        <NuxtLink :to="getEventUrl(event)" class="event-card-image">
            <img :src="getImageUrl(event.PREVIEW_PICTURE)" :alt="event.NAME" />
            <div class="event-card-info">
                <div v-if="event.PROPS.WHEN_DATE?.VALUE" class="event-card-info-item">
                    {{ formatEventDates(event.PROPS.WHEN_DATE?.VALUE) }}
                </div>
                <div v-if="event.PROPS.WHEN_ADDR?.VALUE" class="event-card-info-item">
                    {{ event.PROPS.CITY.VALUE }}
                </div>
                <div v-if="event.PROPS.FORMAT?.VALUE && event.PROPS.FORMAT?.VALUE === 'Online'" class="event-card-info-item">
                    {{ event.PROPS.FORMAT?.VALUE }}
                </div>
            </div>
            <div v-if="isFav" class="event-card-fav" @click.stop.prevent="handleRemoveFav">
                <NuxtIcon name="heart-filled" filled class="event-card-fav-icon" />
            </div>
        </NuxtLink>
        <div class="event-card-content">
            <div class="event-card-badge ui-badge">
                {{ event.PROPS.TYPE?.VALUE || 'Без категории' }}
            </div>
            <NuxtLink :to="getEventUrl(event)" class="event-card-title">
                {{ event.NAME }}
            </NuxtLink>
            <div class="event-card-lectors">
        <span class="event-card-lector">
          {{ getLectorNames(event.lectors) }}
        </span>
            </div>
            <div v-if="event.PROPS.SEATS?.VALUE" class="event-card-seats">
                Осталось мест {{ Math.max(0, event.PROPS.SEATS?.VALUE - (event.PROPS.REGISTERED?.VALUE || 0)) }}
                из {{ event.PROPS.SEATS?.VALUE }}
            </div>
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

const getLectorNames = (lectors: any[]) => {
    if (!lectors || lectors.length === 0) return '';
    return lectors.map(lector => lector.name).join(', ');
};

const formatEventDates = (dateStrings: string[]) => {
    if (!dateStrings || !Array.isArray(dateStrings) || dateStrings.length === 0)
        return 'Дата не указана';

    const sortedDates = [...dateStrings].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    const dates = sortedDates.map(dateString => {
        const date = new Date(dateString);
        const fullMonth = date.toLocaleDateString('ru-RU', { month: 'long' });
        const shortMonth = fullMonth.substring(0, 3);

        return {
            date: date,
            day: date.getDate(),
            month: date.getMonth(),
            monthFormatted: shortMonth
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

const getImageUrl = (path: string) => {
    return path ? `${imageBaseUrl}${path}` : '/images/examples/new-image.jpg';
};

const getEventUrl = (event: any) => {
    return `/courses/${event.CODE}`;
};

const handleRemoveFav = async () => {
    if (!authStore.isAuthenticated) {
        console.log('handleRemoveFav: User not authenticated, opening login modal');
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
        console.log('handleRemoveFav: Removing from favorites, ID:', eventId, 'Current favorites:', authStore.favorites);

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
            console.log('handleRemoveFav: Item not favorite, syncing favorites');
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
.event {
    &-card {
        border-radius: p2r(6);
        box-shadow: 0 p2r(4) p2r(35) rgba(114, 142, 174, 0.1);
        background-color: $bgc;
        overflow: hidden;
        margin-bottom: p2r(60);
        height: calc(100% - 3.75rem);
        display: flex;
        flex-direction: column;

        &-image {
            position: relative;
            aspect-ratio: 1.61;
            border-radius: p2r(6);
            overflow: hidden;

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

        &-info {
            position: absolute;
            top: p2r(20);
            left: p2r(20);
            display: flex;
            flex-wrap: wrap;
            gap: p2r(4);

            &-item {
                font-weight: 600;
                font-size: p2r(12);
                line-height: 1.3;
                text-transform: uppercase;
                color: $font-white;
                background: $primary;
                border-radius: p2r(2);
                padding: p2r(7) p2r(10) p2r(5) p2r(10);
            }
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

        &-content {
            position: relative;
            padding: p2r(20) p2r(20) p2r(24) p2r(20);
            display: flex;
            flex-direction: column;
            flex-grow: 1;
        }

        &-badge {
            position: absolute;
            left: p2r(20);
            top: p2r(20);
        }

        &-title {
            color: $font;
            padding-top: p2r(46);
            font-weight: 500;
            font-size: p2r(20);
            line-height: p2r(26);
            margin-bottom: p2r(16);
        }

        &-lector {
            font-size: p2r(14);
            line-height: p2r(17);
            color: $font-grey;
            margin-bottom: p2r(5);
        }

        &-seats {
            font-size: p2r(14);
            color: $font;
            margin-top: auto;
            align-self: flex-end;
            padding-top: p2r(22);
        }
    }
}
</style>