<template>
  <form class="client-main">
    <div class="client-main__item" v-for="(client, index) in clientsList" :key="index">
      <fieldset-client :action-type="actionType" :closeButton="addClose(index)" @close="deleteClient(index)" />
    </div>

    <div class="client-main__item">
      <v-button
        :text="$t(`forms.client.${actionType}.fields.addOneMoreClient.label`)"
        @click="addOneMoreClientHandler"
      />
    </div>

    <div class="client-main__item">
      <fieldset-relatives :action-type="actionType" />
    </div>

    <div class="client-main__item">
      <v-checkbox
        id="mainAbonementCheckbox"
        name="mainAbonementCheckbox"
        :label="$t(`forms.client.${actionType}.fields.abonementBinding.label`)"
        checked
        @checkboxChange="checkboxAbonementHandler"
      />
    </div>

    <div class="client-main__item">
      <fieldset-abonements :action-type="actionType" v-if="showAbonements" />
    </div>
  </form>
</template>

<script>
import vButton from '@/components/ui/Buttons/ButtonMain';
import vCheckbox from '@/components/ui/Checkboxes/MainCheckbox';
import FieldsetClient from './components/MainGroupClient';
import FieldsetAbonements from './components/MainGroupAbonements';
import FieldsetRelatives from './components/MainGroupRelatives';

export default {
  name: 'ClientEditMain',
  components: {
    vButton,
    vCheckbox,
    FieldsetClient,
    FieldsetAbonements,
    FieldsetRelatives,
  },
  props: {
    selectedClientData: {
      type: Object,
    },
  },
  data() {
    return {
      showAbonements: true,
      clientsList: [0],
    };
  },
  computed: {
    actionType() {
      return this.selectedClientData ? 'edit' : 'add';
    },
  },
  methods: {
    addOneMoreClientHandler() {
      this.clientsList.push(true);
    },
    checkboxAbonementHandler(value) {
      this.showAbonements = value;
    },
    addClose(index) {
      return Number(index) !== 0;
    },
    deleteClient(index) {
      this.clientsList.splice(index, 1);
    },
  },
};
</script>

<style lang="scss" scoped>
.client-main {
  &__item {
    margin-bottom: 1.2rem;
  }

  &__item:last-child {
    margin-bottom: 0;
  }
}
</style>
