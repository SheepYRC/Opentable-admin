<template>
  <div class="dashboard-container">
    <el-card shadow="never" class="welcome-card">
      <div class="flex-y-center">
        <el-avatar :size="64" :src="userStore.avatar || defaultAvatar" />
		  <div class="ml-2 text-xl font-bold">管理员</div>
      </div>
    </el-card>

  </div>
</template>

<script setup lang="ts">
import { useUserStore } from "@/stores";
import logo from "@/assets/logo.svg";

const userStore = useUserStore();
const defaultAvatar = logo;
</script>

<style lang="scss" scoped>
.dashboard-container {
  padding: 20px;
	height:100%;
}

.welcome-card {
  border: none;
	height: 100%;
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
