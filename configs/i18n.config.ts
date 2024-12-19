import ru from "../locales/ru-RU.json";
import en from "../locales/en-EN.json";

export default defineI18nConfig(() => ({
  legacy: false,
  locale: "ru",
  messages: { en, ru },
}));
