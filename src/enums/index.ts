/**
 * 布局模式
 */
export enum LayoutMode {
  LEFT = "left",
  TOP = "top",
  MIX = "mix",
}

/**
 * 组件大小
 */
export enum ComponentSize {
  DEFAULT = "default",
  LARGE = "large",
  SMALL = "small",
}

/**
 * 侧边栏颜色方案
 */
export enum SidebarColor {
  CLASSIC_BLUE = "classic-blue",
  MINIMAL_WHITE = "minimal-white",
}

/**
 * 主题模式
 */
export enum ThemeMode {
  LIGHT = "light",
  DARK = "dark",
  AUTO = "auto",
}

/**
 * 语言枚举
 */
export enum LanguageEnum {
  ZH_CN = "zh-cn",
  EN = "en",
}

/**
 * 设备类型
 */
export enum DeviceEnum {
  DESKTOP = "desktop",
  MOBILE = "mobile",
}

/**
 * 界面设置相关类型
 */
export interface OptionItem {
  label: string;
  value: string;
}

/**
 * 页面切换动画选项
 */
export const PageSwitchingAnimationOptions: Record<string, OptionItem> = {
  FADE: { label: "渐变", value: "fade" },
  FADE_SLIDE: { label: "滑动", value: "fade-slide" },
  FADE_SCALE: { label: "缩放", value: "fade-scale" },
  NONE: { label: "无", value: "none" },
};
