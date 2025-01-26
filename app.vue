<script setup>
import { useBranchesStore } from "@/stores/branchStore";

const { $services } = useNuxtApp();
const branchesStore = useBranchesStore();

const branchesValue = await $services.branchesSelect.get();
branchesStore.set(branchesValue);
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
