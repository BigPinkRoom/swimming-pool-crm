<script setup>
import { useBranchesStore } from "@/stores/branchStore";

const { $services } = useNuxtApp();
const branchesSelectValues = useBranchesStore().branches;

const formSubmitHandler = async (eventForm) => {
  // const user = eventForm.target.elements;

  try {
    const result = await $services.user.signIn(eventForm);

    return result;
  } catch (err) {
    throw err; // Пробрасываем ошибку для error
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

  background-color: #ccc;
}

.title {
  color: #eee;
  font-size: 3.2rem;
  font-family: Arial, sans-serif;

  text-transform: uppercase;
  text-decoration: none;
}
</style>
