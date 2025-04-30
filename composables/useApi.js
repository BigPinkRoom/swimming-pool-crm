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
