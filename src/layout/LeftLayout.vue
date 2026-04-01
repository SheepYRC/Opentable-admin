<template>
  <BaseLayout>
    <!-- 左侧菜单 -->
    <div class="layout__sidebar" :class="{ 'layout__sidebar--collapsed': !isSidebarOpen }">
      <div :class="{ 'has-logo': showLogo }" class="sidebar-container">
        <LayoutLogo v-if="showLogo" :collapse="!isSidebarOpen" />
        <el-scrollbar class="sidebar-menu">
          <LayoutSidebar :data="routes" base-path="" />
        </el-scrollbar>
        <SidebarBottom :collapse="!isSidebarOpen" />
      </div>
    </div>

    <!-- 主内容区 -->
    <div
      class="layout__main"
      :class="{
        hasTagsView: showTagsView,
        'layout__main--collapsed': !isSidebarOpen,
      }"
    >
      <div class="fixed-header">
        <LayoutNavbar />
        <LayoutTagsView v-if="showTagsView" />
      </div>
      <LayoutMain />
    </div>
  </BaseLayout>
</template>

<script setup lang="ts">
import { useLayout } from "./useLayout";
import BaseLayout from "./BaseLayout.vue";
import LayoutLogo from "./components/LayoutLogo.vue";
import LayoutNavbar from "./components/LayoutNavbar.vue";
import LayoutTagsView from "./components/LayoutTagsView.vue";
import LayoutMain from "./components/LayoutMain.vue";
import LayoutSidebar from "./components/LayoutSidebar.vue";
import SidebarBottom from "./components/SidebarBottom.vue";

const { showTagsView, showLogo, isSidebarOpen, routes } = useLayout();
</script>

<style lang="scss" scoped>
.layout {
  &__sidebar {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 1001;
    width: $sidebar-width;
    background-color: $menu-background;
    transition: width 0.28s;

    &--collapsed {
      width: $sidebar-width-collapsed;
    }

    .sidebar-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: $menu-background;

      .sidebar-menu {
        flex: 1;
        overflow: hidden;

        :deep(.el-menu) {
          border: none;
        }
      }
    }
  }

  &__main {
    position: relative;
    min-height: 100%;
    margin-left: $sidebar-width;
    transition: margin-left 0.28s;
    background-color: var(--el-bg-color-page);

    &--collapsed {
      margin-left: $sidebar-width-collapsed;
    }

    .fixed-header {
      position: sticky;
      top: 0;
      z-index: 9;
      width: 100%;
      transition: width 0.28s;
      background: var(--el-bg-color);
    }
  }
}

/* 移动端样式*/
.mobile {
  .layout__sidebar {
    width: $sidebar-width !important;
    transition: transform 0.28s;
  }

  &.hideSidebar {
    .layout__sidebar {
      transform: translateX(-$sidebar-width);
    }
  }

  &.openSidebar {
    .layout__sidebar {
      transform: translateX(0);
    }
  }

  .layout__main {
    margin-left: 0 !important;
  }
}

.hasTagsView {
  :deep(.app-main) {
    min-height: calc(100vh - $navbar-height - $tags-view-height) !important;
  }
}
</style>
