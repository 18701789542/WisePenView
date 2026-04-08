import type { ResourceItem } from '@/types/resource';

export interface RemoveFileFromGroupModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  groupId?: string;
  file: ResourceItem | null;
}
