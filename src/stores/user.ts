import { defineStore } from "pinia";
import { AuthStorage } from "@/utils/auth";

export const useUserStore = defineStore("user", () => {
  // 状态
  const token = ref<string | null>(AuthStorage.getAccessToken());
  const nickname = ref("");
  const avatar = ref("");
  const roles = ref<string[]>([]); // 权限角色

  // 登录 (这是一个示例，你可以根据实际接口调整)
  async function login(loginData: any) {
    // const { data } = await loginApi(loginData);
    // AuthStorage.setAccessToken(data.token);
    // token.value = data.token;
  }

  // 登出
  function logout() {
    AuthStorage.removeAccessToken();
    token.value = null;
    roles.value = [];
    location.reload(); // 简单粗暴清空所有缓存状态
  }

  return { token, nickname, avatar, roles, login, logout };
});
