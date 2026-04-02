<template>
  <div class="sources-container">
    <div class="section-header">
      <h2>数据源列表</h2>
      <el-button type="primary" :icon="Plus" @click="goToImport">新增数据源</el-button>
    </div>

    <el-table :data="tableStore.tables" border style="width: 100%">
      <el-table-column prop="originalName" label="文件名/名称" />
      <el-table-column prop="tableName" label="物理表名" />
      <el-table-column prop="rowCount" label="行数" width="120" />
      <el-table-column prop="importTime" label="导入时间" width="180">
        <template #default="scope">
          {{ formatDate(scope.row.importTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template #default="scope">
          <el-button link type="primary" @click="handlePreview(scope.row)">预览</el-button>
          <el-button link type="danger" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { Plus } from "@element-plus/icons-vue";
import { useTableStore } from "@/stores";
import { useRouter } from "vue-router";
import { ElMessageBox, ElMessage } from "element-plus";

const tableStore = useTableStore();
const router = useRouter();

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString();
};

const goToImport = () => {
  router.push("/data/import");
};

const handlePreview = (row: any) => {
  router.push({
    path: "/data/viewer",
    query: { table: row.tableName }
  });
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm(`确定要删除数据表 [${row.originalName}] 吗？`, "提示", {
    type: "warning"
  }).then(async () => {
    await tableStore.removeTable(row.tableName);
    ElMessage.success("删除成功");
  });
};
</script>

<style lang="scss" scoped>
.sources-container {
  padding: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }
}
</style>
