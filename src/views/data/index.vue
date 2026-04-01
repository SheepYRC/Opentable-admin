<template>
  <div class="data-view-container">
    <!-- 未加载数据时的上传区域 -->
    <div v-if="!hasData" class="upload-area">
      <div class="upload-card">
        <el-upload
          drag
          action="#"
          :auto-upload="false"
          :on-change="handleFileChange"
          :show-file-list="false"
          accept=".csv,.parquet,.xlsx,.xls"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            将数据资产拖到此处，或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持 CSV / Parquet / Excel (xlsx, xls) <br />
              智能识别编码与数据结构
            </div>
          </template>
        </el-upload>
      </div>
    </div>

    <!-- 加载数据后的网格展示区域 -->
    <div v-else class="grid-area">
      <div class="data-header">
        <div class="left">
          <h2 class="table-title">{{ tableName }}</h2>
          <div class="stats">
            <el-tag size="small" type="info" effect="plain"
              >Rows: {{ rowData.length.toLocaleString() }}</el-tag
            >
            <el-tag
              v-if="detectedEncoding"
              size="small"
              type="warning"
              effect="plain"
              >Encoding: {{ detectedEncoding.toUpperCase() }}</el-tag
            >
          </div>
        </div>
        <div class="right">
          <el-button-group>
            <el-button type="primary" @click="resetData">
              <el-icon><Refresh /></el-icon>重新上传
            </el-button>
          </el-button-group>
        </div>
      </div>

      <div class="grid-wrapper">
        <ag-grid-vue
          class="ag-theme-quartz"
          style="width: 100%; height: 100%"
          :columnDefs="columnDefs"
          :rowData="rowData"
          :pagination="true"
          :paginationPageSize="100"
          :paginationPageSizeSelector="[10, 50, 100, 500]"
          @grid-ready="onGridReady"
        >
        </ag-grid-vue>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { UploadFilled, Refresh } from "@element-plus/icons-vue";
import { AgGridVue } from "ag-grid-vue3";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { engine } from "@/core/engine";
import { importer } from "@/core/importer";
import { ElMessage, ElLoading } from "element-plus";
import { ref, computed } from "vue";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-quartz.css";

// 注册 AG-Grid 社区版模块
ModuleRegistry.registerModules([AllCommunityModule]);

const hasData = ref(false);
const tableName = ref("");
const rowData = ref<any[]>([]);
const columnDefs = ref<any[]>([]);
const detectedEncoding = ref("");

/**
 * 处理文件上传
 */
const handleFileChange = async (file: any) => {
  if (!file) return;

  const rawFile = file.raw;

  const loading = ElLoading.service({
    lock: true,
    text: "AI 正在分析并解析数据架构...",
    background: "rgba(255, 255, 255, 0.8)",
  });

  try {
    // 1. 尝试导入文件 (自动识别编码)
    const result = await importer.importFile(rawFile);
    tableName.value = result.tableName;
    detectedEncoding.value = result.encoding;

    // 2. 获取元数据和预览数据
    const data = await engine.getTableData(result.tableName);
    const schema = await engine.getTableSchema(result.tableName);

    rowData.value = data;
    columnDefs.value = schema.map((col: any) => ({
      field: col.column_name,
      headerName: col.column_name,
      sortable: true,
      filter: true,
      resizable: true,
      minWidth: 120,
    }));

    hasData.value = true;
    ElMessage.success(`导入成功: ${rawFile.name}`);
  } catch (error: any) {
    console.error("Failed to import file:", error);
    ElMessage.error("导入失败: " + error.message);
  } finally {
    loading.close();
  }
};

/**
 * 重置视图
 */
const resetData = () => {
  hasData.value = false;
  rowData.value = [];
  columnDefs.value = [];
  tableName.value = "";
};

/**
 * 网格就绪回调
 */
const onGridReady = (params: any) => {
  params.api.sizeColumnsToFit();
};
</script>

<style lang="scss" scoped>
.data-view-container {
  padding: 24px;
  height: 100%;
  background-color: var(--el-bg-color-page);
  display: flex;
  flex-direction: column;
}

.upload-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;

  .upload-card {
    background: var(--el-bg-color);
    padding: 40px;
    border-radius: 16px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.05);
    border: 1px solid var(--el-border-color-lighter);
    transition: transform 0.3s ease;

    &:hover {
      transform: translateY(-4px);
    }
  }

  :deep(.el-upload-dragger) {
    width: 480px;
    height: 280px;
    border: 2px dashed var(--el-border-color-light);
    border-radius: 12px;
    background: transparent;
    display: flex;
    flex-direction: column;
    justify-content: center;

    &:hover {
      border-color: var(--el-color-primary);
    }
  }
}

.grid-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--el-bg-color);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  overflow: hidden;
}

.data-header {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .left {
    .table-title {
      margin: 0 0 8px 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .stats {
      display: flex;
      gap: 8px;
    }
  }
}

.grid-wrapper {
  flex: 1;
  width: 100%;
  height: 0;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-light);
}

:deep(.ag-theme-quartz) {
  --ag-background-color: var(--el-bg-color);
  --ag-header-background-color: var(--el-fill-color-light);
  --ag-font-family: inherit;
}
</style>
