import type { TagTreeNode } from '@/services/Tag/index.type';

export type NodeMap = Map<string, TagTreeNode>;

export interface TreeNavProps {
  /** 视图模式：folder 为路径文件夹树（单选），tag 为标签树（checkbox 多选） */
  mode: 'folder' | 'tag';
  /** 标签/文件夹树的作用域，不传为个人 */
  groupId?: string;
  /** 选中节点变化时回调，始终返回 TagTreeNode[]（folder 模式 0~1 项，tag 模式 0~N 项） */
  onChange?: (selected: TagTreeNode[]) => void;
  /** 变化时重新拉取树数据 */
  refreshTrigger?: number;
  /**
   * 仅 tag 模式：树加载完成后按 tagId 预勾选（如编辑文件标签回显）
   */
  tagInitialCheckedIds?: string[];
}
