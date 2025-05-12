<template>
    <div class="event-card">
        <NuxtLink :to="getEventUrl(event)" class="event-card-image">
            <img :src="getImageUrl(event.PREVIEW_PICTURE)" :alt="event.NAME" />
            <div class="event-card-info">
                <div v-if="event.PROPS.WHEN_DATE?.VALUE" class="event-card-info-item">
                    {{ formatEventDates(event.PROPS.WHEN_DATE?.VALUE) }}
                </div>
                <div v-if="event.PROPS.WHEN_ADDR?.VALUE" class="event-card-info-item">
                    {{ event.PROPS.CITY.VALUE}}
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

// Форматирование дат мероприятия с использованием диапазонов
const formatEventDates = (dateStrings: string[]) => {
    if (!dateStrings || !Array.isArray(dateStrings) || dateStrings.length === 0)
        return 'Дата не указана';

    // Сортируем даты
    const sortedDates = [...dateStrings].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    // Преобразуем строки дат в объекты для группировки
    const dates = sortedDates.map(dateString => {
        const date = new Date(dateString);
        // Получаем русское название месяца и берем только первые 3 буквы без склонения
        const fullMonth = date.toLocaleDateString('ru-RU', { month: 'long' });
        const shortMonth = fullMonth.substring(0, 3);

        return {
            date: date,
            day: date.getDate(),
            month: date.getMonth(),
            monthFormatted: shortMonth
        };
    });

    // Группируем даты по месяцам
    const groupedByMonth: { [key: string]: number[] } = {};
    dates.forEach(dateObj => {
        const monthKey = dateObj.monthFormatted;
        if (!groupedByMonth[monthKey]) {
            groupedByMonth[monthKey] = [];
        }
        groupedByMonth[monthKey].push(dateObj.day);
    });

    // Форматируем каждую группу месяцев
    const formattedGroups: string[] = [];

    for (const [month, days] of Object.entries(groupedByMonth)) {
        // Сортируем дни
        days.sort((a, b) => a - b);

        // Находим последовательные дни
        const ranges: Array<[number, number]> = [];
        let rangeStart = days[0];
        let rangeEnd = days[0];

        for (let i = 1; i < days.length; i++) {
            if (days[i] === rangeEnd + 1) {
                // Продолжаем текущий диапазон
                rangeEnd = days[i];
            } else {
                // Завершаем текущий диапазон и начинаем новый
                ranges.push([rangeStart, rangeEnd]);
                rangeStart = days[i];
                rangeEnd = days[i];
            }
        }

        // Добавляем последний диапазон
        ranges.push([rangeStart, rangeEnd]);

        // Форматируем диапазоны дней
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

// Получение URL изображения
const getImageUrl = (path: string) => {
    return path ? `${imageBaseUrl}${path}` : '/images/examples/new-image.jpg';
};

// Получение URL мероприятия
const getEventUrl = (event: any) => {
    return `/courses/${event.CODE}`;
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