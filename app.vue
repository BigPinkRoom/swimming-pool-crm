<script setup>
import { useBranchesStore } from "@/stores/branchStore";
import { useMenusStore } from "@/stores/menusStore";
import { useUserStore } from "@/stores/userStore";

const { $services } = useNuxtApp();
const branchesStore = useBranchesStore();
const menusStore = useMenusStore();

const branchesValue = await $services.branchesSelect.get();
branchesStore.set(branchesValue);

const menuValue = await $services.menus.getMainMenu();
menusStore.set(menuValue);
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
