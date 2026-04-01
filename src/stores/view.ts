import { defineStore } from "pinia";
import { ref } from "vue";

export const useViewStore = defineStore("view", () => {
  /**
   * 当前激活的顶层视图:
   * management - 系统管理
   * data - 资产管理 (数据视图)
   * ai - 智能任务
   */
  const activeView = ref<"management" | "data" | "ai">("management");

  /**
   * 切换当前视图
   * @param view 目标视图
   */
  function setView(view: "management" | "data" | "ai") {
    activeView.value = view;
  }

  return {
    activeView,
    setView,
  };
});
