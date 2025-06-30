<template>
    <div
            class="journal-card"
            :class="{ backgrounder: isReport }"
    >
        <NuxtLink :to="itemUrl" class="journal-card-image">
            <img :src="imageUrl" :alt="item.NAME" />
        </NuxtLink>
        <div class="journal-card-content">
            <div class="journal-card-badge ui-badge">
                {{ rubricName || 'Без категории' }}
            </div>
            <NuxtLink :to="itemUrl" class="journal-card-title">
                {{ item.NAME }}
            </NuxtLink>
            <div v-if="currentRubric.ID === '2'" class="journal-card-info">
                <span v-for="theme in item.PROPS.THEMES?.VALUE" :key="item.PROPS.THEMES?.VALUE">{{ theme }}</span>
            </div>
            <div v-else-if="currentRubric.ID === '3'" class="journal-card-info">
                <span v-if="item.PROPS.REPORT_GALLERY?.VALUE">{{ item.PROPS.REPORT_GALLERY?.VALUE.length }} {{ $t('report.photo') }}</span>
                <span v-if="item.PROPS.REPORT_GR?.VALUE">{{ item.PROPS.REPORT_GR?.VALUE.length }} {{ $t('report.video') }}</span>
            </div>
            <div v-else class="journal-card-info">{{ formattedDate || '' }}</div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRuntimeConfig } from 'nuxt/app';
import { useLocaleStore } from '~/stores/locale';

const props = defineProps({
    item: {
        type: Object,
        required: true
    },
    rubrics: {
        type: Array,
        default: () => []
    }
});

// Получаем конфигурацию и локаль внутри компонента
const config = useRuntimeConfig();
const imageBaseUrl = config.public.imageBaseUrl;

const localeStore = useLocaleStore();
const locale = computed(() => localeStore.locale);

const imageUrl = computed(() => {
    return props.item.PREVIEW_PICTURE
        ? `${imageBaseUrl}${props.item.PREVIEW_PICTURE}`
        : '/images/examples/new-image.jpg';
});

const currentRubric = computed(() => {
    if (!props.item.IBLOCK_SECTION_ID) return null;
    return props.rubrics.find(r => r.ID === String(props.item.IBLOCK_SECTION_ID));
});

const rubricName = computed(() => {
    if (!currentRubric.value) return null;
    return currentRubric.value.UF_SHORT_NAME || currentRubric.value.NAME;
});

const isReport = computed(() => {
    return currentRubric.value?.UF_SHORT_NAME === 'Отчеты';
});

const isArticle = computed(() => {
    return currentRubric.value?.UF_SHORT_NAME === 'Статьи';
});

const formattedDate = computed(() => {
    if (!props.item.DATE_ACTIVE_FROM) return '';
    const date = new Date(props.item.DATE_ACTIVE_FROM);
    return date.toLocaleDateString(`${locale.value.toLowerCase()}-${locale.value}`, {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
});

const itemUrl = computed(() => {
    const sectionId = props.item.IBLOCK_SECTION_ID;
    const rubric = props.rubrics.find(r => r.ID === String(sectionId));
    const itemSectionCode = rubric?.CODE || 'unknown';
    return `/journal/${itemSectionCode}/${props.item.CODE}`;
});
</script>

<style scoped lang="scss">
.journal {
  &-card {
    border-radius: p2r(6);
    box-shadow: 0 p2r(4) p2r(35) rgba(114, 142, 174, 0.1);
    background-color: $bgc;
    overflow: hidden;
    margin-bottom: p2r(60);
    height: calc(100% - 3.75rem);
    display: flex;
    flex-direction: column;

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
      aspect-ratio: 2;
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
      transition: color 0.3s;

      @media (hover: hover) and (pointer: fine) {
         &:hover {
           color: $primary;
         }
      }

        @media(max-width: 599px) {
            font-size: p2r(16);
            line-height: 1.3;
            margin-bottom: p2r(16);
        }
    }

    &-info {
      font-size: p2r(14);
      line-height: p2r(17);
      color: $font-grey;
      margin-top: auto;

      span {
        margin-right: p2r(24);
        position: relative;

        &:last-child {
          margin-right: 0;

          &::after {
            display: none;
          }
        }

        &::after {
          content: '';
          position: absolute;
          top: 55%;
          right: p2r(-12);
          transform: translate(50%, -50%);
          width: p2r(4);
          height: p2r(4);
          border-radius: 50%;
          background-color: $font-grey;
        }
      }
    }

    &.backgrounder {
      position: relative;
      color: $font-white-light;
      filter: brightness(90%);
      transition: filter 0.3s;

        @media (hover: hover) and (pointer: fine) {
          &:hover {
          filter: brightness(100%);
        }
      }

      .journal-card-content {
        position: static;
      }

      .journal-card-image {
        img {
          aspect-ratio: unset;
          position: absolute;
          top: 0;
          bottom: 0;
          right: 0;
          left: 0;
        }
      }
      .journal-card-title {
        position: relative;
        color: $font-white-light;
      }
      .journal-card-info {
        position: relative;
        color: $font-white-light;
        span {
          &::after {
            background-color: $font-white-light;
          }
        }
      }
    }
  }
}
</style>