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
    sidebar.withoutAnimation = false;
  }

  function closeSideBar() {
    sidebar.opened = false;
    sidebar.withoutAnimation = false;
  }

  function openSideBar() {
    sidebar.opened = true;
    sidebar.withoutAnimation = false;
  }

  function toggleDevice(val: string) {
    device.value = val;
  }

  /** 当前激活的顶部菜单路径 (用于混合布局) */
  const activeTopMenuPath = ref("");

  return {
    sidebar,
    device,
    activeTopMenuPath,
    toggleSidebar,
    closeSideBar,
    openSideBar,
    toggleDevice,
  };
});
