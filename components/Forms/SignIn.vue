<script setup>
import { uuid } from "vue-uuid";
import vSelect from "@/components/ui/Selects/Select";
import vInput from "@/components/ui/Fields/Input";

const uuidV4 = uuid.v4();

const props = defineProps({
  branchOptionsList: {
    type: Array,
    default() {
      return [];
    },
  },
});

const emit = defineEmits(["formSubmit"]);

const emitSubmit = function (event) {
  emit("formSubmit", event);
};
</script>

<template>
  <form id="text" class="form" @submit.prevent="emitSubmit">
    <h1 class="form__title">{{ $t("forms.login.title") }}</h1>

    <div class="form__item">
      <label :for="`login-branch-select_${uuidV4}`" class="form__label">
        {{ $t("forms.login.fields.branch.title") }}
      </label>
      <v-select
        :id="`login-branch-select_${uuidV4}`"
        :options-list="branchOptionsList"
        :placeholder="$t('forms.login.fields.branch.placeholder')"
        name="branch"
      />
    </div>

    <div class="form__item">
      <label :for="`login-email_${uuidV4}`" class="form__label">
        {{ $t("forms.login.fields.email.title") }}
      </label>
      <v-input
        :id="`login-email_${uuidV4}`"
        :placeholder="$t('forms.login.fields.email.placeholder')"
        name="email"
        type="email"
      />
    </div>

    <div class="form__item">
      <label :for="`login-password_${uuidV4}`" class="form__label">
        {{ $t("forms.login.fields.password.title") }}
      </label>
      <v-input
        :id="`login-password_${uuidV4}`"
        :placeholder="$t('forms.login.fields.password.placeholder')"
        name="password"
        type="password"
      />
    </div>

    <v-input type="submit" :value="$t('forms.login.submit')" />
  </form>
</template>
<style lang="scss" scoped>
.form {
  display: flex;
  flex-direction: column;
  padding: 1.6rem;

  &__item {
    display: flex;
    flex-direction: column;
    margin-bottom: 1.6rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  &__label {
    margin-bottom: 0.4rem;
  }
}
</style>
