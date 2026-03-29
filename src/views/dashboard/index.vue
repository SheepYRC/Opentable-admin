<template>
  <div class="dashboard-container">
    <el-card shadow="never" class="welcome-card">
      <div class="flex-y-center">
        <el-avatar :size="64" :src="userStore.avatar || defaultAvatar" />
        <div class="ml-4">
          <h2 class="text-xl font-bold">早安, {{ userStore.nickname || '管理员' }}!</h2>
          <p class="text-gray-500 mt-1">今天又是充满活力的一天，准备好开始工作了吗？</p>
        </div>
      </div>
    </el-card>

    <el-row :gutter="20" class="mt-4">
      <el-col :span="6" v-for="i in 4" :key="i">
        <el-card shadow="hover">
          <template #header>数据指标 {{ i }}</template>
          <div class="text-2xl font-bold text-primary">{{ i * 1234 }}</div>
          <p class="text-xs text-green-500 mt-2">+ {{ i * 2 }}% 较昨日增长</p>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores";

const userStore = useUserStore();
const defaultAvatar = "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png";
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
}

.welcome-card {
  border: none;
  background: linear-gradient(to right, #fdfbfb 0%, #ebedee 100%);
}

.ml-4 {
  margin-left: 20px;
}

.mt-4 {
  margin-top: 20px;
}

.mt-1 {
  margin-top: 4px;
}

.mt-2 {
  margin-top: 8px;
}

.text-xl {
  font-size: 20px;
}

.text-2xl {
  font-size: 28px;
}

.text-xs {
  font-size: 12px;
}

.font-bold {
  font-weight: bold;
}

.text-primary {
  color: var(--el-color-primary);
}

.text-gray-500 {
  color: #909399;
}

.text-green-500 {
  color: #67c23a;
}
</style>
