<template>
  <div class="data-view-container">
    <div class="import-layout">
      <!-- 区块 A: 动态文件槽位 [1,1] -->
      <div class="grid-block block-file-slot">
        <div v-if="uploadStatus === 'idle'" class="dropzone-container">
          <el-upload
            drag
            action="#"
            :auto-upload="false"
            :on-change="handleFileChange"
            :show-file-list="false"
            accept=".csv,.parquet,.xlsx,.xls"
          >
            <div class="dropzone-content">
              <el-icon class="el-icon--upload"><upload-filled /></el-icon>
              <div class="upload-text-group">
                <div class="main-text">拖拽或<em>点击上传</em></div>
                <div class="sub-text">支持 CSV / Parquet / Excel (xlsx, xls)</div>
                <div class="sub-text">智能识别编码与数据结构</div>
              </div>
            </div>
          </el-upload>
        </div>

        <div v-else-if="uploadStatus === 'uploading'" class="uploading-container">
          <el-icon class="loading-icon" :size="48"><Document /></el-icon>
          <div class="upload-info">
            <span>正在解析文件...</span>
            <el-progress :percentage="uploadProgress" :stroke-width="4" />
          </div>
        </div>

        <div v-else-if="uploadStatus === 'ready'" class="file-card">
          <div class="file-header">
            <el-icon :size="32" color="var(--el-color-primary)"><Document /></el-icon>
            <div class="file-meta">
              <div class="file-name" :title="fileInfo.name">{{ fileInfo.name }}</div>
              <div class="file-details">
                <el-tag size="small" type="info">{{ fileInfo.size }}</el-tag>
                <el-tag size="small" type="warning">{{ fileInfo.encoding }}</el-tag>
              </div>
            </div>
            <div class="file-actions">
              <el-button type="primary" size="small" @click="handleImport">导入</el-button>
              <el-button link type="danger" size="small" @click="resetUpload">关闭</el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 区块 B: 预处理配置区 [1, 2-3] -->
      <div class="grid-block block-config">
        <div class="section-title">预处理配置</div>
        <el-form :model="importConfigs" label-position="left" label-width="100px" size="default">
          <div class="config-grid">
            <el-form-item label="跳过行数">
              <el-input-number v-model="importConfigs.skipRows" :min="0" @change="refreshPreview" />
            </el-form-item>
            <el-form-item label="跳过列数">
              <el-input-number v-model="importConfigs.skipCols" :min="0" @change="refreshPreview" />
            </el-form-item>
            <el-form-item label="首行序号列">
              <el-switch v-model="importConfigs.firstRowSeq" @change="refreshPreview" />
            </el-form-item>
            <el-form-item label="首行标题行">
              <el-switch v-model="importConfigs.firstRowTitle" @change="refreshPreview" />
            </el-form-item>
          </div>
        </el-form>
      </div>

      <!-- 区块 C: 数据实时预览大屏 [2-3, 1-3] -->
      <div class="grid-block block-preview" v-loading="isPreviewLoading">
        <div class="preview-header">
          <div class="section-title">数据实时预览 (前10行)</div>
          <el-tag v-if="hasData" type="success" effect="plain" size="small">
            检测到 {{ rowData.length }} 行
          </el-tag>
        </div>
        <div class="grid-wrapper">
          <ag-grid-vue
            v-if="hasData"
            class="ag-theme-quartz"
            style="width: 100%; height: 100%"
            :columnDefs="columnDefs"
            :rowData="previewData"
            :gridOptions="gridOptions"
            @grid-ready="onGridReady"
          >
          </ag-grid-vue>
          <div v-else class="empty-preview">
            <el-empty description="暂无数据预览，请先上传文件" :image-size="100" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from "vue";
import { UploadFilled, Refresh, Document } from "@element-plus/icons-vue";
import { AgGridVue } from "ag-grid-vue3";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { engine } from "@/core/engine";
import { importer } from "@/core/importer";
import { ElMessage } from "element-plus";
import { useTableStore } from "@/stores";
import { useDebounceFn } from "@vueuse/core";

// 注册 AG-Grid 模块
ModuleRegistry.registerModules([AllCommunityModule]);

const tableStore = useTableStore();

// --- 状态定义 ---
const uploadStatus = ref<"idle" | "uploading" | "ready">("idle");
const uploadProgress = ref(0);
const isPreviewLoading = ref(false);
const hasData = ref(false);

const fileInfo = reactive({
  name: "",
  size: "",
  encoding: "",
  raw: null as File | null,
});

const importConfigs = reactive({
  skipRows: 0,
  skipCols: 0,
  firstRowSeq: false,
  firstRowTitle: false,
});

const rowData = ref<any[]>([]);
const columnDefs = ref<any[]>([]);
const tableName = ref("");

const previewData = computed(() => rowData.value.slice(0, 10));

const gridOptions = {
  headerHeight: 40,
  rowHeight: 36,
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
  },
};

// --- 方法 ---

const formatSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const handleFileChange = async (file: any) => {
  if (!file) return;
  fileInfo.raw = file.raw;
  fileInfo.name = file.name;
  fileInfo.size = formatSize(file.raw.size);
  
  await processFile(true);
};

const processFile = async (isInitial = false) => {
  if (!fileInfo.raw) return;

  if (isInitial) {
    uploadStatus.value = "uploading";
    uploadProgress.value = 30;
  } else {
    isPreviewLoading.value = true;
  }

  try {
    const result = await importer.importFile(fileInfo.raw, {
      tableName: tableName.value || undefined,
      skipRows: importConfigs.skipRows,
      skipCols: importConfigs.skipCols,
      hasHeader: importConfigs.firstRowTitle,
    });

    uploadProgress.value = 80;
    tableName.value = result.tableName;
    fileInfo.encoding = result.encoding.toUpperCase();

    // 加载数据
    const data = await engine.getTableData(result.tableName);
    const schema = await engine.getTableSchema(result.tableName);

    rowData.value = data;
    columnDefs.value = schema.map((col: any) => ({
      field: col.column_name,
      headerName: col.column_name,
    }));

    hasData.value = true;
    uploadStatus.value = "ready";
    uploadProgress.value = 100;
  } catch (error: any) {
    console.error("Import failed:", error);
    ElMessage.error("文件导入失败: " + error.message);
    if (isInitial) uploadStatus.value = "idle";
  } finally {
    isPreviewLoading.value = false;
  }
};

const handleImport = async () => {
  if (!tableName.value) {
    ElMessage.warning("请先解析文件");
    return;
  }

  try {
    tableStore.addTable({
      tableName: tableName.value,
      originalName: fileInfo.name,
      rowCount: rowData.value.length,
      importTime: Date.now(),
    });

    ElMessage.success(`数据表 [${fileInfo.name}] 导入成功`);

    // 预留持久化调用点
    await tableStore.persistToDisk();

    // 延迟重置，给用户一点反馈时间
    setTimeout(() => {
      resetUpload();
    }, 800);
  } catch (error: any) {
    ElMessage.error("导入失败: " + error.message);
  }
};

const refreshPreview = useDebounceFn(async () => {
  if (uploadStatus.value !== "ready") return;
  await processFile(false);
}, 500);

const resetUpload = () => {
  uploadStatus.value = "idle";
  hasData.value = false;
  fileInfo.raw = null;
  rowData.value = [];
  columnDefs.value = [];
};

const onGridReady = (params: any) => {
  params.api.sizeColumnsToFit();
};
</script>

<style lang="scss" scoped>
.data-view-container {
  padding: 20px;
  height: 100%;
  background-color: var(--el-bg-color-page);
  overflow: hidden;
}

.import-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  grid-template-rows: 200px 1fr;
  gap: 20px;
  height: 100%;
}

.grid-block {
  background: var(--el-bg-color);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-direction: column;
}

// 区块 A
.block-file-slot {
  grid-column: 1 / 2;
  grid-row: 1 / 2;
  justify-content: center;
  align-items: center;

  .dropzone-container {
    width: 100%;
    height: 100%;
    
    :deep(.el-upload-dragger) {
      width: 100%;
      height: 160px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px dashed var(--el-border-color-light);
      background: transparent;
      
      &:hover {
        border-color: var(--el-color-primary);
      }

      .dropzone-content {
        display: flex;
        align-items: center;
        gap: 16px;
        text-align: left;

        .el-icon--upload {
          margin: 0;
          font-size: 48px;
        }

        .upload-text-group {
          .main-text {
            font-size: 16px;
            color: var(--el-text-color-primary);
            margin-bottom: 4px;
            em {
              color: var(--el-color-primary);
              font-style: normal;
              font-weight: 600;
            }
          }
          .sub-text {
            font-size: 12px;
            color: var(--el-text-color-secondary);
            line-height: 1.4;
          }
        }
      }
    }
  }

  .uploading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    width: 100%;

    .loading-icon {
      animation: rotating 2s linear infinite;
      color: var(--el-color-primary);
    }

    .upload-info {
      width: 80%;
      text-align: center;
      span {
        font-size: 13px;
        color: var(--el-text-color-secondary);
        margin-bottom: 8px;
        display: block;
      }
    }
  }

  .file-card {
    width: 100%;

    .file-header {
      display: flex;
      align-items: flex-start;
      gap: 12px;

      .file-meta {
        flex: 1;
        overflow: hidden;

        .file-name {
          font-weight: 600;
          font-size: 15px;
          margin-bottom: 6px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .file-details {
          display: flex;
          gap: 6px;
        }
      }

      .file-actions {
        display: flex;
        flex-direction: column;
        gap: 4px;
        align-items: flex-end;
      }
    }
  }
}

// 区块 B
.block-config {
  grid-column: 2 / 3;
  grid-row: 1 / 2;

  .config-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0 40px;
    margin-top: 10px;

    :deep(.el-form-item) {
      margin-bottom: 12px;
    }
  }
}

// 区块 C
.block-preview {
  grid-column: 1 / 3;
  grid-row: 2 / 3;

  .preview-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .grid-wrapper {
    flex: 1;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    overflow: hidden;
    position: relative;
  }

  .empty-preview {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 12px;
  position: relative;
  padding-left: 10px;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 14px;
    background-color: var(--el-color-primary);
    border-radius: 2px;
  }
}

@keyframes rotating {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

:deep(.ag-theme-quartz) {
  --ag-background-color: var(--el-bg-color);
  --ag-header-background-color: var(--el-fill-color-light);
  --ag-font-family: inherit;
}
</style>
