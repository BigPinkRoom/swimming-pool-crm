export function formatDate(dateString, shortYear = false) {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    console.warn("Invalid date:", dateString);
    return "";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = shortYear
    ? date.getFullYear().toString().slice(-2)
    : date.getFullYear();

  return `${day}.${month}.${year}`;
}
