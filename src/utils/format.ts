/**
 * 数据格式化工具函数
 */

/**
 * 格式化增长率
 */
export function formatGrowthRate(rate: number) {
  return `${rate > 0 ? "+" : ""}${rate.toFixed(2)}%`;
}

/**
 * 格式化文件大小
 */
export function formatFileSize(size: number) {
  if (size === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(size) / Math.log(k));
  return `${parseFloat((size / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * 格式化数字 (每三位加逗号)
 */
export function formatNumber(num: number | string) {
  const n = Number(num);
  return n.toLocaleString("en-US");
}

/**
 * 格式化货币
 */
export function formatCurrency(num: number | string) {
  const n = Number(num);
  return n.toLocaleString("zh-CN", { style: "currency", currency: "CNY" });
}
