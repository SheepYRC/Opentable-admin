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
    redirect: "/management/dashboard",
    children: [
      // --- 管理视图 (扁平结构) ---
      {
        path: "management/dashboard",
        component: () => import("@/views/dashboard/index.vue"),
        name: "ManagementDashboard",
        meta: { title: "管理面板", icon: "HomeFilled", view: "management" },
      },
      {
        path: "management/users",
        component: () => import("@/views/management/users.vue"),
        name: "ManagementUsers",
        meta: { title: "用户管理", icon: "User", view: "management" },
      },
      {
        path: "management/settings",
        component: () => import("@/views/management/settings.vue"),
        name: "ManagementSettings",
        meta: { title: "系统设置", icon: "Setting", view: "management" },
      },

      // --- 数据视图 (层级结构) ---
      {
        path: "data",
        name: "Data",
        redirect: "/data/overview",
        meta: { title: "数据总览", icon: "DataAnalysis", view: "data", alwaysShow: true, hasAddButton: true, addButtonRoute: "/data/import" },
        children: [
          {
            path: "overview",
            component: () => import("@/views/data/overview.vue"),
            name: "DataOverview",
            meta: { 
              title: "总览详情", 
              icon: "TrendCharts", 
              view: "data",
              hidden: true // 隐藏，让父级代表总览
            },
          },
          {
            path: "import",
            component: () => import("@/views/data/index.vue"),
            name: "DataImport",
            meta: { title: "导入数据", icon: "UploadFilled", view: "data", hidden: true },
          },
          {
            path: "viewer",
            component: () => import("@/views/data/viewer.vue"),
            name: "DataViewer",
            meta: { title: "数据预览", view: "data", hidden: true },
          },
        ],
      },

      // --- 智能视图 (层级结构) ---
      {
        path: "ai",
        name: "AI",
        redirect: "/ai/overview",
        meta: { title: "智能总览", icon: "MagicStick", view: "ai", alwaysShow: true },
        children: [
          {
            path: "overview",
            component: () => import("@/views/ai/overview.vue"),
            name: "AIOverview",
            meta: { title: "对话总览", icon: "Monitor", view: "ai", hidden: true },
          },
          {
            path: "chats",
            component: () => import("@/views/ai/chat.vue"),
            name: "AIChats",
            meta: { title: "对话记录", icon: "ChatDotRound", view: "ai", hidden: true }, // 隐藏旧的固定菜单
          },
        ],
      },
    ],
  },
  // 捕获所有 404
  {
    path: "/:pathMatch(.*)*",
    redirect: "/management/dashboard",
    meta: { hidden: true },
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: constantRoutes,
  scrollBehavior: () => ({ left: 0, top: 0 }),
});

export default router;
