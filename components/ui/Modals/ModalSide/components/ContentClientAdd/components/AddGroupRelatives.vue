<script setup>
import vInput from "@/components/ui/Fields/Input";
import CardTable from "@/components/Common/CardTable.vue";

const props = defineProps({
  actionType: {
    type: String,
  },
});
</script>

<template>
  <fieldset class="client-main__fieldset">
    <CardTable class="card-table__wrapper--pink">
      <template #title>
        <legend class="card-table__title card-table__title--pink">
          {{ $t(`forms.client.${actionType}.fieldsets.relatives.label`) }}
        </legend>
      </template>
      <template #content>
        <label for="relativeType">
          {{
            $t(
              `forms.client.${actionType}.fieldsets.relatives.fields.type.label`
            )
          }}
        </label>
        <v-input id="relativeType" type="number"></v-input>

        <label for="relativeName">
          {{
            $t(
              `forms.client.${actionType}.fieldsets.relatives.fields.name.label`
            )
          }}
        </label>
        <v-input id="relativeName" type="text"></v-input>

        <label for="relativeTelephone">
          {{
            $t(
              `forms.client.${actionType}.fieldsets.relatives.fields.telephone.label`
            )
          }}
        </label>
        <v-input id="relativeTelephone" type="tel"></v-input>
      </template>
    </CardTable>
  </fieldset>
</template>

<style lang="scss" scoped>
.client-main {
  &__fieldset {
    position: relative;
    border: 0;
  }
}
</style>
