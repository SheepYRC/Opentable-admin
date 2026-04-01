<template>
  <div class="tags-container">
    <!-- 水平滚动容器 -->
    <el-scrollbar
      ref="scrollbarRef"
      class="scroll-container"
      :view-style="{ height: '100%' }"
      @wheel="handleScroll"
    >
      <div class="tags-wrapper">
        <el-tag
          v-for="tag in visitedViews"
          :key="tag.fullPath"
          class="tag-item"
          :closable="!tag.meta?.affix"
          :effect="tagsViewStore.isActive(tag) ? 'dark' : 'light'"
          :type="tagsViewStore.isActive(tag) ? 'primary' : 'info'"
          @close="closeSelectedTag(tag)"
          @click="
            router.push({
              path: tag.fullPath,
              query: tag.query,
            })
          "
          @contextmenu.prevent="(event: MouseEvent) => openContextMenu(tag, event)"
        >
          {{ translateRouteTitle((tag.meta?.title as string) || "no-name") }}
        </el-tag>
      </div>
    </el-scrollbar>

    <!-- 标签右键菜单 -->
    <Teleport to="body">
      <ul
        v-show="contextMenu.visible"
        class="contextmenu"
        :style="{ left: contextMenu.x + 'px', top: contextMenu.y + 'px' }"
      >
        <li @click="refreshSelectedTag(selectedTag)">
          <el-icon><Refresh /></el-icon>
          刷新
        </li>
        <li v-if="!selectedTag?.meta?.affix" @click="closeSelectedTag(selectedTag)">
          <el-icon><Close /></el-icon>
          关闭
        </li>
        <li @click="closeOtherTags">
          <el-icon><CircleClose /></el-icon>
          关闭其它
        </li>
        <li v-if="!isFirstView" @click="closeLeftTags">
          <el-icon><Back /></el-icon>
          关闭左侧
        </li>
        <li v-if="!isLastView" @click="closeRightTags">
          <el-icon><Right /></el-icon>
          关闭右侧
        </li>
        <li @click="closeAllTags(selectedTag)">
          <el-icon><Minus /></el-icon>
          关闭所有
        </li>
      </ul>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter, type RouteRecordRaw } from "vue-router";
import { resolve } from "path-browserify";
import { translateRouteTitle } from "@/lang/utils";
import { usePermissionStore, useTagsViewStore, useViewStore } from "@/stores";
import { storeToRefs } from "pinia";
import { Refresh, Close, CircleClose, Back, Right, Minus } from "@element-plus/icons-vue";

interface ContextMenu {
  visible: boolean;
  x: number;
  y: number;
}

const router = useRouter();
const route = useRoute();

// 状态管理
const permissionStore = usePermissionStore();
const tagsViewStore = useTagsViewStore();
const viewStore = useViewStore();

const { visitedViews } = storeToRefs(tagsViewStore);

// 当前选中的标签
const selectedTag = ref<any>(null);

// 右键菜单状态
const contextMenu = reactive<ContextMenu>({
  visible: false,
  x: 0,
  y: 0,
});

// 滚动条引用
const scrollbarRef = ref();

// 判断是否为第一个标签
const isFirstView = computed(() => {
  if (!selectedTag.value) return false;
  return (
    selectedTag.value.path === "/dashboard" ||
    selectedTag.value.path === "/data-view" ||
    selectedTag.value.path === "/ai-chat" ||
    selectedTag.value.fullPath === visitedViews.value[0]?.fullPath
  );
});

// 判断是否为最后一个标签
const isLastView = computed(() => {
  if (!selectedTag.value) return false;
  return selectedTag.value.fullPath === visitedViews.value[visitedViews.value.length - 1]?.fullPath;
});

/**
 * 递归提取固定标签
 */
const extractAffixTags = (routes: readonly RouteRecordRaw[], basePath = "/"): any[] => {
  const affixTags: any[] = [];

  const traverse = (routeList: readonly RouteRecordRaw[], currentBasePath: string) => {
    routeList.forEach((route) => {
      const fullPath = resolve(currentBasePath, route.path);

      if (route.meta?.affix) {
        affixTags.push({
          path: fullPath,
          fullPath,
          name: String(route.name || ""),
          meta: { ...route.meta },
        });
      }

      if (route.children?.length) {
        traverse(route.children, fullPath);
      }
    });
  };

  traverse(routes, basePath);
  return affixTags;
};

/**
 * 初始化固定标签
 */
const initAffixTags = () => {
  // 注意：这里的 permissionStore.routes 已经是过滤后的了
  const affixTags = extractAffixTags(permissionStore.routes);
  affixTags.forEach((tag) => {
    if (tag.name) {
      tagsViewStore.addVisitedView(tag);
    }
  });
};

/**
 * 添加显示标签
 */
const addCurrentTag = () => {
  if (!route.meta?.title) return;
  tagsViewStore.addView(route);
};

/**
 * 刷新标签
 */
const refreshSelectedTag = (tag: any) => {
  if (!tag) return;
  tagsViewStore.delCachedView(tag);
  nextTick(() => {
    router.replace("/redirect" + tag.fullPath);
  });
};

/**
 * 关闭标签
 */
const closeSelectedTag = (tag: any) => {
  if (!tag) return;
  tagsViewStore.delView(tag).then((res: any) => {
    if (tagsViewStore.isActive(tag)) {
      tagsViewStore.toLastView(res.visitedViews, tag);
    }
  });
};

/**
 * 关闭左侧标签
 */
const closeLeftTags = () => {
  if (!selectedTag.value) return;
  tagsViewStore.delLeftViews(selectedTag.value).then((res: any) => {
    const hasCurrentRoute = res.visitedViews.some((v: any) => v.path === route.path);
    if (!hasCurrentRoute) {
      tagsViewStore.toLastView(res.visitedViews);
    }
  });
};

/**
 * 关闭右侧标签
 */
const closeRightTags = () => {
  if (!selectedTag.value) return;
  tagsViewStore.delRightViews(selectedTag.value).then((res: any) => {
    const hasCurrentRoute = res.visitedViews.some((v: any) => v.path === route.path);
    if (!hasCurrentRoute) {
      tagsViewStore.toLastView(res.visitedViews);
    }
  });
};

/**
 * 关闭其他标签
 */
const closeOtherTags = () => {
  if (!selectedTag.value) return;
  router.push(selectedTag.value.fullPath);
  tagsViewStore.delOtherViews(selectedTag.value);
};

/**
 * 关闭所有标签
 */
const closeAllTags = (tag: any) => {
  tagsViewStore.delAllViews().then((res: any) => {
    tagsViewStore.toLastView(res.visitedViews, tag);
  });
};

/**
 * 打开右键菜单
 */
const openContextMenu = (tag: any, event: MouseEvent) => {
  contextMenu.x = event.clientX;
  contextMenu.y = event.clientY;
  contextMenu.visible = true;
  selectedTag.value = tag;
};

/**
 * 关闭右键菜单
 */
const closeContextMenu = () => {
  contextMenu.visible = false;
};

/**
 * 处理滚轮滚动
 */
const handleScroll = (event: WheelEvent) => {
  const scrollWrapper = scrollbarRef.value?.wrapRef;
  if (!scrollWrapper) return;
  scrollWrapper.scrollLeft = scrollWrapper.scrollLeft + event.deltaY;
};

// 监听菜单显示隐藏
watch(
  () => contextMenu.visible,
  (value) => {
    if (value) {
      document.addEventListener("click", closeContextMenu);
    } else {
      document.removeEventListener("click", closeContextMenu);
    }
  }
);

// 监听路由
watch(
  route,
  () => {
    addCurrentTag();
  },
  { immediate: false }
);

// 监听视图模式切换
watch(
  () => viewStore.activeView,
  () => {
    initAffixTags();
    addCurrentTag();
  }
);

onMounted(() => {
  initAffixTags();
  addCurrentTag();
});
</script>

<style lang="scss" scoped>
@use "@/styles/variables.module.scss" as vars;

.tags-container {
  width: 100%;
  height: vars.$tags-view-height;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  box-shadow:
    0 1px 3px 0 rgba(0, 0, 0, 0.12),
    0 0 3px 0 rgba(0, 0, 0, 0.04);

  .scroll-container {
    white-space: nowrap;
    position: relative;
    overflow: hidden;
    width: 100%;

    :deep(.el-scrollbar__bar) {
      display: none !important; // 核心：彻底关闭滚轮条显示，tag栏通常需要流畅度，而不展示滚动条
    }

    .tags-wrapper {
      display: flex;
      align-items: center;
      height: vars.$tags-view-height;
      padding: 0 15px;

      .tag-item {
        margin-right: 5px;
        cursor: pointer;
        height: 26px;
        line-height: 26px;
        border: 1px solid var(--el-border-color-light);
        color: var(--el-text-color-regular);
        background: var(--el-bg-color);
        padding: 0 8px;
        font-size: 12px;

        &:first-of-type {
          margin-left: 0;
        }

        &:last-of-type {
          margin-right: 15px;
        }

        &.el-tag--dark {
          color: #fff;
          background-color: var(--el-color-primary);
          border-color: var(--el-color-primary);

          &::before {
            content: "";
            background: #fff;
            display: inline-block;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            position: relative;
            margin-right: 5px;
          }
        }
      }
    }
  }
}

.contextmenu {
  margin: 0;
  background: var(--el-bg-color);
  z-index: 3000;
  position: absolute;
  list-style-type: none;
  padding: 5px 0;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 400;
  color: var(--el-text-color-primary);
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);

  li {
    margin: 0;
    padding: 7px 16px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;

    &:hover {
      background: var(--el-fill-color-light);
    }
  }
}
</style>
