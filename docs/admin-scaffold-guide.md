# Vue3 + Element Plus 管理后台搭建指南 (老师傅版)

你好！既然要把这个 Vue3 自带模板改造成像 `vue3-element-admin` 那样的专业后台，我们需要从底层架构就开始考究。这不仅仅是把组件堆起来，而是要建立一套**可维护、可扩展、标准化的工程体系**。

作为一名“老师傅”，我为你规划了这份阶梯式的搭建清单，帮助你稳步构建出属于自己的管理系统“架子”。

---

## 🏗️ 第一阶段：工程标准化 (Baseline)
在写任何业务代码之前，先把规矩定好。

1. **包管理工具**: 推荐使用 `pnpm`，比 `npm` 和 `yarn` 更快、更节省磁盘空间。
    > —— **师傅记录**: 已验证根目录下存在 `pnpm-lock.yaml`，确认项目使用 `pnpm` 进行依赖管理。
2. **UI 框架集成 (Element Plus)**:
    - 引入 `element-plus`。
    > —— **师傅记录**: `element-plus` 已安装至 `dependencies`。
    - 使用 `unplugin-vue-components` 和 `unplugin-auto-import` 实现按需自动引入。
    > —— **师傅记录**: 已在 `vite.config.ts` 中配置 `AutoImport` 和 `Components` 插件，并集成 `ElementPlusResolver`。生成的类型声明文件位于 `src/types/`。
3. **CSS 预处理器 (Sass/SCSS)**:
    - 后台管理系统通常有大量的样式变量，必须使用 Sass/SCSS 进行工程化管理。
    > —— **师傅记录**: `sass` 已安装至 `devDependencies`。
4. **代码规范封装**:
    - 配置 `.editorconfig`, `ESLint`, `Prettier`。
    > —— **师傅记录**: `.editorconfig`, `eslint.config.ts` (ESLint 9+ Flat Config) 和 `.prettierrc.yaml` 已配置完成。
    - 进阶：配置 `husky` 和 `lint-staged`。
    > —— **师傅记录**: `.husky` 钩子已初始化，`package.json` 中的 `lint-staged` 已配置，确保提交代码符合规范。

## 🏛️ 第二阶段：核心架构设计 (Infrastructure)
这是后台管理系统的“脊梁骨”。

1. **状态管理 (Pinia)**:
    - 替代 Vuex。划分模块：`user`, `app`, `settings`。
    > —— **师傅记录**: `src/stores` 下已建立 `user.ts` (用户信息/Token)、`app.ts` (侧边栏/设备) 和 `settings.ts` (主题模式/布局) 模块。
2. **网络请求封装 (Axios)**:
    - 在 `src/utils/request.ts` 中封装 Axios 实例。
    - 设置请求/响应拦截器。
    > —— **师傅记录**: `axios` 已安装。`request.ts` 已实现 Token 自动携带、401 自动跳转登录、业务状态码统一处理等核心功能。
3. **全域环境变量**:
    - 划分 `.env.development` 和 `.env.production`。
    > —— **师傅记录**: 已配置 `VITE_APP_BASE_API` 及 Mock 开关。注意：Vite 环境变量必须以 `VITE_` 开头才能在客户端访问。

## 🎨 第三阶段：布局系统 (Layout System)
管理后台的灵魂在于侧边栏和顶栏的交互。

1. **模块化布局**:
    - 将页面拆分为：`Layout`, `Sidebar` (侧边栏), `Navbar` (顶栏), `AppMain` (主内容区), `TagsView` (标签页栏)。
2. **动态侧边栏**:
    - 基于 Vue Router 的 `routes` 列表自动滚动生成菜单。
    - 支持无限级嵌套菜单。
3. **面包屑与标签页**:
    - 实现全路径的面包屑导航（Breadcrumb）。
    - 实现多标签页（TagsView）管理，支持右键关闭、刷新等操作。

## 🔐 第四阶段：权限与动态路由 (RBAC Control)
这是专业后台与普通项目最大的区别。

1. **路由权限守卫**:
    - 在 `src/permission.ts` 中编写全局路由守卫 `router.beforeEach`。
2. **动态生成路由表**:
    - 用户登录后，从后端获取菜单权限数据。
    - 根据权限数据筛选出有权限的路由，使用 `router.addRoute` 动态挂载到路由实例中。
3. **按钮级权限 (V-Permission)**:
    - 编写自定义指令 `v-permission`，根据当前用户角色控制按钮的显隐。

## 🛠️ 第五阶段：开发效率神器 (DX Optimization)
1. **SVG图标封装**:
    - 封装一个 `<svg-icon />` 组件，通过 `vite-plugin-svg-icons` 插件方便地管理本地 SVG 资源。
2. **Mock 服务**:
    - 在后端接口还没准备好时，使用 `vite-plugin-mock` 进行数据模拟，确保前端开发流程不断档。
3. **全局组件封装**:
    - 封装如分页组件、搜索组件等高频使用的业务组件。

---

## 📂 推荐的项目目录结构 (src 层级)

```text
src/
├── api/            # API 接口请求 (按逻辑模块分类)
├── assets/         # 静态资源 (图片、icons 等)
├── components/     # 全局复用组件 (基础组件)
├── directive/      # 自定义指令 (如 v-permission)
├── layout/         # 布局组件 (Sidebar, Navbar, AppMain)
├── plugins/        # 第三方库配置 (Element Plus 等)
├── router/         # 路由配置 (静态路由 与 权限路由)
├── store/          # Pinia 状态管理
├── styles/         # 全局样式 (variables.scss, element-ui.scss)
├── utils/          # 工具函数封装 (request, auth)
├── views/          # 业务页面 (所有具体的 .vue 页面)
└── main.ts         # 入口文件
```

---

### 第一步建议：
既然你已经有了 Vue3 项目，你的**第一步**应该是：
1. 安装 `element-plus`, `sass`。
2. 配置 Vite 插件实现 Element Plus 的自动引入。
3. 建立 `src/layout` 目录，开始画出那个三段式（侧边、顶部、主体）的界面雏形。

**接下来，你想让我直接帮你开始其中哪一部分的编写？**
