<template>
    <ArticlePage :code="pageCode" />
</template>

<script setup>
import { useRoute } from 'nuxt/app';

const route = useRoute();

const pageCode = computed(() => {
    const pathSegments = route.path.split('/').filter(segment => segment);
    return pathSegments.length > 0 ? pathSegments[pathSegments.length - 1] : 'partners';
});
</script>