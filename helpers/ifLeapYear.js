export default function isLeapYear(year) {
  // Год делится на 4 без остатка
  const divisibleBy4 = year % 4 === 0;

  // Год не делится на 100 без остатка (кроме случаев, когда он делится на 400)
  const notDivisibleBy100 = year % 100 !== 0;

  // Год делится на 400 без остатка
  const divisibleBy400 = year % 400 === 0;

  // Год считается високосным, если:
  // 1. Он делится на 4 и не делится на 100, или
  // 2. Он делится на 400
  return (divisibleBy4 && notDivisibleBy100) || divisibleBy400;
}
