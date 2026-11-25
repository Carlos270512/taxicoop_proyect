import { api } from '@shared/api';
import type { ApiResponse } from '@shared/api';
import type { AssistantReply, AssistantStatus, ChatRole } from '../model/types';

const CHAT_TIMEOUT_MS = 30_000;

export const assistantApi = {
  status: () => api.get<ApiResponse<AssistantStatus>>('/assistant/status').then((response) => response.data.data),

  chat: (messages: Array<{ role: ChatRole; content: string }>) =>
    api
      .post<ApiResponse<AssistantReply>>('/assistant/chat', { messages }, { timeout: CHAT_TIMEOUT_MS })
      .then((response) => response.data.data),
};
