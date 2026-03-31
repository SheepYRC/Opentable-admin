import { defineStore } from "pinia";
import { AuthStorage } from "@/utils/auth";
import logo from "@/assets/logo.svg";

export const useUserStore = defineStore("user", () => {
  const token = ref<string | null>(AuthStorage.getAccessToken());
  const nickname = ref("");
  const avatar = ref("");
  const roles = ref<string[]>([]); // 后续扩展角色

  /**
   * 模拟登录 (生产环境请改为调用 API)
   */
  async function login(formData: any) {
    const { username } = formData;
    // 模拟逻辑：非空即登录成功
    const mockToken = "mock-token-123456";
    AuthStorage.setAccessToken(mockToken);
    token.value = mockToken;
    nickname.value = username || "Admin";
    avatar.value = logo;
    roles.value = ["admin"];
  }

  /**
   * 登出
   */
  function logout() {
    AuthStorage.removeAccessToken();
    token.value = null;
    nickname.value = "";
    avatar.value = "";
    roles.value = [];
    location.href = "/login"; // 跳转回登录页
    location.reload(); // 使用 reload 比强制跳转 /login 更彻底地清理 Vue 全局状态
  }

  return { token, nickname, avatar, roles, login, logout };
});
