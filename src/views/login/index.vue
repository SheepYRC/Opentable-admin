<template>
  <div class="login-container">
    <el-card class="login-card">
      <template #header>
        <h2 class="text-center">系统登录</h2>
      </template>
      <el-form :model="loginForm" label-width="0">
        <el-form-item>
          <el-input v-model="loginForm.username" placeholder="用户名" prefix-icon="User" />
        </el-form-item>
        <el-form-item>
          <el-input v-model="loginForm.password" type="password" placeholder="密码" prefix-icon="Lock" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="w-full" :loading="loading" @click="handleLogin">登录</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { User, Lock } from "@element-plus/icons-vue"
import { useUserStore } from "@/stores"
import { ElMessage } from "element-plus"

const userStore = useUserStore()
const router = useRouter()
const loading = ref(false)

const loginForm = reactive({
  username: "admin",
  password: "123"
})

const handleLogin = async () => {
    loading.value = true
    try {
        // 模拟登录逻辑
        userStore.token = "fake-token"
        userStore.nickname = "超级管理员"
        userStore.avatar = "https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png"
        router.push("/")
        ElMessage.success("登录成功")
    } finally {
        loading.value = false
    }
}
</script>

<style lang="scss" scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #f0f2f5;
}

.login-card {
  width: 400px;
}

.text-center {
  text-align: center;
}

.w-full {
  width: 100%;
}
</style>
