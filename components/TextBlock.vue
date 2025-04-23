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
}
</style>