import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import Layout from "@/layout/index.vue";

// 静态路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: "/redirect",
    component: Layout,
    meta: { hidden: true },
    children: [
      {
        path: "/redirect/:path(.*)",
        component: () => import("@/views/redirect/index.vue"),
      },
    ],
  },
  {
    path: "/login",
    component: () => import("@/views/login/index.vue"),
    meta: { hidden: true },
  },
  {
    path: "/",
    component: Layout,
    redirect: "/dashboard",
    children: [
      {
        path: "dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        name: "Dashboard",
        meta: { title: "管理面板", icon: "HomeFilled", affix: true, view: "management" },
      },
      {
        path: "data-view",
        component: () => import("@/views/data/index.vue"),
        name: "DataView",
        meta: { title: "资产管理", icon: "DataAnalysis", view: "data" },
      },
      {
        path: "data-viewer",
        redirect: "data-view",
        meta: { hidden: true },
      },
      {
        path: "ai-chat",
        component: () => import("@/views/dashboard/index.vue"), // 临时占位
        name: "AIChat",
        meta: { title: "智能助手", icon: "ChatDotRound", view: "ai" },
      },
    ],
  },
  // 捕获所有 404
  {
    path: "/:pathMatch(.*)*",
    redirect: "/dashboard",
    meta: { hidden: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

export default router;
