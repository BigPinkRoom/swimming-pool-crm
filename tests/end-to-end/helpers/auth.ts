import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

export async function login(page: Page, email: string, password: string) {
  await page.goto("http://localhost:3000/ru/signin");
  await expect(page).toHaveURL(/.*signin/);

  // Ожидание загрузки формы
  await page.waitForSelector("form");

  // Проверка наличия полей формы
  await page.waitForTimeout(500);
  const emailInput = page.getByLabel("Email");
  await page.waitForTimeout(500);
  const passwordInput = page.getByLabel("Пароль");
  const submitButton = page.getByRole("button", { name: "Войти" });

  await expect(emailInput).toBeVisible();
  await expect(passwordInput).toBeVisible();
  await expect(submitButton).toBeVisible();

  // Заполнение формы входа
  await emailInput.fill(email);
  await passwordInput.fill(password);

  // Нажатие кнопки входа
  await submitButton.click();

  // Ожидание перехода на главную страницу
  await page.waitForURL("http://localhost:3000/ru");

  // Проверка успешной авторизации
  await expect(page).toHaveURL("http://localhost:3000/ru");
}
