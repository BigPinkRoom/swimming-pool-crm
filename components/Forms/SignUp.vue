<script setup>
import vSelect from "@/components/ui/Selects/Select";
import vInput from "@/components/ui/Fields/Input";
import { uuid } from "vue-uuid";

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
  <form class="form" @submit.prevent="emitSubmit">
    <h1 class="form__title">{{ $t("forms.signup.title") }}</h1>

    <div class="form__item">
      <label :for="`signup-branch-select_${uuidV4}`" class="form__label">
        {{ $t("forms.signup.fields.branch.title") }}
      </label>
      <v-select
        :id="`signup-branch-select_${uuidV4}`"
        :placeholder="$t('forms.signup.fields.branch.placeholder')"
        :options-list="props.branchOptionsList"
        name="branch"
      />
    </div>

    <div class="form__item">
      <label :for="`signup-email_${uuidV4}`" class="form__label">
        {{ $t("forms.signup.fields.email.title") }}
      </label>
      <v-input
        :id="`signup-email_${uuidV4}`"
        :placeholder="$t('forms.signup.fields.email.placeholder')"
        name="email"
        type="email"
      />
    </div>

    <div class="form__item">
      <label :for="`signup-password_${uuidV4}`" class="form__label">
        {{ $t("forms.signup.fields.password.title") }}
      </label>
      <v-input
        :id="`signup-password_${uuidV4}`"
        :placeholder="$t('forms.signup.fields.password.placeholder')"
        name="password"
        type="password"
      />
    </div>

    <div class="form__item">
      <label :for="`signup-password-confirm_${uuidV4}`" class="form__label">
        {{ $t("forms.signup.fields.passwordConfirm.title") }}
      </label>
      <v-input
        :id="`signup-password-confirm_${uuidV4}`"
        :placeholder="$t('forms.signup.fields.passwordConfirm.placeholder')"
        name="password-confirm"
        type="password"
      />
    </div>

    <div class="form__item">
      <label :for="`signup-surname_${uuidV4}`" class="form__label">
        {{ $t("forms.signup.fields.surname.title") }}
      </label>
      <v-input
        :id="`signup-surname_${uuidV4}`"
        :placeholder="$t('forms.signup.fields.surname.placeholder')"
        name="surname"
        type="text"
      />
    </div>

    <div class="form__item">
      <label :for="`signup-name_${uuidV4}`" class="form__label">
        {{ $t("forms.signup.fields.name.title") }}
      </label>
      <v-input
        :id="`signup-name_${uuidV4}`"
        :placeholder="$t('forms.signup.fields.name.placeholder')"
        name="name"
        type="text"
      />
    </div>
    <div class="form__item">
      <label :for="`signup-patronymic_${uuidV4}`" class="form__label">
        {{ $t("forms.signup.fields.patronymic.title") }}
      </label>
      <v-input
        :id="`signup-patronymic_${uuidV4}`"
        :placeholder="$t('forms.signup.fields.patronymic.placeholder')"
        name="patronymic"
        type="text"
      />
    </div>

    <v-input type="submit" :value="$t('forms.signup.submit')" />
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
