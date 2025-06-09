<template>
    <div class="rubrics" ref="rubricsRef">
        <div v-if="error" class="error-message">{{ error }}</div>
        <ul v-else class="rubrics-list">
            <li>
                <NuxtLink
                    to="/journal"
                    class="rubrics-link"
                    :class="{ active: !sectionCode }"
                >
                    {{ $t('rubrics.all') }}
                </NuxtLink>
            </li>
            <li v-for="rubric in rubrics" :key="rubric.ID" class="rubrics-item">
                <NuxtLink
                    :to="`/journal/${rubric.CODE}`"
                    :class="{ 'rubrics-link': true, 'active': isActive(rubric.CODE) }"
                >
                    {{ rubric.NAME || rubric.UF_SHORT_NAME }}
                </NuxtLink>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">

const route = useRoute();

// Получаем CODE из пути вместо query.section
const sectionCode = computed(() => route.params.section || null);

const { data, error } = await useFetch('/api/rubrics');
const rubrics = computed(() => data.value?.rubrics || []);

const rubricsRef = ref(null);
defineExpose({
    rubricsRef,
});

const isActive = (code) => {
    return sectionCode.value === code;
};
</script>

<style scoped lang="scss">

.rubrics {
  margin-bottom: p2r(60);

  @media(max-width: 1366px) {
    margin-bottom: p2r(50);
  }

  @media(max-width: 768px) {
    margin-bottom: p2r(40);
  }

    @media(max-width: 599px) {
        margin-bottom: p2r(32);
    }

    @media(max-width: 420px) {
        margin-bottom: p2r(24);
    }

  &-list {
    display: flex;
    flex-wrap: wrap;
    gap: p2r(36);

    @media(max-width: 1024px) {
      flex-wrap: nowrap;
      overflow-y: auto;
      margin-left: p2r(-35);
      margin-right: p2r(-35);
      padding-left: p2r(35);
      padding-right: p2r(35);
      scrollbar-width: none;
      gap: p2r(32);
    }

    @media(max-width: 599px) {
      margin-left: p2r(-30);
      margin-right: p2r(-30);
      padding-left: p2r(30);
      padding-right: p2r(30);
      gap: p2r(28);
    }

    @media(max-width: 420px) {
      margin-left: p2r(-20);
      margin-right: p2r(-20);
      padding-left: p2r(20);
      padding-right: p2r(20);
      gap: p2r(24);
    }
  }

  &-link {
    font-size: p2r(24);
    line-height: p2r(36);
    color: $font;
    border-bottom: 1px solid $border;
    white-space: nowrap;

    @media(max-width: 1366px) {
      font-size: p2r(22);
      line-height: 1.3;
    }

    @media(max-width: 768px) {
      font-size: p2r(20);
    }

    @media(max-width: 599px) {
      font-size: p2r(18);
    }

      @media(max-width: 420px) {
          font-size: p2r(16);
      }

    &.active {
      font-weight: 500;
      color: $font-grey;
      border: none;
    }

    @media (hover: hover) {
      &:hover:not(.active) {
          color: $font-grey;
      }
    }
  }
}
</style>