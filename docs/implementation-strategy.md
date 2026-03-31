# OpenTable: 承上启下 —— 项目落地实施建议 (Implementation Strategy)

通过分析 `design_docs` 下的愿景、架构与路线图，结合目前已经稳固的“管理后台地基”，本项目正处于从 **“通用脚手架”** 转向 **“专业数据 IDE”** 的关键拐点。

以下是我为你梳理的后续开发梯度建议，旨在帮助你从 0 到 1 快速落地核心功能。

---

## 🚀 核心逻辑：从“外壳”到“引擎”

目前的架构已经解决了“外壳”（侧边栏、顶栏、多标签、基础认证）的问题。接下来的核心任务是注入 **“灵魂”** —— 即 DuckDB 驱动的高性能数据处理能力。

### 阶段一：建立计算心脏 (Engine Inception)
**目标**：在浏览器中跑通第一个 SQL 查询。

1.  **初始化 `src/core` 目录**：作为整个项目的计算核心，不要将数据处理逻辑混在 Vue 组件中。
    -   安装 `duckdb-wasm`。
    -   实现 `core/engine.ts`：封装单例模式的 DuckDB 连接池。
2.  **实现“拖拽即看” MVP**：
    -   在 `views/dashboard` 或新建 `views/viewer/index.vue`。
    -   集成 `AG-Grid`：作为本项目推荐的表格引擎，其大数据承载力是不可替代的。
    -   实现一个基础的 `FileUploader`，点击或拖拽 CSV/Excel 后，直接 Load 进内存 DuckDB 并在表格中展示。

### 阶段二：打通 AI 数据交互 (AI Integration)
**目标**：让 AI Panel 不再只是一个摆设，而是能“读懂”数据。

1.  **元数据感知 (Schema Awareness)**：
    -   在 `userStore` 或 `appStore` 中维护当前已加载表的 Schema (列名、数据类型)。
    -   在 AI 发送请求时，自动注入当前表的 Schema 作为 Context。
2.  **Text-to-SQL 落地**：
    -   在 AI Panel 中输入：“帮我查出销售额最高的前 10 个省份”。
    -   AI 返回 SQL -> 核心引擎执行 -> 表格自动刷新结果。
    -   这是 `OpenTable` 愿景中“AI 原生”的第一步。

### 阶段三：草稿与生命周期管理 (Draft & Commit)
**目标**：建立“IDE”级别的数据安全感。

1.  **内存暂存区 (Draft Zone)**：
    -   实现 `core/draft_state.ts`：记录用户在 UI 上对表格进行的修改（增删改）。
    -   模仿 Git 的心智，提供全局的“Unsaved Changes”标识，用户点击 `Commit` 时才同步回 DuckDB 持久化存储。
2.  **多源导入策略**：
    -   开发一个专业的 `Importer` 引导页，支持字段类型识别与预览。

---

## 🛠️ 近期操作建议 (Action Plan)

| 任务项 | 优先级 | 预期成果 |
| :--- | :--- | :--- |
| **集成 DuckDB-Wasm** | 🔴 紧急 | 能够在浏览器控制台执行 `SELECT 1+1`。 |
| **引入 AG-Grid** | 🔴 紧急 | 解决大文件（10w+ 行）在浏览器的平滑滚动展示。 |
| **自定义导入流程** | 🟡 中等 | 支持用户对 CSV 的分隔符、编码格式进行手动校正。 |
| **AI SQL 助手** | 🟡 中等 | 实现第一个文本驱动的 SQL 查询动作。 |

---

## 💡 开发提示
- **Worker 优先**：数据导入与重计算一定要放在 Web Worker 中，否则 AG-Grid 会产生 UI 掉帧。
- **Univer 对齐**：如果你追求的是“在线 Excel”级的精确单元格操作（公式、样式），后续可以引入 `Univer.ai` 的组件，它与 AG-Grid 是互补关系。

> [!TIP]
> **地基已成，引擎先行。** 建议接下来的第一个 PR 聚焦于 `src/core` 的搭建，不要急着画复杂的业务 UI，先让数据在底层“活起来”。
