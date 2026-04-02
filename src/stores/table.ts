import { defineStore } from "pinia";
import { ref } from "vue";
import { engine } from "@/core/engine";
import router from "@/router";

export interface DataTableInfo {
  tableName: string;
  originalName: string;
  rowCount: number;
  importTime: number;
}

export const useTableStore = defineStore("table", () => {
  const tables = ref<DataTableInfo[]>([]);

  function addTable(table: DataTableInfo) {
    // 检查是否已存在（如果复用 tableName 的话）
    const index = tables.value.findIndex(t => t.tableName === table.tableName);
    if (index > -1) {
      tables.value[index] = table;
    } else {
      tables.value.push(table);
    }
  }

  async function removeTable(tableName: string) {
    try {
      // 1. 从内存数据库中真正删除表
      await engine.query(`DROP TABLE IF EXISTS ${tableName}`);
      
      // 2. 从 Store 的追踪列表中移除
      tables.value = tables.value.filter(t => t.tableName !== tableName);

      // 3. 如果当前正处于该表的预览页，重定向回到导入页
      const currentRoute = router.currentRoute.value;
      if (currentRoute.query.table === tableName) {
        router.push("/data-view");
      }
    } catch (error) {
      console.error("Failed to remove table from DuckDB:", error);
      throw error;
    }
  }

  /**
   * 预留持久化占位符
   */
  async function persistToDisk() {
    console.log("Persisting tables to disk (not implemented yet)");
    // TODO: 实现 IndexedDB 或本地文件系统持久化
  }

  return { tables, addTable, removeTable, persistToDisk };
});
