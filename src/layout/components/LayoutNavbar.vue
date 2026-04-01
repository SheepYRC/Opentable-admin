<template>
  <div class="navbar">
    <LayoutSearch />

    <div class="navbar__actions">
      <LayoutToolbar />
    </div>
  </div>
</template>

<script setup lang="ts">
import LayoutSearch from "./LayoutSearch.vue";
</script>

<style lang="scss" scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $navbar-height;
  padding: 0 16px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);

  &__left {
    display: flex;
    align-items: center;
  }

  &__actions {
    display: flex;
    align-items: center;
    height: 100%;
    gap: 8px;
  }
}
</style>
