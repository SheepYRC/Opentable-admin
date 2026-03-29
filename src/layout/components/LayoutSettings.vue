<template>
  <el-drawer
    v-model="drawerVisible"
    size="380"
    :title="t('项目配置')"
    :before-close="handleCloseDrawer"
    class="settings-drawer"
  >
    <div class="settings-content">
      <section class="config-section">
        <el-divider>{{ t("主题模式") }}</el-divider>

        <div class="flex-center">
          <el-switch
            v-model="isDark"
            active-icon="Moon"
            inactive-icon="Sunny"
            class="theme-switch"
            @change="handleThemeChange"
          />
        </div>
      </section>

      <!-- 界面设置 -->
      <section class="config-section">
        <el-divider>{{ t("界面设置") }}</el-divider>

        <div class="config-item flex-x-between">
          <span class="text-xs">{{ t("主题颜色") }}</span>
          <el-color-picker
            v-model="selectedThemeColor"
            :predefine="colorPresets"
            popper-class="theme-picker-dropdown"
          />
        </div>

        <div class="config-item flex-x-between">
          <span class="text-xs">{{ t("显示标签页") }}</span>
          <el-switch v-model="settingsStore.showTagsView" />
        </div>

        <div class="config-item flex-x-between">
          <span class="text-xs">{{ t("显示 Logo") }}</span>
          <el-switch v-model="settingsStore.showAppLogo" />
        </div>

        <div class="config-item flex-x-between">
          <span class="text-xs">{{ t("页面切换动画") }}</span>
          <el-select v-model="settingsStore.pageSwitchingAnimation" style="width: 150px">
            <el-option
              v-for="(item, key) in pageSwitchingAnimationOptions"
              :key
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>
      </section>

      <!-- 布局设置 -->
      <section class="config-section">
        <el-divider>{{ t("布局设置") }}</el-divider>

        <div class="layout-select">
          <div class="layout-grid">
            <el-tooltip
              v-for="item in layoutOptions"
              :key="item.value"
              :content="item.label"
              placement="bottom"
            >
              <div
                role="button"
                tabindex="0"
                :class="[
                  'layout-item',
                  item.className,
                  {
                    'is-active': settingsStore.layout === item.value,
                  },
                ]"
                @click="handleLayoutChange(item.value)"
              >
                <div class="layout-preview">
                  <div v-if="item.value !== LayoutMode.LEFT" class="layout-header"></div>
                  <div v-if="item.value !== LayoutMode.TOP" class="layout-sidebar"></div>
                  <div class="layout-main"></div>
                </div>
                <div class="layout-name">{{ item.label }}</div>
                <div v-if="settingsStore.layout === item.value" class="layout-check">
                  <el-icon><Check /></el-icon>
                </div>
              </div>
            </el-tooltip>
          </div>
        </div>
      </section>
    </div>

    <!-- 操作按钮区域 -->
    <template #footer>
      <div class="action-buttons">
        <el-button
          type="primary"
          size="default"
          :icon="copyIcon"
          :loading="copyLoading"
          @click="handleCopySettings"
        >
          {{ copyLoading ? "复制中..." : t("复制配置") }}
        </el-button>
        <el-button
          type="warning"
          size="default"
          :icon="resetIcon"
          :loading="resetLoading"
          @click="handleResetSettings"
        >
          {{ resetLoading ? "重置中..." : t("恢复默认") }}
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { DocumentCopy, RefreshLeft, Check } from "@element-plus/icons-vue";
import { LayoutMode, PageSwitchingAnimationOptions, SidebarColor, ThemeMode, type OptionItem } from "@/enums";
import { useSettingsStore } from "@/stores";
import { ElMessage } from "element-plus";

// Mock t function until i18n is setup
const t = (key: string) => key;

// 页面切换动画选项
const pageSwitchingAnimationOptions = PageSwitchingAnimationOptions;

// 按钮图标
const copyIcon = markRaw(DocumentCopy);
const resetIcon = markRaw(RefreshLeft);

// 加载状态
const copyLoading = ref(false);
const resetLoading = ref(false);

// 布局选项配置
const layoutOptions = [
  { value: LayoutMode.LEFT, label: "左侧菜单模式", className: "left" },
  { value: LayoutMode.TOP, label: "顶部菜单模式", className: "top" },
  { value: LayoutMode.MIX, label: "混合菜单模式", className: "mix" },
];

const colorPresets = [
  "#409EFF",
  "#009688",
  "#11a983",
  "#13c2c2",
  "#6954f0",
  "#f5222d",
];

const settingsStore = useSettingsStore();

const isDark = ref<boolean>(settingsStore.theme === ThemeMode.DARK);

const selectedThemeColor = computed({
  get: () => settingsStore.themeColor,
  set: (value) => {
    settingsStore.themeColor = value;
  },
});

const drawerVisible = computed({
  get: () => settingsStore.settingsVisible,
  set: (value) => (settingsStore.settingsVisible = value),
});

const handleThemeChange = (val: any) => {
  settingsStore.theme = val ? ThemeMode.DARK : ThemeMode.LIGHT;
};

const handleLayoutChange = (layout: LayoutMode) => {
  settingsStore.layout = layout;
};

const handleCopySettings = async () => {
  copyLoading.value = true;
  try {
    const config = JSON.stringify(settingsStore.$state, null, 2);
    await navigator.clipboard.writeText(config);
    ElMessage.success("配置已复制到剪贴板");
  } catch {
    ElMessage.error("复制失败");
  } finally {
    copyLoading.value = false;
  }
};

const handleResetSettings = () => {
  resetLoading.value = true;
  setTimeout(() => {
    settingsStore.resetSettings();
    isDark.value = settingsStore.theme === ThemeMode.DARK;
    resetLoading.value = false;
    ElMessage.success("已恢复默认配置");
  }, 500);
};

const handleCloseDrawer = () => {
  settingsStore.settingsVisible = false;
};
</script>

<style lang="scss" scoped>
.settings-drawer {
  :deep(.el-drawer__body) {
    padding: 0;
  }
}

.settings-content {
  padding: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
  padding: 10px 20px;

  .el-button {
    flex: 1;
  }
}

.config-section {
  margin-bottom: 24px;

  .config-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid var(--el-border-color-light);

    &:last-child {
      border-bottom: none;
    }
  }
}

.layout-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.layout-item {
  border: 2px solid var(--el-border-color);
  border-radius: 8px;
  padding: 8px;
  cursor: pointer;
  position: relative;
  text-align: center;

  &.is-active {
    border-color: var(--el-color-primary);
  }

  .layout-preview {
    height: 40px;
    background: var(--el-fill-color-light);
    margin-bottom: 8px;
    position: relative;
    border-radius: 4px;

    .layout-header {
      height: 8px;
      background: var(--el-color-primary-light-3);
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
    }

    .layout-sidebar {
      width: 12px;
      background: var(--el-color-primary);
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
    }

    .layout-main {
      background: var(--el-fill-color);
      position: absolute;
      top: 10px;
      left: 14px;
      right: 2px;
      bottom: 2px;
    }
  }

  &.top .layout-sidebar { display: none; }
  &.left .layout-header { display: none; }
  &.left .layout-main { top: 2px; }

  .layout-name {
    font-size: 10px;
  }

  .layout-check {
    position: absolute;
    top: -8px;
    right: -8px;
    background: var(--el-color-success);
    color: white;
    border-radius: 50%;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
  }
}
</style>
