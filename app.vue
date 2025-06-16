<template>
    <NuxtLayout>
        <NuxtPage />
        <ClientOnly>
            <Modals />
        </ClientOnly>
    </NuxtLayout>
</template>

<script setup>
// import { useAuthStore } from '~/stores/auth'
//
// const authStore = useAuthStore()
//
// // Инициализируем store при монтировании приложения
// onMounted(() => {
//     authStore.initialize()
// })
//
// // Также можно инициализировать в процессе гидратации
// if (process.client) {
//     authStore.initialize()
// }
</script>