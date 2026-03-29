import type { MoveToFolderTarget } from '../types';

export interface MoveToFolderModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  target: MoveToFolderTarget | null;
  /** 与树、移动作用域一致；不传为个人空间 */
  groupId?: string;
}
