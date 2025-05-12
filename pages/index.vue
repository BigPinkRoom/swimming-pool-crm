<script setup>
import ContentClientAdd from "@/components/ui/Modals/ModalSide/components/ContentClientAdd/index.vue";
import FooterMain from "@/components/ui/Modals/ModalSide/components/FooterMain.vue";
import { filterFilledObjects } from "@/helpers/filterFilledObjects.js";
import { ref, computed } from "vue";

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
const selectedClientData = ref({ type: "add", family: null });
const contentClientAddRef = ref(null);

const { $services, $showError } = useNuxtApp();

const actionType = computed(() => {
  return selectedClientData.value;
});

const closeModalSide = () => {
  modalSideActive.value = false;
  selectedClientData.value = { type: "add", family: null };
  clientsStore.reset();
  relativesStore.reset();
  abonementsStore.setFilledObject([]);
};

const openModalSide = (clientDataFromTable) => {
  if (clientDataFromTable && clientDataFromTable.type === "edit") {
    selectedClientData.value = {
      type: clientDataFromTable.type,
      family: clientDataFromTable.family,
    };
  } else {
    selectedClientData.value = {
      type: "add",
      family: null,
    };
  }
  modalSideActive.value = true;
};

const handleFamilyDataUpdatedFromSearch = (familyDataFromSearch) => {
  selectedClientData.value = {
    type: "add",
    family: familyDataFromSearch,
  };
};

const sendFamily = async () => {
  const clientsForRequest = clientsStore.clients
    .filter((client) => client.name && client.name.trim() !== "")
    .map((client) => ({
      name: client.name,
      surname: client.surname,
      patronymic: client.patronymic,
      birthday: client.birthday,
      gender: client.gender,
      ...(client.id && { id: client.id }),
    }));

  const relativesForRequest = relativesStore.relatives
    .filter((relative) => relative.name && relative.name.trim() !== "")
    .map((relative) => ({
      name: relative.name,
      surname: relative.surname,
      patronymic: relative.patronymic,
      relative_type_id: relative.relativeTypeId,
      telephone: relative.telephone,
      ...(relative.id && { id: relative.id }),
    }));

  const abonementsForRequest = abonementsStore.abonements
    .filter((a) => a && a.abonement_id)
    .map((a) => ({
      abonement_id: a.abonement_id,
      visits_quantity: a.visits_quantity,
      visits_left: a.visits_left,
      date_create: a.date_create,
      date_start: a.date_start,
      date_end: a.date_end,
      user_created_id: a.user_created_id,
      status_id: a.status_id,
      branch_id: a.branch_id,
      // ...добавьте другие поля, если нужно
    }));

  const familyRequest = {
    family: {
      clients: clientsForRequest,
      relatives: relativesForRequest,
      abonements: abonementsForRequest,
    },
  };

  return familyRequest;
};

const updateFamily = async (request) => {
  const formData = createAddFamilyFormData({
    clients: request.family.clients,
    relatives: request.family.relatives,
    abonements: request.family.abonements,
  });
  await $services.abonements.updateFamily(formData);
};

const updateIdsFromResponse = (response) => {
  // console.log("Received response after addFamily:", response);
};

const handleFormSubmit = async () => {
  try {
    const request = await sendFamily();

    // Получаем ref на компонент абонементов
    const fieldsetAbonements =
      contentClientAddRef.value?.$refs?.fieldsetAbonements;
    let tempAbonement = null;
    if (
      fieldsetAbonements &&
      typeof fieldsetAbonements.getCurrentTempAbonement === "function"
    ) {
      tempAbonement = fieldsetAbonements.getCurrentTempAbonement();
    }
    // Если выбран режим "Добавить новый" и абонемент заполнен, добавляем его в массив для отправки
    if (
      tempAbonement &&
      tempAbonement.quantity &&
      tempAbonement.duration &&
      tempAbonement.activationDate
    ) {
      // Добавляем новый абонемент в массив для отправки
      request.family.abonements.push({
        quantity: tempAbonement.quantity,
        duration: tempAbonement.duration,
        activation_date: tempAbonement.activationDate,
      });
    }

    // Определяем, нужно обновлять существующую семью (если она пришла из поиска или редактирования)
    // Семья считается существующей, если она открыта на редактирование (type === 'edit')
    // или если она пришла из поиска и содержит хотя бы одного клиента или родственника с ID.
    const familyExists =
      actionType.value.type === "edit" ||
      actionType.value.family?.clients?.some((client) => client.id) ||
      actionType.value.family?.relatives?.some((relative) => relative.id);

    if (familyExists) {
      await updateFamily(request);
    } else {
      const formData = createAddFamilyFormData({
        clients: request.family.clients,
        relatives: request.family.relatives,
        abonements: request.family.abonements,
      });
      const response = await $services.abonements.addFamily(formData);
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
        :title="$t(`forms.client.${actionType?.type || 'add'}.title`)"
      >
        <template #content>
          <ContentClientAdd
            ref="contentClientAddRef"
            :actionType="actionType"
            @family-data-updated="handleFamilyDataUpdatedFromSearch"
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
