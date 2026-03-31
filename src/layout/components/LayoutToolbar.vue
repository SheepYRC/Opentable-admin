<template>
  <div class="navbar-actions">
    <!-- 全屏 -->
    <div class="navbar-actions__item" @click="toggleFullscreen">
      <el-icon :size="18"><FullScreen /></el-icon>
    </div>

    <!-- 用户菜单 -->
    <div class="navbar-actions__item">
      <el-dropdown trigger="click">
        <div class="user-profile">
          <el-avatar :size="24" :src="userStore.avatar || defaultAvatar" />
          <span class="user-profile__name">{{ userStore.nickname || "管理员" }}</span>
        </div>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleProfileClick">个人中心</el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- 全局AI面板 -->
    <div class="navbar-actions__item" @click="handleAIClick">
      <el-icon :size="18"><Reading /></el-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FullScreen, Reading } from "@element-plus/icons-vue";
import { useSettingsStore, useUserStore, useAIPanelStore } from "@/stores";
import { useFullscreen } from "@vueuse/core";
import { ElMessageBox } from "element-plus";
import logo from "@/assets/logo.svg";

const userStore = useUserStore();
const settingsStore = useSettingsStore();
const router = useRouter();
const { toggle: toggleFullscreen } = useFullscreen();

const defaultAvatar = logo;

function handleProfileClick() {
  router.push("/profile");
}

function handleLogout() {
  ElMessageBox.confirm("确定注销并退出系统吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    userStore.logout();
  });
}

const AIPanelStore = useAIPanelStore();

function handleAIClick() {
  AIPanelStore.AIPanelVisible = true;
}
</script>

<style lang="scss" scoped>
.navbar-actions {
  display: flex;
  align-items: center;
  height: 100%;

  &__item {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0 10px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: var(--el-fill-color-light);
    }
  }

  .user-profile {
    display: flex;
    align-items: center;
    gap: 8px;

    &__name {
      font-size: 14px;
      color: var(--el-text-color-regular);
    }
  }
}
</style>
