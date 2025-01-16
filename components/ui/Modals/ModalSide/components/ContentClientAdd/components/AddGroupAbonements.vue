<template>
  <fieldset class="client-main__fieldset client-main-abonement">
    <CardTable class="card-table__wrapper--gray">
      <template #title>
        <legend class="card-table__title card-table__title--gray">
          {{ $t(`forms.client.${actionType}.fieldsets.abonement.label`) }}
        </legend>
      </template>
      <template #content>
        <v-radio-button name="abonementType" :input-data="inputData"></v-radio-button>

        <div class="client-main-abonement__row">
          <div class="client-main-abonement__column">
            <label for="abonementId">{{ $t(`forms.client.${actionType}.fieldsets.abonement.fields.id.label`) }}</label>
            <v-input id="abonementId" type="number"></v-input>
          </div>
          <div class="client-main-abonement__column">
            <label for="abonementQuantity">{{
              $t(`forms.client.${actionType}.fieldsets.abonement.fields.quantity.label`)
            }}</label>
            <v-input id="abonementQuantity" type="number"></v-input>
          </div>
        </div>

        <div class="client-main-abonement__row">
          <div class="client-main-abonement__column">
            <label for="abonementStart">
              {{ $t(`forms.client.${actionType}.fieldsets.abonement.fields.startDate.label`) }}
            </label>
            <v-input id="abonementStart" type="number"></v-input>
          </div>
          <div class="client-main-abonement__column">
            <label for="abonementEnd">
              {{ $t(`forms.client.${actionType}.fieldsets.abonement.fields.endDate.label`) }}
            </label>
            <v-input id="abonementEnd" type="number"></v-input>
          </div>
        </div>
      </template>
    </CardTable>
  </fieldset>
</template>

<script>
import vInput from '@/components/ui/Fields/Input';
import vRadioButton from '@/components/ui/RadioButtons/MainRadioButton';
import CardTable from '@/components/Common/CardTable.vue';

export default {
  name: 'MainGroupAbonements',
  components: {
    vInput,
    vRadioButton,
    CardTable,
  },
  props: {
    actionType: {
      type: String,
    },
  },
  data() {
    return {
      inputData: [
        {
          id: 'mainRadioAbonementNew',
          value: 0,
          label: this.$t(`forms.client.${this.actionType}.fieldsets.abonement.fields.type.new.label`),
        },
        {
          id: 'mainRadioAbonementExist',
          value: 1,
          label: this.$t(`forms.client.${this.actionType}.fieldsets.abonement.fields.type.existed.label`),
        },
      ],
    };
  },
};
</script>

<style lang="scss" scoped>
.client-main__fieldset {
  position: relative;
  padding: 1.2rem;
  border: 0;
}

.client-main-abonement {
  &__row {
    display: flex;
    flex-direction: row;
    flex-grow: 0;
  }

  &__column {
    display: flex;
    flex-direction: column;
    width: 50%;

    margin-right: 1.9rem;
  }

  &__column:last-child {
    margin-right: 0;
  }
}
</style>
