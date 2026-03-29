import { defineStore } from "pinia";
import type { RouteRecordRaw } from "vue-router";
import router from "@/router";

export const usePermissionStore = defineStore("permission", () => {
  // 路由列表 (静态 + 动态)
  const routes = ref<readonly RouteRecordRaw[]>([]);

  // 混合布局下的侧边菜单 (针对 Mix 布局，用户现在不需要，但保留接口)
  const mixLayoutSideMenus = ref<readonly RouteRecordRaw[]>([]);

  /**
   * 生成路由 (目前先直接读取静态路由)
   */
  function generateRoutes() {
    // 过滤出 layout 下的子路由，或者直接返回所有路由
    // 为了让侧边栏能显示，我们先返回 router 的配置
    routes.value = router.options.routes;
    return routes.value;
  }

  // 初始化时生成一次
  generateRoutes();

  return { routes, mixLayoutSideMenus, generateRoutes };
});
