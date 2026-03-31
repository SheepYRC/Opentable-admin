<template>
  <div class="login-container">
    <el-card class="login-card" shadow="always">
      <template #header>
        <div class="login-header">
          <img v-if="hasLogo" src="@/assets/logo.svg" alt="Logo" class="login-logo" />
          <h2 class="login-title">Opentable Admin</h2>
          <p class="login-subtitle">请登录您的账号以继续</p>
        </div>
      </template>

      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="0"
        size="large"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="用户名"
            :prefix-icon="User"
            clearable
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="密码"
            :prefix-icon="Lock"
            show-password
            @keyup.enter="handleLogin"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-button" :loading="loading" @click="handleLogin">
            立即登录
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-footer">
        <p>默认账号: admin / 密码: 123</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { User, Lock } from "@element-plus/icons-vue";
import { useUserStore } from "@/stores";
import { ElMessage, type FormInstance } from "element-plus";

const userStore = useUserStore();
const router = useRouter();
const route = useRoute();

const loginFormRef = ref<FormInstance>();
const loading = ref(false);
const hasLogo = ref(false); // 暂时关闭，直到确认 logo 路径

const loginForm = reactive({
  username: "admin",
  password: "123",
});

const loginRules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }],
};

const handleLogin = async () => {
  if (!loginFormRef.value) return;

  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        await userStore.login(loginForm);
        ElMessage.success("登录成功，欢迎回来");

        // 跳转至重定向页面或首页
        const redirect = (route.query.redirect as string) || "/";
        router.push(redirect);
      } catch (error: any) {
        ElMessage.error(error.message || "登录失败");
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  width: 100%;
  max-width: 420px;
  border-radius: 12px;
  overflow: hidden;
  border: none;

  :deep(.el-card__header) {
    background-color: transparent;
    border-bottom: none;
    padding-bottom: 0;
  }
}

.login-header {
  text-align: center;
  padding: 20px 0 10px;

  .login-logo {
    width: 64px;
    height: 64px;
    margin-bottom: 20px;
  }

  .login-title {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }

  .login-subtitle {
    margin: 10px 0 0;
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
}

.login-button {
  width: 100%;
  margin-top: 10px;
  letter-spacing: 1px;
  font-weight: 500;
}

.login-footer {
  margin-top: 20px;
  text-align: center;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}
</style>
