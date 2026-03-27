# OpenTable: 技术架构

## 1. 技术栈演进路线
为了解决分发臃肿和性能瓶颈，OpenTable 采用“Web 驱动，原生包装”的路线：
- **MVP 阶段**：Vue 3 + Vite + DuckDB-Wasm (全浏览器运行，零安装)。
- **原生阶段**：Tauri (Rust 后端) + Vue 3 + DuckDB Native。

## 2. 核心组件
- **前端框架**：Vue 3 (Composition API) + Pinia (状态管理)。
- **表格引擎**：AG-Grid (工业级大数据渲染) + Univer (Excel 级单元格编辑)。
- **计算核心**：DuckDB (唯一数据引擎，支持 SQL 和高性能列式计算)。
- **存储方案**：
    - Web 版：OPFS / IndexedDB 持久化。
    - Tauri 版：本地文件系统直接读写。

## 3. 数据生命周期
1. **Load**：通过 Worker 线程将本地文件导入内存 DuckDB。
2. **Draft**：用户操作 UI 或执行 SQL，更改在内存暂存。
3. **Commit**：用户点击“保存”，数据执行落盘操作或导出为新文件。

## 4. 关于 Rust 的说明
Tauri 仅作为底层“胶水层”，提供 Rust 编写的数据库驱动和文件 I/O。业务逻辑 90% 保留在 Vue/JS 层，降低开发复杂度。
