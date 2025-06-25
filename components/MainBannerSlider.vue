<template>
    <div class="slider">
        <div class="slider-cards">
            <Swiper
                    :modules="modules"
                    :slides-per-view="1"
                    :space-between="0"
                    :loop="true"
                    :autoplay="{ delay: 5000, disableOnInteraction: false }"
                    class="slider-swiper"
            >
                <SwiperSlide v-for="banner in banners" :key="banner.ID">
                    <a :href="banner.link" class="slider-card">
                        <picture>
                            <source
                                    :srcset="imageBaseUrl + banner.imageMobile"
                                    media="(max-width: 599px)"
                                    v-if="banner.imageMobile"
                            />
                            <source
                                    :srcset="imageBaseUrl + banner.imageTablet"
                                    media="(min-width: 600px) and (max-width: 1023px)"
                                    v-if="banner.imageTablet"
                            />
                            <source
                                    :srcset="imageBaseUrl + banner.imagePC"
                                    media="(min-width: 1024px)"
                                    v-if="banner.imagePC"
                            />
                            <img
                                    :src="imageBaseUrl + banner.imagePC || '/images/placeholder.jpg'"
                                    :alt="banner.title"
                                    class="slider-card-image"
                            />
                        </picture>
                        <div v-if="banner.hasHtmlCode" class="slider-card-content" v-html="getDecodedHTML(banner.htmlContent)"></div>
                    </a>
                </SwiperSlide>
            </Swiper>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Swiper, SwiperSlide } from 'swiper/vue';
import { Autoplay, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';

const config = useRuntimeConfig();
const imageBaseUrl = config.public.imageBaseUrl;

const modules = [Autoplay, Pagination];

const { data, error } = await useAsyncData('bannerSlider', async () => {
    try {
        const response = await $fetch('/api/banner', {
            query: {
                iblockId: 16,
                GET_ALL_FILES: 'Y',
            },
        });
        if (response.error) {
            throw new Error(response.details);
        }
        return response.banners || [];
    } catch (err) {
        console.error('Ошибка загрузки баннеров:', err);
        return [];
    }
});

const banners = ref(data.value?.map(banner => {
    const htmlCode = banner.PROPS.HTML_CODE?.VALUE?.TEXT;
    return {
        ID: banner.ID,
        title: banner.NAME || 'Без названия',
        imagePC: banner.PROPS.IMG_PC?.VALUE_PATH || '/images/placeholder.jpg',
        imageTablet: banner.PROPS.IMG_TABLET?.VALUE_PATH || banner.PROPS.IMG_PC?.VALUE_PATH || '/images/placeholder.jpg',
        imageMobile: banner.PROPS.IMG_MOBILE?.VALUE_PATH || banner.PROPS.IMG_TABLET?.VALUE_PATH || banner.PROPS.IMG_PC?.VALUE_PATH || '/images/placeholder.jpg',
        link: banner.PROPS.LINK?.VALUE || '/',
        hasHtmlCode: !!htmlCode,
        htmlContent: htmlCode || '',
    };
}) || []);

if (error.value) {
    console.error('BannerSlider: Ошибка useAsyncData:', error.value);
}

function decodeHTML(text) {
    if (!text) return '';

    const entities = {
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&amp;': '&',
        '&nbsp;': ' '
    };

    let decodedText = text.replace(/&lt;|&gt;|&quot;|&amp;|&nbsp;/g, match => entities[match]);

    decodedText = decodedText.replace(/\r\n/g, ' ');

    decodedText = decodedText.replace(/<img\s+[^>]*src="([^"]+)"[^>]*>/gi, (match, src) => {
        if (src.startsWith('/upload')) {
            return match.replace(src, `${baseUrl}${src}`);
        }
        return match;
    });

    return decodedText;
}

const getDecodedHTML = (text: string) => {
    return decodeHTML(text);
};
</script>

<style scoped lang="scss">
.slider {
  position: relative;
    margin-bottom: p2r(70);

    @media (max-width: 1280px) {
        margin-bottom: p2r(50);
    }
    @media (max-width: 1140px) {
        margin-bottom: p2r(42);
    }
    @media (max-width: 1024px) {
        margin-bottom: p2r(32);
    }

  &-cards {
    position: relative;
  }

  &-card {
    position: relative;
    display: block;
    overflow: hidden;
    aspect-ratio: 390/440;
    border-radius: p2r(8);

    @media(max-width: 1024px) {
      aspect-ratio: 344/172;
    }

    @media(max-width: 599px) {
      aspect-ratio: 344/172;
    }

    &-image {
      position: absolute;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 1;
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }

    &-content:deep() {
      position: relative;
      z-index: 2;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding-left: p2r(115);
      color: $font-white;
      width: 60%;

      @media(max-width: 599px) {
        padding: p2r(20);
        width: 100%;
      }

      h2 {
        text-transform: uppercase;

        @media(max-width: 599px) {
          font-size: p2r(24);
          line-height: p2r(29);
        }
      }
      h3 {
        @media(max-width: 599px) {
          font-size: 16px;
          line-height: 1.3;
        }
      }

      h2, h3, h4, h5, h6 {
        color: $font-white;
      }
    }
  }

  &-swiper {
    width: 100%;
    height: 100%;
  }
}

.swiper-slide {
  height: auto;
}
</style>