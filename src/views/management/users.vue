<template>
  <div class="users-container">
    <div class="section-header">
      <h2>用户管理</h2>
      <el-button type="primary" :icon="Plus">新建用户</el-button>
    </div>

    <el-table :data="tableData" border style="width: 100%">
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="role" label="角色" />
      <el-table-column prop="status" label="状态">
        <template #default="scope">
          <el-tag :type="scope.row.status === '启用' ? 'success' : 'danger'">{{ scope.row.status }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default>
          <el-button link type="primary">编辑</el-button>
          <el-button link type="danger">禁用</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup lang="ts">
import { Plus } from "@element-plus/icons-vue";

const tableData = [
  { username: "admin", nickname: "超级管理员", role: "管理员", status: "启用" },
  { username: "tester", nickname: "测试账号", role: "普通用户", status: "启用" },
  { username: "guest", nickname: "访客", role: "普通用户", status: "禁用" },
];
</script>

<style lang="scss" scoped>
.users-container {
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
</style>
