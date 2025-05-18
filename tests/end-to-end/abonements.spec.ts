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

test.describe("Управление абонементами", () => {
  test.beforeEach(async ({ page }) => {
    const login = process.env.TESTS_LOGIN;
    const password = process.env.TESTS_PASSWORD;

    if (!login || !password) {
      console.log(process.env);
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

  test("Проверка добавления семьи + абонемента и сверка данных", async ({
    page,
  }) => {
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
});
