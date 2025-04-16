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
                    {{ rubric.UF_SHORT_NAME || rubric.NAME }}
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

  &-list {
    display: flex;
    flex-wrap: wrap;
    gap: p2r(36);
  }

  &-link {
    font-size: p2r(24);
    line-height: p2r(36);
    color: $font;
    border-bottom: 1px solid $border;

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