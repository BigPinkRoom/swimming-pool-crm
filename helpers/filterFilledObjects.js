export function filterFilledObjects(array) {
  return array.filter((obj) => {
    return Object.values(obj).every((value) => {
      return (
        value !== "" &&
        value !== null &&
        value !== undefined &&
        !Number.isNaN(value)
      );
    });
  });
}
