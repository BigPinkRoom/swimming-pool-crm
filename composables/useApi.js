export async function useApi(urlPath, method, params) {
  const { $i18n } = useNuxtApp();
  const t = $i18n.t;

  const config = useRuntimeConfig();
  const baseUrlValue = config.public.baseUrl;

  const { $showMessage, $showError } = useNuxtApp();

  try {
    const { data } = await useFetch(`${baseUrlValue}${urlPath}`, {
      credentials: "include",
      method,
      body: params,
    });

    return data?.value;
  } catch (error) {
    throw error;
  }

  return;
}
