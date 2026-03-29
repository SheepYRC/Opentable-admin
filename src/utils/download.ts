/**
 * 文件下载相关工具函数
 */

/**
 * 核心下载函数
 */
export function downloadFile(url: string, fileName?: string) {
  const link = document.createElement("a");
  link.setAttribute("href", url);
  if (fileName) {
    link.setAttribute("download", fileName);
  } else {
    // 尝试从 URL 中截取文件名
    link.setAttribute("download", url.split("/").pop() || "download");
  }
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
