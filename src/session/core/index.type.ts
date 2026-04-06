import { StatusManager } from './StatusManager';

export type Status =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error'
  | 'disconnecting';

export interface Session {
  readonly id: string;
  readonly manager: StatusManager;
  readonly instance: SessionInstance;
  dispose(): Promise<void>;
}

export interface StatusAdapter {
  open: () => Promise<void>;
  close: () => Promise<void>;
  // 注入 hooks 通知 manager 当底层链接准备好、断开或失败时
  setup: (hooks: {
    onConnected: () => void;
    onDisconnected: () => void;
    onError: (err: unknown) => void;
  }) => void;
}

export interface SessionInstance {
  dispose?(): void;
}
