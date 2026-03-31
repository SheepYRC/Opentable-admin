<template>
  <div class="viewer-container">
    <!-- 未加载数据时的上传区域 -->
    <div v-if="!hasData" class="upload-area">
      <el-upload
        drag
        action="#"
        :auto-upload="false"
        :on-change="handleFileChange"
        :show-file-list="false"
        accept=".csv,.parquet,.xlsx,.xls"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <template #tip>
          <div class="el-upload__tip">
            支持 CSV / Parquet / Excel (xlsx, xls) <br />
            自动识别编码与结构
          </div>
        </template>
      </el-upload>
    </div>

    <!-- 加载数据后的网格展示区域 -->
    <div v-else class="grid-area">
      <div class="toolbar">
        <div class="left">
          <el-button type="primary" plain @click="resetData"
            >清除数据 / 重新上传</el-button
          >
        </div>
        <div class="right">
          <div class="table-info">
            <el-tag v-if="detectedEncoding" type="warning" effect="plain"
              >识别编码: {{ detectedEncoding.toUpperCase() }}</el-tag
            >
            <el-tag type="info">表名: {{ tableName }}</el-tag>
            <el-tag type="success">行数: {{ rowData.length }}</el-tag>
          </div>
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
import { UploadFilled } from "@element-plus/icons-vue";
import { AgGridVue } from "ag-grid-vue3";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { engine } from "@/core/engine";
import { importer } from "@/core/importer";
import { ElMessage, ElLoading, ElMessageBox } from "element-plus";
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
    text: "正在加载 DuckDB 并分析文件...",
    background: "rgba(255, 255, 255, 0.7)",
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
.viewer-container {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.upload-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  .upload-settings {
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 20px;
    background: var(--el-fill-color-light);
    border-radius: 8px;

    .label {
      font-size: 14px;
      color: var(--el-text-color-primary);
      font-weight: 500;
    }
  }

  :deep(.el-upload-dragger) {
    width: 400px;
    height: 240px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}

.grid-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.toolbar {
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.table-info {
  display: flex;
  gap: 12px;
}

.grid-wrapper {
  flex: 1;
  width: 100%;
  height: 0;
  border: 1px solid var(--el-border-color-light);
  border-radius: 4px;
  overflow: hidden;
}
</style>
