<template>
  <component :is="type" v-bind="linkProps(to)">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { isExternal } from "@/utils/validate";

const props = defineProps({
  to: {
    type: [String, Object],
    required: true,
  },
});

const isExt = computed(() => {
  return typeof props.to === "string" && isExternal(props.to);
});

const type = computed(() => {
  if (isExt.value) {
    return "a";
  }
  return "router-link";
});

const linkProps = (to: any) => {
  if (isExt.value) {
    return {
      href: to,
      target: "_blank",
      rel: "noopener",
    };
  }
  return {
    to: to,
  };
};
</script>
