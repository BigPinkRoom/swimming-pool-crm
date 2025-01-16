<template>
  <div class="select">
    <select :id="id" :name="name" class="select__field" @input="updateValue($event.target.value)">
      <option v-if="placeholder" value="null" disabled selected>
        {{ placeholder }}
      </option>
      <option
        v-for="option in optionsList"
        :key="`${option.value}_${uuid}`"
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

<script>
import { uuid } from 'vue-uuid';

export default {
  name: 'Select',
  props: {
    id: {
      type: [String, Number],
    },
    name: {
      type: String,
    },
    placeholder: {
      type: String,
      default: () => '',
    },
    optionsList: {
      type: Array,
    },
  },
  data() {
    return {
      uuid: '',
    };
  },
  mounted() {
    this.uuid = uuid.v4();
  },
  methods: {
    updateValue(value) {},
  },
};
</script>
<style lang="scss" scoped>
.select {
  &__field {
    width: 100%;
  }
  &__option {
  }
}
</style>
