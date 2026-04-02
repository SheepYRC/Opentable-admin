<!-- 菜单组件 -->
<template>
  <el-menu
    ref="menuRef"
    :default-active="activeMenuPath"
    :collapse="!appStore.sidebar.opened"
    :background-color="menuThemeProps.backgroundColor"
    :text-color="menuThemeProps.textColor"
    :active-text-color="menuThemeProps.activeTextColor"
    :popper-effect="theme"
    :unique-opened="false"
    :collapse-transition="false"
    :mode="menuMode"
    @open="onMenuOpen"
    @close="onMenuClose"
  >
    <!-- 菜单项 -->
    <LayoutSidebarItem
      v-for="route in filteredData"
      :key="route.path"
      :item="route"
      :base-path="resolveFullPath(route.path)"
    />
  </el-menu>
</template>

<script lang="ts" setup>
import { useRoute } from "vue-router";
import { computed, nextTick, onMounted, watch, ref, type PropType } from "vue";
import path from "path-browserify";
import type { MenuInstance } from "element-plus";
import type { RouteRecordRaw } from "vue-router";
import { SidebarColor } from "@/enums";
import { useSettingsStore, useAppStore, useViewStore, useTableStore } from "@/stores";
import { isExternal } from "@/utils/index";
import LayoutSidebarItem from "./LayoutSidebarItem.vue";
import variables from "@/styles/variables.module.scss";

const props = defineProps({
  data: {
    type: Array as PropType<readonly RouteRecordRaw[]>,
    default: () => [],
  },
  basePath: {
    type: String,
    required: true,
  },
  menuMode: {
    type: String as PropType<"vertical" | "horizontal">,
    default: "vertical",
    validator: (value: string) => ["vertical", "horizontal"].includes(value),
  },
});

const menuRef = ref<MenuInstance>();
const settingsStore = useSettingsStore();
const appStore = useAppStore();
const viewStore = useViewStore();
const currentRoute = useRoute();
const tableStore = useTableStore();

// 根据视图过滤菜单数据
const filteredData = computed(() => {
  const filterRoutes = (routes: any[]) => {
    return routes.map((item) => {
      const newItem = { ...item };

      if (newItem.children) {
        newItem.children = filterRoutes(newItem.children);
      }

      // --- 动态注入数据源子级 ---
      if (newItem.path === "data" || newItem.path === "/data") {
        const dynamicChildren = tableStore.tables.map((t) => ({
          path: `/data/viewer?table=${t.tableName}`,
          name: `Dynamic_${t.tableName}`,
          meta: {
            title: t.originalName,
            icon: "Document",
            view: "data",
            isTable: true,
            tableName: t.tableName,
          },
        }));

        // 测试占位数据
        dynamicChildren.push({
          path: "/data/viewer?table=test_table",
          name: "Dynamic_test_table",
          meta: {
            title: "测试数据表 (占位)",
            icon: "Document",
            view: "data",
            isTable: true,
            tableName: "test_table",
          },
        });

        newItem.children = [
          ...(newItem.children || []).filter((c: any) => c.meta && !c.meta.hidden),
          ...dynamicChildren,
        ];
      }

      // --- 动态注入 AI 对话子项 ---
      if (newItem.path === "ai" || newItem.path === "/ai") {
        const dynamicChats = [
          {
            path: "/ai/chats?id=test_chat",
            name: "Dynamic_AI_Chat",
            meta: {
              title: "测试对话记录 (占位)",
              icon: "ChatLineRound",
              view: "ai",
            },
          },
        ];

        newItem.children = [
          ...(newItem.children || []).filter((c: any) => c.meta && !c.meta.hidden),
          ...dynamicChats,
        ];
      }

      return newItem;
    }).filter((item) => {
      if (item.meta && item.meta.view && item.meta.view !== viewStore.activeView) {
        return false;
      }
      return true;
    });
  };

  const dataCopy = JSON.parse(JSON.stringify(props.data));
  return filterRoutes(dataCopy);
});

const expandedMenuIndexes = ref<string[]>([]);
const theme = computed(() => settingsStore.theme);
const sidebarColorScheme = computed(() => settingsStore.sidebarColorScheme);

const menuThemeProps = computed(() => {
  const isDarkOrClassicBlue =
    theme.value === "dark" || sidebarColorScheme.value === SidebarColor.CLASSIC_BLUE;

  return {
    backgroundColor: isDarkOrClassicBlue ? variables["menu-background"] : undefined,
    textColor: isDarkOrClassicBlue ? variables["menu-text"] : undefined,
    activeTextColor: isDarkOrClassicBlue ? variables["menu-active-text"] : undefined,
  };
});

const activeMenuPath = computed((): string => {
  const { meta, path } = currentRoute;
  if (meta?.activeMenu && typeof meta.activeMenu === "string") {
    return meta.activeMenu;
  }
  return path;
});

function resolveFullPath(routePath: string) {
  if (isExternal(routePath)) return routePath;
  if (isExternal(props.basePath)) return props.basePath;
  if (!props.basePath || props.basePath === "") return routePath;
  return path.resolve(props.basePath, routePath);
}

const onMenuOpen = (index: string) => {
  expandedMenuIndexes.value.push(index);
};

const onMenuClose = (index: string) => {
  expandedMenuIndexes.value = expandedMenuIndexes.value.filter((item) => item !== index);
};

watch(() => expandedMenuIndexes.value, () => {
  updateParentMenuStyles();
});

watch(() => props.menuMode, (newMode) => {
  if (newMode === "horizontal" && menuRef.value) {
    expandedMenuIndexes.value.forEach((item) => menuRef.value!.close(item));
  }
});

watch(() => activeMenuPath.value, () => {
  nextTick(() => {
    updateParentMenuStyles();
  });
}, { immediate: true });

watch(() => currentRoute.path, () => {
  nextTick(() => {
    updateParentMenuStyles();
  });
});

function updateParentMenuStyles() {
  if (!menuRef.value?.$el) return;
  nextTick(() => {
    try {
      const menuEl = menuRef.value?.$el as HTMLElement;
      if (!menuEl) return;
      const allSubMenus = menuEl.querySelectorAll(".el-sub-menu");
      allSubMenus.forEach((subMenu) => {
        subMenu.classList.remove("has-active-child");
      });
      const activeMenuItem = menuEl.querySelector(".el-menu-item.is-active");
      if (activeMenuItem) {
        let parent = activeMenuItem.parentElement;
        while (parent && parent !== menuEl) {
          if (parent.classList.contains("el-sub-menu")) {
            parent.classList.add("has-active-child");
          }
          parent = parent.parentElement;
        }
      } else if (props.menuMode === "horizontal") {
        const currentPath = activeMenuPath.value;
        allSubMenus.forEach((subMenu) => {
          const subMenuEl = subMenu as HTMLElement;
          const subMenuPath = subMenuEl.getAttribute("data-path") || subMenuEl.querySelector(".el-sub-menu__title")?.getAttribute("data-path");
          if (subMenuPath && currentPath.startsWith(subMenuPath)) {
            subMenuEl.classList.add("has-active-child");
          }
        });
      }
    } catch (error) {
      console.error("Error updating parent menu styles:", error);
    }
  });
}

onMounted(() => {
  updateParentMenuStyles();
});
</script>
