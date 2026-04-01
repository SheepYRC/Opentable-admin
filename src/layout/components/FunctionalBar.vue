<template>
  <div class="functional-bar">
    <div class="modes">
      <div 
        v-for="mode in availableModes" 
        :key="mode.id"
        class="mode-item"
        :class="{ active: currentMode === mode.id }"
        @click="currentMode = mode.id"
      >
        <el-icon><component :is="mode.icon" /></el-icon>
        <span>{{ mode.label }}</span>
      </div>
    </div>
    <div class="actions">
      <slot name="actions"></slot>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from "vue";
import { DataLine, Files, Open, Guide } from "@element-plus/icons-vue";
import { useViewStore } from "@/stores";

const viewStore = useViewStore();
const currentMode = ref("default");

const availableModes = computed(() => {
  switch (viewStore.activeView) {
    case "management":
      return [
        { id: "default", label: "概览", icon: Guide },
        { id: "config", label: "配置", icon: Open },
      ];
    case "data":
      return [
        { id: "default", label: "数据视图", icon: DataLine },
        { id: "files", label: "资源文件", icon: Files },
      ];
    default:
      return [{ id: "default", label: "标准模式", icon: Guide }];
  }
});
</script>

<style lang="scss" scoped>
.functional-bar {
  height: 40px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 24px;

  .modes {
    display: flex;
    gap: 12px;

    .mode-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
      cursor: pointer;
      padding: 4px 12px;
      border-radius: 6px;
      transition: all 0.2s ease;

      &:hover {
        background: var(--el-fill-color-light);
        color: var(--el-text-color-primary);
      }

      &.active {
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
        font-weight: 500;
      }
    }
  }
}
</style>
