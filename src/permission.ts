import router from "@/router";
import { AuthStorage } from "@/utils/auth";
import NProgress from "nprogress";
import "nprogress/nprogress.css";
import { useViewStore } from "@/stores";

// NProgress 配置
NProgress.configure({ showSpinner: false });

// 白名单
const whiteList = ["/login", "/auth-redirect"];

router.beforeEach(async (to, from, next) => {
  NProgress.start();

  // 同步视图模式
  const viewStore = useViewStore();
  if (to.meta?.view) {
    viewStore.setView(to.meta.view as any);
  }

  const hasToken = AuthStorage.getAccessToken();

  if (hasToken) {
    if (to.path === "/login") {
      // 已登录，跳转首页
      next({ path: "/" });
      NProgress.done();
    } else {
      // 可以在这里检查用户信息是否存在，如果不存在则拉取
      // 由于目前是简易版本，暂时直接放行
      next();
    }
  } else {
    // 未登录
    if (whiteList.indexOf(to.path) !== -1) {
      // 在免登录白名单，直接进入
      next();
    } else {
      // 其他无权限页面全部重定向到登录页
      next(`/login?redirect=${to.path}`);
      NProgress.done();
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});
