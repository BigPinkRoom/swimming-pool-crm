// import { useUserStore } from "@/stores/userStore";
import isLeapYear from "@/helpers/ifLeapYear";

export default class Abonements {
  constructor(context) {
    this.context = context;
  }

  _getDaysOfCurrentMonth() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    isLeapYear(currentYear) ? 366 : 365;

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    const monthCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    console.log("month cells", monthCells);

    return monthCells;
  }
}
