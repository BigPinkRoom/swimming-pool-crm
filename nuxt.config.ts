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
    session: {
      name: "id",
    },
  },

  plugins: [
    "~/plugins/api.js",
    "~/plugins/message.js",
    "~/plugins/services.js",
    "~/plugins/auth.js",
  ],

  // routeRules: {
  //   "/**": { middleware: "auth" },
  // },

  // nitro: {
  //   devProxy: {
  //     "/api": "http://localhost:4000",
  //   },
  // },

  css: [
    "~/assets/css/fonts.css",
    "~/assets/scss/global.scss",
    "~/assets/scss/global/variables.scss",
  ],

  modules: [
    "@nuxtjs/i18n",
    "@nuxtjs/google-fonts",
    "@pinia/nuxt",
    "@vee-validate/nuxt",
  ],

  googleFonts: {
    preconnect: true,
    prefetch: true,
    preload: true,
    families: {
      "Open+Sans": [100, 300, 400, 500, 700],
    },
  },

  i18n: {
    baseUrl: "http://localhost:3000",
    vueI18n: "../configs/i18n.config.ts",
    strategy: "prefix",
    defaultLocale: "ru",
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

  veeValidate: {
    autoImports: true,
  },
});
