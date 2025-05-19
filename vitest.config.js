import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()], // Добавляем плагин для обработки .vue файлов
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."), // Указываем на корень проекта
    },
  },
  test: {
    globals: true,
    environment: "jsdom", // Эмуляция DOM для тестирования компонентов
    setupFiles: "./tests/setup.js", // Файл для глобальной настройки (опционально)
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
      "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
      "**/tests/end-to-end/**", // Исключаем директорию с e2e тестами
    ],
  },
});
