import { expect } from "@playwright/test";

export class SignUpPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  typeDelay = 10;
  // Селекторы элементов как приватные геттеры (условная приватность через _ или просто соглашение)
  get _branchSelect() {
    return this.page.getByLabel("Филиал");
  }

  get _emailInput() {
    return this.page.getByRole("textbox", { name: "Email" });
  }

  get _passwordInput() {
    return this.page.getByRole("textbox", { name: "Пароль" });
  }

  get _passwordConfirmInput() {
    return this.page.getByRole("textbox", { name: "Подтверждение пароля" });
  }

  get _surnameInput() {
    return this.page.getByRole("textbox", { name: "Фамилия" });
  }

  get _nameInput() {
    return this.page.getByRole("textbox", { name: "Имя" });
  }

  get _patronymicInput() {
    return this.page.getByRole("textbox", { name: "Отчество" });
  }

  get _submitButton() {
    return this.page.getByRole("button", { name: "Зарегистрироваться" });
  }

  // Геттер для уведомления об успехе
  // Мы предполагаем, что текст "forms.signup" уникален для этого уведомления
  // Если нет, селектор нужно будет уточнить (например, по классу или ID контейнера уведомлений)
  _successNotification(text) {
    return this.page.getByText(text, { exact: true }); // Ищем точное совпадение текста
  }

  /**
   * Переходит на страницу входа.
   */
  async navigate() {
    await this.page.goto("http://localhost:3000/ru/signup");
    await expect(this.page).toHaveURL(/.*signup/);
    // Ожидание загрузки формы (можно улучшить селектор, если есть более надежный)
    await this.page.waitForSelector("form");
    await this._emailInput.waitFor({ state: "visible", timeout: 10000 });
  }

  /**
   * Выполняет вход в систему.
   * @param {string} email
   * @param {string} password
   */
  async register(email, password, passwordConfirm, surname, name, patronymic) {
    await this.page.waitForTimeout(300);
    await this._emailInput.pressSequentially(email, { delay: this.typeDelay });
    await this._passwordInput.pressSequentially(password, {
      delay: this.typeDelay,
    });
    await this._passwordConfirmInput.pressSequentially(passwordConfirm, {
      delay: this.typeDelay,
    });
    await this._surnameInput.pressSequentially(surname, {
      delay: this.typeDelay,
    });
    await this._nameInput.pressSequentially(name, { delay: this.typeDelay });
    await this._patronymicInput.pressSequentially(patronymic, {
      delay: this.typeDelay,
    });

    await this._submitButton.click();
    // Ожидание перехода на главную страницу
    await this.page.waitForURL("http://localhost:3000/ru/signin");
    // Проверка успешной авторизации
    await expect(this.page).toHaveURL("http://localhost:3000/ru/signin");
  }
}
