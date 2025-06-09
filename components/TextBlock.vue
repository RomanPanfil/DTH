<template>
    <div class="text-block">
        <div v-if="content" v-html="content"></div>
    </div>
</template>

<script setup>
const props = defineProps({
    content: String,
});

console.log('TextBlock props:', props);
</script>

<style scoped lang="scss">
.text-block {
    line-height: 1.6;
    font-size: p2r(18);
    border-bottom: 1px solid $border;
    padding-bottom: p2r(40);

    @media (max-width: 1366px) {
        font-size: p2r(16);
        padding-bottom: p2r(32);
    }

    @media (max-width: 599px) {
        padding-bottom: p2r(24);
    }
}
</style>