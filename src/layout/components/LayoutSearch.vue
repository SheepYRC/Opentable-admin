<template>
  <div class="search-container">
    <div class="search-box">
      <el-icon><Search /></el-icon>
      <input type="text" placeholder="探索功能、数据集或 AI 任务..." />
      <span class="shortcut">⌘K</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Search } from "@element-plus/icons-vue";
</script>

<style lang="scss" scoped>
.search-container {
  flex: 1;
  max-width: 480px;
  margin: 0 40px;
  display: flex;
  justify-content: center;

  .search-box {
    width: 100%;
    height: 36px;
    background: var(--el-fill-color-light);
    border-radius: 8px;
    display: flex;
    align-items: center;
    padding: 0 12px;
    gap: 8px;
    border: 1px solid var(--el-border-color-light);
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--el-border-color);
      background: var(--el-fill-color);
    }

    .el-icon {
      font-size: 16px;
      color: var(--el-text-color-placeholder);
    }

    input {
      border: none;
      background: transparent;
      outline: none;
      flex: 1;
      font-size: 13px;
      color: var(--el-text-color-primary);

      &::placeholder {
        color: var(--el-text-color-placeholder);
      }
    }

    .shortcut {
      font-size: 11px;
      color: var(--el-text-color-placeholder);
      background: var(--el-bg-color);
      padding: 1px 6px;
      border-radius: 4px;
      border: 1px solid var(--el-border-color-light);
      font-family: monospace;
    }
  }
}
</style>
