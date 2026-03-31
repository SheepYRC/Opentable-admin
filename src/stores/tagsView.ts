import { defineStore } from "pinia";
import type { RouteLocationNormalized } from "vue-router";
import router from "@/router";

export const useTagsViewStore = defineStore("tagsView", () => {
  const visitedViews = ref<RouteLocationNormalized[]>([]);
  const cachedViews = ref<string[]>([]);

  function isActive(view: RouteLocationNormalized) {
    return view.path === router.currentRoute.value.path;
  }

  function addView(view: any) {
    addVisitedView(view);
    addCachedView(view);
  }

  function addVisitedView(view: any) {
    if (visitedViews.value.some((v) => v.path === view.path)) return;
    visitedViews.value.push(
      Object.assign({}, view, {
        title: view.title || "no-name",
      })
    );
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
    for (const [i, v] of visitedViews.value.entries()) {
      if (v.path === view.path) {
        visitedViews.value.splice(i, 1);
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
      visitedViews.value = visitedViews.value.filter((v) => {
        return v.meta?.affix || v.path === view.path;
      });
      const viewName = view.name as string;
      const index = cachedViews.value.indexOf(viewName);
      if (index > -1) {
        cachedViews.value = cachedViews.value.slice(index, index + 1);
      } else {
        cachedViews.value = [];
      }
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      });
    });
  }

  function delLeftViews(view: any) {
    return new Promise((resolve) => {
      const index = visitedViews.value.findIndex((v) => v.path === view.path);
      if (index === -1) return;
      visitedViews.value = visitedViews.value.filter((v, i) => {
        return v.meta?.affix || i >= index;
      });
      resolve({
        visitedViews: [...visitedViews.value],
      });
    });
  }

  function delRightViews(view: any) {
    return new Promise((resolve) => {
      const index = visitedViews.value.findIndex((v) => v.path === view.path);
      if (index === -1) return;
      visitedViews.value = visitedViews.value.filter((v, i) => {
        return v.meta?.affix || i <= index;
      });
      resolve({
        visitedViews: [...visitedViews.value],
      });
    });
  }

  function delAllViews() {
    return new Promise((resolve) => {
      const affixTags = visitedViews.value.filter((tag) => tag.meta?.affix);
      visitedViews.value = affixTags;
      cachedViews.value = [];
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
        router.push("/");
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
