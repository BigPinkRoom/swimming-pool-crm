<script setup>
import { useBranchesStore } from "@/stores/branchStore";

const { $services } = useNuxtApp();

const branchesSelectValues = useBranchesStore().branches;

const formSubmitHandler = async (eventForm) => {
  $services.user.create(eventForm.target.elements);
};

const createModelSignup = (fields) => {
  const model = {};

  const fieldsArray = Array.from(fields);

  fieldsArray.forEach((item) => {
    if (item.name) {
      model[item.name] = item.value;
    }
  });

  return model;
};
</script>

<template>
  <div class="container">
    <FormsSignUp
      :branch-options-list="branchesSelectValues"
      @formSubmit="formSubmitHandler"
    />
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
