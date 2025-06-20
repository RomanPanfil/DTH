<template>
    <div class="event-share-links" v-show="isShow">
        <a :href="shareLinks.vk" target="_blank" class="event-share-link" @click="trackShare('vk')">
            <NuxtIcon name="vk-color" class="event-share-link-icon" filled />
        </a>
        <a :href="shareLinks.telegram" target="_blank" class="event-share-link" @click="trackShare('telegram')">
            <NuxtIcon name="tg-color" class="event-share-link-icon" filled />
        </a>
        <a :href="shareLinks.facebook" target="_blank" class="event-share-link" @click="trackShare('facebook')">
            <NuxtIcon name="fb-color" class="event-share-link-icon" filled />
        </a>
        <a :href="shareLinks.ok" target="_blank" class="event-share-link" @click="trackShare('ok')">
            <NuxtIcon name="ok-color" class="event-share-link-icon" filled />
        </a>
        <a :href="shareLinks.twitter" target="_blank" class="event-share-link" @click="trackShare('twitter')">
            <NuxtIcon name="twitter-color" class="event-share-link-icon" filled />
        </a>
        <a href="#" class="event-share-link" @click.prevent="copyLink">
            <NuxtIcon name="link-color" class="event-share-link-icon" filled />
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
    image?: string;
}>();

// Формирование ссылок для шаринга с правильными параметрами
const shareLinks = computed(() => {
    const encodedUrl = encodeURIComponent(props.url);
    const encodedTitle = encodeURIComponent(props.title);
    const encodedDescription = encodeURIComponent(props.description || '');
    const encodedImage = props.image ? encodeURIComponent(props.image) : '';

    // Создаем полный текст для соцсетей, которые не поддерживают отдельные параметры
    const fullText = props.description
        ? `${props.title}\n\n${props.description}`
        : props.title;
    const encodedFullText = encodeURIComponent(fullText);

    return {
        // ВКонтакте - поддерживает title, description и image
        vk: `https://vk.com/share.php?url=${encodedUrl}&title=${encodedTitle}&description=${encodedDescription}${encodedImage ? `&image=${encodedImage}` : ''}`,

        // Telegram - объединяем заголовок и описание в text
        telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedFullText}`,

        // Facebook - использует только URL, описание берется из Open Graph мета-тегов
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,

        // Одноклассники - поддерживает title, description и imageUrl
        ok: `https://connect.ok.ru/offer?url=${encodedUrl}&title=${encodedTitle}&description=${encodedDescription}${encodedImage ? `&imageUrl=${encodedImage}` : ''}`,

        // Twitter - объединяем заголовок и описание в text
        twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedFullText}`,
    };
});

// Функция для копирования ссылки в буфер обмена
// const copyLink = async () => {
//     try {
//         await navigator.clipboard.writeText(props.url);
//         console.log(props.url)
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

// Отслеживание кликов по шарингу (для аналитики)
const trackShare = (platform: string) => {
    // console.log(`Shared on ${platform}`);
    // Здесь можно добавить интеграцию с аналитикой, например, gtag
};
</script>

<style scoped lang="scss">
.event {
    &-share {
        &-head {
            cursor: pointer;
            &-title {
                border-bottom: 1px dotted $font;
                margin-right: p2r(8);
            }
        }

        &-links {
            position: absolute;
            right: 0;
            top: 100%;
            display: flex;
            gap: p2r(12);
            padding: p2r(20);
            background: $bgc;
            box-shadow: 0 4px 35px rgba(114, 142, 174, 0.1);
            border-radius: p2r(8);
            z-index: 2;

            @media (max-width: 599px) {
                width: calc(100vw - 60px);
                flex-wrap: wrap;
            }

            @media (max-width: 420px) {
                width: calc(100vw - 40px);
            }
        }

        &-link {
            &-icon {
                display: block;
                font-size: p2r(48);
                line-height: p2r(32);
            }
        }
    }
}
</style>