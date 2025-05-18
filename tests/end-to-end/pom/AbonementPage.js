import { expect } from "@playwright/test";

export class AbonementPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  get _modalButton() {
    return this.page.locator(".abonements-table__header-add");
  }

  get _searchInput() {
    return this.page.getByRole("textbox", {
      name: "Поиск по ФИО и по номеру телефона",
    });
  }

  // Клиентские поля

  get _clientSurnameInput() {
    return this.page
      .getByRole("group")
      .filter({ hasText: "Дети" })
      .getByLabel("Фамилия");
  }

  get _clientNameInput() {
    return this.page
      .getByRole("group")
      .filter({ hasText: "Дети" })
      .getByLabel("Имя");
  }

  get _clientPatronymicInput() {
    return this.page
      .getByRole("group")
      .filter({ hasText: "Дети" })
      .getByLabel("Отчество");
  }

  get _clientBirthdayInput() {
    return this.page
      .getByRole("group")
      .filter({ hasText: "Дети" })
      .getByLabel("День рождения");
  }
  Дети;
  get _clientOkButton() {
    return this.page
      .getByRole("group")
      .filter({
        hasText:
          "Дети Имя / фамилия Возраст Пол Действия ФамилияВалидация успешнаИмяВалидация усп",
      })
      .locator("img")
      .nth(1);
  }

  // Родительские поля

  get _relativeSurnameInput() {
    return this.page
      .getByRole("group")
      .filter({ hasText: "Родственники" })
      .getByLabel("Фамилия");
  }

  get _relativeNameInput() {
    return this.page
      .getByRole("group")
      .filter({ hasText: "Родственники" })
      .getByLabel("Имя");
  }

  get _relativePatronymicInput() {
    return this.page
      .getByRole("group")
      .filter({ hasText: "Родственники" })
      .getByLabel("Отчество");
  }

  get _relativeTypeInput() {
    return this.page
      .getByRole("group")
      .filter({ hasText: "Родственники" })
      .getByLabel("Тип родителя");
  }

  get _relativePhoneInput() {
    return this.page
      .getByRole("group")
      .filter({ hasText: "Родственники" })
      .getByLabel("Номер телефона");
  }

  get _relativeOkButton() {
    return this.page
      .getByRole("group")
      .filter({ hasText: "Родственники" })
      .locator("img")
      .nth(1);
  }

  //  Поля абонементов

  get _abonementQuantityInput() {
    return this.page.getByLabel("Кол-во занятий");
  }

  get _abonementDurationInput() {
    return this.page.getByLabel("Длительность");
  }

  get _abonementActivationDateInput() {
    return this.page.getByLabel("Дата активации");
  }

  get _abonementSaveButton() {
    return this.page.getByRole("button", { name: "Save" });
  }

  get _abonementNotificationSuccess() {
    return this.page.getByText("Семья успешно добавлена");
  }

  get _editClientButton() {
    return this.page
      .locator(".client-main__fieldset")
      .filter({ hasText: "Дети" })
      .locator(".card-table__actions--edit");
  }

  get _editRelativeButton() {
    return this.page
      .locator(".client-main__fieldset")
      .filter({ hasText: "Родственники" })
      .locator(".card-table__actions--edit");
  }
  /**
   * Переходит на страницу входа.
   */
  async navigate() {
    await this.page.goto("http://localhost:3000/ru/");
  }

  async openModal() {
    await expect(this._modalButton).toBeVisible({ timeout: 10000 });
    await this._modalButton.click();
    await expect(this._searchInput).toBeVisible({ timeout: 10000 });
  }

  async fillClientForm(surname, name, patronymic, birthday) {
    await this._clientSurnameInput.fill(surname);
    await this._clientNameInput.fill(name);
    await this._clientPatronymicInput.fill(patronymic);
    await this._clientBirthdayInput.pressSequentially(birthday);
    await this._clientOkButton.click();
  }

  async fillRelativeForm(surname, name, patronymic, type, phone) {
    await this._relativeSurnameInput.pressSequentially(surname);
    await this._relativeNameInput.pressSequentially(name);
    await this._relativePatronymicInput.pressSequentially(patronymic);
    await this._relativePhoneInput.pressSequentially(phone);
    await this._relativeOkButton.click();
  }

  async fillAbonementForm(quantity, duration, activationDate) {
    await this._abonementQuantityInput.selectOption(quantity);
    await this._abonementDurationInput.selectOption(duration);
    await this._abonementActivationDateInput.pressSequentially(activationDate);
    await this._abonementSaveButton.click();
    await this._abonementNotificationSuccess.waitFor({
      state: "visible",
      timeout: 10000,
    });
  }

  get _editModalTitleLocator() {
    return this.page.locator('aside header h2:has-text("Редактировать семью")');
  }

  /**
   * Находит строку семьи в таблице по полному имени клиента.
   * @param {string} fullName - Полное имя клиента (например, "Иванов Иван Иванович")
   * @returns {import('@playwright/test').Locator} Локатор для строки таблицы.
   */
  async getFamilyRowByName(fullName) {
    this.page.reload();
    await this.page.waitForLoadState("networkidle"); // Ожидаем завершения сетевой активности
    const rowLocator = this.page.locator(
      `.abonements-table__body-row:has-text("${fullName}")`
    );

    return rowLocator;
  }

  async clickEditFamilyInRow(familyRowLocator) {
    const ellipsisImage = familyRowLocator.locator(
      ".abonements-table__body-cell--settings .abonements-table__ellipis-img"
    );

    await ellipsisImage.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(1000);
    await ellipsisImage.click();

    // Ожидаем появления заголовка модального окна редактирования
    // await expect(this._editModalTitleLocator).toBeVisible({ timeout: 10000 });
  }

  async clickEditClient() {
    await this._editClientButton.click();
  }

  async clickEditRelative() {
    await this._editRelativeButton.click();
  }

  async closeEditModal() {
    const cancelButton = this.page.locator(
      'aside footer button:has-text("Cancel"), aside footer button:has-text("Отмена")'
    );
    const closeIcon = this.page.locator(
      'aside header button[class*="close"], aside header button > svg[class*="close"], aside header button[aria-label*="Закрыть"]'
    );

    if (await cancelButton.isVisible()) {
      await cancelButton.click();
    } else if (await closeIcon.isVisible()) {
      await closeIcon.click();
    } else {
      console.warn(
        "Кнопка закрытия модального окна редактирования не найдена."
      );
    }
  }

  async expectFamilyAdded(familyName) {
    await expect(this.page.getByText(familyName)).toBeVisible({
      timeout: 10000,
    });
  }
}
