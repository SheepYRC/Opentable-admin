<template>
  <div v-if="!item.meta || !item.meta.hidden">
    <!--【叶子节点】显示单子节点或自身直接渲染 -->
    <template
      v-if="
        (hasOneShowingChild(item.children, item) &&
          (!onlyOneChild.children || onlyOneChild.noShowingChildren) &&
          !item.meta?.alwaysShow) ||
        (item.meta?.alwaysShow && (!item.children || item.children.length === 0))
      "
    >
      <AppLink v-if="onlyOneChild && onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item
          :index="resolvePath(onlyOneChild.path)"
          :class="{ 'submenu-title-noDropdown': !isNest }"
        >
          <el-icon v-if="onlyOneChild.meta.icon || item.meta?.icon">
            <component :is="onlyOneChild.meta.icon || item.meta?.icon" />
          </el-icon>
          <template #title>
            <div class="menu-title-container">
              <span v-if="onlyOneChild && onlyOneChild.meta && onlyOneChild.meta.title">
                {{ translateRouteTitle(onlyOneChild.meta.title as string) }}
              </span>
              <!-- 仅针对数据表显示更多操作 -->
              <div v-if="onlyOneChild && onlyOneChild.meta && onlyOneChild.meta.isTable" class="item-actions" @click.stop.prevent>
                <el-dropdown trigger="click" @command="handleCommand($event, onlyOneChild)">
                  <span class="more-icon-btn" @click.stop.prevent @mousedown.stop @mouseup.stop>
                    <el-icon><MoreFilled /></el-icon>
                  </span>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item command="delete">
                        <el-icon><Delete /></el-icon> 删除
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
              </div>
            </div>
          </template>
        </el-menu-item>
      </AppLink>
    </template>

    <!--【非叶子节点】含子菜单 -->
    <el-sub-menu v-else :index="resolvePath(item.path)">
      <template #title>
        <el-icon v-if="item.meta && item.meta.icon">
          <component :is="item.meta.icon" />
        </el-icon>
        <span v-if="item.meta && item.meta.title">
          {{ translateRouteTitle(item.meta.title as string) }}
        </span>
      </template>

      <LayoutSidebarItem
        v-for="child in item.children"
        :key="child.path"
        :is-nest="true"
        :item="child"
        :base-path="resolvePath(child.path)"
      />
    </el-sub-menu>
  </div>
</template>

<script setup lang="ts">
import { ref, type PropType } from "vue";
import path from "path-browserify";
import type { RouteRecordRaw } from "vue-router";
import { isExternal } from "@/utils/validate";
import { translateRouteTitle } from "@/lang/utils";
import { MoreFilled, Delete } from "@element-plus/icons-vue";
import { useTableStore } from "@/stores";
import { ElMessageBox, ElMessage } from "element-plus";
import AppLink from "./AppLink.vue";

const props = defineProps({
  item: {
    type: Object as PropType<RouteRecordRaw>,
    required: true,
  },
  basePath: {
    type: String,
    required: true,
  },
  isNest: {
    type: Boolean,
    default: false,
  },
});

const tableStore = useTableStore();
const onlyOneChild = ref<any>(null);

const handleCommand = (command: string, item: any) => {
  if (command === "delete") {
    // 优先从 meta 中获取表名，以前从路径中提取的方法不够严谨且不稳定
    const tableName = item.meta?.tableName;
    if (!tableName) return;

    ElMessageBox.confirm(`确定要删除数据表 [${item.meta.title}] 吗？`, "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }).then(async () => {
      await tableStore.removeTable(tableName);
      ElMessage.success("删除成功");
    });
  }
};

function hasOneShowingChild(children: RouteRecordRaw[] = [], parent: RouteRecordRaw) {
  const showingChildren = children.filter((route: RouteRecordRaw) => {
    if (route.meta?.hidden) {
      return false;
    } else {
      onlyOneChild.value = route;
      return true;
    }
  });

  if (showingChildren.length === 1) {
    return true;
  }

  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...parent, path: "", noShowingChildren: true };
    return true;
  }

  return false;
}

function resolvePath(routePath: string) {
  if (isExternal(routePath)) {
    return routePath;
  }
  if (isExternal(props.basePath)) {
    return props.basePath;
  }
  return path.resolve(props.basePath, routePath);
}
</script>

<style lang="scss" scoped>
.el-menu-item {
  &.is-active {
    background-color: var(--el-color-primary-light-9);
  }
}

.menu-title-container {
  position: relative; // 为绝对定位提供基准
  display: flex;
  align-items: center;
  width: 100%;
  overflow: hidden;

  span {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    padding-right: 24px; // 为操作按钮预留空间
  }

  .item-actions {
    position: absolute;
    right: 0;
    display: none;
    line-height: normal;
    background-color: transparent;
    z-index: 10;
    
    .more-icon-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 4px;
      transition: background-color 0.2s;
      
      &:hover {
        background-color: var(--el-fill-color);
      }
    }
  }
}

.el-menu-item:hover {
  .item-actions {
    display: flex;
  }
}

// 当侧边栏折叠时隐藏操作按钮
.el-menu--collapse {
  .item-actions {
    display: none !important;
  }
}
</style>
