# OpenTable: 开发路线图 (Roadmap)

## Milestone 1: 基建与单机查看器 (Month 1)
- [ ] 初始化 Vue 3 + Vite + AG-Grid 环境。
- [ ] 集成 DuckDB-Wasm，实现 CSV/Excel 流式导入。
- [ ] 完成基础的 SQL 命令行与表格分页展示。

## Milestone 2: 数据资产与自动化流水线 (Month 2)
- [ ] **草稿与回滚**：实现内存 Draft 机制，支持多步撤销/重做 (Undo/Redo)。
- [ ] **多源同步**：实现本地目录监听与 API 定时抓取逻辑。
- [ ] **精细化算子**：开发引导式导入界面与自定义预处理脚本 (JS Runtime)。
- [ ] **逻辑配方**：支持将清洗与转换步骤保存并导出为可重复执行的“配方”。

## Milestone 3: Tauri 原生化与 AI 智能增强 (Month 3)
- [ ] **本地原生化**：封装 Tauri 壳，提升文件系统读写权限与原生计算性能。
- [ ] **AI 决策助手**：集成 Text-to-SQL/Action，实现自然语言驱动的数据操作。
- [ ] **深度洞察**：集成 LanceDB 语义搜索，并利用 AI 自动生成业务分析报告。

