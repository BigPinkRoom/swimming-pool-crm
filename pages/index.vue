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
  // Подготавливаем данные для отправки
  const prepareData = (items) => {
    return items.map((item) => {
      if (!item.id) {
        const { id, ...itemWithoutId } = item;
        return itemWithoutId;
      }

      // Для временных идентификаторов (начинающихся с temp_), удаляем их перед отправкой
      if (item.id && item.id.toString().startsWith("temp_")) {
        const { id, ...itemWithoutId } = item;
        return itemWithoutId;
      }

      return item;
    });
  };

  const familyModelRequest = createFamilyModelRequest({
    clients: filterFilledObjects(clientsStore.clients),
    relatives: filterFilledObjects(relativesStore.relatives),
    abonements: abonementsStore.abonements,
  });

  const family = createAddFamilyFormData({
    clients: prepareData(filterFilledObjects(familyModelRequest.clients)),
    relatives: prepareData(filterFilledObjects(familyModelRequest.relatives)),
    abonements: familyModelRequest.abonements,
  });

  return family;
};

/**
 * Обновляет идентификаторы родственников и клиентов после ответа сервера
 * @param {Object} response - Ответ сервера
 */
const updateIdsFromResponse = (response) => {
  // Обновляем ID только у новых клиентов
  if (response.createdClientIds) {
    const newClients = clientsStore.clients.filter(
      (client) =>
        !client.id || (client.id && client.id.toString().startsWith("temp_"))
    );
    newClients.forEach((client, index) => {
      if (response.createdClientIds[index]) {
        client.id = response.createdClientIds[index];
      }
    });
  }

  // Обновляем ID только у новых родственников
  if (response.createdRelativeIds) {
    const newRelatives = relativesStore.relatives.filter(
      (relative) =>
        !relative.id ||
        (relative.id && relative.id.toString().startsWith("temp_"))
    );
    newRelatives.forEach((relative, index) => {
      if (response.createdRelativeIds[index]) {
        relative.id = response.createdRelativeIds[index];
        console.log(
          `Родственнику установлен ID ${response.createdRelativeIds[index]} от сервера`
        );
      }
    });
  }
};

const updateFamily = async (request) => {
  try {
    const response = await $services.abonements.updateFamily(request);
    updateIdsFromResponse(response);
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
      // При добавлении новой семьи также обрабатываем ID от сервера
      const response = await $services.abonements.addFamily(request);
      updateIdsFromResponse(response);
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
    <transition name="side-modal-slide-fade">
      <ui-modals-modal-side
        :active="modalSideActive"
        v-if="modalSideActive"
        sticky
        position="left"
        @close="closeModalSide"
        :title="$t(`forms.client.${actionType?.type}.title`)"
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
    </transition>
    <TablesAbonementsTable @open-modal="openModalSide" />
  </div>
</template>

<style lang="scss" scoped>
.side-modal-slide-fade-enter-active,
.side-modal-slide-fade-leave-active {
  transition: opacity 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
.side-modal-slide-fade-enter-from,
.side-modal-slide-fade-leave-to {
  opacity: 0;
  transform: translateX(-60px);
}
.side-modal-slide-fade-enter-to,
.side-modal-slide-fade-leave-from {
  opacity: 1;
  transform: translateX(0);
}
</style>
