import { expect } from "@playwright/test";

export class SignInPage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  // Селекторы элементов как приватные геттеры (условная приватность через _ или просто соглашение)
  get _emailInput() {
    return this.page.getByLabel("Email");
  }

  get _passwordInput() {
    return this.page.getByLabel("Пароль");
  }

  get _submitButton() {
    return this.page.getByRole("button", { name: "Войти" });
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
    await this.page.goto("http://localhost:3000/ru/signin");
    await expect(this.page).toHaveURL(/.*signin/);
    // Ожидание загрузки формы (можно улучшить селектор, если есть более надежный)
    await this.page.waitForSelector("form");
  }

  /**
   * Выполняет вход в систему.
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    await this.page.waitForTimeout(300);
    await this._emailInput.pressSequentially(email);
    await this._passwordInput.pressSequentially(password);
    await this._submitButton.click();
    // Ожидание перехода на главную страницу
    await this.page.waitForURL("http://localhost:3000/ru");
    // Проверка успешной авторизации
    await expect(this.page).toHaveURL("http://localhost:3000/ru");
  }

  /**
   * Проверяет видимость основных элементов формы входа.
   */
  async expectFormElementsVisible() {
    await expect(this._emailInput).toBeVisible();
    await expect(this._passwordInput).toBeVisible();
    await expect(this._submitButton).toBeVisible();
  }

  /**
   * Проверяет видимость уведомления об успехе с указанным текстом.
   * @param {string} expectedText - Ожидаемый текст в уведомлении.
   */
  async expectSuccessNotificationVisibleWithText(expectedText) {
    // Уведомления часто появляются с анимацией, дадим ему немного времени
    // Если есть более специфичный класс для уведомления, лучше использовать его
    // Например, page.waitForSelector('.success-toast-class', { state: 'visible' });
    const notification = this._successNotification(expectedText);
    await expect(notification).toBeVisible({ timeout: 5000 }); // Увеличим таймаут, если уведомление появляется не сразу
    // Дополнительно можно проверить текст, если getByText не всегда надежен для этого в вашем случае
    // await expect(notification).toHaveText(expectedText);
  }
}
