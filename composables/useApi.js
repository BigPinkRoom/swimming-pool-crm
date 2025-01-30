export async function useApi(urlPath, method, params) {
  const { $i18n } = useNuxtApp();
  const t = $i18n.t;

  const config = useRuntimeConfig();
  const baseUrlValue = config.public.baseUrl;

  const { $showMessage, $showError } = useNuxtApp();

  try {
    const { data, error } = await useFetch(`${baseUrlValue}${urlPath}`, {
      method,
      body: params,
    });

    if (error.value) {
      throw error;
    }

    return data?.value;
  } catch (error) {
    throw error;
  }

  return;
}
