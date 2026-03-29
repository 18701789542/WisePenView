import type { MoveToFolderTarget } from '../types';

export interface EditTagModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  groupId?: string;
  /** 仅处理 type 为 file；为 null 时不展示有效内容 */
  target: MoveToFolderTarget | null;
}
