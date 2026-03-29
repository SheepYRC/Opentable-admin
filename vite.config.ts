import { fileURLToPath, URL } from 'node:url'

import { type ConfigEnv, type UserConfig, loadEnv, defineConfig, PluginOption } from "vite";

import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),

	  // API 自动导入
	  AutoImport({
		  // 导入 Vue 函数，如：ref, reactive, toRef 等
		  imports: ["vue", "@vueuse/core", "pinia", "vue-router", "vue-i18n"],
		  resolvers: [
			  // 导入 Element Plus函数，如：ElMessage, ElMessageBox 等
			  ElementPlusResolver(),
		  ],
		  eslintrc: {
			  enabled: true, // 改为 true！生成 .eslintrc-auto-import.json 供 ESLint 识别
			  filepath: "./.eslintrc-auto-import.json",
			  globalsPropValue: true,
		  },
		  vueTemplate: true,
		  // 导入函数类型声明文件路径 (false:关闭自动生成)
		  // 开启 TS 类型生成，建议放在 src/types 下
      		dts: "src/types/auto-imports.d.ts", 
	  }),
	  // 组件自动导入
      Components({
        resolvers: [
          // 导入 Element Plus 组件
          ElementPlusResolver({
			importStyle: "sass", // 如果你要自定义主题，设为 sass 比较好
			}),
        ],
        // 指定自定义组件位置(默认:src/components)
        dirs: ["src/components", "src/**/components"],
        // 导入组件类型声明文件路径 (false:关闭自动生成)
        // 开启 TS 类型生成
      	dts: "src/types/components.d.ts",
		}),
    ] as PluginOption[],

  server: {
    port: 5555,
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  define: {
    __APP_INFO__: JSON.stringify({
      pkg: {
        name: "opentable-admin",
        version: "0.0.0",
      },
      lastBuildTime: new Date().toLocaleString(),
    }),
  },
})
