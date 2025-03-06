<script setup>
import { useMenusStore } from "@/stores/menusStore";
import { routesConstantsActions } from "@/constants/routes";
const { locale, locales } = useI18n();

const mainMenuList = computed(() => {
  return useMenusStore().mainMenu;
});

const localePath = useLocalePath();
</script>

<template>
  <div class="navbar">
    <div class="navbar__left"></div>
    <div class="navbar__right">
      <div v-for="route in mainMenuList" :key="route.name" class="navbar__item">
        <nuxt-link
          :to="localePath(route.name)"
          @click.native="routesConstantsActions[route.name]"
        >
          {{ $t(`pages.${route.name}.title`) }}
        </nuxt-link>
      </div>
      <select id="" v-model="locale" class="" name="">
        <option v-for="lang in locales" :key="lang.code" :value="lang.code">
          {{ lang.name }}
        </option>
      </select>
    </div>
  </div>
</template>

<style lang="scss">
.navbar {
  display: flex;
  width: 100%;
  padding: 1.2rem 1rem;

  background-color: var(--color-main);

  &__right {
    display: flex;
    flex-direction: row;
    margin-left: auto;
  }

  &__item {
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin-right: 1.25rem;

    color: var(--color-main);
    cursor: pointer;
    text-transform: uppercase;

    &:last-child {
      margin-right: 0;
    }

    & a {
      color: var(--color-white);
      font-size: 1.2rem;
      line-height: 1.35;
      text-decoration: none;
    }
  }
}
</style>
