import axios, { type InternalAxiosRequestConfig, type AxiosResponse } from "axios";
import { ElMessage } from "element-plus";
import { ApiCodeEnum } from "@/enums/api";
import { AuthStorage, redirectToLogin } from "@/utils/auth";

// HTTP 请求实例
const http = axios.create({
	baseURL: import.meta.env.VITE_APP_BASE_API,
	timeout: 50000,
	headers: { "Content-Type": "application/json;charset=utf-8" },
});

// 请求拦截器：自动携带 Token
http.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		const token = AuthStorage.getAccessToken();
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

// 响应拦截器：统一业务报错处理
http.interceptors.response.use(
	(response: AxiosResponse<ApiResponse>) => {
		// 处理文件流
		const { responseType } = response.config;
		if (responseType === "blob" || responseType === "arraybuffer") return response;

		const { code, data, msg } = response.data;
		if (code === ApiCodeEnum.SUCCESS) return data;

		// 处理特殊错误码
		if (code === ApiCodeEnum.UNAUTHORIZED || code === ApiCodeEnum.ACCESS_TOKEN_INVALID) {
			redirectToLogin("登录过期，请重新登录");
		} else {
			ElMessage.error(msg || "系统繁忙");
		}

		return Promise.reject(new Error(msg || "Error"));
	},
	(error) => {
		ElMessage.error(error.message || "网络异常");
		return Promise.reject(error);
	}
);

export default http;
