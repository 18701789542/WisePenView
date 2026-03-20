import type { SyncPayload } from '@/types/note';
import type {
  INoteService,
  SyncNoteResponse,
  LoadNoteResponse,
  CreateNoteRequest,
  CreateNoteResponse,
} from '@/services/Note';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** 预设的两个 mock resourceId，loadNote 会按 id 返回不同内容 */
export const MOCK_NOTE_IDS = ['mock-note-1', 'mock-note-2'] as const;

const MOCK_NOTE_1: Omit<LoadNoteResponse, 'resourceId'> = {
  ok: true,
  version: 1,
  blocks: [
    {
      id: 'mock-block-1',
      type: 'paragraph',
      props: {},
      content: [{ type: 'text', text: '', styles: {} }],
      children: [],
    },
  ],
  updated_at: new Date().toISOString(),
};

const MOCK_NOTE_2: Omit<LoadNoteResponse, 'resourceId'> = {
  ok: true,
  version: 1,
  blocks: [
    {
      id: 'mock-block-2',
      type: 'paragraph',
      props: {},
      content: [{ type: 'text', text: '第二份 Mock 笔记', styles: {} }],
      children: [],
    },
  ],
  updated_at: new Date().toISOString(),
};

const syncNote = async (resourceId: string, payload: SyncPayload): Promise<SyncNoteResponse> => {
  const { base_version, send_timestamp, deltas } = payload;
  console.log('[NoteServices.mock] syncNote', {
    resourceId,
    baseVersion: base_version,
    sendTimestamp: send_timestamp,
    deltas: deltas.map((delta) => {
      const { op, blockId, firstOp, data } = delta;
      const dataSummary =
        data && typeof data === 'object'
          ? (() => {
              const d = data as Record<string, unknown>;
              return {
                ...(d.id !== undefined && { id: d.id }),
                ...(d.type !== undefined && { type: d.type }),
                ...(d.content !== undefined && { content: d.content }),
                ...(d.props !== undefined && { props: d.props }),
              };
            })()
          : { type: typeof data };
      return {
        op,
        blockId,
        firstOp,
        ...dataSummary,
      };
    }),
  });
  await delay(200);
  return { new_version: Date.now() };
};

const loadNote = async (resourceId: string): Promise<LoadNoteResponse> => {
  await delay(300);
  const base = resourceId === MOCK_NOTE_IDS[1] ? MOCK_NOTE_2 : MOCK_NOTE_1;
  return { ...base, resourceId };
};

const createNote = async (params?: CreateNoteRequest): Promise<CreateNoteResponse> => {
  await delay(200);
  const resourceId =
    params?.resourceId ??
    (params?.source !== undefined
      ? `mock-doc-copy-${params.source}-${Date.now()}`
      : `mock-doc-${Date.now()}`);
  return {
    ok: true,
    resourceId,
    version: 1,
    created_at: new Date().toISOString(),
  };
};

export const NoteServicesMock: INoteService = {
  syncNote,
  loadNote,
  createNote,
};
