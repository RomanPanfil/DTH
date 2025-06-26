<template>
    <div class="news-share-links" v-show="isShow">
        <a :href="shareLinks.vk" target="_blank" class="news-share-link" @click="trackShare('vk')">
            <NuxtIcon name="vk-color" class="news-share-link-icon" filled />
        </a>
        <a :href="shareLinks.telegram" target="_blank" class="news-share-link" @click="trackShare('telegram')">
            <NuxtIcon name="tg-color" class="news-share-link-icon" filled />
        </a>
        <a :href="shareLinks.facebook" target="_blank" class="news-share-link" @click="trackShare('facebook')">
            <NuxtIcon name="fb-color" class="news-share-link-icon" filled />
        </a>
        <a :href="shareLinks.ok" target="_blank" class="news-share-link" @click="trackShare('ok')">
            <NuxtIcon name="ok-color" class="news-share-link-icon" filled />
        </a>
        <a :href="shareLinks.twitter" target="_blank" class="news-share-link" @click="trackShare('twitter')">
            <NuxtIcon name="twitter-color" class="news-share-link-icon" filled />
        </a>
        <a href="#" class="news-share-link" @click.prevent="copyLink">
            <NuxtIcon name="link-color" class="news-share-link-icon" filled />
        </a>
    </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';

const { t } = useI18n();

const props = defineProps<{
    isShow: boolean;
    url: string;
    title: string;
    description?: string;
    image?: string; // Новый проп для изображения
}>();

// Формирование ссылок для шаринга
const shareLinks = computed(() => {
    const encodedUrl = encodeURIComponent(props.url);
    const encodedTitle = encodeURIComponent(props.title);
    const encodedDescription = encodeURIComponent(props.description || '');
    const encodedImage = props.image ? encodeURIComponent(props.image) : '';

    return {
        vk: `https://vk.com/share.php?url=${encodedUrl}&title=${encodedTitle}&description=${encodedDescription}&image=${encodedImage}`,
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&picture=${encodedImage}`,
        ok: `https://connect.ok.ru/offer?url=${encodedUrl}&title=${encodedTitle}&imageUrl=${encodedImage}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    };
});

// Функция для копирования ссылки в буфер обмена
// const copyLink = async () => {
//     try {
//         await navigator.clipboard.writeText(props.url);
//         alert(t('share.linkCopied'));
//     } catch (err) {
//         console.error('Ошибка копирования ссылки:', err);
//         alert(t('share.linkCopyError'));
//     }
// };
const copyLink = async () => {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(props.url);
            alert(t('news.link_copied'));
        } else {
            const textarea = document.createElement('textarea');
            textarea.value = props.url;
            textarea.style.position = 'fixed'; // Скрыть элемент
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            if (success) {
                alert(t('share.linkCopied'));
            } else {
                throw new Error(t('share.linkCopyError'));
            }
        }
    } catch (err) {
        alert(t('share.linkCopyError'));
    }
};
</script>

<style scoped lang="scss">
.news-share-links {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: p2r(12);
    background: $bgc;
    box-shadow: 0px 4px 35px rgba(114, 142, 174, 0.1);
    border-radius: p2r(8);
    padding: p2r(20);

    @media (max-width: 1366px) {
        gap: p2r(8);
        padding: p2r(16);
    }

    @media (max-width: 1024px) {
        justify-content: flex-start;
    }
}

.news-share-link {
    transition: transform 0.2s ease;
    &:hover {
        transform: scale(1.1);
    }

    &-icon {
        display: block;
        font-size: p2r(48);
        line-height: p2r(32);

        @media (max-width: 1366px) {
            font-size: p2r(42);
            line-height: p2r(28);
        }
    }
}
</style>
