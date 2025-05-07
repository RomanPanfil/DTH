<template>
    <div class="event-card">
        <NuxtLink :to="getEventUrl(event)" class="event-card-image">
            <img :src="getImageUrl(event.PREVIEW_PICTURE)" :alt="event.NAME" />
            <div class="event-card-info">
                <div v-if="event.PROPS.WHEN_DATE?.VALUE" class="event-card-info-item">
                    {{ formatEventDates(event.PROPS.WHEN_DATE?.VALUE) }}
                </div>
                <div v-if="event.PROPS.WHEN_ADDR?.VALUE" class="event-card-info-item">
                    {{ event.PROPS.WHEN_ADDR?.VALUE }}
                </div>
                <div v-if="event.PROPS.FORMAT?.VALUE && event.PROPS.FORMAT?.VALUE === 'Online'" class="event-card-info-item">
                    {{ event.PROPS.FORMAT?.VALUE }}
                </div>
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
import { defineProps } from 'vue';

// Определяем пропсы для компонента
const props = defineProps<{
    event: any;
}>();

// Получаем конфигурацию из runtimeConfig
const config = useRuntimeConfig();
const imageBaseUrl = config.public.imageBaseUrl;

// Функция для форматирования имен лекторов с запятыми
const getLectorNames = (lectors: any[]) => {
    if (!lectors || lectors.length === 0) return '';
    return lectors.map(lector => lector.name).join(', ');
};

// Форматирование дат мероприятия
const formatEventDates = (dateStrings: string[]) => {
    if (!dateStrings || !Array.isArray(dateStrings)) return 'Дата не указана';
    return dateStrings.map(dateString => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
    }).join(', ');
};

// Получение URL изображения
const getImageUrl = (path: string) => {
    return path ? `${imageBaseUrl}${path}` : '/images/examples/new-image.jpg';
};

// Получение URL мероприятия
const getEventUrl = (event: any) => {
    return `/events/${event.CODE}`;
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
        background: $font-dark-grey;
        border-radius: p2r(2);
        padding: p2r(7) p2r(10) p2r(5) p2r(10);
      }
    }

    &-content {
      position: relative;
      padding: p2r(20) p2r(20) p2r(30) p2r(20);
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
      margin-bottom: p2r(20);
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
      padding-top: p2r(40);
    }
  }
}
</style>