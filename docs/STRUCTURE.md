# OpenTable: 目录结构设计

```text
openTable/
├── src-tauri/             # Tauri Rust 后端 (未来扩展)
├── src/
│   ├── api/               # AI 接口与外部数据源对接
│   ├── core/              # 核心计算引擎
│   │   ├── engine.ts      # DuckDB 连接与查询封装
│   │   ├── draft_state.ts # 内存暂存区状态管理
│   │   └── io.ts          # 文件读取与编码识别 (SheetJS/js-chardet)
│   ├── modules/           # 业务子模块
│   │   ├── table/         # 表格渲染 (AG-Grid/Univer)
│   │   ├── ai/            # AI Agent 逻辑 (Prompt 模板)
│   │   └── visual/        # 数据可视化组件
│   ├── stores/            # Pinia 全局状态
│   ├── assets/            # CSS/字体等静态资源
│   ├── App.vue
│   └── main.ts
├── public/                # DuckDB-Wasm 静态库文件
├── index.html
├── package.json
└── README.md
```
