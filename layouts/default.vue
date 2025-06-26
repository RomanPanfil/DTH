<template>
    <div class="page-wrapper">
        <AppHeader />
        <main class="main-content" :class="{grey: isGreyBg}">
            <slot />
        </main>
        <AppFooter />
        <Toast ref="toast" />
    </div>
</template>

<script setup>
import { useTokenRefresh} from "~/composables/useTokenRefresh";

const toast = ref(null);
const { $setToastInstance } = useNuxtApp()
onMounted(() => {
    if (toast.value) {
        $setToastInstance(toast.value)
    }
})

useTokenRefresh();
const route = useRoute();

const isGreyBg = computed(() => route.path.includes('register') || route.path.includes('support') || route.path.includes('recovery') || route.path.includes('thank-you') || (route.path.includes('success') && route.path.includes('payment')))

</script>

<style lang="scss" scoped>

</style>