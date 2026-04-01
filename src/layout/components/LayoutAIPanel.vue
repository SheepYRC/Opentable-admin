<template>
  <el-drawer
    v-model="drawerVisible"
    size="380"
    :title="t('AI面板')"
    :before-close="handleCloseDrawer"
    class="settings-drawer"
  ></el-drawer>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useAIPanelStore } from "@/stores";
import { ElMessage } from "element-plus";

// Mock t function until i18n is setup
const t = (key: string) => key;

const AIPanelStore = useAIPanelStore();

const drawerVisible = computed({
  get: () => AIPanelStore.AIPanelVisible,
  set: (value) => (AIPanelStore.AIPanelVisible = value),
});

const handleCloseDrawer = () => {
  AIPanelStore.AIPanelVisible = false;
};
</script>

<style lang="scss" scoped></style>
