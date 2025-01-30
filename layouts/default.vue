<script setup>
import { useMessageStore } from "@/stores/messageStore";

const messageStore = useMessageStore();
</script>

<template>
  <div class="layout">
    <div class="layout__infobar">
      <InfoBar
        v-for="message in messageStore.messages"
        :id="message.id"
        :key="message.id"
        :type="message.type"
      >
        <template #message>
          {{ message.message }}
        </template>
      </InfoBar>
    </div>
    <HeaderNavbar />
    <NuxtPage />
  </div>
</template>

<style lang="scss" scoped>
.layout {
  height: 100vh;

  &__infobar {
    position: fixed;
    top: 5.1rem;

    width: 100%;
  }

  &__navbar {
  }

  &__main {
  }
}
</style>
