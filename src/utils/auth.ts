/**
 * 封装 Token 的本地存储
 */
import { ElMessage } from "element-plus";

const TOKEN_KEY = 'access_token';

export const AuthStorage = {
	getAccessToken: () => localStorage.getItem(TOKEN_KEY),
	setAccessToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
	removeAccessToken: () => localStorage.removeItem(TOKEN_KEY)
};

/** 跳转登录页并提示 */
export const redirectToLogin = async (msg: string) => {
	ElMessage.warning(msg);
	AuthStorage.removeAccessToken();
	// 简单暴力：直接刷新到登录页 (假设你以后会有 /login)
	window.location.href = '#/login';
};
