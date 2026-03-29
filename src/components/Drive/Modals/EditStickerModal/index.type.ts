import type { ResourceItem } from '@/types/resource';

export interface EditStickerModalProps {
  open: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
  file: ResourceItem | null;
}
