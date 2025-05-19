import { test, expect } from "@playwright/test";
import { SignInPage } from "./pom/SignInPage.js";
import { AbonementPage } from "./pom/AbonementPage.js";
import {
  fakerRu,
  patronymics,
  getRandomValueFromArray,
  generatePhoneNumber,
} from "./utils/dataHelpers.js";
import { formatDateToDDMMYYYY } from "./utils/formatters.js";

test.describe.serial("Управление абонементами", () => {
  test.beforeEach(async ({ page }) => {
    const login = process.env.TESTS_LOGIN;
    const password = process.env.TESTS_PASSWORD;

    if (!login || !password) {
      throw new Error(
        "Тестовые учетные данные TESTS_LOGIN и TESTS_PASSWORD должны быть установлены в переменных окружения."
      );
    }

    const signInPage = new SignInPage(page);
    await signInPage.navigate();
    await signInPage.login(login, password);
    await signInPage.expectSuccessNotificationVisibleWithText("forms.signup");
  });

  test("Проверка открытия основной модалки", async ({ page }) => {
    const abonementPage = new AbonementPage(page);
    await abonementPage.openModal();
  });

  test("Проверка добавления семьи", async ({ page }) => {
    const abonementPage = new AbonementPage(page);
    await abonementPage.openModal();

    const RuRandomFirstName = fakerRu.person.firstName();
    const RuRandomLastName = fakerRu.person.lastName();

    const clientSurname = RuRandomLastName;
    const clientName = RuRandomFirstName;
    const clientPatronymic = getRandomValueFromArray(patronymics);
    const clientBirthday = `15.05.${getRandomValueFromArray([
      "2020",
      "2021",
      "2022",
    ])}`;

    const relativeSurname = fakerRu.person.lastName();
    const relativeName = fakerRu.person.firstName();
    const relativePatronymic = getRandomValueFromArray(patronymics);
    const relativeTypeIndex = 0;
    const relativePhoneNumber = generatePhoneNumber();
    const expectedRelativePhoneNumber = relativePhoneNumber;

    await abonementPage.fillClientForm(
      clientSurname,
      clientName,
      clientPatronymic,
      clientBirthday
    );

    await abonementPage.fillRelativeForm(
      relativeSurname,
      relativeName,
      relativePatronymic,
      relativeTypeIndex,
      relativePhoneNumber
    );

    const abonementQuantity = getRandomValueFromArray(["1", "3", "5"]);
    const abonementDuration = getRandomValueFromArray(["5", "10", "15"]);
    const abonementActivationDate = "01.01.2050";

    await abonementPage.fillAbonementForm(
      abonementQuantity,
      abonementDuration,
      abonementActivationDate
    );

    await expect(
      page
        .locator('aside header h2:has-text("Добавить семью")')
        .locator("xpath=../..")
    ).not.toBeVisible({ timeout: 10000 });

    const familyRow = await abonementPage.getFamilyRowByName(
      `${clientSurname} ${clientName} ${clientPatronymic}`
    );

    await expect(familyRow).toBeVisible({ timeout: 10000 });

    await abonementPage.clickEditFamilyInRow(familyRow);

    await abonementPage.clickEditClient();
    expect(await abonementPage._clientSurnameInput.inputValue()).toBe(
      clientSurname
    );
    expect(await abonementPage._clientNameInput.inputValue()).toBe(clientName);
    expect(await abonementPage._clientPatronymicInput.inputValue()).toBe(
      clientPatronymic
    );
    expect(
      formatDateToDDMMYYYY(
        await abonementPage._clientBirthdayInput.inputValue()
      )
    ).toBe(clientBirthday);

    await abonementPage.clickEditRelative();
    expect(await abonementPage._relativeSurnameInput.inputValue()).toBe(
      relativeSurname
    );
    expect(await abonementPage._relativeNameInput.inputValue()).toBe(
      relativeName
    );
    expect(await abonementPage._relativePatronymicInput.inputValue()).toBe(
      relativePatronymic
    );
    expect(await abonementPage._relativePhoneInput.inputValue()).toBe(
      expectedRelativePhoneNumber
    );

    await abonementPage.closeEditModal();
    await expect(abonementPage._editModalTitleLocator).not.toBeVisible({
      timeout: 5000,
    });
  });

  test("Проверка добавления семьи (по 2 шт)", async ({ page }) => {
    const abonementPage = new AbonementPage(page);
    await abonementPage.openModal();

    const RuRandomFirstName = fakerRu.person.firstName();
    const RuRandomLastName = fakerRu.person.lastName();

    const clientSurname = RuRandomLastName;
    const clientName = RuRandomFirstName;
    const clientPatronymic = getRandomValueFromArray(patronymics);
    const clientBirthday = `15.05.${getRandomValueFromArray([
      "2020",
      "2021",
      "2022",
    ])}`;

    const clientSurnameSecondary = fakerRu.person.lastName();
    const clientNameSecondary = fakerRu.person.firstName();
    const clientPatronymicSecondary = getRandomValueFromArray(patronymics);
    const clientBirthdaySecondary = `15.05.${getRandomValueFromArray([
      "2020",
      "2021",
      "2022",
    ])}`;

    const relativeSurname = fakerRu.person.lastName();
    const relativeName = fakerRu.person.firstName();
    const relativePatronymic = getRandomValueFromArray(patronymics);
    const relativeTypeIndex = 0;
    const relativePhoneNumber = generatePhoneNumber();
    const expectedRelativePhoneNumber = relativePhoneNumber;

    const relativeSurnameSecondary = fakerRu.person.lastName();
    const relativeNameSecondary = fakerRu.person.firstName();
    const relativePatronymicSecondary = getRandomValueFromArray(patronymics);
    const relativeTypeIndexSecondary = 0;
    const relativePhoneNumberSecondary = generatePhoneNumber();
    const expectedRelativePhoneNumberSecondary = relativePhoneNumberSecondary;

    await abonementPage.fillClientForm(
      clientSurname,
      clientName,
      clientPatronymic,
      clientBirthday
    );

    await page
      .getByRole("button", { name: "+ Добавить ещё одного ребёнка" })
      .click();

    await abonementPage.fillClientForm(
      clientSurnameSecondary,
      clientNameSecondary,
      clientPatronymicSecondary,
      clientBirthdaySecondary
    );

    await abonementPage.fillRelativeForm(
      relativeSurname,
      relativeName,
      relativePatronymic,
      relativeTypeIndex,
      relativePhoneNumber
    );

    await page
      .getByRole("button", { name: "+ Добавить ещё одного родственника" })
      .click();

    await abonementPage.fillRelativeForm(
      relativeSurnameSecondary,
      relativeNameSecondary,
      relativePatronymicSecondary,
      relativeTypeIndexSecondary,
      relativePhoneNumberSecondary
    );

    const abonementQuantity = getRandomValueFromArray(["1", "3", "5"]);
    const abonementDuration = getRandomValueFromArray(["5", "10", "15"]);
    const abonementActivationDate = "01.01.2050";

    await abonementPage.fillAbonementForm(
      abonementQuantity,
      abonementDuration,
      abonementActivationDate
    );

    await expect(
      page
        .locator('aside header h2:has-text("Добавить семью")')
        .locator("xpath=../..")
    ).not.toBeVisible({ timeout: 10000 });

    const familyRow = await abonementPage.getFamilyRowByName(
      `${clientSurname} ${clientName} ${clientPatronymic}`
    );

    await expect(familyRow).toBeVisible({ timeout: 10000 });

    await abonementPage.clickEditFamilyInRow(familyRow);

    await abonementPage.clickEditClient();
    expect(await abonementPage._clientSurnameInput.inputValue()).toBe(
      clientSurname
    );
    expect(await abonementPage._clientNameInput.inputValue()).toBe(clientName);
    expect(await abonementPage._clientPatronymicInput.inputValue()).toBe(
      clientPatronymic
    );
    expect(
      formatDateToDDMMYYYY(
        await abonementPage._clientBirthdayInput.inputValue()
      )
    ).toBe(clientBirthday);

    await abonementPage.clickEditClientSecondary();
    expect(await abonementPage._clientSurnameInput.inputValue()).toBe(
      clientSurnameSecondary
    );
    expect(await abonementPage._clientNameInput.inputValue()).toBe(
      clientNameSecondary
    );
    expect(await abonementPage._clientPatronymicInput.inputValue()).toBe(
      clientPatronymicSecondary
    );
    expect(
      formatDateToDDMMYYYY(
        await abonementPage._clientBirthdayInput.inputValue()
      )
    ).toBe(clientBirthdaySecondary);

    await abonementPage.clickEditRelative();
    expect(await abonementPage._relativeSurnameInput.inputValue()).toBe(
      relativeSurname
    );
    expect(await abonementPage._relativeNameInput.inputValue()).toBe(
      relativeName
    );
    expect(await abonementPage._relativePatronymicInput.inputValue()).toBe(
      relativePatronymic
    );
    expect(await abonementPage._relativePhoneInput.inputValue()).toBe(
      expectedRelativePhoneNumber
    );

    await abonementPage.clickEditRelativeSecondary();
    expect(await abonementPage._relativeSurnameInput.inputValue()).toBe(
      relativeSurnameSecondary
    );
    expect(await abonementPage._relativeNameInput.inputValue()).toBe(
      relativeNameSecondary
    );
    expect(await abonementPage._relativePatronymicInput.inputValue()).toBe(
      relativePatronymicSecondary
    );
    expect(await abonementPage._relativePhoneInput.inputValue()).toBe(
      expectedRelativePhoneNumberSecondary
    );

    await abonementPage.closeEditModal();
    await expect(abonementPage._editModalTitleLocator).not.toBeVisible({
      timeout: 5000,
    });
  });

  test("Проверка поиска семьи по ФИО", async ({ page }) => {
    const abonementPage = new AbonementPage(page);
    await abonementPage.openModal();

    const RuRandomFirstName = fakerRu.person.firstName();
    const RuRandomLastName = fakerRu.person.lastName();

    const clientSurname = RuRandomLastName;
    const clientName = RuRandomFirstName;
    const clientPatronymic = getRandomValueFromArray(patronymics);
    const clientBirthday = `15.05.${getRandomValueFromArray([
      "2020",
      "2021",
      "2022",
    ])}`;

    const relativeSurname = fakerRu.person.lastName();
    const relativeName = fakerRu.person.firstName();
    const relativePatronymic = getRandomValueFromArray(patronymics);
    const relativeTypeIndex = 0;
    const relativePhoneNumber = generatePhoneNumber();
    const expectedRelativePhoneNumber = relativePhoneNumber;

    await abonementPage.fillClientForm(
      clientSurname,
      clientName,
      clientPatronymic,
      clientBirthday
    );

    await abonementPage.fillRelativeForm(
      relativeSurname,
      relativeName,
      relativePatronymic,
      relativeTypeIndex,
      relativePhoneNumber
    );

    const abonementQuantity = getRandomValueFromArray(["1", "3", "5"]);
    const abonementDuration = getRandomValueFromArray(["5", "10", "15"]);
    const abonementActivationDate = "01.01.2050";

    await abonementPage.fillAbonementForm(
      abonementQuantity,
      abonementDuration,
      abonementActivationDate
    );

    await expect(
      page
        .locator('aside header h2:has-text("Добавить семью")')
        .locator("xpath=../..")
    ).not.toBeVisible({ timeout: 10000 });

    const familyRow = await abonementPage.getFamilyRowByName(
      `${clientSurname} ${clientName} ${clientPatronymic}`
    );

    await expect(familyRow).toBeVisible({ timeout: 10000 });

    await abonementPage.clickEditFamilyInRow(familyRow);

    await page
      .getByRole("textbox", {
        name: "Поиск по ФИО и по номеру телефона",
      })
      .fill(`${clientSurname} ${clientName} ${clientPatronymic}`);

    await page.locator(".search-results-list").nth(0).click();

    await abonementPage.clickEditClient();
    expect(await abonementPage._clientSurnameInput.inputValue()).toBe(
      clientSurname
    );
    expect(await abonementPage._clientNameInput.inputValue()).toBe(clientName);
    expect(await abonementPage._clientPatronymicInput.inputValue()).toBe(
      clientPatronymic
    );
    expect(
      formatDateToDDMMYYYY(
        await abonementPage._clientBirthdayInput.inputValue()
      )
    ).toBe(clientBirthday);

    await abonementPage.clickEditRelative();
    expect(await abonementPage._relativeSurnameInput.inputValue()).toBe(
      relativeSurname
    );
    expect(await abonementPage._relativeNameInput.inputValue()).toBe(
      relativeName
    );
    expect(await abonementPage._relativePatronymicInput.inputValue()).toBe(
      relativePatronymic
    );
    expect(await abonementPage._relativePhoneInput.inputValue()).toBe(
      expectedRelativePhoneNumber
    );

    await abonementPage.closeEditModal();
    await expect(abonementPage._editModalTitleLocator).not.toBeVisible({
      timeout: 5000,
    });
  });
});
