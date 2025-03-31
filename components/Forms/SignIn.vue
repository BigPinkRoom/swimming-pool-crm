<script setup>
import { uuid } from "vue-uuid";
import { userSignInValidationSchema } from "@/schemas/zod/userSchemas";
import vSelect from "@/components/ui/Selects/Select";
import vInput from "@/components/ui/Fields/Input";
import { toTypedSchema } from "@vee-validate/zod";

const { $services } = useNuxtApp();
const { $i18n } = useNuxtApp();
const t = $i18n.t;
const uuidV4 = uuid.v4();

const validationSchema = toTypedSchema(userSignInValidationSchema(t));

const props = defineProps({
  branchOptionsList: {
    type: Array,
    default() {
      return [];
    },
  },
});

const { errors, values, meta, validate } = useForm({
  validationSchema,
});

const formSubmitHandler = async (eventSubmitForm) => {
  try {
    await validate();
    const result = await $services.user.signIn(eventSubmitForm);

    return result;
  } catch (error) {
    throw error;
  }
};
</script>

<template>
  <form id="text" class="form" @submit.prevent="formSubmitHandler">
    <h1 class="form__title">{{ $t("forms.login.title") }}</h1>

    <div class="form__item">
      <v-select
        :id="`login-branch-select_${uuidV4}`"
        :options-list="branchOptionsList"
        :title="$t('forms.login.fields.branch.title')"
        name="branch"
        :success-message="$t('zod.success')"
        :errorSubmit="errors.branch"
      />
    </div>

    <div class="form__item">
      <v-input
        :id="`login-email_${uuidV4}`"
        :title="$t('forms.login.fields.email.title')"
        name="email"
        type="email"
        :success-message="$t('zod.success')"
        :errorSubmit="errors.email"
      />
    </div>

    <div class="form__item">
      <v-input
        :id="`login-password_${uuidV4}`"
        :title="$t('forms.login.fields.password.title')"
        name="password"
        type="password"
        :success-message="$t('zod.success')"
        :errorSubmit="errors.password"
      />
    </div>

    <UiButtonsButtonSubmit
      :disabled="!meta.valid"
      text-invalid="forms.login.submit"
      text-success="forms.login.submit"
    />
  </form>
</template>
<style lang="scss" scoped>
.form {
  display: flex;
  flex-direction: column;
  max-width: 220px;
  width: 220px;
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
