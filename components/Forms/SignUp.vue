<script setup>
import { uuid } from "vue-uuid";
import { userSignUpValidationSchema } from "@/schemas/zod/userSchemas";
import vSelect from "@/components/ui/Selects/Select";
import vInput from "@/components/ui/Fields/Input";
import { toTypedSchema } from "@vee-validate/zod";

const { $services } = useNuxtApp();
const { $i18n } = useNuxtApp();
const t = $i18n.t;
const uuidV4 = uuid.v4();

const validationSchema = toTypedSchema(userSignUpValidationSchema(t));

const props = defineProps({
  branchOptionsList: {
    type: Array,
    default() {
      return [];
    },
  },
});

const { errors, meta, validate } = useForm({
  validationSchema,
});

const formSubmitHandler = async (eventSubmitForm) => {
  try {
    await validate();
    const result = await $services.user.create(eventSubmitForm);

    return result;
  } catch (error) {
    throw error;
  }
};
</script>

<template>
  <form class="form" @submit.prevent="formSubmitHandler">
    <h1 class="form_title">{{ $t("forms.signup.title") }}</h1>

    <div class="form__item">
      <v-select
        :id="`signup-branch-select_${uuidV4}`"
        :title="$t('forms.signup.fields.branch.title')"
        :options-list="props.branchOptionsList"
        name="branch"
        :success-message="$t('zod.success')"
        :errorSubmit="errors.branch"
      />
    </div>
    <div class="form__item">
      <v-input
        :id="`signup-email_${uuidV4}`"
        :title="$t('forms.signup.fields.email.title')"
        name="email"
        type="email"
        :success-message="$t('zod.success')"
        :errorSubmit="errors.email"
      />
    </div>

    <div class="form__item">
      <v-input
        :id="`signup-password_${uuidV4}`"
        :title="$t('forms.signup.fields.password.title')"
        name="password"
        type="password"
        :success-message="$t('zod.success')"
        :errorSubmit="errors.password"
      />
    </div>

    <div class="form__item">
      <v-input
        :id="`signup-password-confirm_${uuidV4}`"
        :title="$t('forms.signup.fields.passwordConfirm.title')"
        name="passwordConfirm"
        type="password"
        :success-message="$t('zod.success')"
        :errorSubmit="errors.passwordConfirm"
      />
    </div>

    <div class="form__item">
      <v-input
        :id="`signup-surname_${uuidV4}`"
        :title="$t('forms.signup.fields.surname.title')"
        name="surname"
        type="text"
        :success-message="$t('zod.success')"
        :errorSubmit="errors.surname"
      />
    </div>

    <div class="form__item">
      <v-input
        :id="`signup-name_${uuidV4}`"
        :title="$t('forms.signup.fields.name.title')"
        name="name"
        type="text"
        :success-message="$t('zod.success')"
        :errorSubmit="errors.name"
      />
    </div>
    <div class="form__item">
      <v-input
        :id="`signup-patronymic_${uuidV4}`"
        :title="$t('forms.signup.fields.patronymic.title')"
        name="patronymic"
        type="text"
        :success-message="$t('zod.success')"
        :errorSubmit="errors.patronymic"
      />
    </div>

    <UiButtonsButtonSubmit
      :disabled="!meta.valid"
      text-invalid="forms.signup.submit"
      text-success="forms.signup.submit"
    />
  </form>
</template>
<style lang="scss" scoped>
.form {
  display: flex;
  flex-direction: column;
  padding: 1.6rem;

  border: 1px solid var(--color-main-tertiary-light-extra);
  border-radius: 6px;
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

  &__submit {
    height: 3.4rem;

    &:disabled {
      color: var(--color-white);

      border: 1px solid var(--color-main-tertiary-light-extra);
      background-color: var(--color-main-tertiary-light-extra);
    }
  }
}
</style>
