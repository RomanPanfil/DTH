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
import { useTokenRefresh} from "~/composables/useTokenRefresh";

useTokenRefresh();
const route = useRoute();

const isGreyBg = computed(() => route.path.includes('register') || route.path.includes('recovery'))

</script>

<style lang="scss" scoped>

</style>