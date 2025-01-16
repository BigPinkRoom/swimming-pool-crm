<script setup>
const { $services } = useNuxtApp();

const branches = await $services.branches.get();
</script>

<template>
  <div class="container">
    <FormsSignUp
      :branch-options-list="branchesSelectList"
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
