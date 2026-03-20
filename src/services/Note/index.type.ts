/**
 * Note 文档同步相关 API 请求类型
 * 与 blocknote/docs/API.md 对齐
 */

import type { SyncPayload, Block } from '@/types/note';

/** NoteService 接口：供依赖注入使用 */
export interface INoteService {
  /** 增量保存：将一批编辑变更提交到服务端 */
  syncNote(resourceId: string, payload: SyncPayload): Promise<SyncNoteResponse>;
  /** 全量加载：获取文档的完整内容 */
  loadNote(resourceId: string): Promise<LoadNoteResponse>;
  /**
   * 新建或复制文档：普通创建不传参或传 `initial_content`；
   * 从已有文档复制时传 `source`（与旧 `duplicate` 接口合并为同一 POST /note/create）
   */
  createNote(params?: CreateNoteRequest): Promise<CreateNoteResponse>;
}

/** 增量保存响应 */
export interface SyncNoteResponse {
  /** 应用变更后的文档版本，客户端应更新本地 base_version */
  new_version: number;
}

/** 全量加载响应 */
export interface LoadNoteResponse {
  ok: boolean;
  resourceId: string;
  version: number;
  blocks: Block[];
  updated_at?: string;
}

/** 新建文档请求参数 */
export interface CreateNoteRequest {
  /** 与已有 Resource 绑定时传入其 id（须先 createResource） */
  resourceId?: string;
  /** 初始 Block 树；不传则创建空文档 */
  initial_content?: Block[];
  /** 源笔记 resourceId，用于从已有文档创建副本；普通创建留空 */
  source?: string;
}

/** 新建文档响应（不返回 `blocks`，正文以服务端持久化为准，由 `loadNote` 拉取） */
export interface CreateNoteResponse {
  ok: boolean;
  resourceId: string;
  version: number;
  created_at?: string;
}
