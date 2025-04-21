export function filterFilledObject(obj) {
  if (obj) {
    return Object.fromEntries(
      Object.entries(obj).filter(([key, value]) => {
        return (
          value !== "" &&
          value !== null &&
          value !== undefined &&
          !Number.isNaN(value)
        );
      })
    );
  } else {
    return {};
  }
}
