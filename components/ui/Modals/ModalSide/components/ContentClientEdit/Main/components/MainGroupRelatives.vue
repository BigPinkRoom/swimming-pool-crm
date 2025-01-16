<template>
  <fieldset>
    <legend>{{ $t(`forms.client.${actionType}.fieldsets.relatives.label`) }}</legend>

    <label for="relativeType">
      {{ $t(`forms.client.${actionType}.fieldsets.relatives.fields.type.label`) }}
    </label>
    <v-input id="relativeType" type="number"></v-input>

    <label for="relativeName">
      {{ $t(`forms.client.${actionType}.fieldsets.relatives.fields.name.label`) }}
    </label>
    <v-input id="relativeName" type="text"></v-input>

    <label for="relativeTelephone">
      {{ $t(`forms.client.${actionType}.fieldsets.relatives.fields.telephone.label`) }}
    </label>
    <v-input id="relativeTelephone" type="tel"></v-input>
  </fieldset>
</template>

<script>
import vInput from '@/components/ui/Fields/Input';

export default {
  name: 'MainGroupRelatives',
  components: {
    vInput,
  },
  props: {
    actionType: {
      type: String,
    },
  },
};
</script>
