<template>
    <div class="pagination" v-if="totalPages > 1">
        <button
            class="pagination-btn pagination-prev"
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)"
        >
            <NuxtIcon name="arrow-left" class="pagination-icon" filled />
        </button>
        <button
            v-for="page in visiblePages"
            :key="page"
            class="pagination-link"
            :class="{ active: currentPage === page }"
            @click="changePage(page)"
        >
            {{ page }}
        </button>
        <span
            v-if="totalPages > 5 && visiblePages[visiblePages.length - 1] < totalPages - 1"
            class="pagination-ellipsis"
        >...</span>
        <button
            v-if="totalPages > 5 && visiblePages[visiblePages.length - 1] < totalPages"
            class="pagination-link"
            :class="{ active: currentPage === totalPages }"
            @click="changePage(totalPages)"
        >
            {{ totalPages }}
        </button>
        <button
            class="pagination-btn pagination-next"
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)"
        >
            <NuxtIcon name="arrow-right" class="pagination-icon" filled />
        </button>
    </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { computed } from 'vue';

const props = defineProps<{
    currentPage: number;
    totalPages: number;
    section: string | null;
}>();

const emit = defineEmits(['page-change']);

const route = useRoute();

const visiblePages = computed(() => {
    const pages = [];
    const maxVisible = 3;
    let start = Math.max(1, props.currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(props.totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) start = Math.max(1, end - maxVisible + 1);

    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
});

const changePage = (page: number) => {
    if (page >= 1 && page <= props.totalPages) {
        const query = { ...route.query, page: page.toString() };
        // Сохраняем section, если он есть
        if (props.section && !query.section) {
            query.section = props.section;
        }
        emit('page-change', page);
    }
};
</script>

<style scoped lang="scss">
.pagination {
    display: flex;
    align-items: center;
    gap: p2r(8);
    padding: p2r(20) 0;

    &-btn {
        width: p2r(48);
        height: p2r(48);
        border-radius: 50%;
        border: 1px solid $border;
        background: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: border-color 0.3s;

        @media (hover: hover) and (pointer: fine) {
            &:hover {
                border-color: $primary;

                .pagination-icon {
                    color: $primary;
                }
            }
        }

        &:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            pointer-events: none;
        }

        &:hover:not(:disabled) {
            //background-color: $bgc-dark;
        }
    }

    &-icon {
        font-size: p2r(22);
        line-height: p2r(18);
        color: $font;
        transition: color 0.3s;
    }

    &-link {
        width: p2r(48);
        height: p2r(48);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: p2r(20);
        line-height: p2r(20);
        text-decoration: none;
        color: $font-black;
        border: none;
        background: none;
        cursor: pointer;
        transition: color 0.3s;

        @media (hover: hover) and (pointer: fine) {
            &:not(.active) {
                &:hover {
                    color: $primary;
                }
            }
        }

        &.active {
            background-color: $primary;
            color: $font-white;
            border-color: $primary;
            pointer-events: none;
        }

        &:hover:not(.active) {
            //background-color: $bgc-dark;
        }

        &:first-of-type{
            margin-left: p2r(12);
        }

        &:last-of-type{
            margin-right: p2r(12);
        }
    }

    &-ellipsis {
        font-size: p2r(20);
        color: $font-black;
        padding: 0 p2r(8);
    }
}
</style>