<template>
    <div class="report">
        <div class="report-head">
            <h2 class="h2 report-head-title">{{ title }}</h2>
            <a :href="linkUrl" class="report-head-more">{{ linkName }}</a>
        </div>
        <div class="gallery-images">
            <div v-for="(photo, index) in photos" :key="index" class="gallery-item">
                <a href="#" class="gallery-item-image" :data-index="index" @click.prevent="$emit('open-popup', index)">
                    <img :src="photo" alt="Report photo" />
                </a>
            </div>
        </div>
    </div>
</template>

<script setup>
const props = defineProps({
    title: String,
    linkName: String,
    linkUrl: String,
    photos: Array,
});

console.log('Report props:', props);

defineEmits(['open-popup']);
</script>

<style scoped lang="scss">
.report {
    margin: p2r(20) 0;
}
.report-head {
    display: flex;
    align-items: baseline;
    margin-bottom: p2r(40);

    @media (max-width: 599px) {
        row-gap: p2r(4);
        flex-direction: column;
        margin-bottom: p2r(30);
    }
}
.report-head-title {
    margin-right: p2r(24);

    @media (max-width: 599px) {
        font-size: p2r(24);
        margin-bottom: 0;
    }
}
.report-head-more {
    font-weight: 500;
    font-size: p2r(18);
    line-height: p2r(18);
    color: $font;
    border-bottom: 1px solid $border-grey;

    @media (max-width: 599px) {
        font-size: p2r(14);
        line-height: 1.3;
    }
}
.report-photos {
    display: flex;
    flex-wrap: wrap;
}

</style>