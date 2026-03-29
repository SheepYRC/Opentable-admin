import { defineStore } from "pinia";
import { useStorage } from "@vueuse/core";
import { defaults } from "@/settings";
import { ThemeMode, LayoutMode, ComponentSize, SidebarColor, LanguageEnum } from "@/enums";

export const useSettingsStore = defineStore("settings", () => {
  // 使用 useStorage 实现状态持久化
  const theme = useStorage<ThemeMode>("theme", defaults.theme);
  const themeColor = useStorage<string>("themeColor", defaults.themeColor);
  const sidebarColorScheme = useStorage<SidebarColor>("sidebarColorScheme", defaults.sidebarColorScheme);
  const layout = useStorage<LayoutMode>("layout", defaults.layout);
  const size = useStorage<ComponentSize>("size", defaults.size);
  const language = useStorage<LanguageEnum>("language", defaults.language);
  
  const showTagsView = useStorage<boolean>("showTagsView", defaults.showTagsView);
  const showAppLogo = useStorage<boolean>("showAppLogo", defaults.showAppLogo);
  const showWatermark = useStorage<boolean>("showWatermark", defaults.showWatermark);
  const showSettings = useStorage<boolean>("showSettings", defaults.showSettings);
  
  const pageSwitchingAnimation = useStorage<string>("pageSwitchingAnimation", defaults.pageSwitchingAnimation);
  const watermarkContent = useStorage<string>("watermarkContent", defaults.watermarkContent);

  // 界面控制
  const settingsVisible = ref(false);

  // 切换主题模式
  function changeTheme(val: ThemeMode) {
    theme.value = val;
  }

  // 修改主题色
  function changeThemeColor(val: string) {
    themeColor.value = val;
  }

  // 修改布局模式
  function changeLayout(val: LayoutMode) {
    layout.value = val;
  }

  // 重置设置
  function resetSettings() {
    theme.value = defaults.theme;
    themeColor.value = defaults.themeColor;
    sidebarColorScheme.value = defaults.sidebarColorScheme;
    layout.value = defaults.layout;
    size.value = defaults.size;
    language.value = defaults.language;
    showTagsView.value = defaults.showTagsView;
    showAppLogo.value = defaults.showAppLogo;
    showWatermark.value = defaults.showWatermark;
    showSettings.value = defaults.showSettings;
    pageSwitchingAnimation.value = defaults.pageSwitchingAnimation;
    watermarkContent.value = defaults.watermarkContent;
  }

  return {
    theme,
    themeColor,
    sidebarColorScheme,
    layout,
    size,
    language,
    showTagsView,
    showAppLogo,
    showWatermark,
    showSettings,
    pageSwitchingAnimation,
    watermarkContent,
    settingsVisible,
    changeTheme,
    changeThemeColor,
    changeLayout,
    resetSettings,
  };
});
