/**
 * API 响应状态码映射
 */
export const enum ApiCodeEnum {
	SUCCESS = 200,                // 成功
	UNAUTHORIZED = 401,           // 未登录
	ACCESS_TOKEN_INVALID = 40101, // Token 失效
	REFRESH_TOKEN_INVALID = 40102, // Refresh Token 失效
	PERMISSION_DENIED = 403       // 权限不足
}
