import { defineStore } from "pinia";

export const useAIPanelStore = defineStore("aiPanel", () => {
  const AIPanelVisible = ref(false);

  function toggleAIPanel() {
    AIPanelVisible.value = !AIPanelVisible.value;
  }

  return {
    AIPanelVisible,
    toggleAIPanel,
  };
});
