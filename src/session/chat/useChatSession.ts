import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useCallback } from 'react';
import { useNoteSelectionStore } from '@/store';
import { baseURL } from '@/utils/Axios';
import type { ChatState, ChatRequestBody, UseChatSessionOptions } from './index.type';

const DEFAULT_COMPLETIONS_API = `${baseURL}chat/completions`;

const buildRequestBody = ({
  sessionId,
  query,
  model,
  selected,
  enableSelected,
}: {
  sessionId: string;
  query: string;
  model?: string;
  selected?: string;
  enableSelected?: boolean;
}): ChatRequestBody => {
  const normalizedStates: ChatState[] = [];
  const shouldIncludeSelected = Boolean(enableSelected);
  const selectedValue = selected?.trim();

  if (shouldIncludeSelected && selectedValue) {
    const selectedIndex = normalizedStates.findIndex((state) => state.key === 'selected');
    if (selectedIndex >= 0) {
      normalizedStates[selectedIndex] = {
        ...normalizedStates[selectedIndex],
        value: selectedValue,
      };
    } else {
      normalizedStates.push({ key: 'selected', value: selectedValue });
    }
  }

  return {
    session_id: sessionId,
    query,
    ...(model ? { model } : {}),
    ...(normalizedStates.length > 0 ? { states: normalizedStates } : {}),
  };
};

/**
 * 对 useChat 的薄封装：
 * 1) 统一请求地址到 /chat/completions
 * 2) 统一补齐 ChatRequest 所需字段（session_id/query/model/states）
 * 3) 通过 enableSelected 控制是否自动注入 selected 到 states
 * 4) 保留 useChat 原始能力（messages、status、stop 等）
 */
export const useChatSession = ({
  sessionId,
  model,
  enableSelected = false,
}: UseChatSessionOptions) => {
  const selected = useNoteSelectionStore((state) => state.selectedTextByResourceId[sessionId]);

  const chat = useChat({
    transport: new DefaultChatTransport({
      api: DEFAULT_COMPLETIONS_API,
      fetch: (input, init) =>
        fetch(input, {
          ...init,
          credentials: 'include',
        }),
    }),
  });

  const sendSessionMessage = useCallback(
    async (query: string, options?: { model?: string; enableSelected?: boolean }) => {
      const requestBody = buildRequestBody({
        sessionId,
        query,
        model: options?.model ?? model,
        selected,
        enableSelected: options?.enableSelected ?? enableSelected,
      });
      await chat.sendMessage({ text: query }, { body: requestBody });
    },
    [chat, enableSelected, model, selected, sessionId]
  );

  return {
    ...chat,
    sendSessionMessage,
  };
};
