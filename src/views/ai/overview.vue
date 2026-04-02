<template>
  <div class="overview-container">
    <div class="welcome-section">
      <h1 class="title">AI 智能助手</h1>
      <p class="subtitle">您的智能数据分析专家，随时准备为您提供洞察与建议。</p>
    </div>

    <div class="features-grid">
      <el-card v-for="item in features" :key="item.title" shadow="hover" class="feature-card">
        <template #header>
          <div class="card-header">
            <el-icon :size="24" :color="item.color"><component :is="item.icon" /></el-icon>
            <span>{{ item.title }}</span>
          </div>
        </template>
        <p class="feature-desc">{{ item.description }}</p>
      </el-card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ChatDotRound, Management, DataAnalysis, MagicStick } from "@element-plus/icons-vue";

const features = [
  {
    title: "智能问答",
    description: "基于自然语言的数据可视化建议与 SQL 生成，让非技术人员也能轻松驾驭数据。",
    icon: ChatDotRound,
    color: "#409EFF",
  },
  {
    title: "数据清洗策略",
    description: "AI 自动识别数据异常，并提供一键式清洗建议，提升数据质量。",
    icon: MagicStick,
    color: "#67C23A",
  },
  {
    title: "多维洞察",
    description: "自动识别数据中的潜在关联与趋势，为您发现不曾察觉的价值点。",
    icon: DataAnalysis,
    color: "#E6A23C",
  },
  {
    title: "报表生成",
    description: "通过简单的语言描述，自动为您构建复杂的分析看板与报告。",
    icon: Management,
    color: "#F56C6C",
  },
];
</script>

<style lang="scss" scoped>
.overview-container {
  padding: 30px;
  height: 100%;
  background: var(--el-bg-color-page);
  overflow-y: auto;
}

.welcome-section {
  max-width: 800px;
  margin-bottom: 40px;

  .title {
    font-size: 32px;
    font-weight: 700;
    color: var(--el-text-color-primary);
    margin-bottom: 12px;
  }

  .subtitle {
    font-size: 16px;
    color: var(--el-text-color-secondary);
  }
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.feature-card {
  .card-header {
    display: flex;
    align-items: center;
    gap: 12px;
    font-weight: 600;
  }

  .feature-desc {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    line-height: 1.6;
  }
}
</style>
