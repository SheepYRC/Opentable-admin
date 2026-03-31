import './assets/main.css'
import "element-plus/dist/index.css"; // 引入基础类库，确保 MessageBox 等 JS 组件样式正常
import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";
import "./permission"; // 引入路由分发/权限守卫

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
