export async function useApi(urlPath, method, params) {
  const { $i18n } = useNuxtApp();
  const t = $i18n.t;

  const config = useRuntimeConfig();
  const baseUrlValue = config.public.baseUrl;

  const { $showMessage, $showError } = useNuxtApp();

  const headers = useRequestHeaders(["cookie"]);

  try {
    const { data } = await useFetch(`${baseUrlValue}${urlPath}`, {
      credentials: "include",
      method,
      body: params,
      headers,
    });

    return data?.value;
  } catch (error) {
    throw error;
  }

  return;
}
