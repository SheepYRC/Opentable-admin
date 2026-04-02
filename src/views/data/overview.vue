<template>
  <div class="data-overview-container">
    <div class="welcome-header">
      <h1 class="title">数据资产总览</h1>
      <p class="subtitle">管理并洞察您的所有数据资源。</p>
    </div>

    <!-- 核心指标 -->
    <div class="stats-row">
      <el-card v-for="stat in stats" :key="stat.label" shadow="never" class="stat-card">
        <div class="stat-label">{{ stat.label }}</div>
        <div class="stat-value">{{ stat.value }}</div>
        <div class="stat-trend" :class="stat.trendType">
          {{ stat.trend }}
          <el-icon><component :is="stat.trendIcon" /></el-icon>
        </div>
      </el-card>
    </div>

    <!-- 活跃数据源 -->
    <div class="section-container">
      <h3 class="section-title">活跃数据源</h3>
      <el-table :data="recentDataSources" style="width: 100%">
        <el-table-column prop="name" label="数据源名称" />
        <el-table-column prop="type" label="类型" width="100">
          <template #default="scope">
            <el-tag size="small">{{ scope.row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="rows" label="行数" width="120" />
        <el-table-column prop="lastUpdate" label="最后更新" width="180" />
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { CaretTop, CaretBottom } from "@element-plus/icons-vue";

const stats = [
  { label: "数据表总量", value: "24", trend: "+2", trendType: "up", trendIcon: CaretTop },
  { label: "总记录数", value: "1,284,031", trend: "12%", trendType: "up", trendIcon: CaretTop },
  { label: "存储空间占用", value: "4.2 GB", trend: "-5%", trendType: "down", trendIcon: CaretBottom },
  { label: "API 调用量", value: "12.5k", trend: "+1.2k", trendType: "up", trendIcon: CaretTop },
];

const recentDataSources = [
  { name: "2024第一季度销售数据.csv", type: "CSV", rows: "45,000", lastUpdate: "2024-03-25 14:20" },
  { name: "用户画像动态同步表", type: "DB", rows: "1,200,000", lastUpdate: "2024-03-26 09:30" },
  { name: "APP行为日志-昨日.parquet", type: "Parquet", rows: "39,031", lastUpdate: "2024-03-26 10:15" },
];
</script>

<style lang="scss" scoped>
.data-overview-container {
  padding: 30px;
  background: var(--el-bg-color-page);
  height: 100%;
  overflow-y: auto;
}

.welcome-header {
  margin-bottom: 40px;
  .title { font-size: 28px; font-weight: 700; margin-bottom: 8px; }
  .subtitle { font-size: 14px; color: var(--el-text-color-secondary); }
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 40px;

  .stat-card {
    border-radius: 12px;
    padding: 10px;
    background: var(--el-bg-color);

    .stat-label { font-size: 13px; color: var(--el-text-color-secondary); margin-bottom: 12px; }
    .stat-value { font-size: 24px; font-weight: 700; color: var(--el-text-color-primary); margin-bottom: 8px; }
    .stat-trend {
      font-size: 12px;
      display: flex;
      align-items: center;
      gap: 4px;
      &.up { color: var(--el-color-success); }
      &.down { color: var(--el-color-danger); }
    }
  }
}

.section-container {
  background: var(--el-bg-color);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.02);

  .section-title { font-size: 18px; font-weight: 600; margin-bottom: 20px; }
}
</style>
