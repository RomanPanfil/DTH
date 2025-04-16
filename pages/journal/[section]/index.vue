<template>
    <JournalList :section-code="sectionCode" />
</template>

<script setup lang="ts">

const route = useRoute();
const sectionCode = computed(() => route.params.section);

</script>