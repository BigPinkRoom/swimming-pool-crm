// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  app: {
    // baseURL: process.env.NUXT_PUBLIC_API_BASE,
  },

  runtimeConfig: {
    public: {
      baseUrl: process.env.BASE_URL,
    },
  },

  css: [
    "~/assets/css/fonts.css",
    "~/assets/scss/global.scss",
    "~/assets/scss/global/variables.scss",
  ],

  modules: ["@nuxtjs/i18n", "@nuxtjs/google-fonts", "@pinia/nuxt"],

  googleFonts: {
    preconnect: true,
    prefetch: true,
    preload: true,
    families: {
      "Open+Sans": true,
    },
  },

  i18n: {
    baseUrl: "http://localhost:4000/api/v1/",
    vueI18n: "./configs/i18n.config.ts",
    locales: [
      {
        code: "ru",
        name: "Русский",
      },
      {
        code: "en",
        name: "English",
      },
    ],
  },
});
