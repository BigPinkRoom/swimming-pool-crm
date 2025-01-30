<script setup>
import { useMessageStore } from "@/stores/messageStore";

const messageStore = useMessageStore();

const props = defineProps({
  id: Number,
  type: String,
  duration: {
    type: Number,
    default: 6000,
  },
});

const timeout = ref(null);

const classes = computed(() => {
  const classes = [];

  if (typeof props.type === "string" && props.type !== "") {
    classes.push(`infobar__message_${props.type}`);
  }

  return classes;
});

function show() {
  if (props.duration > 0) {
    clearTimeout(timeout.value);

    timeout.value = setTimeout(() => {
      close();
    }, props.duration);
  }
}

function close() {
  clearTimeout(timeout.value);
  messageStore.remove(props.id);
}

onMounted(() => {
  // console.log("timeout value", timeout.value);
  show();
});
</script>

<template>
  <transition name="transition-infobar" appear>
    <div class="infobar" :class="classes">
      <slot name="message"></slot>
    </div>
  </transition>
</template>

<style lang="scss" scoped>
.infobar {
  width: 100%;
  height: 100%;
  padding: 0.4rem 1.6rem;

  color: var(--color-white);
  text-align: center;

  background-color: var(--color-main);

  &__message {
    &_error {
      background-color: var(--color-warning);
    }
  }
}
</style>
