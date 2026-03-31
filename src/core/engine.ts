import * as duckdb from "@duckdb/duckdb-wasm";
import duckdb_wasm from "@duckdb/duckdb-wasm/dist/duckdb-mvp.wasm?url";
import mvp_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-mvp.worker.js?url";
import duckdb_wasm_eh from "@duckdb/duckdb-wasm/dist/duckdb-eh.wasm?url";
import eh_worker from "@duckdb/duckdb-wasm/dist/duckdb-browser-eh.worker.js?url";

const MANUAL_BUNDLES: duckdb.DuckDBBundles = {
  mvp: {
    mainModule: duckdb_wasm,
    mainWorker: mvp_worker,
  },
  eh: {
    mainModule: duckdb_wasm_eh,
    mainWorker: eh_worker,
  },
};

class DuckDBEngine {
  private db: duckdb.AsyncDuckDB | null = null;
  private conn: duckdb.AsyncDuckDBConnection | null = null;
  private isInitializing = false;

  /**
   * 初始化 DuckDB
   */
  async init() {
    if (this.db) return this.db;
    if (this.isInitializing) {
      // 等待初始化完成
      while (this.isInitializing) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return this.db;
    }

    this.isInitializing = true;
    try {
      console.log("Initializing DuckDB...");
      const bundle = await duckdb.selectBundle(MANUAL_BUNDLES);
      const worker = new Worker(bundle.mainWorker!);
      const logger = new duckdb.ConsoleLogger();
      const db = new duckdb.AsyncDuckDB(logger, worker);
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      this.db = db;
      this.conn = await db.connect();
      console.log("DuckDB initialized.");
      return db;
    } catch (error) {
      console.error("Failed to initialize DuckDB:", error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * 执行 SQL 查询
   */
  async query(sql: string) {
    if (!this.conn) {
      await this.init();
    }
    if (!this.conn) throw new Error("DuckDB not initialized");
    return await this.conn.query(sql);
  }

  /**
   * 导入文件
   */
  async importFile(
    file: File,
    tableName: string,
    options: { encoding?: string } = {}
  ) {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) throw new Error("DuckDB not initialized");

    const { encoding = "utf-8" } = options;
    let buffer: Uint8Array;

    // 如果指定了非 UTF-8 编码且是 CSV，进行转码处理
    if (encoding.toLowerCase() !== "utf-8" && file.name.endsWith(".csv")) {
      console.log(`Transcoding ${file.name} from ${encoding} to utf-8...`);
      const originalBuffer = await file.arrayBuffer();
      const decoder = new TextDecoder(encoding);
      const text = decoder.decode(originalBuffer);
      const encoder = new TextEncoder();
      buffer = encoder.encode(text);
    } else {
      const content = await file.arrayBuffer();
      buffer = new Uint8Array(content);
    }

    await this.db.registerFileBuffer(file.name, buffer);

    let sql = "";
    if (file.name.endsWith(".csv")) {
      sql = `CREATE OR REPLACE TABLE ${tableName} AS SELECT * FROM read_csv_auto('${file.name}')`;
    } else if (file.name.endsWith(".parquet")) {
      sql = `CREATE OR REPLACE TABLE ${tableName} AS SELECT * FROM read_parquet('${file.name}')`;
    } else {
      throw new Error("Unsupported file format. Please use .csv or .parquet");
    }

    await this.query(sql);
    console.log(`File ${file.name} imported as table ${tableName}`);
  }

  /**
   * 获取表的所有数据 (用于 AG-Grid 展示)
   */
  async getTableData(tableName: string) {
    const result = await this.query(`SELECT * FROM ${tableName}`);
    // 将 Arrow Table 转换为普通的 JSON 数组
    return result.toArray().map((row) => row.toJSON());
  }

  /**
   * 获取表结构
   */
  async getTableSchema(tableName: string) {
    const result = await this.query(`DESCRIBE ${tableName}`);
    return result.toArray().map((row) => row.toJSON());
  }
}

export const engine = new DuckDBEngine();
