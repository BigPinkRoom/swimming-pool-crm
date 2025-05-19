export function getRandomValueFromArray(possibleValues) {
  // Проверка, что массив не пустой
  if (!possibleValues || possibleValues.length === 0) {
    throw new Error("Массив возможных значений не может быть пустым.");
  }

  // Генерируем случайный индекс в диапазоне от 0 до (длина массива - 1)
  const randomIndex = Math.floor(Math.random() * possibleValues.length);

  // Возвращаем элемент массива по случайному индексу
  return possibleValues[randomIndex];
}
