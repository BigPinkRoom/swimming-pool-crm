import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";

interface AbonementData {
  name: string;
  visitsCount: number;
  validityDays: number;
  price: number;
}

export async function createAbonement(
  page: Page,
  abonementData: AbonementData
) {
  await page.getByRole("button", { name: "Добавить абонемент" }).click();

  await page.getByLabel("Название").fill(abonementData.name);
  await page
    .getByLabel("Количество посещений")
    .fill(abonementData.visitsCount.toString());
  await page
    .getByLabel("Срок действия (дни)")
    .fill(abonementData.validityDays.toString());
  await page.getByLabel("Цена").fill(abonementData.price.toString());

  await page.getByRole("button", { name: "Сохранить" }).click();

  // Проверка создания
  await expect(page.getByText(abonementData.name)).toBeVisible();
}

export async function editAbonement(
  page: Page,
  abonementId: string,
  newPrice: number
) {
  await page.getByRole("button", { name: "Редактировать" }).first().click();
  await page.getByLabel("Цена").fill(newPrice.toString());
  await page.getByRole("button", { name: "Сохранить" }).click();

  // Проверка изменения
  await expect(page.getByText(newPrice.toString())).toBeVisible();
}
