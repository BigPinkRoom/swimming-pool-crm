<script setup>
import { useBranchesStore } from "@/stores/branchStore";

const { $services } = useNuxtApp();

const branchesSelectValues = useBranchesStore().branches;

const formErrors = ref({});

const formSubmitHandler = async (eventSubmitForm) => {
  try {
    const result = await $services.user.signIn(eventSubmitForm);

    return result;
  } catch (error) {
    formErrors.value = error;
  }
};

const refreshUser = async () => {
  const data = await $services.user.getCurrent();
};
</script>

<template>
  <div class="container">
    <FormsSignIn
      :branch-options-list="branchesSelectValues"
      :errors="formErrors"
      @formSubmit="formSubmitHandler"
    />
    <button @click="refreshUser">get user</button>
  </div>
</template>

<style lang="scss" scoped>
.container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: calc(100vh - 4rem);

  background-color: #fff;
}

.title {
  color: #eee;
  font-size: 3.2rem;
  font-family: Arial, sans-serif;

  text-transform: uppercase;
  text-decoration: none;
}
</style>
