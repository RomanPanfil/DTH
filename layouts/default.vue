<template>
    <div class="page-wrapper">
        <AppHeader />
        <main class="main-content" :class="{grey: isGreyBg}">
            <slot />
        </main>
        <AppFooter />
    </div>
</template>

<script setup>
const route = useRoute();

const isGreyBg = computed(() => route.path.includes('register'))
console.log(route.name === 'register')

</script>

<style lang="scss" scoped>

</style>