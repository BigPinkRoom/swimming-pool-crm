/**
 * @async
 * @function useApi
 * @description Осуществляет API-запрос с использованием useFetch из Nuxt.
 * Обрабатывает конфигурацию базового URL (клиент/сервер), включает учетные данные и заголовки.
 *
 * @param {string} urlPath - Путь для добавления к базовому URL.
 * @param {string} method - HTTP-метод (например, 'GET', 'POST').
 * @param {object} [params] - Тело запроса (например, для 'POST', 'PUT').
 *
 * @returns {Promise<object>} - Результат выполнения запроса. Возвращает data.value от useFetch
 * или { success: true }, если data.value равно null или undefined.
 * @throws {Error} - Выбрасывает ошибку, если запрос не удался или возникла другая ошибка.
 */
export async function useApi(urlPath, method, params) {
  const { $i18n } = useNuxtApp();
  const t = $i18n.t;

  const config = useRuntimeConfig();

  const baseUrlValue = import.meta.client
    ? config.public.baseUrl
    : config.basePrivateUrl;

  const { $showMessage, $showError } = useNuxtApp();

  const headers = useRequestHeaders(["cookie"]);

  try {
    const { data, error } = await useFetch(`${baseUrlValue}${urlPath}`, {
      credentials: "include",
      method,
      body: params,
      headers,
    });

    if (error.value) {
      throw error.value;
    }

    if (data.value === null || data.value === undefined) {
      return { success: true };
    }

    return data.value;
  } catch (error) {
    throw error;
  }
}
