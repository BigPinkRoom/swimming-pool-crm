<script setup>
import ContentClientAdd from "@/components/ui/Modals/ModalSide/components/ContentClientAdd/index.vue";
import FooterMain from "@/components/ui/Modals/ModalSide/components/FooterMain.vue";

import { useRelativesStore } from "@/stores/relativeStore";
const relativesStore = useRelativesStore();

const modalSideActive = ref(false);
const selectedClientData = ref(false);

const { $services } = useNuxtApp();

const actionType = computed(() => {
  return selectedClientData.value ? "edit" : "add";
});

const openAddNewClient = () => {
  modalSideActive.value = true;
};
const closeModalSide = () => {
  modalSideActive.value = false;
};
</script>

<template>
  <div>
    <ui-modals-modal-side
      :active="modalSideActive"
      v-show="modalSideActive"
      sticky
      position="left"
      @close="closeModalSide"
      :title="$t(`forms.client.${actionType}.title`)"
    >
      <template #content><ContentClientAdd /></template>
      <template #footer>
        <footer-main />
      </template>
    </ui-modals-modal-side>
    <TablesAbonementsTable @open-modal="openAddNewClient" />
  </div>
</template>
