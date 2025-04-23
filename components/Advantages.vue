<template>
    <div class="advantages">
        <h2 class="advantages-title">{{ title }}</h2>
        <div class="advantages-list">
            <div v-for="item in items" :key="item.text" class="advantage-item">
                <img v-if="item.icon" :src="item.icon" alt="Advantage icon" class="advantage-icon" />
                <p>{{ item.text }}</p>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    title: String,
    items: Array,
});

console.log('Advantages props:', props);
</script>

<style scoped lang="scss">
.advantages {
    margin: p2r(40) 0;
    display: flex;
}
.advantages-title {
    max-width: p2r(250);
    flex: 0 0 p2r(250);
    font-weight: 500;
    font-size: p2r(32);
    line-height: 1.35;
}
.advantages-list {
    display: flex;
    flex-wrap: wrap;
    column-gap: p2r(70);
    row-gap: p2r(58);
}
.advantage-item {
    display: flex;
    align-items: center;
    width: calc(50% - 70px);
}
.advantage-icon {
    width: p2r(68);
    height: p2r(68);
    display: block;
    margin-right: p2r(20);
    object-fit: contain;
}
p {
    margin: 0;
    font-weight: 500;
    line-height: 1.3;
}
</style>