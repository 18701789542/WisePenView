import type { TagTreeNode } from '@/services/Tag/index.type';

export interface DeleteTagModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  tag: TagTreeNode | null;
  groupId?: string;
}
