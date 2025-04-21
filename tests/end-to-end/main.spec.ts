import { test, expect } from "@playwright/test";
import { login } from "./helpers/auth";
import { createClient, addRelative, editClient } from "./helpers/clients";
import { createAbonement, editAbonement } from "./helpers/abonements";

test.describe("Тесты CRM системы бассейна", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("http://localhost:3000/ru");
  });

  test("Проверка авторизации", async ({ page }) => {
    await login(page, "aasdasdasd123ADS@mail.ru", "aasdasdasd123ADS@mail.ru");
  });

  test("Проверка работы с клиентами", async ({ page }) => {
    // Авторизация
    await login(page, "aasdasdasd123ADS@mail.ru", "aasdasdasd123ADS@mail.ru");

    // Переход к клиентам
    await page
      .locator(
        ".abonements-table__body-cell.abonements-table__body-cell--settings"
      )
      .first()
      .click();

    await page.waitForTimeout(500);

    // Создание клиента
    await createClient(page, {
      name: "Тестовый Клиент",
      phone: "+79991234567",
      email: "client@example.com",
      birthDate: "1990-01-01",
    });

    // Добавление родственника
    await addRelative(page, {
      name: "Родственник Клиента",
      phone: "+79998765432",
      email: "relative@example.com",
      surname: "Родственник",
      patronymic: "Родственник",
    });

    // Редактирование клиента
    await editClient(page, "1", "+79999999999");
  });

  test("Проверка работы с абонементами", async ({ page }) => {
    // Авторизация
    await login(page, "aasdasdasd123ADS@mail.ru", "aasdasdasd123ADS@mail.ru");

    // Переход к абонементам
    await page.getByRole("link", { name: "Абонементы" }).click();
    await expect(page).toHaveURL(/.*abonements/);

    // Создание абонемента
    await createAbonement(page, {
      name: "Тестовый абонемент",
      visitsCount: 10,
      validityDays: 30,
      price: 5000,
    });

    // Редактирование абонемента
    await editAbonement(page, "1", 6000);
  });
});
