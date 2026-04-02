<template>
  <div class="settings-container">
    <div class="section-header">
      <h2>系统设置</h2>
      <el-button type="primary" @click="handleSave">保存配置</el-button>
    </div>

    <el-form label-position="left" label-width="120px" class="settings-form">
      <el-form-item label="站点名称">
        <el-input v-model="form.siteName" />
      </el-form-item>
      <el-form-item label="开启多租户">
        <el-switch v-model="form.tenantEnabled" />
      </el-form-item>
      <el-form-item label="默认语言">
        <el-select v-model="form.lang" style="width: 100%">
          <el-option label="简体中文" value="zh-cn" />
          <el-option label="English" value="en" />
        </el-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { ElMessage } from "element-plus";

const form = reactive({
  siteName: "Opentable Admin",
  tenantEnabled: false,
  lang: "zh-cn",
});

const handleSave = () => {
  ElMessage.success("配置保存成功");
};
</script>

<style lang="scss" scoped>
.settings-container {
  padding: 30px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

  h2 {
    margin: 0;
    font-size: 24px;
    font-weight: 600;
  }
}

.settings-form {
  max-width: 600px;
}
</style>
