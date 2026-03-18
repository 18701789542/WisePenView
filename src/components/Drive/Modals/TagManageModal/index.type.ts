export interface TagManageModalProps {
  open: boolean;
  onCancel: () => void;
  /** 小组标签树时传入 */
  groupId?: string;
}
