export async function useApi(urlPath, method, params) {
  const config = useRuntimeConfig();
  const baseUrlValue = config.public.baseUrl;

  try {
    const { data, error } = await useFetch(`${baseUrlValue}${urlPath}`, {
      method,
      body: params,
    });

    return data?.value;
  } catch (error) {
    console.log("error", error);
  }

  return;
}
