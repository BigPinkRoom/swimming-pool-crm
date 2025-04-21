<script setup>
import ContentClientAdd from "@/components/ui/Modals/ModalSide/components/ContentClientAdd/index.vue";
import FooterMain from "@/components/ui/Modals/ModalSide/components/FooterMain.vue";
import { filterFilledObjects } from "@/helpers/filterFilledObjects.js";

import AbonementEntity from "@/entities/abonementEntity";

import { useClientsStore } from "@/stores/clientStore";
import { useRelativesStore } from "@/stores/relativeStore";
import { useAbonementsStore } from "@/stores/abonementStore";

const abonementsStore = useAbonementsStore();
const clientsStore = useClientsStore();
const relativesStore = useRelativesStore();

const { createAddFamilyFormData, createFamilyModelRequest } =
  new AbonementEntity();

const modalSideActive = ref(false);
const selectedClientData = ref("add");
const contentClientAddRef = ref(null);

const { $services, $showError } = useNuxtApp();

const actionType = computed(() => {
  return selectedClientData.value;
});

const openModalSide = (value) => {
  selectedClientData.value = value;
  modalSideActive.value = true;
};
const closeModalSide = () => {
  modalSideActive.value = false;
};

const sendFamily = async () => {
  const familyModelRequest = createFamilyModelRequest({
    clients: filterFilledObjects(clientsStore.clients),
    relatives: filterFilledObjects(relativesStore.relatives),
    abonements: abonementsStore.abonements,
  });

  console.log("relatives", familyModelRequest.relatives);
  console.log(
    "relatives filter filled objects",
    filterFilledObjects(familyModelRequest.relatives)
  );

  const family = createAddFamilyFormData({
    clients: filterFilledObjects(familyModelRequest.clients),
    relatives: filterFilledObjects(familyModelRequest.relatives),
    abonements: familyModelRequest.abonements,
  });

  return family;
};

const updateFamily = async (request) => {
  try {
    const response = await $services.abonements.updateFamily(request);

    // Обновляем ID только у новых клиентов
    if (response.createdClientIds) {
      const newClients = clientsStore.clients.filter((client) => client.isNew);
      newClients.forEach((client, index) => {
        if (response.createdClientIds[index]) {
          client.id = response.createdClientIds[index];
        }
      });
    }

    // Обновляем ID только у новых родственников
    if (response.createdRelativeIds) {
      const newRelatives = relativesStore.relatives.filter(
        (relative) => relative.isNew
      );
      newRelatives.forEach((relative, index) => {
        if (response.createdRelativeIds[index]) {
          relative.id = response.createdRelativeIds[index];
        }
      });
    }
  } catch (error) {
    console.error("Error updating family data:", error);
    if (error.value?.data?.error?.message) {
      $showError(error.value.data.error.message);
    } else {
      $showError("Произошла ошибка при обновлении данных");
    }
  }
};

const handleFormSubmit = async () => {
  try {
    const request = await sendFamily();

    if (actionType.value.type === "edit") {
      await updateFamily(request);
    } else {
      await $services.abonements.addFamily(request);
    }
    closeModalSide();
  } catch (error) {
    console.error("Error saving form data:", error);
    if (error.value?.data?.error?.message) {
      $showError(error.value.data.error.message);
    } else {
      $showError("Произошла ошибка при сохранении данных");
    }
  }
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
      <template #content>
        <ContentClientAdd ref="contentClientAddRef" :actionType="actionType"
      /></template>
      <template #footer>
        <FooterMain
          left-text="Save"
          right-text="Cancel"
          @click-left="handleFormSubmit"
          @click-right="closeModalSide"
        />
      </template>
    </ui-modals-modal-side>
    <TablesAbonementsTable @open-modal="openModalSide" />
  </div>
</template>
