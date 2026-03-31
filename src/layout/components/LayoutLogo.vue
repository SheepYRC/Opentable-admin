<template>
  <div class="logo">
    <div v-if="!collapse" class="logo-buttons">
      <el-button-group>
        <el-button
          :type="activeTab === 'admin' ? 'primary' : ''"
          size="small"
          @click="activeTab = 'admin'"
        >
          管理
        </el-button>
        <el-button
          :type="activeTab === 'data' ? 'primary' : ''"
          size="small"
          @click="activeTab = 'data'"
        >
          数据
        </el-button>
        <el-button
          :type="activeTab === 'ai' ? 'primary' : ''"
          size="small"
          @click="activeTab = 'ai'"
        >
          智能
        </el-button>
      </el-button-group>
    </div>
    <div v-else class="logo-collapsed">
      <el-icon :size="24"><Platform /></el-icon>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Platform } from "@element-plus/icons-vue";

defineProps({
  collapse: {
    type: Boolean,
    required: true,
  },
});

const activeTab = ref("admin");
</script>

<style lang="scss" scoped>
.logo {
  width: 100%;
  height: $navbar-height;
  background-color: $menu-background;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 10px;

  .logo-buttons {
    width: 100%;
    display: flex;
    justify-content: center;

    :deep(.el-button) {
      padding: 5px 8px;
    }
  }

  .logo-collapsed {
    color: #fff;
  }
}
</style>
