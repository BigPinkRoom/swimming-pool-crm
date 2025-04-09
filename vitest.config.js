import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";

export default defineConfig({
  plugins: [vue()], // Добавляем плагин для обработки .vue файлов
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Если ваши файлы находятся в папке src
    },
  },
  test: {
    globals: true,
    environment: "jsdom", // Эмуляция DOM для тестирования компонентов
    setupFiles: "./tests/setup.js", // Файл для глобальной настройки (опционально)
  },
});
