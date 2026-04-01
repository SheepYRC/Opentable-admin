<template>
  <div v-if="!collapse" class="sidebar-bottom">
    <div class="monitor-item">
      <div class="label">{{ monitorLabel }}</div>
      <div class="value">
        <el-progress 
          :percentage="percentage" 
          :status="status" 
          :stroke-width="4"
          :show-text="false"
        />
        <span class="text">{{ percentage }}%</span>
      </div>
    </div>
    <div class="monitor-status">
      <div class="dot" :class="activeStatus"></div>
      <span class="status-text">{{ statusText }}</span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useViewStore } from "@/stores";

defineProps({
  collapse: {
    type: Boolean,
    required: true,
  },
});

const viewStore = useViewStore();

const percentage = ref(45);
const activeStatus = ref("online");

// 模拟动态变化
onMounted(() => {
  const timer = setInterval(() => {
    const change = Math.floor(Math.random() * 7) - 3;
    percentage.value = Math.max(10, Math.min(95, percentage.value + change));
  }, 4000);

  (window as any).__sidebar_timer = timer;
});

onUnmounted(() => {
  if ((window as any).__sidebar_timer) {
    clearInterval((window as any).__sidebar_timer);
  }
});

const monitorLabel = computed(() => {
  switch (viewStore.activeView) {
    case "management": return "系统资源";
    case "data": return "存储占用";
    case "ai": return "算力负载";
    default: return "系统状态";
  }
});

const statusText = computed(() => {
  switch (viewStore.activeView) {
    case "management": return "系统运行中";
    case "data": return "数据库在线";
    case "ai": return "AI 引擎就绪";
    default: return "在线";
  }
});

const status = computed(() => {
  if (percentage.value > 80) return "exception";
  if (percentage.value > 60) return "warning";
  return "success";
});
</script>

<style lang="scss" scoped>
.sidebar-bottom {
  padding: 20px 16px;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.02), rgba(0, 0, 0, 0.2));
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(10px);

  .monitor-item {
    margin-bottom: 16px;

    .label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: rgba(255, 255, 255, 0.4);
      margin-bottom: 10px;
      font-weight: 600;
    }

    .value {
      display: flex;
      align-items: center;
      gap: 12px;

      .el-progress {
        flex: 1;
        :deep(.el-progress-bar__outer) {
          background-color: rgba(255, 255, 255, 0.1) !important;
        }
      }

      .text {
        font-size: 13px;
        font-weight: 700;
        color: #fff;
        min-width: 36px;
        font-family: "JetBrains Mono", monospace;
      }
    }
  }

  .monitor-status {
    display: flex;
    align-items: center;
    gap: 10px;

    .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: #67c23a;
      position: relative;

      &::after {
        content: "";
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border-radius: 50%;
        border: 2px solid #67c23a;
        opacity: 0.4;
        animation: pulse 2s infinite;
      }

      &.online {
        background: #67c23a;
        &::after { border-color: #67c23a; }
      }
    }

    .status-text {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.6);
      font-weight: 500;
    }
  }
}

@keyframes pulse {
  0% { transform: scale(1); opacity: 0.4; }
  70% { transform: scale(1.5); opacity: 0; }
  100% { transform: scale(1); opacity: 0; }
}
</style>
