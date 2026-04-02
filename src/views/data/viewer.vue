<template>
  <div class="data-viewer-container">
    <div class="viewer-layout">
      <!-- 顶部状态栏 -->
      <div class="viewer-header grid-block">
        <div class="header-left">
          <el-button link @click="$router.back()">
            <el-icon><ArrowLeft /></el-icon>
            返回
          </el-button>
          <div class="divider"></div>
          <div class="table-info">
            <span class="table-label">当前资产:</span>
            <span class="table-name">{{ tableInfo?.originalName || tableName }}</span>
            <el-tag size="small" type="info" effect="plain">{{ rowCount }} 行</el-tag>
          </div>
        </div>
        <div class="header-right">
          <el-input
            v-model="quickFilterText"
            placeholder="搜索数据..."
            class="search-input"
            clearable
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-button type="primary" plain @click="exportData">
            <el-icon><Download /></el-icon>
            导出
          </el-button>
          <el-button :type="isSqlEditorOpen ? 'primary' : 'default'" plain @click="isSqlEditorOpen = !isSqlEditorOpen">
            <el-icon><Operation /></el-icon>
            SQL 编辑器
          </el-button>
        </div>
      </div>

      <!-- 数据主表格区与 SQL 编辑器并排 -->
      <div class="viewer-main" v-loading="isLoading">
        <div class="viewer-content">
          <div class="grid-block grid-wrapper">
            <ag-grid-vue
              v-if="!isLoading"
              class="ag-theme-quartz"
              style="width: 100%; height: 100%"
              :columnDefs="columnDefs"
              :rowData="rowData"
              :gridOptions="gridOptions"
              :quickFilterText="quickFilterText"
              @grid-ready="onGridReady"
            >
            </ag-grid-vue>
          </div>

          <transition name="slide-right">
            <div v-if="isSqlEditorOpen" class="grid-block sql-editor-panel">
              <div class="panel-header">
                <span class="panel-title">SQL</span>
              </div>
              <div class="panel-content">
                <el-empty description="SQL 编辑器功能开发中..." :image-size="80">
                  <template #description>
                    <div class="sql-placeholder">
                      <p>在这里编写 SQL 语句对数据进行深度分析</p>
                      <code>SELECT * FROM {{ tableName }} WHERE ...</code>
                    </div>
                  </template>
                </el-empty>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Search, Download, Delete, Operation, Close } from "@element-plus/icons-vue";
import { AgGridVue } from "ag-grid-vue3";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { engine } from "@/core/engine";
import { useTableStore } from "@/stores";
import { ElMessage, ElMessageBox } from "element-plus";

// 注册 AG-Grid 模块
ModuleRegistry.registerModules([AllCommunityModule]);

const route = useRoute();
const router = useRouter();
const tableStore = useTableStore();

const tableName = computed(() => route.query.table as string);
const tableInfo = computed(() => tableStore.tables.find(t => t.tableName === tableName.value));

const isLoading = ref(true);
const rowData = ref<any[]>([]);
const columnDefs = ref<any[]>([]);
const rowCount = ref(0);
const quickFilterText = ref("");
const isSqlEditorOpen = ref(false);

const gridOptions = {
  headerHeight: 40,
  rowHeight: 36,
  pagination: true,
  paginationPageSize: 20,
  paginationPageSizeSelector: [10, 20, 50, 100],
  defaultColDef: {
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
    flex: 1,
  },
};

const loadData = async () => {
  if (!tableName.value) return;
  isLoading.value = true;
  try {
    const data = await engine.getTableData(tableName.value);
    const schema = await engine.getTableSchema(tableName.value);

    rowData.value = data;
    rowCount.value = data.length;
    columnDefs.value = schema.map((col: any) => ({
      field: col.column_name,
      headerName: col.column_name,
    }));
  } catch (error: any) {
    ElMessage.error("获取数据失败: " + error.message);
  } finally {
    isLoading.value = false;
  }
};

const onGridReady = (params: any) => {
  // 可以在这里进行更多表格初始化
};

const exportData = () => {
  ElMessage.info("导出功能开发中...");
};

const handleDelete = () => {
  ElMessageBox.confirm("确定要删除这张表吗？", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    tableStore.removeTable(tableName.value);
    ElMessage.success("数据表已移除");
    router.push("/data-view");
  });
};

onMounted(() => {
  loadData();
});

// 监听路由参数变化，以便在切换数据表时重新加载
watch(() => route.query.table, () => {
  loadData();
});
</script>

<script lang="ts">
export default {
  name: "DataViewer",
};
</script>

<style lang="scss" scoped>
.data-viewer-container {
  padding: 20px;
  height: 100%;
  background-color: var(--el-bg-color-page);
  overflow: hidden;
}

.viewer-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
}

.grid-block {
  background: var(--el-bg-color);
  border-radius: 12px;
  padding: 16px 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--el-border-color-lighter);
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;

  .header-left {
    display: flex;
    align-items: center;
    gap: 12px;

    .divider {
      width: 1px;
      height: 20px;
      background-color: var(--el-border-color);
    }

    .table-info {
      display: flex;
      align-items: center;
      gap: 8px;
      .table-label {
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
      .table-name {
        font-weight: 600;
        font-size: 15px;
        color: var(--el-text-color-primary);
      }
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 12px;

    .search-input {
      width: 240px;
    }
  }
}

.viewer-main {
  flex: 1;
  min-height: 0; // 重要：确保 flex 子项能正确收缩

  .viewer-content {
    display: flex;
    gap: 20px;
    height: 100%;
    width: 100%;
  }

  .grid-wrapper {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    padding: 12px; // 稍微调小 padding 留给表格

    :deep(.ag-theme-quartz) {
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--el-border-color-lighter);
    }
  }

  .sql-editor-panel {
    width: 400px;
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;

    .panel-header {
      padding: 12px 16px;
      border-bottom: 1px solid var(--el-border-color-lighter);
      display: flex;
      justify-content: space-between;
      align-items: center;

      .panel-title {
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }
    }

    .panel-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      padding: 20px;

      .sql-placeholder {
        margin-top: 20px;
        color: var(--el-text-color-secondary);
        font-size: 13px;

        code {
          display: block;
          margin-top: 10px;
          padding: 8px;
          background: var(--el-fill-color-light);
          border-radius: 4px;
          font-family: monospace;
        }
      }
    }
  }
}

// 动画
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
  width: 0;
}

:deep(.ag-theme-quartz) {
  --ag-background-color: var(--el-bg-color);
  --ag-header-background-color: var(--el-fill-color-light);
  --ag-font-family: inherit;
}
</style>
