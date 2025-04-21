import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

interface ClientData {
  name: string;
  phone: string;
  email: string;
  birthDate: string;
}

interface RelativeData {
  name: string;
  surname: string;
  patronymic: string;
  phone: string;
  email: string;
}

export async function createClient(page: Page, clientData: ClientData) {
  await page.locator(".abonements-table__body-cell--settings").click();
  await page.waitForTimeout(500);
  await page.getByRole("button", { name: "Добавить клиента" }).click();

  await page.getByLabel("Имя").fill(clientData.name);
  await page.getByLabel("Телефон").fill(clientData.phone);
  await page.getByLabel("Email").fill(clientData.email);
  await page.getByLabel("Дата рождения").fill(clientData.birthDate);

  await page.getByRole("button", { name: "Сохранить" }).click();

  // Проверка создания
  await expect(page.getByText(clientData.name)).toBeVisible();
}

export async function addRelative(page: Page, relativeData: RelativeData) {
  await page.getByRole("button", { name: "Добавить родственника" }).click();

  await page.getByLabel("Имя родственника").fill(relativeData.name);
  await page.getByLabel("Телефон родственника").fill(relativeData.phone);
  await page.getByLabel("Email родственника").fill(relativeData.email);

  await page.getByRole("button", { name: "Добавить" }).click();

  // Проверка добавления родственника
  await expect(page.getByText(relativeData.name)).toBeVisible();
}

export async function editClient(
  page: Page,
  clientId: string,
  newPhone: string
) {
  await page.getByRole("button", { name: "Редактировать" }).first().click();
  await page.getByLabel("Телефон").fill(newPhone);
  await page.getByRole("button", { name: "Сохранить" }).click();

  // Проверка изменения
  await expect(page.getByText(newPhone)).toBeVisible();
}
