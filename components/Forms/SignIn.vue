<script setup>
import { uuid } from "vue-uuid";
import { userSignInValidationSchema } from "@/schemas/zod/userSchemas";
import vSelect from "@/components/ui/Selects/Select";
import vInput from "@/components/ui/Fields/Input";

const { $services } = useNuxtApp();
const { $i18n } = useNuxtApp();
const t = $i18n.t;

const uuidV4 = uuid.v4();
const email = ref("");
const password = ref("");
const formErrors = ref({});

const props = defineProps({
  branchOptionsList: {
    type: Array,
    default() {
      return [];
    },
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["formSubmit"]);

const emitSubmit = function (event) {
  emit("formSubmit", event);
};

watch(email, (newEmail) => {
  $services.user.validateField({
    field: "email",
    value: newEmail,
    schemaRaw: userSignInValidationSchema,
    formErrors: formErrors.value,
    propsErrors: props.errors,
  });
});

watch(password, (newPassword) => {
  $services.user.validateField({
    field: "password",
    value: newPassword,
    schemaRaw: userSignInValidationSchema,
    formErrors: formErrors.value,
    propsErrors: props.errors,
  });
});
</script>

<template>
  <form id="text" class="form" @submit.prevent="emitSubmit">
    <h1 class="form__title">{{ $t("forms.login.title") }}</h1>

    <div class="form__item">
      <v-select
        :id="`login-branch-select_${uuidV4}`"
        :options-list="branchOptionsList"
        :title="$t('forms.login.fields.branch.title')"
        name="branch"
      />
    </div>

    <div class="form__item">
      <v-input
        v-model="email"
        :id="`login-email_${uuidV4}`"
        :title="$t('forms.login.fields.email.title')"
        name="email"
        type="email"
        :errorMessage="
          $services.user.errorMessagesInputCheck(
            'email',
            formErrors,
            props.errors
          )
        "
      />
    </div>

    <div class="form__item">
      <v-input
        v-model="password"
        :id="`login-password_${uuidV4}`"
        :title="$t('forms.login.fields.password.title')"
        name="password"
        type="password"
        :errorMessage="
          $services.user.errorMessagesInputCheck(
            'password',
            formErrors,
            props.errors
          )
        "
      />
    </div>

    <v-input type="submit" :value="$t('forms.login.submit')" />
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
