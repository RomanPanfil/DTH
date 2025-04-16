<!--<template>-->
<!--    <NewsDetail :news-id="newsId" />-->
<!--</template>-->

<!--<script setup lang="ts">-->
<!--const route = useRoute();-->
<!--const newsId = route.params.id;-->
<!--</script>-->



<template>
    <NewsDetail :news-code="newsCode" />
</template>

<script setup lang="ts">
const route = useRoute();
const newsCode = route.params.code;
</script>