import { defineStore } from "pinia";
import type { RouteRecordRaw } from "vue-router";
import router from "@/router";
import { useViewStore } from "./view";
import { useTableStore } from "./table";
import { ref, computed } from "vue";

export const usePermissionStore = defineStore("permission", () => {
  const viewStore = useViewStore();

  // 原始路由列表
  const _routes = ref<readonly RouteRecordRaw[]>([]);

  /**
   * 根据当前激活的 ViewMode 过滤出的路由列表
   */
  const routes = computed(() => {
    const tableStore = useTableStore();
    
    const filterByView = (routeList: readonly RouteRecordRaw[]): RouteRecordRaw[] => {
      const res: RouteRecordRaw[] = [];
      routeList.forEach((route) => {
        const tmp = { ...route };
        // 如果路由定义了 view，且与当前模式不符，则过滤掉
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

    const filtered = filterByView(_routes.value);

    // 1. 动态注入导入的表到 DataView 菜单下
    if (viewStore.activeView === "data") {
      const dataViewItem = filtered
        .flatMap(r => [r, ...(r.children || [])])
        .find(r => r.name === "DataView");

      if (dataViewItem) {
        if (tableStore.tables.length > 0) {
          if (!dataViewItem.meta) dataViewItem.meta = {};
          dataViewItem.meta.alwaysShow = true;
          
          dataViewItem.children = [
            ...(dataViewItem.children || []),
            ...tableStore.tables.map(t => ({
              path: `/data-viewer?table=${t.tableName}`,
              name: `Table_${t.tableName}`,
              component: () => import("@/views/data/viewer.vue"),
              meta: { 
                title: t.originalName, 
                icon: "Memo", 
                view: "data", 
                isTable: true,
                tableName: t.tableName // 将表名显式存入 meta，方便删除
              }
            }))
          ];
        } else {
          if (dataViewItem.meta) dataViewItem.meta.alwaysShow = false;
        }
      }
    }

    // 2. 拍平根节点：如果根节点（如 "/"）没有标题且有子节点，则直接展示子节点
    const flattened: RouteRecordRaw[] = [];
    filtered.forEach(route => {
      if (!route.meta?.title && route.children && route.children.length > 0) {
        const absoluteChildren = route.children.map(child => {
          let fullPath = child.path;
          if (!fullPath.startsWith("/")) {
            const prefix = route.path.endsWith("/") ? route.path : route.path + "/";
            fullPath = prefix + fullPath;
          }
          return {
            ...child,
            path: fullPath
          };
        });
        flattened.push(...(absoluteChildren as RouteRecordRaw[]));
      } else {
        flattened.push(route);
      }
    });

    return flattened;
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
