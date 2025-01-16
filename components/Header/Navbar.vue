<script setup>
const { locale, locales } = useI18n();

import { routesConstants } from "@/constants/routes";
import { rolesConstants } from "@/constants/roles";

// Роуты-ссылки для главного горизонтального меню
const menuRoutes = [
  {
    name: routesConstants.MAIN_PAGE_ROUTE_NAME,
    forRoles: [
      rolesConstants.EMPLOYEE_ROLE_NAME,
      rolesConstants.GUEST_ROLE_NAME,
    ],
  },
  {
    name: routesConstants.SIGNUP_ROUTE_NAME,
    forRoles: [rolesConstants.GUEST_ROLE_NAME],
  },
  {
    name: routesConstants.LOGIN_ROUTE_NAME,
    forRoles: [rolesConstants.GUEST_ROLE_NAME],
  },
  {
    name: routesConstants.PROFILE_ROUTE_NAME,
    forRoles: [rolesConstants.EMPLOYEE_ROLE_NAME],
  },
  {
    name: routesConstants.LOGOUT_ROUTE_NAME,
    forRoles: [rolesConstants.EMPLOYEE_ROLE_NAME],
    // action: this.logout,
    disabledRouteEvent: true,
  },
];

// Проверенные по ролям роуты
const checkedRoutes = computed(() => {
  const checkedRoutes = [];

  menuRoutes.forEach((route) => {
    //   let check = false;

    //   if (this.$auth.loggedIn) {
    //     check = route.forRoles.find((role) => role === this.$auth.user.user_role);
    //   }

    //   if (!this.$auth.loggedIn) {
    //     check = route.forRoles.find((role) => role === "guest");
    //   }

    //   if (check) {
    //     checkedRoutes.push(route);
    //   }
    checkedRoutes.push(route);
  });

  return checkedRoutes;
});

const startAction = function (action) {
  if (action) action();
};

const localePath = useLocalePath();
</script>

<template>
  <div class="navbar">
    <div class="navbar__left"></div>
    <div class="navbar__right">
      <div
        v-for="route in checkedRoutes"
        :key="route.name"
        class="navbar__item"
      >
        <nuxt-link
          :to="localePath(route.name)"
          :event="route.disabledRouteEvent ? '' : 'click'"
          @click.native="startAction(route.action)"
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
