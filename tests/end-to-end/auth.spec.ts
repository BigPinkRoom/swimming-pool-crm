import { test } from "@playwright/test";
import { SignUpPage } from "./pom/SignUpPage.js";
import { SignInPage } from "./pom/SignInPage.js";
import { fakerEn, fakerRu } from "./utils/dataHelpers.js";

test.describe("Аутентификация", () => {
  const RuRandomFirstName = fakerRu.person.firstName();
  const RuRandomLastName = fakerRu.person.lastName();
  const EnRandomFirstName = fakerEn.person.firstName();
  const EnRandomLastName = fakerEn.person.lastName();
  const randomEmail = fakerEn.internet.email({
    firstName: EnRandomFirstName,
    lastName: EnRandomLastName,
  });
  const randomPassword = fakerEn.internet.password({ length: 12 }) + "A!1a";

  test("Проверка регистрации нового пользователя", async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    await signUpPage.navigate();
    await signUpPage.register(
      randomEmail,
      randomPassword,
      randomPassword,
      RuRandomFirstName,
      RuRandomLastName,
      RuRandomFirstName
    );
  });

  test("Проверка авторизации", async ({ page }) => {
    const signUpPage = new SignUpPage(page);
    await signUpPage.navigate();
    await signUpPage.register(
      randomEmail,
      randomPassword,
      randomPassword,
      RuRandomFirstName,
      RuRandomLastName,
      RuRandomFirstName
    );
    const signInPage = new SignInPage(page);
    await signInPage.navigate();
    await signInPage.expectFormElementsVisible();
    await signInPage.login(randomEmail, randomPassword);
    await signInPage.expectSuccessNotificationVisibleWithText("forms.signup");
  });
});
