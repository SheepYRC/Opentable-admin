import * as XLSX from "xlsx";
// @ts-ignore
import jschardet from "jschardet";
import { engine } from "./engine";

export interface ImportOptions {
  tableName?: string;
  encoding?: string; // 如果不传，则自动检测
  sheetIndex?: number; // 针对 Excel，指定导入第几个工作表
  skipRows?: number;
  skipCols?: number;
  hasHeader?: boolean;
}

class DataImporter {
  /**
   * 自动检测文件编码 (针对 CSV)
   */
  async detectEncoding(file: File): Promise<string> {
    const previewSize = 32 * 1024; // 读取前 32KB 进行检测，提高准确度
    const blob = file.slice(0, previewSize);
    const buffer = await blob.arrayBuffer();
    const uint8Array = new Uint8Array(buffer);

    // 将 Uint8Array 转为二进制字符串供 jschardet 使用
    let binary = "";
    for (let i = 0; i < uint8Array.length; i++) {
      binary += String.fromCharCode(uint8Array[i]!);
    }

    const result = jschardet.detect(binary);
    console.log(`Detected encoding for ${file.name}:`, result);

    if (result && result.encoding) {
      const enc = result.encoding.toLowerCase();
      // 常见中文编码映射优化
      if (enc === "gb2312" || enc === "gbk" || enc === "hz-gb-2312") return "gbk";
      if (enc === "windows-1252") {
        // windows-1252 经常误诊，如果是中文系统下的文件，极有可能是 gbk
        // 这里做一个简单的检查：如果包含非 ASCII 字符且 jschardet 认为是 windows-1252
        return "gbk";
      }
      return enc;
    }
    return "utf-8";
  }

  /**
   * 导入文件到 DuckDB
   */
  async importFile(file: File, options: ImportOptions = {}) {
    const tableName = options.tableName || "t_" + Math.random().toString(36).substring(7);
    const extension = file.name.split(".").pop()?.toLowerCase();

    let usedEncoding = "";

    if (extension === "csv") {
      const res = await this.importCSV(file, tableName, options);
      usedEncoding = res.encoding;
    } else if (extension === "parquet") {
      await this.importParquet(file, tableName);
      usedEncoding = "parquet";
    } else if (extension === "xlsx" || extension === "xls") {
      await this.importExcel(file, tableName, options);
      usedEncoding = "excel";
    } else {
      throw new Error(`不支持的文件格式: .${extension}`);
    }

    return { tableName, encoding: usedEncoding };
  }

  /**
   * 导入 CSV
   */
  private async importCSV(file: File, tableName: string, options: ImportOptions = {}) {
    const db = (await engine.init())!;
    const targetEncoding = options.encoding || (await this.detectEncoding(file));

    let buffer: Uint8Array;
    const originalBuffer = await file.arrayBuffer();

    if (targetEncoding.toLowerCase() !== "utf-8") {
      console.log(`Transcoding ${file.name} from ${targetEncoding} to utf-8...`);
      try {
        const decoder = new TextDecoder(targetEncoding);
        const text = decoder.decode(originalBuffer);
        const encoder = new TextEncoder();
        buffer = encoder.encode(text);
      } catch (e) {
        console.warn("TextDecoder failed, falling back to original buffer", e);
        buffer = new Uint8Array(originalBuffer);
      }
    } else {
      buffer = new Uint8Array(originalBuffer);
    }

    await db.registerFileBuffer(file.name, buffer);

    const skip = options.skipRows || 0;
    const header = options.hasHeader !== undefined ? options.hasHeader : true;
    const skipCols = options.skipCols || 0;

    // 1. 先获取原始文件分析出的所有列名
    // 使用 read_csv_auto 分析出的列头信息
    const describeQuery = `DESCRIBE SELECT * FROM read_csv_auto('${file.name}', skip=${skip}, header=${header})`;
    const describeResult = await engine.query(describeQuery);
    const allColumns = describeResult.toArray().map((r) => r.toJSON().column_name);

    // 2. 根据 skipCols 对列进行切片
    const selectedColumns = allColumns.slice(skipCols);
    
    if (selectedColumns.length === 0) {
      throw new Error("跳过列数过多，未检测到有效列");
    }

    // 3. 构造最终的创建表语句
    // 将列名用双引号包裹以防特殊字符
    const columnSelection = selectedColumns.map(name => `"${name}"`).join(", ");
    
    const query = `CREATE OR REPLACE TABLE ${tableName} AS 
                   SELECT ${columnSelection} 
                   FROM read_csv_auto('${file.name}', skip=${skip}, header=${header})`;

    await engine.query(query);

    return { encoding: targetEncoding };
  }

  /**
   * 导入 Parquet
   */
  private async importParquet(file: File, tableName: string) {
    const db = (await engine.init())!;
    const buffer = await file.arrayBuffer();
    await db.registerFileBuffer(file.name, new Uint8Array(buffer));
    await engine.query(
      `CREATE OR REPLACE TABLE ${tableName} AS SELECT * FROM read_parquet('${file.name}')`
    );
  }

  /**
   * 导入 Excel (.xlsx, .xls)
   * 使用 SheetJS 将数据转为 JSON 后由 DuckDB 摄入
   */
  private async importExcel(file: File, tableName: string, options: ImportOptions = {}) {
    const sheetIndex = options.sheetIndex ?? 0;
    const skipRows = options.skipRows ?? 0;
    const skipCols = options.skipCols ?? 0;
    const hasHeader = options.hasHeader !== undefined ? options.hasHeader : true;

    const db = (await engine.init())!;
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data, { type: "array" });

    if (sheetIndex >= workbook.SheetNames.length) {
      throw new Error("工作表索引超出范围");
    }

    const sheetName = workbook.SheetNames[sheetIndex];
    if (sheetName === undefined) {
      throw new Error("工作表不存在");
    }
    const worksheet = workbook.Sheets[sheetName];
    if (!worksheet) {
      throw new Error("无法读取工作表内容");
    }

    // 将 Sheet 转为 2D 数组进行手动处理 skipRows/skipCols
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, range: skipRows }) as any[][];

    if (rawData.length === 0) {
      throw new Error("Excel 文件中没有数据");
    }

    // 处理 skipCols 并转为 JSON 对象数组
    let jsonData: any[] = [];
    if (hasHeader) {
      const headers = (rawData[0] || []).slice(skipCols);
      const dataRows = rawData.slice(1);
      
      jsonData = dataRows.map(row => {
        const obj: any = {};
        const slicedRow = (row || []).slice(skipCols);
        headers.forEach((h: any, i: number) => {
          const key = (h !== undefined && h !== null && h !== "") ? String(h) : `column${i}`;
          obj[key] = slicedRow[i];
        });
        return obj;
      });
    } else {
      jsonData = rawData.map(row => {
        const obj: any = {};
        const slicedRow = (row || []).slice(skipCols);
        slicedRow.forEach((v: any, i: number) => {
          obj[`column${i}`] = v;
        });
        return obj;
      });
    }

    if (jsonData.length === 0 && !hasHeader) {
      throw new Error("Excel 文件处理后没有数据");
    }

    // 采用 insertJSON 的方式注入，这需要使用 connection
    // 注意：DuckDB-Wasm 的 insertJSON 性能在大数据量下不如 read_csv
    // 这里我们先生成一个临时的 JSON 文件并用 read_json_auto 读取，这样更 DuckDB 原生
    const jsonStr = JSON.stringify(jsonData);
    const jsonBuffer = new TextEncoder().encode(jsonStr);
    const tmpJsonFileName = `${tableName}_tmp.json`;

    await db.registerFileBuffer(tmpJsonFileName, jsonBuffer);
    await engine.query(
      `CREATE OR REPLACE TABLE ${tableName} AS SELECT * FROM read_json_auto('${tmpJsonFileName}')`
    );
  }
}

export const importer = new DataImporter();
