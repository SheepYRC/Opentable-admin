<template>
  <div class="chat-container">
    <div class="chat-header">
      <h2>对话记录</h2>
      <el-button type="primary" plain size="small" :icon="Plus">开启新对话</el-button>
    </div>

    <el-empty description="暂无对话记录，点击上方按钮开启您的第一次 AI 探索吧" :image-size="200" />
  </div>
</template>

<script setup lang="ts">
import { Plus } from "@element-plus/icons-vue";
</script>

<style lang="scss" scoped>
.chat-container {
  padding: 30px;
  height: 100%;
  display: flex;
  flex-direction: column;

  .chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 40px;

    h2 {
      margin: 0;
      font-size: 24px;
      font-weight: 600;
    }
  }

  :deep(.el-empty) {
    flex: 1;
  }
}
</style>
