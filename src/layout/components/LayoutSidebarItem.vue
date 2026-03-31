<template>
  <div v-if="!item.meta || !item.meta.hidden">
    <!--【叶子节点】显示单子节点或自身直接渲染 -->
    <template
      v-if="
        (hasOneShowingChild(item.children, item) &&
          (!onlyOneChild.children || onlyOneChild.noShowingChildren) &&
          !item.meta?.alwaysShow) ||
        (item.meta?.alwaysShow && (!item.children || item.children.length === 0))
      "
    >
      <AppLink v-if="onlyOneChild && onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item
          :index="resolvePath(onlyOneChild.path)"
          :class="{ 'submenu-title-noDropdown': !isNest }"
        >
          <el-icon v-if="onlyOneChild.meta.icon || item.meta?.icon">
            <component :is="onlyOneChild.meta.icon || item.meta?.icon" />
          </el-icon>
          <template #title>
            <span v-if="onlyOneChild.meta.title">
              {{ translateRouteTitle(onlyOneChild.meta.title as string) }}
            </span>
          </template>
        </el-menu-item>
      </AppLink>
    </template>

    <!--【非叶子节点】含子菜单 -->
    <el-sub-menu v-else :index="resolvePath(item.path)">
      <template #title>
        <el-icon v-if="item.meta && item.meta.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <span v-if="item.meta && item.meta.title">
          {{ translateRouteTitle(item.meta.title as string) }}
        </span>
      </template>

      <LayoutSidebarItem
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
      />
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType } from "vue";
import path from "path-browserify";
import type { RouteRecordRaw } from "vue-router";
import { isExternal } from "@/utils/validate";
import { translateRouteTitle } from "@/lang/utils";
import AppLink from "./AppLink.vue";

const props = defineProps({
  item: {
    type: Object as PropType<RouteRecordRaw>,
    required: true,
  },
  basePath: {
    type: String,
    required: true,
  },
  isNest: {
    type: Boolean,
    default: false,
  },
});

const onlyOneChild = ref<any>(null);

function hasOneShowingChild(children: RouteRecordRaw[] = [], parent: RouteRecordRaw) {
  const showingChildren = children.filter((route: RouteRecordRaw) => {
    if (route.meta?.hidden) {
      return false;
    } else {
      onlyOneChild.value = route;
      return true;
    }
  });

  if (showingChildren.length === 1) {
    return true;
  }

  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: "", noShowingChildren: true };
    return true;
  }

  return false;
}

function resolvePath(routePath: string) {
  if (isExternal(routePath)) {
    return routePath;
  }
  if (isExternal(props.basePath)) {
    return props.basePath;
  }
  return path.resolve(props.basePath, routePath);
}
</script>

<style lang="scss" scoped>
.el-menu-item {
  &.is-active {
    background-color: var(--el-color-primary-light-9);
  }
}
</style>
