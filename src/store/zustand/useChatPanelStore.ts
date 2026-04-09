import { create } from 'zustand';

interface ChatPanelState {
  chatPanelCollapsed: boolean;
  setChatPanelCollapsed: (collapsed: boolean) => void;
  toggleChatPanelCollapsed: () => void;
}

const DEFAULT_CHAT_PANEL_STATE: Pick<ChatPanelState, 'chatPanelCollapsed'> = {
  chatPanelCollapsed: false,
};

export const useChatPanelStore = create<ChatPanelState>()((set) => ({
  ...DEFAULT_CHAT_PANEL_STATE,
  setChatPanelCollapsed: (collapsed) =>
    set((state) => {
      if (state.chatPanelCollapsed === collapsed) {
        return state;
      }
      return { chatPanelCollapsed: collapsed };
    }),
  toggleChatPanelCollapsed: () =>
    set((state) => ({ chatPanelCollapsed: !state.chatPanelCollapsed })),
}));

export const clearChatPanelStore = (): void => {
  useChatPanelStore.setState(DEFAULT_CHAT_PANEL_STATE);
};
