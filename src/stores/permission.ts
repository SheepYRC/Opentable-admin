import { defineStore } from "pinia";
import type { RouteRecordRaw } from "vue-router";
import router from "@/router";
import { useViewStore } from "./view";
import { ref, computed } from "vue";

export const usePermissionStore = defineStore("permission", () => {
  const viewStore = useViewStore();

  // 原始路由列表
  const _routes = ref<readonly RouteRecordRaw[]>([]);

  /**
   * 根据当前激活的 ViewMode 过滤出的路由列表
   */
  const routes = computed(() => {
    const filterByView = (routeList: readonly RouteRecordRaw[]): RouteRecordRaw[] => {
      const res: RouteRecordRaw[] = [];
      routeList.forEach((route) => {
        const tmp = { ...route };
        // 如果路由定义了 viewMeta，且与当前模式不符，则过滤掉
        if (tmp.meta?.view && tmp.meta.view !== viewStore.activeView) {
          return;
        }
        if (tmp.children) {
          tmp.children = filterByView(tmp.children);
        }
        res.push(tmp);
      });
      return res;
    };
    return filterByView(_routes.value);
  });

  // 混合布局下的侧边菜单 (针对 Mix 布局)
  const mixLayoutSideMenus = ref<readonly RouteRecordRaw[]>([]);

  /**
   * 生成路由 (目前先直接读取静态路由)
   */
  function generateRoutes() {
    _routes.value = router.options.routes;
    return routes.value;
  }

  // 初始化时生成一次
  generateRoutes();

  return { routes, mixLayoutSideMenus, generateRoutes };
});
