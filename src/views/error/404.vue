<template>
  <div class="error-page">
    <div class="error-page__content">
      <h1 class="error-page__title">404</h1>
      <p class="error-page__desc">抱歉，您访问的页面不存在。</p>
      <el-button type="primary" @click="$router.push('/')">返回首页</el-button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  text-align: center;

  &__title {
    font-size: 120px;
    font-weight: bold;
    color: var(--el-color-primary);
    margin: 0;
  }

  &__desc {
    font-size: 20px;
    color: var(--el-text-color-secondary);
    margin: 20px 0 40px;
  }
}
</style>
