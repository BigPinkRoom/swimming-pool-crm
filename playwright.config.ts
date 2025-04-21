import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/end-to-end", // Директория, где будут находиться тесты
  fullyParallel: true, // Запускать тесты параллельно
  forbidOnly: !!process.env.CI, // Запретить использование .only в CI
  retries: process.env.CI ? 2 : 0, // Повторить тесты в случае ошибки в CI
  workers: process.env.CI ? 1 : undefined, // Ограничить количество воркеров в CI
  reporter: "html", // Использовать HTML-отчет для удобства
  use: {
    headless: false,
    baseURL: "http://localhost:3000", // URL вашего приложения
    trace: "on-first-retry", // Включить трассировку для отладки
  },
  webServer: {
    command: "npm run dev", // Команда для запуска вашего Nuxt приложения
    port: 3000, // Порт, на котором работает приложение
    reuseExistingServer: !process.env.CI, // Использовать существующий сервер, если он запущен
  },
});
