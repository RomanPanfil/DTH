// @ts-ignore
export default defineNuxtConfig({
  plugins: ['~/plugins/auth.ts', '~/plugins/vee-validate.ts'],
  modules: ['@nuxt/image',  'nuxt-icons', 'nuxt-swiper', '@pinia/nuxt'],
  css: ["~/assets/scss/main.scss", 'plyr/dist/plyr.css'],
  // css: ["~/assets/scss/main.scss"],
  app: {
    head: {
      link: [
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Manrope:wght@200..800&display=swap' },
        { rel: 'stylesheet', href: 'https://cdn.plyr.io/3.7.8/plyr.css' },
      ]
    }
  },
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/_vars.scss" as *;\n',
        },
      },
    },
  },
  compatibilityDate: "2025-03-25",
  runtimeConfig: {
    private: {
      bitrixApiKey: 'fgH87N801DesRspts',
      bitrixApiUrl: 'https://dth.farbatest.com/',
    },
    public: {
      imageBaseUrl: process.env.NUXT_IMAGE_BASE_URL || '',
      baseUrl: process.env.NUXT_BASE_URL || 'https://localhost:3000',
    },
  },
});