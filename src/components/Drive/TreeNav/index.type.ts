import type { TagTreeNode } from '@/services/Tag/index.type';
import type { ResourceItem } from '@/types/resource';

export type NodeMap = Map<string, TagTreeNode>;

export interface TreeNavProps {
  /** 视图模式：folder 为路径文件夹树（单选），tag 为标签树（checkbox 多选） */
  viewMode: 'folder' | 'tag';
  /** 操作模式：nodes 为选择tag/folder，leaves 为选择文件 */
  selectMode: 'nodes' | 'leaves';
  /** 标签/文件夹树的作用域，不传为个人 */
  groupId?: string;
  /** 选中变化：`selectMode === 'nodes'` 时仅 nodes 有值；`leaves` 时仅 leaves 有值（另两种 props 为空数组） */
  onChange?: (selectedNodes: TagTreeNode[], selectedLeaves: ResourceItem[]) => void;
  /** 变化时重新拉取树数据 */
  refreshTrigger?: number;
  /**
   * 仅 tag 模式：树加载完成后按 tagId 预勾选（如编辑文件标签回显）
   */
  tagInitialCheckedIds?: string[];
}
