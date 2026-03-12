import { MOCK_MODELS } from './mock/ChatPanel';
import type { Model } from '@/components/ChatPanel/index.type';

export const ModelService = {
  getModels: async (): Promise<Model[]> => {
    // ChatPanel 整体为 mock，暂不接入真实 API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(MOCK_MODELS);
      }, 500);
    });
  },
};
