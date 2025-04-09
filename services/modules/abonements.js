export default class Abonements {
  constructor(context) {
    this.context = context;
  }

  getDaysOfCurrentMonth() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1;

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

    const monthCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return monthCells;
  }

  async getFullAbonements({ sortings = [], filters = {} } = {}) {
    try {
      const params = {};

      if (!sortings.length) {
        params.sortings = [{ name: "user_created_id", type: "ASC" }];
      }

      const response = await this.context.$api.abonements.getFull(params);

      return response;
    } catch (error) {
      this.context.$showError(error);
    }
  }
}
