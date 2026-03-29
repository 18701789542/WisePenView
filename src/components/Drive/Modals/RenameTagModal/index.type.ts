import type { TagTreeNode } from '@/services/Tag/index.type';

export interface RenameTagModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  tag: TagTreeNode | null;
  groupId?: string;
}
