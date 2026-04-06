import { createSessionHook } from '@/session/core/createSessionHook';
import { RetryStrategies } from '@/session/core/RetryStrategy';
import { IndexeddbPersistence } from 'y-indexeddb';
import * as Y from 'yjs';

import { NoteAdapter } from './NoteAdapter';
import { NoteInstance } from './NoteInstance';
import { WisepenProvider } from './WisepenProvider';

/** y-indexeddb 存储键：单条笔记一个 room，与 resourceId 对应（不承诺离线冷启动可打开） */
export function noteYjsIdbRoomName(resourceId: string): string {
  return `wisepen-note:${resourceId}`;
}

export const NoteSessionUnit = {
  type: 'note',
  create: (resourceId: string) => {
    const doc = new Y.Doc();
    const provider = new WisepenProvider(resourceId, doc, { connect: false });
    const idb = new IndexeddbPersistence(noteYjsIdbRoomName(resourceId), doc);
    const instance = new NoteInstance({ doc, provider, idb });
    const adapter = new NoteAdapter(instance, provider);
    return { instance, adapter };
  },
  config: {
    retryStrategy: RetryStrategies.exponential(1000, 30000, 5, 3),
  },
} as const;

export const useNoteSession = createSessionHook(NoteSessionUnit);
