/**
 * Функция для вычисления возраста в годах на основе даты рождения.
 * @param {string} birthday - Дата рождения в формате "ДД.ММ.ГГГГ" (например, "01.03.2000").
 * @returns {number | null} - Возраст в годах или null, если дата рождения некорректна.
 */
export function calculateAge(birthday) {
  if (
    !birthday ||
    typeof birthday !== "string" ||
    !/^\d{2}\.\d{2}\.\d{4}$/.test(birthday)
  ) {
    return null;
  }

  const [day, month, year] = birthday.split(".").map(Number);
  const birthDate = new Date(year, month - 1, day);

  if (isNaN(birthDate.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();

  if (
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() &&
      today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age;
}
