<template>
  <main-tab></main-tab>
</template>

<script>
import mainTab from './Main';

export default {
  name: 'ClientEdit',
  components: {
    mainTab,
  },
  props: {
    selectedClientData: {
      type: Object,
    },
  },
  computed: {
    actionType() {
      return this.selectedClientData ? 'edit' : 'add';
    },
  },
};
</script>

<style lang="scss" scoped></style>
