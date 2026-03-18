import type { Folder } from '@/types/folder';
import type { ResourceItem } from '@/types/resource';
import type { TreeDriveMode } from '@/components/Drive/TreeDrive';

export interface TreeNavProps {
  /**
   * 选中节点时回调；传 null 表示取消选中（如 tag 受控模式下再次点击已选节点或清空选择）
   */
  onSelect?: (
    item: { type: 'file'; data: ResourceItem } | { type: 'folder'; data: Folder } | null
  ) => void;
  /**
   * tag 模式：由父组件控制选中项（如 TagManageModal）。为 true 时需配合 tagSelectedKey。
   */
  tagSelectionControlled?: boolean;
  /** tag 受控：当前选中的 tagId，null 表示无选中 */
  tagSelectedKey?: string | null;
  /** 是否显示「新建文件夹」/「新建标签」按钮，默认 true */
  showNewFolderButton?: boolean;
  /** 根路径（folder mode），默认 '/' */
  rootPath?: string;
  /** 视图模式：folder 为路径文件夹树，tag 为全量标签树（无文件预览） */
  mode?: TreeDriveMode;
  /** 外部 class */
  className?: string;
  /** 嵌入模式：为 true 时不显示新建按钮、不渲染内部 NewFolderModal，由外部（如 NewFolderModal）管理 */
  embedMode?: boolean;
  /** 嵌入模式下初始选中节点 key（如父路径），用于在树中高亮当前父级 */
  defaultSelectedKey?: string;
  /**
   * tag 模式：与 OpenAPI getTagTree 的 groupId 一致，不传为个人标签树
   */
  tagTreeGroupId?: string;
  /** tag 模式：变更时重新拉取标签树（如弹窗每次打开） */
  tagTreeRefreshTrigger?: number;
  /**
   * tag 模式：允许拖拽调整层级（调用 moveTag）。默认 false，避免导航场景误拖。
   */
  tagTreeDraggable?: boolean;
  /** tag 模式：拖拽移动成功后回调（用于刷新平铺标签池等） */
  onTagTreeStructureChange?: () => void;
}
