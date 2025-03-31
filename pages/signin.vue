<script setup>
import { useBranchesStore } from "@/stores/branchStore";

const { $services } = useNuxtApp();

const branchesSelectValues = useBranchesStore().branches;
</script>

<template>
  <div class="container">
    <FormsSignIn :branch-options-list="branchesSelectValues" />
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
