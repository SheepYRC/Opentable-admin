<template>
  <div class="layout-wrapper" :class="layoutClass">
    <LeftLayout />
    <Settings v-if="showSettings" />
    <LayoutAIPanel />
  </div>
</template>

<script setup lang="ts">
import { useLayout } from "./useLayout";
import LeftLayout from "./LeftLayout.vue";
import Settings from "./components/LayoutSettings.vue";

const { layoutClass, showSettings } = useLayout();
</script>

<style lang="scss" scoped>
.layout-wrapper {
  width: 100%;
  height: 100%;
}
</style>
