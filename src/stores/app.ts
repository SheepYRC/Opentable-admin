import { defineStore } from "pinia";

export const useAppStore = defineStore("app", () => {
  // 侧边栏状态
  const sidebar = reactive({
    opened: true, // 是否展开
    withoutAnimation: false, // 是否禁用过渡动画
  });

  // 设备类型 (用于移动端适配)
  const device = ref("desktop");

  function toggleSidebar() {
    sidebar.opened = !sidebar.opened;
  }

  function closeSidebar(withoutAnimation: boolean) {
    sidebar.opened = false;
    sidebar.withoutAnimation = withoutAnimation;
  }

  return { sidebar, device, toggleSidebar, closeSidebar };
});
