<template>
  <table class="common-table" :class="styleType">
    <thead>
      <tr v-for="row in rowsHead" :key="row.id" :class="row.class">
        <th v-for="column in row.columns" :key="column.id">
          {{ checkI18n(column) }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in rowsBody" :key="row.id" :class="row.class">
        <td v-for="column in row.columns" :key="column.id" :class="column.class">
          {{ column.text }}
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
export default {
  name: 'Table',
  props: {
    styleType: {
      type: String,
    },
    rowsHead: {
      type: Array,
    },
    rowsHeadI18n: {
      type: String,
    },
    rowsBody: {
      type: Array,
    },
  },
  methods: {
    checkI18n(column) {
      if (this.rowsHeadI18n) {
        return column.code ? this.$t(`${this.rowsHeadI18n}.${column.code}.title`) : '';
      } else {
        return column.text;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.common-table {
  white-space: nowrap;

  border-spacing: 0;

  & th {
    padding: 0.25rem;

    border: 0.1rem solid green;
  }

  & td {
    border: 0.1rem, solid green;
  }

  & tr {
    height: 2.2rem;
  }
}

.main-table {
}
</style>
