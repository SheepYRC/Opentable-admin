import { defineStore } from "pinia";
import type { RouteLocationNormalized } from "vue-router";
import router from "@/router";
import { useViewStore } from "./view";
import { ref, watch, computed } from "vue";

type ViewMode = "management" | "data" | "ai";

export const useTagsViewStore = defineStore("tagsView", () => {
  const viewStore = useViewStore();

  // 从 localStorage 加载持久化的视图 (分视图模式存储)
  const savedViews = localStorage.getItem("visitedViewsMap");
  const initialViewsMap: Record<ViewMode, RouteLocationNormalized[]> = savedViews
    ? JSON.parse(savedViews)
    : {
        management: [],
        data: [],
        ai: [],
      };

  const visitedViewsMap = ref<Record<ViewMode, RouteLocationNormalized[]>>(initialViewsMap);
  const cachedViewsMap = ref<Record<ViewMode, string[]>>({
    management: [],
    data: [],
    ai: [],
  });

  // 暴露给外部的“当前”视图 (通过计算属性，始终对应当前激活的顶层视图)
  const visitedViews = computed(() => {
    const mode = viewStore.activeView as ViewMode;
    return visitedViewsMap.value[mode] || [];
  });

  const cachedViews = computed(() => {
    const mode = viewStore.activeView as ViewMode;
    return cachedViewsMap.value[mode] || [];
  });

  // 监听变化并同步到 localStorage
  watch(
    visitedViewsMap,
    (val) => {
      const persistMap: Record<string, any[]> = {};
      for (const key in val) {
        const mode = key as ViewMode;
        persistMap[mode] = val[mode].map((v: any) => ({
          path: v.path,
          fullPath: v.fullPath,
          name: v.name,
          meta: v.meta,
          title: v.title,
          query: v.query,
          params: v.params,
        }));
      }
      localStorage.setItem("visitedViewsMap", JSON.stringify(persistMap));
    },
    { deep: true }
  );

  function isActive(view: RouteLocationNormalized) {
    return view.path === router.currentRoute.value.path;
  }

  function addView(view: any) {
    addVisitedView(view);
    addCachedView(view);
  }

  function addVisitedView(view: any) {
    // 检查是否已经在当前视图池里
    if (visitedViews.value.some((v) => v.path === view.path)) return;

    const newView = {
      ...view,
      title: (view.meta?.title as string) || (view.name as string) || "no-name",
    };

    // 如果是固定标签，且列表不为空，则尝试放到合适的位置（固定标签在前）
    if (newView.meta?.affix) {
      visitedViews.value.unshift(newView as any);
    } else {
      visitedViews.value.push(newView as any);
    }
  }

  function addCachedView(view: any) {
    const viewName = view.name as string;
    if (cachedViews.value.includes(viewName)) return;
    if (!view.noCache && viewName) {
      cachedViews.value.push(viewName);
    }
  }

  function delView(view: any) {
    return new Promise((resolve) => {
      delVisitedView(view);
      delCachedView(view);
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      });
    });
  }

  function delVisitedView(view: any) {
    const views = visitedViews.value;
    for (const [i, v] of views.entries()) {
      if (v.path === view.path) {
        views.splice(i, 1);
        break;
      }
    }
  }

  function delCachedView(view: any) {
    const viewName = view.name as string;
    const index = cachedViews.value.indexOf(viewName);
    if (index > -1) {
      cachedViews.value.splice(index, 1);
    }
  }

  function delOtherViews(view: any) {
    return new Promise((resolve) => {
      const mode = viewStore.activeView as ViewMode;
      const currentViews = visitedViewsMap.value[mode] || [];
      visitedViewsMap.value[mode] = currentViews.filter((v) => {
        return v.meta?.affix || v.path === view.path;
      });
      
      const currentCaches = cachedViewsMap.value[mode] || [];
      const viewName = view.name as string;
      const index = currentCaches.indexOf(viewName);
      if (index > -1) {
        cachedViewsMap.value[mode] = currentCaches.slice(index, index + 1);
      } else {
        cachedViewsMap.value[mode] = [];
      }
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      });
    });
  }

  function delLeftViews(view: any) {
    return new Promise((resolve) => {
      const mode = viewStore.activeView as ViewMode;
      const views = visitedViewsMap.value[mode] || [];
      const index = views.findIndex((v) => v.path === view.path);
      if (index === -1) return;
      visitedViewsMap.value[mode] = views.filter((v, i) => {
        return v.meta?.affix || i >= index;
      });
      resolve({
        visitedViews: [...visitedViews.value],
      });
    });
  }

  function delRightViews(view: any) {
    return new Promise((resolve) => {
      const mode = viewStore.activeView as ViewMode;
      const views = visitedViewsMap.value[mode] || [];
      const index = views.findIndex((v) => v.path === view.path);
      if (index === -1) return;
      visitedViewsMap.value[mode] = views.filter((v, i) => {
        return v.meta?.affix || i <= index;
      });
      resolve({
        visitedViews: [...visitedViews.value],
      });
    });
  }

  function delAllViews() {
    return new Promise((resolve) => {
      const mode = viewStore.activeView as ViewMode;
      const currentViews = visitedViewsMap.value[mode] || [];
      const affixTags = currentViews.filter((tag) => tag.meta?.affix);
      visitedViewsMap.value[mode] = affixTags;
      cachedViewsMap.value[mode] = [];
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      });
    });
  }

  function toLastView(visitedViews: any[], view?: any) {
    const latest = visitedViews.slice(-1)[0];
    if (latest && latest.fullPath) {
      router.push(latest.fullPath);
    } else {
      if (view && view.name === "Dashboard") {
        router.replace({ path: "/redirect" + view.fullPath });
      } else {
        // 如果没有标签了，跳转到当前模式的首页
        const mode = viewStore.activeView;
        if (mode === "data") router.push("/data-view");
        else if (mode === "ai") router.push("/ai-chat");
        else router.push("/");
      }
    }
  }

  function updateVisitedView(view: any) {
    for (let v of visitedViews.value) {
      if (v.path === view.path) {
        v = Object.assign(v, view);
        break;
      }
    }
  }

  return {
    visitedViews,
    cachedViews,
    visitedViewsMap,
    cachedViewsMap,
    isActive,
    addView,
    addVisitedView,
    addCachedView,
    delView,
    delVisitedView,
    delCachedView,
    delOtherViews,
    delLeftViews,
    delRightViews,
    delAllViews,
    toLastView,
    updateVisitedView,
  };
});
