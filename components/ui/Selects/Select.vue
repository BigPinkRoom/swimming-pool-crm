<script setup>
import { uuid } from "vue-uuid";

const props = defineProps({
  id: {
    type: [String, Number],
  },
  name: {
    type: String,
  },
  placeholder: {
    type: String,
    default: () => "",
  },
  optionsList: {
    type: Array,
  },
});

const uuidV4 = uuid.v4();

const updateValue = function (value) {
  console.log("select update value", value);
};
</script>

<template>
  <div class="select">
    <select
      :id="id"
      :name="name"
      class="select__field"
      @input="updateValue($event.target.value)"
    >
      <option v-if="placeholder" value="null" disabled selected>
        {{ placeholder }}
      </option>
      <option
        v-for="option in optionsList"
        :key="`${option.value}_${uuidV4}`"
        :disabled="option.disabled"
        :selected="option.selected"
        :value="option.value"
        class="select__option"
      >
        {{ option.text }}
      </option>
    </select>
  </div>
</template>

<style lang="scss" scoped>
.select {
  &__field {
    width: 100%;
  }
  &__option {
  }
}
</style>
