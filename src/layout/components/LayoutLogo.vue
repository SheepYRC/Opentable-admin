<template>
  <div class="logo">
    <transition enter-active-class="animate__animated animate__fadeInLeft">
      <router-link :key="+collapse" class="wh-full flex-center" to="/">
<!--        <img :src="logo" class="w20px h20px" />-->
        <span v-if="!collapse" class="title">
          {{ appConfig.title }}
        </span>
      </router-link>
    </transition>
  </div>
</template>

<script lang="ts" setup>
import { appConfig } from "@/settings";
import logo from "@/assets/logo.svg";

defineProps({
  collapse: {
    type: Boolean,
    required: true,
  },
});
</script>

<style lang="scss" scoped>
.logo {
  width: 100%;
  height: $navbar-height;
  background-color: $menu-background;
  display: flex;
  align-items: center;
  justify-content: center;

  .wh-full {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    text-decoration: none;
  }

  .title {
    flex-shrink: 0;
    margin-left: 10px;
    font-size: 14px;
    font-weight: bold;
    color: #fff;
  }
}
</style>
