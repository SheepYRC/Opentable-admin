<template>
  <div class="hamburger-container" @click="toggleClick">
    <el-icon :size="20" class="icon">
      <Fold v-if="isActive" />
      <Expand v-else />
    </el-icon>
  </div>
</template>

<script setup lang="ts">
import { Expand, Fold } from "@element-plus/icons-vue";

defineProps({
  isActive: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["toggleClick"]);

function toggleClick() {
  emit("toggleClick");
}
</script>

<style scoped lang="scss">
.hamburger-container {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 15px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background: rgba(0, 0, 0, 0.025);
  }

  .icon {
    vertical-align: middle;
  }
}
</style>
